import { Category, EventType, Priority, SlaState, TicketStatus } from '../core/models';

export const PRIORITIES: Priority[] = ['P1', 'P2', 'P3', 'P4'];
export const CATEGORIES: Category[] = ['INFRA', 'APPLICATION', 'ACCESS', 'BILLING'];
export const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED'];
export const SLA_STATES: SlaState[] = ['ON_TRACK', 'AT_RISK', 'BREACHED', 'MET'];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  ON_HOLD: 'On hold',
  RESOLVED: 'Resolved',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  INFRA: 'Infra',
  APPLICATION: 'Application',
  ACCESS: 'Access',
  BILLING: 'Billing',
};

export const SLA_STATE_LABELS: Record<SlaState, string> = {
  ON_TRACK: 'On track',
  AT_RISK: 'At risk',
  BREACHED: 'Breached',
  MET: 'Met',
};

export const EVENT_LABELS: Record<EventType, string> = {
  CREATED: 'Created',
  AI_TRIAGED: 'AI triaged',
  ASSIGNED: 'Assigned',
  STATUS_CHANGED: 'Status changed',
  COMMENT: 'Comment',
  SLA_AT_RISK: 'SLA at risk',
  SLA_BREACHED: 'SLA breached',
  ESCALATED: 'Escalated',
};

const FRUSTRATION_LABELS = ['Calm', 'Mildly annoyed', 'Frustrated', 'Very angry'];

/** Frustration is 0..3; each whole step is a band (2.1 is "Frustrated"). */
export function frustrationLabel(score: number): string {
  const band = Math.min(3, Math.max(0, Math.floor(score)));
  return FRUSTRATION_LABELS[band];
}

export function isFrustrated(score: number | null): boolean {
  return score !== null && score >= 2;
}

export function percent(fraction: number): string {
  return `${Math.round(fraction * 100)}%`;
}
