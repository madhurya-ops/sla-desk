import { Priority } from './enums';

export interface PriorityBreakdown {
  priority: Priority;
  onTrack: number;
  atRisk: number;
  breached: number;
}

/** Counts cover unresolved tickets; compliance = resolved within SLA / all resolved. */
export interface DashboardSummaryDto {
  openCount: number;
  atRiskCount: number;
  breachedCount: number;
  escalatedCount: number;
  resolvedTodayCount: number;
  slaCompliancePercent: number;
  byPriority: PriorityBreakdown[];
}
