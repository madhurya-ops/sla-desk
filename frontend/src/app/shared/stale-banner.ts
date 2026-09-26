import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Shown when a background refresh fails but earlier data is still on screen. */
@Component({
  selector: 'app-stale-banner',
  imports: [DatePipe, MatIconModule],
  template: `
    <mat-icon aria-hidden="true">sync_problem</mat-icon>
    <span>
      Can't reach the server; showing data from {{ since() | date: 'mediumTime' }}. Retrying…
    </span>
  `,
  host: { role: 'status' },
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding: 8px 12px;
      border-radius: 10px;
      font: var(--mat-sys-body-medium);
      background: color-mix(in srgb, var(--sla-at-risk) 12%, transparent);
      color: var(--sla-at-risk);
    }
    mat-icon {
      flex: none;
    }
  `,
})
export class StaleBanner {
  readonly since = input.required<Date>();
}
