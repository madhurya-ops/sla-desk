package com.madhurya.sladesk.ticket;

import com.madhurya.sladesk.event.TicketEvent;
import com.madhurya.sladesk.event.dto.TicketEventDto;
import com.madhurya.sladesk.sla.SlaCalculator;
import com.madhurya.sladesk.ticket.dto.TicketDetailDto;
import com.madhurya.sladesk.ticket.dto.TicketSummaryDto;
import com.madhurya.sladesk.user.dto.UserRef;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TicketMapper {
    private final SlaCalculator sla;

    public TicketSummaryDto toSummary(Ticket t, Instant now) {
        return new TicketSummaryDto(t.getId(), t.getTitle(), t.getPriority(), t.getCategory(),
                t.getStatus(), t.getSlaState(), UserRef.from(t.getAssignee()), t.isEscalated(),
                t.isNeedsTriage(), t.getCreatedAt(), t.getDueAt(), t.getPausedAt(),
                round(sla.percentUsed(t, now)), sla.remainingSeconds(t, now), t.getAiFrustration());
    }

    public TicketDetailDto toDetail(Ticket t, List<TicketEvent> events, Instant now) {
        return new TicketDetailDto(t.getId(), t.getTitle(), t.getPriority(), t.getCategory(),
                t.getStatus(), t.getSlaState(), UserRef.from(t.getAssignee()), t.isEscalated(),
                t.isNeedsTriage(), t.getCreatedAt(), t.getDueAt(), t.getPausedAt(),
                round(sla.percentUsed(t, now)), sla.remainingSeconds(t, now), t.getAiFrustration(),
                t.getDescription(), UserRef.from(t.getCreatedBy()), t.getResolvedAt(), t.getSlaMinutes(),
                t.getAiPriority(), t.getAiCategory(), t.getAiConfidence(), t.getAiBusinessImpact(),
                events.stream().map(TicketEventDto::from).toList());
    }

    private double round(double v) { return Math.round(v * 10) / 10.0; }
}
