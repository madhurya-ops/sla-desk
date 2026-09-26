import { DestroyRef, Injectable, inject, signal } from '@angular/core';

/** A single app-wide 1-second tick so every countdown and relative time moves in step. */
@Injectable({ providedIn: 'root' })
export class Clock {
  private readonly _now = signal(Date.now());
  readonly now = this._now.asReadonly();

  constructor() {
    const id = setInterval(() => this._now.set(Date.now()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
}
