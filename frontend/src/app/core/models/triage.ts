import { Category, Priority } from './enums';

export interface TriageRequest {
  title: string;
  description: string;
}

/** available=false means AI was unreachable; other fields are null and needsTriage=true. */
export interface TriageResult {
  available: boolean;
  priority: Priority | null;
  priorityConfidence: number | null;
  category: Category | null;
  categoryConfidence: number | null;
  /** 0..1; >= 0.8 triggers immediate escalation on create. */
  businessImpact: number | null;
  /** 0..3: 0 Calm, 1 Mildly annoyed, 2 Frustrated, 3 Very angry. */
  frustration: number | null;
  needsTriage: boolean;
}
