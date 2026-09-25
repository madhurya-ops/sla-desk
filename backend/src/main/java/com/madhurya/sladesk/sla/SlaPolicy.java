package com.madhurya.sladesk.sla;

import com.madhurya.sladesk.ticket.Priority;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "sla_policies")
@Getter
@Setter
@NoArgsConstructor
public class SlaPolicy {
    @Id @Enumerated(EnumType.STRING) private Priority priority;
    @Column(name = "resolution_minutes", nullable = false) private int resolutionMinutes;
    @Column(name = "at_risk_percent", nullable = false) private int atRiskPercent;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
}
