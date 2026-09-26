package com.madhurya.sladesk.sla.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UpdateSlaPolicyRequest(@Min(1) int resolutionMinutes,
                                     @Min(1) @Max(99) int atRiskPercent) {}