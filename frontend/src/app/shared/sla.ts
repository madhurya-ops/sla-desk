import { SlaState, TicketStatus } from '../core/models';

/** What the badge should look like: the server's state, "PAUSED", or BREACHED once the client clock passes dueAt. */
export type SlaTone = SlaState | 'PAUSED';

export interface SlaClockInput {
  status: TicketStatus;
  slaState: SlaState;
  dueAt: string;
  pausedAt: string | null;
}

export interface SlaDisplay {
  tone: SlaTone;
  text: string;
}

/** Positive seconds as "mm:ss" under an hour, otherwise "3h 12m". */
export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  if (s < 3600) {
    return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  }
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
}

/** Compact elapsed duration: "45s", "4m", "2h 5m", "3d 4h". */
export function formatElapsed(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}

/** A minute count in exact d/h/m units: 90 -> "1h 30m", 1440 -> "1d", 2 -> "2m". */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.floor(minutes));
  const parts: [number, string][] = [
    [Math.floor(m / 1440), 'd'],
    [Math.floor((m % 1440) / 60), 'h'],
    [m % 60, 'm'],
  ];
  const text = parts
    .filter(([n]) => n > 0)
    .map(([n, unit]) => `${n}${unit}`)
    .join(' ');
  return text || '0m';
}

/** Ticks from dueAt on the client; frozen while paused; static once resolved. */
export function slaDisplay(ticket: SlaClockInput, now: number): SlaDisplay {
  if (ticket.status === 'RESOLVED') {
    return { tone: ticket.slaState, text: ticket.slaState === 'BREACHED' ? 'Breached' : 'Met' };
  }
  if (ticket.pausedAt) {
    return { tone: 'PAUSED', text: 'Paused' };
  }
  const remaining = Math.floor((Date.parse(ticket.dueAt) - now) / 1000);
  if (remaining < 0 || ticket.slaState === 'BREACHED') {
    return { tone: 'BREACHED', text: `Breached ${formatElapsed(-remaining)} ago` };
  }
  return { tone: ticket.slaState, text: formatCountdown(remaining) };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
