import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type PageStateKind = 'loading' | 'empty' | 'error';

const DEFAULT_ICONS: Record<PageStateKind, string> = {
  loading: '',
  empty: 'inbox',
  error: 'cloud_off',
};

/** Centered loading / empty / error placeholder. Project a button (e.g. Retry) as the action. */
@Component({
  selector: 'app-page-state',
  imports: [MatIconModule, MatProgressSpinnerModule],
  template: `
    @if (kind() === 'loading') {
      <mat-spinner diameter="36" />
    } @else {
      <mat-icon aria-hidden="true">{{ iconName() }}</mat-icon>
    }
    <p>{{ message() }}</p>
    <ng-content />
  `,
  host: {
    '[class]': 'kind()',
    '[attr.role]': 'kind() === "error" ? "alert" : "status"',
  },
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 48px 16px;
      text-align: center;
      color: var(--mat-sys-on-surface-variant);
    }
    :host(.error) mat-icon {
      color: var(--sla-breached);
    }
    mat-icon {
      width: 40px;
      height: 40px;
      font-size: 40px;
    }
    p {
      margin: 0;
      max-width: 36ch;
      font: var(--mat-sys-body-large);
    }
  `,
})
export class PageState {
  readonly kind = input.required<PageStateKind>();
  readonly message = input.required<string>();
  readonly icon = input<string>();

  protected readonly iconName = computed(() => this.icon() ?? DEFAULT_ICONS[this.kind()]);
}
