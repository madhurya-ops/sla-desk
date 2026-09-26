package com.madhurya.sladesk.sla;

import com.madhurya.sladesk.event.EventService;
import com.madhurya.sladesk.event.EventType;
import com.madhurya.sladesk.ticket.SlaState;
import com.madhurya.sladesk.ticket.Ticket;
import com.madhurya.sladesk.ticket.TicketRepository;
import com.madhurya.sladesk.ticket.TicketStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SlaMonitorJob {
    private final TicketRepository tickets;
    private final SlaCalculator sla;
    private final EventService events;
    private final EscalationService escalation;

    @Scheduled(fixedDelay = 15_000, initialDelay = 10_000)   // 15s after the previous run ends
    @Transactional
    public void checkSlas() {
        Instant now = Instant.now();
        // ON_HOLD and RESOLVED tickets are skipped: their clocks are not running
        List<Ticket> running = tickets.findByStatusInAndSlaStateIn(
                List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS),
                List.of(SlaState.ON_TRACK, SlaState.AT_RISK));

        for (Ticket t : running) {
            SlaState before = t.getSlaState();
            SlaState after = sla.evaluate(t, now);
            if (after == before) continue;

            t.setSlaState(after);
            if (after == SlaState.AT_RISK) {
                events.record(t, null, EventType.SLA_AT_RISK, before.name(), after.name(),
                        t.getAtRiskPercent() + "% of SLA time used");
            } else if (after == SlaState.BREACHED) {
                events.record(t, null, EventType.SLA_BREACHED, before.name(), after.name(),
                        "SLA deadline passed");
                escalation.escalate(t, "Auto-escalated: SLA breached");
            }
            log.info("Ticket {} moved {} -> {}", t.getId(), before, after);
        }
    }
}
