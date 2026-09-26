import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  defer,
  exhaustMap,
  filter,
  forkJoin,
  merge,
  switchMap,
  takeWhile,
  tap,
  timer,
} from 'rxjs';
import { silentErrors } from '../../core/api/error.interceptor';
import { TicketsApi } from '../../core/api/tickets.api';
import { UsersApi } from '../../core/api/users.api';
import { AuthService } from '../../core/auth/auth.service';
import { TicketDetailDto, TicketStatus, UserDto } from '../../core/models';
import { CATEGORY_LABELS, STATUS_LABELS } from '../../shared/labels';
import { PageState } from '../../shared/page-state';
import { PriorityChip } from '../../shared/priority-chip';
import { SlaBadge } from '../../shared/sla-badge';
import { StaleBanner } from '../../shared/stale-banner';
import { HoldDialog, HoldDialogResult } from './hold-dialog';
import { SlaProgress } from './sla-progress';
import { TicketAiPanel } from './ticket-ai-panel';
import { TicketFlags } from './ticket-flags';
import { TicketTimeline } from './ticket-timeline';
import { STATUS_MOVES, canChangeStatus, canReassign } from './ticket-rules';

const POLL_MS = 5000;

interface StatusAction {
  status: TicketStatus;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-ticket-detail',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    PageState,
    PriorityChip,
    SlaBadge,
    SlaProgress,
    StaleBanner,
    TicketAiPanel,
    TicketFlags,
    TicketTimeline,
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.scss',
})
export class TicketDetail {
  private readonly api = inject(TicketsApi);
  private readonly usersApi = inject(UsersApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  /** Route param, bound via withComponentInputBinding. */
  readonly id = input.required<string>();

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly categoryLabels = CATEGORY_LABELS;

  protected readonly user = inject(AuthService).currentUser;
  protected readonly ticket = signal<TicketDetailDto | null>(null);
  protected readonly notFound = signal(false);
  /** The last load failed for a reason other than 404; polling keeps retrying. */
  protected readonly failed = signal(false);
  protected readonly lastUpdated = signal<Date | null>(null);
  protected readonly busy = signal(false);
  protected readonly assignees = signal<UserDto[]>([]);
  // No required validator: Post is disabled while empty, and a validator would flag the box red after reset.
  protected readonly commentForm = new FormGroup({
    message: new FormControl('', { nonNullable: true }),
  });

  protected readonly canAct = computed(() => {
    const t = this.ticket();
    return !!t && canChangeStatus(this.user(), t);
  });
  protected readonly canReassign = computed(() => canReassign(this.user()));

  protected readonly actions = computed<StatusAction[]>(() => {
    const t = this.ticket();
    if (!t || !this.canAct()) return [];
    return STATUS_MOVES[t.status].map((to) => actionFor(t.status, to));
  });

  /**
   * Bumped on every write so a poll that was already in flight can't overwrite the fresher
   * response the write returned.
   */
  private writeSeq = 0;
  private readonly retry$ = new Subject<void>();

  constructor() {
    toObservable(this.id)
      .pipe(
        switchMap((id) => {
          this.ticket.set(null);
          this.notFound.set(false);
          this.failed.set(false);
          return merge(timer(0, POLL_MS), this.retry$).pipe(
            exhaustMap(() => this.load(Number(id))),
          );
        }),
        takeWhile(() => !this.notFound()),
        takeUntilDestroyed(),
      )
      .subscribe((ticket) => this.ticket.set(ticket));

    if (this.canReassign()) {
      forkJoin([this.usersApi.list('AGENT'), this.usersApi.list('LEAD')])
        .pipe(takeUntilDestroyed())
        .subscribe(([agents, leads]) => this.assignees.set([...agents, ...leads]));
    }

    const title = inject(Title);
    effect(() => {
      const t = this.ticket();
      title.setTitle(t ? `#${t.id} ${t.title} · SLA Desk` : 'Ticket · SLA Desk');
    });
  }

  protected retry(): void {
    this.retry$.next();
  }

  private load(id: number): Observable<TicketDetailDto> {
    return defer(() => {
      const seq = this.writeSeq;
      return this.api.get(id, silentErrors()).pipe(
        tap(() => {
          this.failed.set(false);
          this.lastUpdated.set(new Date());
        }),
        filter(() => seq === this.writeSeq),
        catchError((error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this.notFound.set(true);
          } else {
            this.failed.set(true);
          }
          return EMPTY;
        }),
      );
    });
  }

  protected changeStatus(action: StatusAction): void {
    const t = this.ticket();
    if (!t) return;
    if (action.status !== 'ON_HOLD') {
      this.write(this.api.updateStatus(t.id, { status: action.status, note: null }));
      return;
    }
    this.dialog
      .open<HoldDialog, void, HoldDialogResult>(HoldDialog, { width: '420px', maxWidth: '92vw' })
      .afterClosed()
      .subscribe((result) => {
        if (typeof result !== 'object') return;
        const note = result.note.trim() || null;
        this.write(this.api.updateStatus(t.id, { status: 'ON_HOLD', note }));
      });
  }

  protected reassign(assigneeId: number): void {
    const t = this.ticket();
    if (!t || t.assignee?.id === assigneeId) return;
    this.write(this.api.assign(t.id, { assigneeId }), (updated) =>
      this.snackBar.open(`Assigned to ${updated.assignee?.fullName ?? 'nobody'}`, undefined, {
        duration: 3000,
      }),
    );
  }

  protected postComment(): void {
    const t = this.ticket();
    const message = this.commentForm.controls.message.value.trim();
    if (!t || !message) return;
    this.write(this.api.comment(t.id, { message }), () => this.commentForm.reset());
  }

  private write(request: Observable<TicketDetailDto>, done?: (t: TicketDetailDto) => void): void {
    this.writeSeq++;
    this.busy.set(true);
    request.subscribe({
      next: (updated) => {
        this.writeSeq++;
        this.ticket.set(updated);
        this.busy.set(false);
        done?.(updated);
      },
      // The error interceptor shows ProblemDetail.detail; re-sync in case the ticket moved on.
      error: () => {
        this.busy.set(false);
        const t = this.ticket();
        if (t) this.load(t.id).subscribe((fresh) => this.ticket.set(fresh));
      },
    });
  }
}

function actionFor(from: TicketStatus, to: TicketStatus): StatusAction {
  switch (to) {
    case 'IN_PROGRESS':
      return from === 'ON_HOLD'
        ? { status: to, label: 'Resume', icon: 'play_arrow' }
        : { status: to, label: 'Start work', icon: 'play_arrow' };
    case 'ON_HOLD':
      return { status: to, label: 'Put on hold', icon: 'pause' };
    case 'RESOLVED':
      return { status: to, label: 'Resolve', icon: 'check' };
    default:
      return { status: to, label: STATUS_LABELS[to], icon: 'sync_alt' };
  }
}
