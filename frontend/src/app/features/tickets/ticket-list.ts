import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { Subject, catchError, exhaustMap, map, merge, of, switchMap, timer } from 'rxjs';
import { silentErrors } from '../../core/api/error.interceptor';
import { TicketsApi } from '../../core/api/tickets.api';
import { TicketQuery, TicketSummaryDto } from '../../core/models';
import {
  CATEGORY_LABELS,
  PRIORITIES,
  SLA_STATES,
  SLA_STATE_LABELS,
  STATUSES,
  STATUS_LABELS,
} from '../../shared/labels';
import { PageState } from '../../shared/page-state';
import { PriorityChip } from '../../shared/priority-chip';
import { SlaBadge } from '../../shared/sla-badge';
import { StaleBanner } from '../../shared/stale-banner';
import { TicketFlags } from './ticket-flags';

const POLL_MS = 5000;

@Component({
  selector: 'app-ticket-list',
  imports: [
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTableModule,
    PageState,
    PriorityChip,
    SlaBadge,
    StaleBanner,
    TicketFlags,
  ],
  templateUrl: './ticket-list.html',
  styleUrl: './ticket-list.scss',
})
export class TicketList {
  private readonly api = inject(TicketsApi);
  private readonly router = inject(Router);

  protected readonly statuses = STATUSES;
  protected readonly slaStates = SLA_STATES;
  protected readonly priorities = PRIORITIES;
  // Widened because mat-table's cell context (`let t`) is untyped.
  protected readonly statusLabels: Record<string, string> = STATUS_LABELS;
  protected readonly slaStateLabels: Record<string, string> = SLA_STATE_LABELS;
  protected readonly categoryLabels: Record<string, string> = CATEGORY_LABELS;
  protected readonly columns = ['priority', 'title', 'category', 'status', 'assignee', 'sla'];

  protected readonly isMobile = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 767px)')
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  protected readonly filters = signal<TicketQuery>({});
  /** null until the first successful load. */
  protected readonly tickets = signal<TicketSummaryDto[] | null>(null);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly lastUpdated = signal<Date | null>(null);
  protected readonly hasFilters = computed(() =>
    Object.values(this.filters()).some((value) => value !== undefined),
  );

  private readonly retry$ = new Subject<void>();

  constructor() {
    // Restart polling whenever the filters change; the countdowns tick on their own in between.
    toObservable(this.filters)
      .pipe(
        switchMap((query) => {
          this.loading.set(true);
          return merge(timer(0, POLL_MS), this.retry$).pipe(
            exhaustMap(() =>
              this.api.list(query, silentErrors()).pipe(
                map((tickets): TicketSummaryDto[] | null => tickets),
                catchError(() => of(null)),
              ),
            ),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((tickets) => {
        this.loading.set(false);
        this.failed.set(tickets === null);
        if (tickets) {
          this.tickets.set(tickets);
          this.lastUpdated.set(new Date());
        }
      });
  }

  protected retry(): void {
    this.loading.set(true);
    this.retry$.next();
  }

  protected clearFilters(): void {
    this.filters.set({});
  }

  protected setFilter<K extends keyof TicketQuery>(key: K, value: TicketQuery[K]): void {
    this.filters.update((current) => ({ ...current, [key]: value || undefined }));
  }

  protected readonly trackById = (_: number, ticket: TicketSummaryDto) => ticket.id;

  protected rowClass(ticket: TicketSummaryDto): string {
    if (ticket.status === 'RESOLVED') return '';
    if (ticket.slaState === 'BREACHED') return 'breached';
    if (ticket.slaState === 'AT_RISK') return 'at-risk';
    return '';
  }

  protected open(ticket: TicketSummaryDto): void {
    this.router.navigate(['/tickets', ticket.id]);
  }
}
