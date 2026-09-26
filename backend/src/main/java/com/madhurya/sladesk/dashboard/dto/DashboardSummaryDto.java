package com.madhurya.sladesk.dashboard.dto;

import java.util.List;

public record DashboardSummaryDto(long openCount, long atRiskCount, long breachedCount,
                                  long escalatedCount, long resolvedTodayCount, double slaCompliancePercent,
                                  List<PriorityBreakdown> byPriority) {}
