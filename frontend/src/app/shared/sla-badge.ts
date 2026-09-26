import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SLA_STATE_LABELS } from './labels';
import { Clock } from './clock';
import { SlaClockInput, SlaTone, slaDisplay } from './sla';

const TONE_ICONS: Record<SlaTone, string> = {
  ON_TRACK: 'schedule',
  AT_RISK: 'warning',
  BREACHED: 'error',
  MET: 'check_circle',
  PAUSED: 'pause_circle',
};

/** SLA state with a live countdown. Colour is always paired with an icon and text. */
@Component({
  selector: 'app-sla-badge',
  imports: [MatIconModule],
  template: `
    <mat-icon aria-hidden="true">{{ icon() }}</mat-icon>
    @if (showStateLabel()) {
      <span class="state">{{ stateLabel() }}</span>
    }
    <span class="time">{{ display().text }}</span>
  `,
  host: {
    '[class]': '"tone-" + display().tone.toLowerCase().replace("_", "-")',
    role: 'status',
  },
  styles: `
    :host {
      --tone: var(--sla-on-track);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 10px 2px 6px;
      border-radius: 999px;
      white-space: nowrap;
      color: var(--tone);
      background: color-mix(in srgb, var(--tone) 12%, transparent);
      font: var(--mat-sys-label-large);
      font-variant-numeric: tabular-nums;
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
    mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .state {
      font-weight: 600;
    }
    .state::after {
      content: '·';
      margin-left: 4px;
    }
  `,
})
export class SlaBadge {
  private readonly clock = inject(Clock);

  readonly ticket = input.required<SlaClockInput>();

  protected readonly display = computed(() => slaDisplay(this.ticket(), this.clock.now()));
  protected readonly icon = computed(() => TONE_ICONS[this.display().tone]);

  /** Countdowns carry a state word too ("At risk · 09:58"); "Paused", "Met", "Breached …" already say it. */
  protected readonly showStateLabel = computed(() => {
    const { tone } = this.display();
    return tone === 'ON_TRACK' || tone === 'AT_RISK';
  });
  protected readonly stateLabel = computed(() => {
    const tone = this.display().tone;
    return tone === 'PAUSED' ? 'Paused' : SLA_STATE_LABELS[tone];
  });
}
