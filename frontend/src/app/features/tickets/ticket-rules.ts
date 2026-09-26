import { TicketStatus, TicketSummaryDto, UserDto } from '../../core/models';

/** Allowed status moves, per docs/API.md. */
export const STATUS_MOVES: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'ON_HOLD', 'RESOLVED'],
  IN_PROGRESS: ['ON_HOLD', 'RESOLVED'],
  ON_HOLD: ['IN_PROGRESS', 'RESOLVED'],
  RESOLVED: [],
};

/** Agents may change status only on tickets assigned to them; leads and managers on any. */
export function canChangeStatus(user: UserDto | null, ticket: TicketSummaryDto): boolean {
  if (!user) return false;
  return user.role !== 'AGENT' || ticket.assignee?.id === user.id;
}

export function canReassign(user: UserDto | null): boolean {
  return user?.role === 'LEAD' || user?.role === 'MANAGER';
}
