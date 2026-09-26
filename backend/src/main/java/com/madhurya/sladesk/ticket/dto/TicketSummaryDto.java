package com.madhurya.sladesk.ticket.dto;

import com.madhurya.sladesk.ticket.Category;
import com.madhurya.sladesk.ticket.Priority;
import com.madhurya.sladesk.ticket.SlaState;
import com.madhurya.sladesk.ticket.TicketStatus;
import com.madhurya.sladesk.user.dto.UserRef;

import java.time.Instant;

public record TicketSummaryDto(Long id, String title, Priority priority, Category category,
                               TicketStatus status, SlaState slaState, UserRef assignee, boolean escalated,
                               boolean needsTriage, Instant createdAt, Instant dueAt, Instant pausedAt,
                               double percentUsed, long remainingSeconds, Double aiFrustration) {}
