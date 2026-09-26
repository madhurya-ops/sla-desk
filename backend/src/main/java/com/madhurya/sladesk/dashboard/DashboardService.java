package com.madhurya.sladesk.dashboard;

import com.madhurya.sladesk.dashboard.dto.DashboardSummaryDto;
import com.madhurya.sladesk.dashboard.dto.PriorityBreakdown;
import com.madhurya.sladesk.ticket.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private final TicketRepository tickets;

    @Transactional(readOnly = true)
    public DashboardSummaryDto summary() {
        List<Ticket> all = tickets.findAll();
        List<Ticket> open = all.stream().filter(t -> t.getStatus() != TicketStatus.RESOLVED).toList();
        List<Ticket> resolved = all.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED).toList();
        Instant startOfToday = LocalDate.now(IST).atStartOfDay(IST).toInstant();

        long met = resolved.stream().filter(t -> t.getSlaState() == SlaState.MET).count();
        double compliance = resolved.isEmpty() ? 100.0 : Math.round(1000.0 * met / resolved.size()) / 10.0;

        List<PriorityBreakdown> byPriority = Arrays.stream(Priority.values())
                .map(p -> new PriorityBreakdown(p,
                        count(open, p, SlaState.ON_TRACK), count(open, p, SlaState.AT_RISK),
                        count(open, p, SlaState.BREACHED)))
                .toList();

        return new DashboardSummaryDto(
                open.size(),
                open.stream().filter(t -> t.getSlaState() == SlaState.AT_RISK).count(),
                open.stream().filter(t -> t.getSlaState() == SlaState.BREACHED).count(),
                open.stream().filter(Ticket::isEscalated).count(),
                resolved.stream().filter(t -> t.getResolvedAt().isAfter(startOfToday)).count(),
                compliance, byPriority);
    }

    private long count(List<Ticket> list, Priority p, SlaState s) {
        return list.stream().filter(t -> t.getPriority() == p && t.getSlaState() == s).count();
    }
}
