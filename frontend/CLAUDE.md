# SLA Desk UI — rules
- Angular (latest stable via `ng new`), standalone components, signals, new control flow (@if/@for).
- UI kit: Angular Material. Charts: ng2-charts (Chart.js). No other UI libraries.
- Backend: Spring Boot. Base URL from environment.apiUrl (dev http://localhost:8080).
- The API contract is ../docs/API.md. Never invent endpoints or fields. Models in core/models mirror its DTOs exactly.
- Auth: POST /api/auth/login returns { token, user }. Store both in localStorage. A functional HTTP interceptor adds
  "Authorization: Bearer <token>". On any 401: clear storage, go to /login.
- Roles AGENT, LEAD, MANAGER. Hide actions a role cannot perform (see API.md). Routes: role guard.
- Errors: show ProblemDetail.detail in a MatSnackBar.
- All timestamps are ISO UTC; display in the browser's local time. Countdowns tick every second on the client from dueAt;
  when pausedAt is set, show "Paused" and freeze the clock.
- SLA colours: ON_TRACK green, AT_RISK amber, BREACHED red, MET grey, paused blue-grey. Never colour alone: add a text label.
- Structure: core/(auth, api, models), layout/, features/(login, tickets, dashboard, sla-policies), shared/.
- Must look good on a 390px-wide phone and on a laptop.
- Do not modify anything outside frontend/ except docs when asked.
