package com.madhurya.sladesk.sla;

import com.madhurya.sladesk.ticket.SlaState;
import com.madhurya.sladesk.ticket.Ticket;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
public class SlaCalculator {

    /** Seconds of SLA time used so far; time on hold is excluded. */
    public long elapsedSeconds(Ticket t, Instant now) {
        Instant end = t.getResolvedAt() != null ? t.getResolvedAt()
                : t.getPausedAt()   != null ? t.getPausedAt()
                : now;
        return Duration.between(t.getCreatedAt(), end).getSeconds() - t.getPausedSeconds();
    }

    public long budgetSeconds(Ticket t) {
        return t.getSlaMinutes() * 60L;
    }

    public double percentUsed(Ticket t, Instant now) {
        return 100.0 * elapsedSeconds(t, now) / budgetSeconds(t);
    }

    public long remainingSeconds(Ticket t, Instant now) {
        return budgetSeconds(t) - elapsedSeconds(t, now);
    }

    /** Deadline, pushed back by all time spent on hold. */
    public Instant dueAt(Ticket t) {
        return t.getCreatedAt().plusSeconds(budgetSeconds(t) + t.getPausedSeconds());
    }

    /** The SLA state the ticket should be in right now. A breach is permanent. */
    public SlaState evaluate(Ticket t, Instant now) {
        if (t.getSlaState() == SlaState.BREACHED) return SlaState.BREACHED;
        double pct = percentUsed(t, now);
        if (pct >= 100) return SlaState.BREACHED;
        if (pct >= t.getAtRiskPercent()) return SlaState.AT_RISK;
        return SlaState.ON_TRACK;
    }
}
