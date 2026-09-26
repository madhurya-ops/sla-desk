package com.madhurya.sladesk.ticket.dto;

import jakarta.validation.constraints.NotNull;

public record AssignRequest(@NotNull Long assigneeId) {}
