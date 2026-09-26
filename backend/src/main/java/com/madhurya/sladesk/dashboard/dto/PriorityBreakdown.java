package com.madhurya.sladesk.dashboard.dto;

import com.madhurya.sladesk.ticket.Priority;

public record PriorityBreakdown(Priority priority, long onTrack, long atRisk, long breached) {}
