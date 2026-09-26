import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { TicketsApi } from '../../core/api/tickets.api';
import { TriageApi } from '../../core/api/triage.api';
import { Category, Priority, TriageRequest, TriageResult } from '../../core/models';
import { CATEGORIES, CATEGORY_LABELS, PRIORITIES, percent } from '../../shared/labels';

const TRIAGE_DEBOUNCE_MS = 800;
const HIGH_IMPACT = 0.8;
const FALLBACK_PRIORITY: Priority = 'P3';
const FALLBACK_CATEGORY: Category = 'APPLICATION';

/** What we show when the preview call itself fails: same as the API's available=false. */
const UNAVAILABLE: TriageResult = {
  available: false,
  priority: null,
  priorityConfidence: null,
  category: null,
  categoryConfidence: null,
  businessImpact: null,
  frustration: null,
  needsTriage: true,
};

@Component({
  selector: 'app-ticket-new',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  templateUrl: './ticket-new.html',
  styleUrl: './ticket-new.scss',
})
export class TicketNew {
  private readonly ticketsApi = inject(TicketsApi);
  private readonly triageApi = inject(TriageApi);
  private readonly router = inject(Router);

  protected readonly priorities = PRIORITIES;
  protected readonly categories = CATEGORIES;
  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly percent = percent;
  protected readonly highImpact = HIGH_IMPACT;

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.required],
    priority: this.fb.control<Priority | null>(null, Validators.required),
    category: this.fb.control<Category | null>(null, Validators.required),
  });

  protected readonly triage = signal<TriageResult | null>(null);
  protected readonly triaging = signal(false);
  protected readonly submitting = signal(false);

  constructor() {
    this.form.valueChanges
      .pipe(
        map((v): TriageRequest => ({
          title: v.title?.trim() ?? '',
          description: v.description?.trim() ?? '',
        })),
        distinctUntilChanged((a, b) => a.title === b.title && a.description === b.description),
        debounceTime(TRIAGE_DEBOUNCE_MS),
        filter((req) => !!req.title && !!req.description),
        tap(() => this.triaging.set(true)),
        switchMap((req) => this.triageApi.preview(req).pipe(catchError(() => of(UNAVAILABLE)))),
        takeUntilDestroyed(),
      )
      .subscribe((result) => {
        this.triaging.set(false);
        this.triage.set(result);
        this.prefill(result);
      });
  }

  /** Fill the selects from the suggestion, but never overwrite a choice the user made. */
  private prefill(result: TriageResult): void {
    const { priority, category } = this.form.controls;
    if (!priority.dirty) {
      priority.setValue(result.available ? result.priority : FALLBACK_PRIORITY);
    }
    if (!category.dirty) {
      category.setValue(result.available ? result.category : FALLBACK_CATEGORY);
    }
  }

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const { title, description, priority, category } = this.form.getRawValue();
    this.ticketsApi
      .create({ title: title.trim(), description: description.trim(), priority, category })
      .subscribe({
        next: (ticket) => this.router.navigate(['/tickets', ticket.id]),
        // The error interceptor shows ProblemDetail.detail in a snackbar.
        error: () => this.submitting.set(false),
      });
  }
}
