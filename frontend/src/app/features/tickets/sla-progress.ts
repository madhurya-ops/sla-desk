import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TicketDetailDto } from '../../core/models';
import { Clock } from '../../shared/clock';
import { SlaBadge } from '../../shared/sla-badge';
import { slaDisplay } from '../../shared/sla';

/** Large SLA bar: percentUsed coloured by state, with a "Paused" overlay while the clock is frozen. */
@Component({
  selector: 'app-sla-progress',
  imports: [DatePipe, DecimalPipe, MatIconModule, SlaBadge],
  template: `
    <div class="top">
      <span class="label">SLA · {{ ticket().slaMinutes }} min</span>
      <app-sla-badge [ticket]="ticket()" />
    </div>
    <div
      class="track"
      role="progressbar"
      aria-label="SLA time used"
      aria-valuemin="0"
      aria-valuemax="100"
      [attr.aria-valuenow]="clamped()"
      [attr.aria-valuetext]="(ticket().percentUsed | number: '1.0-0') + '% used'"
    >
      <div class="fill" [style.width.%]="clamped()"></div>
      @if (paused()) {
        <div class="paused"><mat-icon>pause</mat-icon> Paused</div>
      }
    </div>
    <div class="times">
      <span>Created {{ ticket().createdAt | date: 'medium' }}</span>
      <span class="used">{{ ticket().percentUsed | number: '1.0-0' }}% used</span>
      <span>
        @if (ticket().resolvedAt; as resolvedAt) {
          Resolved {{ resolvedAt | date: 'medium' }}
        } @else {
          Due {{ ticket().dueAt | date: 'medium' }}
        }
      </span>
    </div>
  `,
  host: { '[class]': '"tone-" + tone()' },
  styles: `
    :host {
      --tone: var(--sla-on-track);
      display: block;
    }
    :host(.tone-at-risk) {
      --tone: var(--sla-at-risk);
    }
    :host(.tone-breached) {
      --tone: var(--sla-breached);
    }
    :host(.tone-met) {
      --tone: var(--sla-met);
    }
    :host(.tone-paused) {
      --tone: var(--sla-paused);
    }
    .top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .label {
      font: var(--mat-sys-title-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .track {
      position: relative;
      height: 20px;
      border-radius: 10px;
      overflow: hidden;
      background: color-mix(in srgb, var(--tone) 14%, var(--mat-sys-surface-container-high));
    }
    .fill {
      height: 100%;
      background: var(--tone);
      transition: width 400ms ease;
    }
    .paused {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: #fff;
      font: var(--mat-sys-label-large);
      background: repeating-linear-gradient(
        135deg,
        rgb(84 110 122 / 0.75) 0 10px,
        rgb(84 110 122 / 0.55) 10px 20px
      );
    }
    .paused mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .times {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 4px 12px;
      margin-top: 8px;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .used {
      font-weight: 600;
      color: var(--tone);
    }
  `,
})
export class SlaProgress {
  private readonly clock = inject(Clock);

  readonly ticket = input.required<TicketDetailDto>();

  protected readonly paused = computed(() => !!this.ticket().pausedAt);
  protected readonly clamped = computed(() =>
    Math.min(100, Math.max(0, this.ticket().percentUsed)),
  );
  protected readonly tone = computed(() =>
    slaDisplay(this.ticket(), this.clock.now()).tone.toLowerCase().replace('_', '-'),
  );
}
