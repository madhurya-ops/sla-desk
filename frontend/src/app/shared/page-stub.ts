import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Placeholder body for pages that are not built yet. */
@Component({
  selector: 'app-page-stub',
  imports: [MatIconModule],
  template: `
    <h1>{{ heading() }}</h1>
    <div class="stub">
      <mat-icon>construction</mat-icon>
      <p>{{ note() }}</p>
    </div>
  `,
  styles: `
    h1 { font: var(--mat-sys-headline-small); margin: 0 0 16px; }
    .stub {
      display: flex; align-items: center; gap: 12px; padding: 24px;
      border: 1px dashed var(--mat-sys-outline-variant); border-radius: 12px;
      color: var(--mat-sys-on-surface-variant);
    }
    p { margin: 0; }
  `,
})
export class PageStub {
  readonly heading = input.required<string>();
  readonly note = input('Coming soon.');
}
