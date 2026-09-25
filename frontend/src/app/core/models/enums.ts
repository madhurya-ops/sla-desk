export type Role = 'AGENT' | 'LEAD' | 'MANAGER';
export type Priority = 'P1' | 'P2' | 'P3' | 'P4';
export type Category = 'INFRA' | 'APPLICATION' | 'ACCESS' | 'BILLING';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'ON_HOLD' | 'RESOLVED';
export type SlaState = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'MET';
export type EventType =
  | 'CREATED'
  | 'AI_TRIAGED'
  | 'ASSIGNED'
  | 'STATUS_CHANGED'
  | 'COMMENT'
  | 'SLA_AT_RISK'
  | 'SLA_BREACHED'
  | 'ESCALATED';
