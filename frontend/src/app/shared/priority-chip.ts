import { Component, input } from '@angular/core';
import { Priority } from '../core/models';

@Component({
  selector: 'app-priority-chip',
  template: `{{ priority() }}`,
  host: {
    '[class]': '"chip " + priority().toLowerCase()',
    '[attr.aria-label]': '"Priority " + priority()',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      padding: 2px 8px;
      border-radius: 999px;
      font: var(--mat-sys-label-medium);
      font-weight: 600;
      letter-spacing: 0.02em;
    }
    :host(.p1) {
      background: #fde7e7;
      color: #b71c1c;
    }
    :host(.p2) {
      background: #fff0db;
      color: #8a4b00;
    }
    :host(.p3) {
      background: #e3eefc;
      color: #0d47a1;
    }
    :host(.p4) {
      background: #eceff1;
      color: #455a64;
    }
  `,
})
export class PriorityChip {
  readonly priority = input.required<Priority>();
}
