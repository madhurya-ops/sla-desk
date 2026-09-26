import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TicketSummaryDto } from '../../core/models';
import { isFrustrated } from '../../shared/labels';

interface Flag {
  icon: string;
  label: string;
  tone: string;
}

/** Small icons for escalated / needs triage / frustrated customer. */
@Component({
  selector: 'app-ticket-flags',
  imports: [MatIconModule, MatTooltipModule],
  template: `
    @for (flag of flags(); track flag.icon) {
      <mat-icon
        [class]="flag.tone"
        [matTooltip]="flag.label"
        [attr.aria-label]="flag.label"
        aria-hidden="false"
        role="img"
        >{{ flag.icon }}</mat-icon
      >
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      gap: 2px;
      vertical-align: middle;
    }
    mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .escalated {
      color: var(--sla-breached);
    }
    .triage {
      color: var(--mat-sys-tertiary);
    }
    .frustrated {
      color: var(--sla-at-risk);
    }
  `,
})
export class TicketFlags {
  readonly ticket = input.required<TicketSummaryDto>();

  protected readonly flags = computed(() => {
    const t = this.ticket();
    const flags: Flag[] = [];
    if (t.escalated) flags.push({ icon: 'e911_emergency', label: 'Escalated', tone: 'escalated' });
    if (t.needsTriage) flags.push({ icon: 'help', label: 'Needs triage', tone: 'triage' });
    if (isFrustrated(t.aiFrustration)) {
      flags.push({
        icon: 'sentiment_very_dissatisfied',
        label: 'Frustrated customer',
        tone: 'frustrated',
      });
    }
    return flags;
  });
}
