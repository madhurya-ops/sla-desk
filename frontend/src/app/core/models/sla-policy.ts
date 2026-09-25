import { Priority } from './enums';

export interface SlaPolicyDto {
  priority: Priority;
  resolutionMinutes: number;
  atRiskPercent: number;
}

/** Applies to NEW tickets only. */
export interface UpdateSlaPolicyRequest {
  resolutionMinutes: number;
  atRiskPercent: number;
}
