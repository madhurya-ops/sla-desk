package com.madhurya.sladesk.ticket;

import java.util.Map;
import java.util.Set;

public final class StatusTransitions {
    private static final Map<TicketStatus, Set<TicketStatus>> ALLOWED = Map.of(
            TicketStatus.OPEN,        Set.of(TicketStatus.IN_PROGRESS, TicketStatus.ON_HOLD, TicketStatus.RESOLVED),
            TicketStatus.IN_PROGRESS, Set.of(TicketStatus.ON_HOLD, TicketStatus.RESOLVED),
            TicketStatus.ON_HOLD,     Set.of(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED),
            TicketStatus.RESOLVED,    Set.of());

    public static boolean isAllowed(TicketStatus from, TicketStatus to) {
        return ALLOWED.getOrDefault(from, Set.of()).contains(to);
    }

    private StatusTransitions() {}
}
