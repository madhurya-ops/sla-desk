package com.madhurya.sladesk.common;

import com.madhurya.sladesk.ticket.TicketStatus;

public class InvalidTransitionException extends RuntimeException {
    public InvalidTransitionException(TicketStatus from, TicketStatus to) {
        super("Cannot move " + from + " -> " + to);
    }
}