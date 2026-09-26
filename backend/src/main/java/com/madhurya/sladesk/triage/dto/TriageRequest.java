package com.madhurya.sladesk.triage.dto;

import jakarta.validation.constraints.NotBlank;

public record TriageRequest(@NotBlank String title, @NotBlank String description) {}
