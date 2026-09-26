package com.madhurya.sladesk.sla;

import com.madhurya.sladesk.event.EventService;
import com.madhurya.sladesk.event.EventType;
import com.madhurya.sladesk.ticket.Ticket;
import com.madhurya.sladesk.user.Role;
import com.madhurya.sladesk.user.User;
import com.madhurya.sladesk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EscalationService {
    private final UserRepository users;
    private final EventService events;

    /** Moves the ticket to the Lead, once. Call inside an existing transaction. */
    public void escalate(Ticket t, String reason) {
        if (t.isEscalated()) return;
        User lead = users.findFirstByRole(Role.LEAD).orElse(null);
        String from = t.getAssignee() == null ? "Unassigned" : t.getAssignee().getFullName();
        t.setEscalated(true);
        if (lead != null) t.setAssignee(lead);
        events.record(t, null, EventType.ESCALATED, from,
                lead == null ? null : lead.getFullName(), reason);
    }
}