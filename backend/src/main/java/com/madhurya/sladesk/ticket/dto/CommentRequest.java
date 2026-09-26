package com.madhurya.sladesk.ticket.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(@NotBlank String message) {}