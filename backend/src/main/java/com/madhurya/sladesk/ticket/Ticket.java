package com.madhurya.sladesk.ticket;

import com.madhurya.sladesk.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
public class Ticket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String title;
    @Column(nullable = false, columnDefinition = "TEXT") private String description;

    @Enumerated(EnumType.STRING) @Column(nullable = false) private Priority priority;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Category category;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private TicketStatus status = TicketStatus.OPEN;
    @Enumerated(EnumType.STRING) @Column(name = "sla_state", nullable = false) private SlaState slaState = SlaState.ON_TRACK;

    @Column(name = "sla_minutes", nullable = false) private int slaMinutes;
    @Column(name = "at_risk_percent", nullable = false) private int atRiskPercent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "created_by_id")
    private User createdBy;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assignee_id")
    private User assignee;

    @Column(nullable = false) private boolean escalated;

    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "due_at", nullable = false) private Instant dueAt;
    @Column(name = "paused_at") private Instant pausedAt;
    @Column(name = "paused_seconds", nullable = false) private long pausedSeconds;
    @Column(name = "resolved_at") private Instant resolvedAt;

    @Enumerated(EnumType.STRING) @Column(name = "ai_priority") private Priority aiPriority;
    @Enumerated(EnumType.STRING) @Column(name = "ai_category") private Category aiCategory;
    @Column(name = "ai_confidence") private Double aiConfidence;
    @Column(name = "ai_business_impact") private Double aiBusinessImpact;
    @Column(name = "ai_frustration") private Double aiFrustration;
    @Column(name = "needs_triage", nullable = false) private boolean needsTriage;

    @Version private long version;   // optimistic locking; never set it yourself
}
