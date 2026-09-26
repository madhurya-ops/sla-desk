package com.madhurya.sladesk.sla.dto;

import com.madhurya.sladesk.sla.SlaPolicy;
import com.madhurya.sladesk.ticket.Priority;

public record SlaPolicyDto(Priority priority, int resolutionMinutes, int atRiskPercent) {
    public static SlaPolicyDto from(SlaPolicy p) {
        return new SlaPolicyDto(p.getPriority(), p.getResolutionMinutes(), p.getAtRiskPercent());
    }
}
