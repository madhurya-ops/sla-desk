import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { silentErrors } from '../../core/api/error.interceptor';
import { SlaPoliciesApi } from '../../core/api/sla-policies.api';
import { Priority, SlaPolicyDto } from '../../core/models';
import { PageState } from '../../shared/page-state';
import { PriorityChip } from '../../shared/priority-chip';
import { formatMinutes } from '../../shared/sla';

type PolicyForm = FormGroup<{
  resolutionMinutes: FormControl<number>;
  atRiskPercent: FormControl<number>;
}>;

interface PolicyRow {
  priority: Priority;
  form: PolicyForm;
}

@Component({
  selector: 'app-sla-policies',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PageState,
    PriorityChip,
  ],
  templateUrl: './sla-policies.html',
  styleUrl: './sla-policies.scss',
})
export class SlaPolicies {
  private readonly api = inject(SlaPoliciesApi);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  private readonly destroyRef = inject(DestroyRef);

  /** null until loaded. */
  protected readonly rows = signal<PolicyRow[] | null>(null);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);
  protected readonly saving = signal<Priority | null>(null);
  protected readonly formatMinutes = formatMinutes;

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.failed.set(false);
    this.api
      .list(silentErrors())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (policies) => {
          this.rows.set(policies.map((p) => ({ priority: p.priority, form: this.buildForm(p) })));
          this.loading.set(false);
        },
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }

  private buildForm(policy: SlaPolicyDto): PolicyForm {
    return this.fb.group({
      resolutionMinutes: [
        policy.resolutionMinutes,
        [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
      ],
      atRiskPercent: [
        policy.atRiskPercent,
        [Validators.required, Validators.min(1), Validators.max(99), Validators.pattern(/^\d+$/)],
      ],
    });
  }

  protected save(row: PolicyRow): void {
    if (row.form.invalid || row.form.pristine || this.saving()) {
      row.form.markAllAsTouched();
      return;
    }
    this.saving.set(row.priority);
    const { resolutionMinutes, atRiskPercent } = row.form.getRawValue();
    this.api
      .update(row.priority, {
        resolutionMinutes: Number(resolutionMinutes),
        atRiskPercent: Number(atRiskPercent),
      })
      .subscribe({
        next: (saved) => {
          row.form.reset({
            resolutionMinutes: saved.resolutionMinutes,
            atRiskPercent: saved.atRiskPercent,
          });
          this.saving.set(null);
          this.snackBar.open(`${saved.priority} saved. Applies to new tickets only`, 'OK', {
            duration: 4000,
          });
        },
        // The error interceptor shows ProblemDetail.detail in a snackbar.
        error: () => this.saving.set(null),
      });
  }
}
