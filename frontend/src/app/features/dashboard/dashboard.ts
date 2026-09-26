import { formatNumber } from '@angular/common';
import { Component, LOCALE_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Subject, catchError, exhaustMap, forkJoin, merge, of, timer } from 'rxjs';
import { silentErrors } from '../../core/api/error.interceptor';
import { DashboardApi } from '../../core/api/dashboard.api';
import { TicketsApi } from '../../core/api/tickets.api';
import { DashboardSummaryDto, TicketSummaryDto } from '../../core/models';
import { PageState } from '../../shared/page-state';
import { PriorityChip } from '../../shared/priority-chip';
import { SlaBadge } from '../../shared/sla-badge';
import { StaleBanner } from '../../shared/stale-banner';
import { SlaByPriorityChart } from './sla-by-priority-chart';

const POLL_MS = 10_000;
const URGENT_COUNT = 5;

interface Kpi {
  label: string;
  value: string;
  icon: string;
  tone: 'neutral' | 'at-risk' | 'breached' | 'good';
}

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    PageState,
    PriorityChip,
    SlaBadge,
    SlaByPriorityChart,
    StaleBanner,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly dashboardApi = inject(DashboardApi);
  private readonly ticketsApi = inject(TicketsApi);
  private readonly locale = inject(LOCALE_ID);

  /** Each is null until its first successful load. */
  protected readonly summary = signal<DashboardSummaryDto | null>(null);
  protected readonly urgent = signal<TicketSummaryDto[] | null>(null);
  protected readonly loaded = signal(false);
  protected readonly summaryFailed = signal(false);
  protected readonly ticketsFailed = signal(false);
  protected readonly lastUpdated = signal<Date | null>(null);

  private readonly retry$ = new Subject<void>();

  protected readonly kpis = computed<Kpi[]>(() => {
    const s = this.summary();
    if (!s) return [];
    return [
      { label: 'Open', value: `${s.openCount}`, icon: 'inbox', tone: 'neutral' },
      { label: 'At risk', value: `${s.atRiskCount}`, icon: 'warning', tone: 'at-risk' },
      { label: 'Breached', value: `${s.breachedCount}`, icon: 'error', tone: 'breached' },
      { label: 'Escalated', value: `${s.escalatedCount}`, icon: 'e911_emergency', tone: 'neutral' },
      {
        label: 'Resolved today',
        value: `${s.resolvedTodayCount}`,
        icon: 'task_alt',
        tone: 'neutral',
      },
      {
        label: 'SLA compliance',
        value: `${formatNumber(s.slaCompliancePercent, this.locale, '1.0-1')}%`,
        icon: 'verified',
        tone: 'good',
      },
    ];
  });

  constructor() {
    // Each call degrades on its own, so a failing summary doesn't blank the urgent list (or vice versa).
    merge(timer(0, POLL_MS), this.retry$)
      .pipe(
        exhaustMap(() =>
          forkJoin({
            summary: this.dashboardApi.summary(silentErrors()).pipe(catchError(() => of(null))),
            tickets: this.ticketsApi.list({}, silentErrors()).pipe(catchError(() => of(null))),
          }),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ summary, tickets }) => {
        this.summaryFailed.set(summary === null);
        this.ticketsFailed.set(tickets === null);
        if (summary) {
          this.summary.set(summary);
          this.lastUpdated.set(new Date());
        }
        // The API sorts by dueAt ascending, so the first unresolved ones are the most urgent.
        if (tickets) {
          this.urgent.set(tickets.filter((t) => t.status !== 'RESOLVED').slice(0, URGENT_COUNT));
        }
        this.loaded.set(true);
      });
  }

  protected retry(): void {
    this.retry$.next();
  }
}
