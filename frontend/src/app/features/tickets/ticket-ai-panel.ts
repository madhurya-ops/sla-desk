import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TicketDetailDto } from '../../core/models';
import { CATEGORY_LABELS, frustrationLabel, isFrustrated, percent } from '../../shared/labels';

@Component({
  selector: 'app-ticket-ai-panel',
  imports: [MatIconModule],
  template: `
    <h2><mat-icon>smart_toy</mat-icon> AI triage</h2>
    @let t = ticket();
    @if (hasAi()) {
      <dl>
        <div>
          <dt>Priority</dt>
          <dd>{{ t.aiPriority ?? '—' }}</dd>
        </div>
        <div>
          <dt>Team</dt>
          <dd>{{ t.aiCategory ? categoryLabels[t.aiCategory] : '—' }}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{{ t.aiConfidence !== null ? percent(t.aiConfidence) : '—' }}</dd>
        </div>
        <div>
          <dt>Customer mood</dt>
          <dd [class.frustrated]="frustrated()">{{ mood() }}</dd>
        </div>
      </dl>
      @if (t.aiBusinessImpact !== null) {
        <div class="impact">
          <div class="impact-label">
            <span>Business impact</span><span>{{ percent(t.aiBusinessImpact) }}</span>
          </div>
          <div
            class="bar"
            role="meter"
            aria-label="Business impact"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-valuenow]="t.aiBusinessImpact * 100"
          >
            <div
              class="fill"
              [class.high]="t.aiBusinessImpact >= 0.8"
              [style.width.%]="t.aiBusinessImpact * 100"
            ></div>
          </div>
        </div>
      }
    } @else {
      <p class="muted"><mat-icon>cloud_off</mat-icon> AI triage was unavailable for this ticket.</p>
    }
    @if (t.needsTriage) {
      <p class="triage"><mat-icon>help</mat-icon> Needs triage: check priority and team.</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px;
      font: var(--mat-sys-title-medium);
    }
    dl {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 0 0 12px;
    }
    dt {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    dd {
      margin: 2px 0 0;
      font: var(--mat-sys-title-medium);
    }
    dd.frustrated {
      color: var(--sla-at-risk);
    }
    .impact-label {
      display: flex;
      justify-content: space-between;
      font: var(--mat-sys-label-medium);
      margin-bottom: 4px;
    }
    .bar {
      height: 8px;
      border-radius: 4px;
      background: var(--mat-sys-surface-container-highest);
      overflow: hidden;
    }
    .fill {
      height: 100%;
      background: var(--mat-sys-primary);
    }
    .fill.high {
      background: var(--sla-breached);
    }
    p {
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 12px 0 0;
      font: var(--mat-sys-body-medium);
    }
    .muted {
      color: var(--mat-sys-on-surface-variant);
    }
    .triage {
      color: var(--sla-at-risk);
    }
  `,
})
export class TicketAiPanel {
  readonly ticket = input.required<TicketDetailDto>();

  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly percent = percent;

  protected readonly hasAi = computed(() => {
    const t = this.ticket();
    return t.aiPriority !== null || t.aiCategory !== null || t.aiConfidence !== null;
  });
  protected readonly mood = computed(() => {
    const score = this.ticket().aiFrustration;
    return score === null ? '—' : frustrationLabel(score);
  });
  protected readonly frustrated = computed(() => isFrustrated(this.ticket().aiFrustration));
}
