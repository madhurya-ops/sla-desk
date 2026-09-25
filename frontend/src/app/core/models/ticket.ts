import { Category, EventType, Priority, SlaState, TicketStatus } from './enums';
import { UserRef } from './user';

export interface CreateTicketRequest {
  title: string;
  description: string;
  /** null = use the AI suggestion (fallback P3). */
  priority: Priority | null;
  /** null = use the AI suggestion (fallback APPLICATION). */
  category: Category | null;
}

export interface TicketSummaryDto {
  id: number;
  title: string;
  priority: Priority;
  category: Category;
  status: TicketStatus;
  slaState: SlaState;
  assignee: UserRef | null;
  escalated: boolean;
  needsTriage: boolean;
  createdAt: string;
  dueAt: string;
  /** When set, the SLA clock is frozen. */
  pausedAt: string | null;
  percentUsed: number;
  /** Negative once breached. */
  remainingSeconds: number;
  aiFrustration: number | null;
}

export interface TicketEventDto {
  id: number;
  type: EventType;
  /** "System" when the scheduler or the AI did it. */
  actorName: string;
  fromValue: string | null;
  toValue: string | null;
  message: string | null;
  createdAt: string;
}

export interface TicketDetailDto extends TicketSummaryDto {
  description: string;
  createdBy: UserRef;
  resolvedAt: string | null;
  slaMinutes: number;
  aiPriority: Priority | null;
  aiCategory: Category | null;
  aiConfidence: number | null;
  aiBusinessImpact: number | null;
  /** Oldest first. */
  events: TicketEventDto[];
}

export interface UpdateStatusRequest {
  status: TicketStatus;
  note: string | null;
}

export interface AssignRequest {
  assigneeId: number;
}

export interface CommentRequest {
  message: string;
}

export interface TicketQuery {
  status?: TicketStatus;
  slaState?: SlaState;
  priority?: Priority;
  mine?: boolean;
}
