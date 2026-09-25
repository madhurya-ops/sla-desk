# SLA Desk API

Base URL: local http://localhost:8080, prod https://<app>.onrender.com
All endpoints except login need header: Authorization: Bearer <token>
All timestamps are ISO-8601 UTC strings, e.g. "2026-09-28T04:30:00Z".
Errors return Spring ProblemDetail JSON: { "status": 409, "title": "Conflict", "detail": "Cannot move RESOLVED -> OPEN" }

## Enums
Role: AGENT | LEAD | MANAGER
Priority: P1 | P2 | P3 | P4
Category: INFRA | APPLICATION | ACCESS | BILLING
TicketStatus: OPEN | IN_PROGRESS | ON_HOLD | RESOLVED
SlaState: ON_TRACK | AT_RISK | BREACHED | MET
EventType: CREATED | AI_TRIAGED | ASSIGNED | STATUS_CHANGED | COMMENT | SLA_AT_RISK | SLA_BREACHED | ESCALATED

Allowed status moves:
OPEN -> IN_PROGRESS, ON_HOLD, RESOLVED
IN_PROGRESS -> ON_HOLD, RESOLVED
ON_HOLD -> IN_PROGRESS, RESOLVED
RESOLVED -> (none)
Agents may change status only on tickets assigned to them.

## Endpoints
| Method | Path | Who | Body | Returns |
|---|---|---|---|---|
| POST | /api/auth/login | anyone | LoginRequest | LoginResponse |
| GET | /api/auth/me | any role | - | UserDto |
| GET | /api/users?role=AGENT | LEAD, MANAGER | - | UserDto[] |
| POST | /api/triage/preview | any role | TriageRequest | TriageResult |
| GET | /api/tickets?status=&slaState=&priority=&mine=true | any role | - | TicketSummaryDto[] sorted by dueAt ascending |
| POST | /api/tickets | any role | CreateTicketRequest | TicketDetailDto (201) |
| GET | /api/tickets/{id} | any role | - | TicketDetailDto |
| PATCH | /api/tickets/{id}/status | any role (rules above) | UpdateStatusRequest | TicketDetailDto |
| PATCH | /api/tickets/{id}/assignee | LEAD, MANAGER | AssignRequest | TicketDetailDto |
| POST | /api/tickets/{id}/comments | any role | CommentRequest | TicketDetailDto |
| GET | /api/sla-policies | any role | - | SlaPolicyDto[] |
| PUT | /api/sla-policies/{priority} | MANAGER | UpdateSlaPolicyRequest | SlaPolicyDto |
| GET | /api/dashboard/summary | any role | - | DashboardSummaryDto |
| GET | /actuator/health | anyone | - | { "status": "UP" } |
| GET | /swagger-ui.html | anyone | - | Swagger UI |
| GET | /v3/api-docs | anyone | - | OpenAPI JSON |

## Shapes
LoginRequest       { "email": "agent.infra@sladesk.dev", "password": "Demo@123" }
LoginResponse      { "token": "eyJ...", "user": UserDto }
UserDto            { "id": 1, "email": "...", "fullName": "Arjun (Infra Agent)", "role": "AGENT", "team": "INFRA" | null }
UserRef            { "id": 3, "fullName": "Rahul (Team Lead)" }

TriageRequest      { "title": "...", "description": "..." }
TriageResult       { "available": true, "priority": "P1", "priorityConfidence": 0.91,
                     "category": "INFRA", "categoryConfidence": 0.84,
                     "businessImpact": 0.95, "frustration": 2.1, "needsTriage": false }
                   available=false means AI was unreachable; other fields are null and needsTriage=true.
                   businessImpact is 0..1 (>= 0.8 triggers immediate escalation on create).
                   frustration is 0..3: 0 Calm, 1 Mildly annoyed, 2 Frustrated, 3 Very angry.

CreateTicketRequest { "title": "..." (required, max 200), "description": "..." (required),
                      "priority": "P1" | null, "category": "INFRA" | null }
                    null priority/category = use the AI suggestion (fallback P3 / APPLICATION).

TicketSummaryDto   { "id": 12, "title": "...", "priority": "P1", "category": "INFRA",
                     "status": "IN_PROGRESS", "slaState": "AT_RISK", "assignee": UserRef | null,
                     "escalated": false, "needsTriage": false,
                     "createdAt": "...", "dueAt": "...", "pausedAt": "..." | null,
                     "percentUsed": 83.4, "remainingSeconds": 598, "aiFrustration": 2.1 | null }
                   remainingSeconds is negative once breached. When pausedAt != null the clock is frozen.

TicketDetailDto    TicketSummaryDto fields plus:
                   { "description": "...", "createdBy": UserRef, "resolvedAt": "..." | null,
                     "slaMinutes": 60, "aiPriority": "P1" | null, "aiCategory": "INFRA" | null,
                     "aiConfidence": 0.91 | null, "aiBusinessImpact": 0.95 | null,
                     "events": TicketEventDto[] (oldest first) }
TicketEventDto     { "id": 40, "type": "ESCALATED", "actorName": "System", "fromValue": "Arjun (Infra Agent)",
                     "toValue": "Rahul (Team Lead)", "message": "Auto-escalated: SLA breached", "createdAt": "..." }
                   actorName is "System" when the scheduler or the AI did it.

UpdateStatusRequest { "status": "ON_HOLD", "note": "Waiting for client" | null }
AssignRequest       { "assigneeId": 2 }
CommentRequest      { "message": "Restarted the gateway pods" }

SlaPolicyDto          { "priority": "P1", "resolutionMinutes": 60, "atRiskPercent": 80 }
UpdateSlaPolicyRequest { "resolutionMinutes": 2, "atRiskPercent": 80 }   (applies to NEW tickets only)

DashboardSummaryDto { "openCount": 9, "atRiskCount": 3, "breachedCount": 2, "escalatedCount": 2,
                      "resolvedTodayCount": 4, "slaCompliancePercent": 87.5,
                      "byPriority": [ { "priority": "P1", "onTrack": 1, "atRisk": 1, "breached": 1 }, ... ] }
                    Counts cover unresolved tickets; compliance = resolved within SLA / all resolved.

## Demo users (password Demo@123)
agent.infra@sladesk.dev (AGENT, INFRA), agent.app@sladesk.dev (AGENT, APPLICATION),
lead@sladesk.dev (LEAD), manager@sladesk.dev (MANAGER)