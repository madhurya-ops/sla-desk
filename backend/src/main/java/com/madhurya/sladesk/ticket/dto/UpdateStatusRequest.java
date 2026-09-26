package com.madhurya.sladesk.ticket.dto;

import com.madhurya.sladesk.ticket.TicketStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull TicketStatus status, String note) {}
