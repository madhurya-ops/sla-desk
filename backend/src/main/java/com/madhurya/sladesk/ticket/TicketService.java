package com.madhurya.sladesk.ticket;

import com.madhurya.sladesk.common.InvalidTransitionException;
import com.madhurya.sladesk.common.NotFoundException;
import com.madhurya.sladesk.event.EventService;
import com.madhurya.sladesk.event.EventType;
import com.madhurya.sladesk.event.TicketEventRepository;
import com.madhurya.sladesk.security.CurrentUser;
import com.madhurya.sladesk.sla.EscalationService;
import com.madhurya.sladesk.sla.SlaCalculator;
import com.madhurya.sladesk.sla.SlaPolicy;
import com.madhurya.sladesk.sla.SlaPolicyRepository;
import com.madhurya.sladesk.ticket.dto.CreateTicketRequest;
import com.madhurya.sladesk.ticket.dto.TicketDetailDto;
import com.madhurya.sladesk.ticket.dto.TicketSummaryDto;
import com.madhurya.sladesk.ticket.dto.UpdateStatusRequest;
import com.madhurya.sladesk.triage.TriageService;
import com.madhurya.sladesk.triage.dto.TriageResult;
import com.madhurya.sladesk.user.Role;
import com.madhurya.sladesk.user.User;
import com.madhurya.sladesk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {
    private final TicketRepository tickets;
    private final TicketEventRepository eventRepo;
    private final SlaPolicyRepository policies;
    private final UserRepository users;
    private final EventService events;
    private final EscalationService escalation;
    private final SlaCalculator sla;
    private final TicketMapper mapper;
    private final CurrentUser currentUser;
    private final TriageService triageService;


    @Transactional
    public TicketDetailDto create(CreateTicketRequest req) {
        User creator = currentUser.get();
        TriageResult ai = triageService.triage(req.title(), req.description());

        Priority priority = req.priority() != null ? req.priority()
                : ai.available() ? ai.priority() : Priority.P3;
        Category category = req.category() != null ? req.category()
                : ai.available() ? ai.category() : Category.APPLICATION;
        SlaPolicy policy = policies.findById(priority).orElseThrow();

        Ticket t = new Ticket();
        t.setTitle(req.title());
        t.setDescription(req.description());
        t.setPriority(priority);
        t.setCategory(category);
        t.setSlaMinutes(policy.getResolutionMinutes());      // snapshot
        t.setAtRiskPercent(policy.getAtRiskPercent());       // snapshot
        t.setCreatedBy(creator);
        t.setCreatedAt(Instant.now());
        t.setDueAt(sla.dueAt(t));
        t.setAssignee(pickAgent(category));
        if (ai.available()) {
            t.setAiPriority(ai.priority());
            t.setAiCategory(ai.category());
            t.setAiConfidence(ai.priorityConfidence());
            t.setAiBusinessImpact(ai.businessImpact());
            t.setAiFrustration(ai.frustration());
        }
        boolean humanChoseBoth = req.priority() != null && req.category() != null;
        t.setNeedsTriage(!humanChoseBoth && ai.needsTriage());
        tickets.save(t);

        events.record(t, creator, EventType.CREATED, null, priority.name(), "Ticket created");
        if (ai.available()) {
            events.record(t, null, EventType.AI_TRIAGED, null, ai.priority().name(), ai.summary());
        }
        if (t.getAssignee() != null) {
            events.record(t, null, EventType.ASSIGNED, "Unassigned",
                    t.getAssignee().getFullName(), "Auto-assigned to " + category + " team");
        }
        if (ai.available() && ai.businessImpact() >= 0.8) {
            escalation.escalate(t, "High business impact detected by AI triage");
        }
        return detail(t);
    }

    @Transactional(readOnly = true)
    public List<TicketSummaryDto> list(TicketStatus status, SlaState slaState,
                                       Priority priority, boolean mine) {
        User me = currentUser.get();
        Instant now = Instant.now();
        return tickets.findAll(Sort.by("dueAt")).stream()
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> slaState == null || t.getSlaState() == slaState)
                .filter(t -> priority == null || t.getPriority() == priority)
                .filter(t -> !mine || (t.getAssignee() != null && t.getAssignee().getId().equals(me.getId())))
                .map(t -> mapper.toSummary(t, now))
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketDetailDto get(Long id) {
        return detail(getOrThrow(id));
    }

    @Transactional
    public TicketDetailDto changeStatus(Long id, UpdateStatusRequest req) {
        User actor = currentUser.get();
        Ticket t = getOrThrow(id);
        TicketStatus from = t.getStatus();
        TicketStatus to = req.status();

        if (!StatusTransitions.isAllowed(from, to)) throw new InvalidTransitionException(from, to);
        boolean isAgent = actor.getRole() == Role.AGENT;
        boolean isAssignee = t.getAssignee() != null && t.getAssignee().getId().equals(actor.getId());
        if (isAgent && !isAssignee) {
            throw new AccessDeniedException("Agents can only update tickets assigned to them");
        }

        Instant now = Instant.now();
        if (from == TicketStatus.ON_HOLD) {                   // resume the clock
            long paused = Duration.between(t.getPausedAt(), now).getSeconds();
            t.setPausedSeconds(t.getPausedSeconds() + paused);
            t.setPausedAt(null);
            t.setDueAt(sla.dueAt(t));
        }
        if (to == TicketStatus.ON_HOLD) {                     // freeze the clock
            t.setPausedAt(now);
        }
        if (to == TicketStatus.RESOLVED) {
            t.setResolvedAt(now);
            boolean breached = sla.evaluate(t, now) == SlaState.BREACHED;
            t.setSlaState(breached ? SlaState.BREACHED : SlaState.MET);
        }
        t.setStatus(to);
        events.record(t, actor, EventType.STATUS_CHANGED, from.name(), to.name(), req.note());
        return detail(t);
    }

    @Transactional
    public TicketDetailDto assign(Long id, Long assigneeId) {
        User actor = currentUser.get();
        Ticket t = getOrThrow(id);
        User to = users.findById(assigneeId)
                .orElseThrow(() -> new NotFoundException("User " + assigneeId + " not found"));
        String from = t.getAssignee() == null ? "Unassigned" : t.getAssignee().getFullName();
        t.setAssignee(to);
        events.record(t, actor, EventType.ASSIGNED, from, to.getFullName(), null);
        return detail(t);
    }

    @Transactional
    public TicketDetailDto comment(Long id, String message) {
        Ticket t = getOrThrow(id);
        events.record(t, currentUser.get(), EventType.COMMENT, null, null, message);
        return detail(t);
    }

    /** Least-busy agent on the matching team; null if that team has no agents. */
    private User pickAgent(Category category) {
        return users.findByRoleAndTeam(Role.AGENT, category).stream()
                .min(Comparator.comparingLong(a -> tickets.countByAssigneeAndStatusNot(a, TicketStatus.RESOLVED)))
                .orElse(null);
    }

    private Ticket getOrThrow(Long id) {
        return tickets.findById(id).orElseThrow(() -> new NotFoundException("Ticket " + id + " not found"));
    }

    private TicketDetailDto detail(Ticket t) {
        return mapper.toDetail(t, eventRepo.findByTicketIdOrderByCreatedAtAsc(t.getId()), Instant.now());
    }
}
