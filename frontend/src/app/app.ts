import { Component, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  constructor() {
    // index.html loads the Material Symbols font rather than the legacy Material Icons one.
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
  }
}
