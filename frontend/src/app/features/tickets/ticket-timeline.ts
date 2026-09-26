import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EventType, TicketEventDto } from '../../core/models';
import { Clock } from '../../shared/clock';
import { CATEGORY_LABELS, EVENT_LABELS, STATUS_LABELS } from '../../shared/labels';
import { formatElapsed } from '../../shared/sla';

const EVENT_ICONS: Record<EventType, string> = {
  CREATED: 'add_circle',
  AI_TRIAGED: 'smart_toy',
  ASSIGNED: 'person',
  STATUS_CHANGED: 'sync_alt',
  COMMENT: 'chat',
  SLA_AT_RISK: 'warning',
  SLA_BREACHED: 'e911_emergency',
  ESCALATED: 'e911_emergency',
};

const ALARM_EVENTS: EventType[] = ['SLA_AT_RISK', 'SLA_BREACHED', 'ESCALATED'];
const SYSTEM_ACTOR = 'System';

/** Enum-ish from/to values ("ON_HOLD", "INFRA") read better as labels; names pass through. */
const VALUE_LABELS: Record<string, string> = { ...STATUS_LABELS, ...CATEGORY_LABELS };

@Component({
  selector: 'app-ticket-timeline',
  imports: [DatePipe, MatIconModule],
  template: `
    <ol>
      @for (e of events(); track e.id) {
        <li
          [class.system]="e.actorName === systemActor"
          [class.alarm]="isAlarm(e.type)"
          [class.breach]="e.type !== 'SLA_AT_RISK' && isAlarm(e.type)"
        >
          <span class="dot"
            ><mat-icon aria-hidden="true">{{ icons[e.type] }}</mat-icon></span
          >
          <div class="body">
            <div class="head">
              <span class="type">{{ labels[e.type] }}</span>
              <span class="actor">{{ e.actorName }}</span>
              <time [attr.datetime]="e.createdAt" [title]="e.createdAt | date: 'medium'">
                {{ ago(e.createdAt) }}
              </time>
            </div>
            @if (e.fromValue || e.toValue) {
              <div class="change">
                @if (e.fromValue) {
                  <span>{{ label(e.fromValue) }}</span>
                  <mat-icon aria-label="to">arrow_forward</mat-icon>
                }
                <strong>{{ e.toValue ? label(e.toValue) : '—' }}</strong>
              </div>
            }
            @if (e.message) {
              <p class="message">{{ e.message }}</p>
            }
          </div>
        </li>
      } @empty {
        <li class="empty">No activity yet.</li>
      }
    </ol>
  `,
  styles: `
    ol {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      position: relative;
      display: flex;
      gap: 12px;
      padding-bottom: 16px;
    }
    li:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 32px;
      bottom: 0;
      width: 2px;
      background: var(--mat-sys-outline-variant);
    }
    .dot {
      flex: none;
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--mat-sys-secondary-container);
      color: var(--mat-sys-on-secondary-container);
    }
    .dot mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .body {
      flex: 1;
      min-width: 0;
      padding-top: 5px;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 8px;
    }
    .type {
      font: var(--mat-sys-title-small);
    }
    .actor {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    time {
      margin-left: auto;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .change {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      font: var(--mat-sys-body-medium);
    }
    .change mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    .message {
      margin: 4px 0 0;
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
    li.system .body {
      padding: 6px 10px;
      border-radius: 10px;
      background: var(--mat-sys-surface-container);
      border: 1px dashed var(--mat-sys-outline-variant);
    }
    li.system .dot {
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
    }
    li.system .actor {
      font-style: italic;
    }
    li.alarm .dot {
      background: var(--sla-at-risk);
      color: #fff;
    }
    li.alarm .body {
      border-color: var(--sla-at-risk);
    }
    li.breach .dot {
      background: var(--sla-breached);
    }
    li.breach .body {
      border: 1px solid var(--sla-breached);
      background: color-mix(in srgb, var(--sla-breached) 8%, transparent);
    }
    .empty {
      color: var(--mat-sys-on-surface-variant);
    }
  `,
})
export class TicketTimeline {
  private readonly clock = inject(Clock);

  readonly events = input.required<TicketEventDto[]>();

  protected readonly icons = EVENT_ICONS;
  protected readonly labels = EVENT_LABELS;
  protected readonly systemActor = SYSTEM_ACTOR;

  private readonly now = computed(() => this.clock.now());

  protected isAlarm(type: EventType): boolean {
    return ALARM_EVENTS.includes(type);
  }

  protected label(value: string): string {
    return VALUE_LABELS[value] ?? value;
  }

  protected ago(iso: string): string {
    const seconds = (this.now() - Date.parse(iso)) / 1000;
    return seconds < 10 ? 'just now' : `${formatElapsed(seconds)} ago`;
  }
}
