# TV Hub V6.5: Audit Logs (Session 16 instructor version)

## Teaching scope

The live coding example is the Report flow: validate, persist the Report, write an AuditLog, then continue the existing email and Socket.IO behavior. The Report controller and escalation job show these calls directly. Security auditing is a complete supporting feature; it uses the same small model and write helper without changing the MVC structure.

## Model and events

`AuditLog` stores `category`, `action`, `actorType`, optional `actorId`, `resourceType`, optional `resourceId` and `sessionId`, selected `metadata`, and `createdAt`. It has no update or delete routes. Indexes support Report history, category/action timelines, actor lookup, and session lookup.

| Category | Actions |
| --- | --- |
| REPORT | `REPORT_CREATED`, `REPORT_UPDATED`, `REPORT_ESCALATED`, `REPORT_RESOLVED`, `REPORT_DELETED` |
| SECURITY | `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILURE`, `AUTH_LOGOUT`, `AUTH_REFRESH_SUCCESS`, `AUTH_REFRESH_FAILURE`, `AUTHORIZATION_DENIED`, `SESSION_CREATED`, `SESSION_TERMINATED`, `SESSION_EXPIRED` |

Actor types are `USER`, `ADMIN`, `SYSTEM`, and `ANONYMOUS`. Resource types are `REPORT`, `SESSION`, `AUTH`, and `USER`. Report creation records channel ID/name, reason, and initial status. Updates record changed field names and old/new status; they do not copy the Report. Escalation records the OPEN to ESCALATED transition and threshold. ADMIN resolution records the prior status, resolution time, and resolver. Deleting a Report preserves a final audit event even though the Report document is removed.

Login success records the user/role and session; invalid credentials and malformed credentials record a bounded attempted email and reason. Refresh records rotation or a specific failure reason. Logout records both `AUTH_LOGOUT` and the corresponding session termination; logout-all records one logout and each revoked session. Registration and login create real Session documents, so they record `SESSION_CREATED`. Role denials and attempts to edit/delete another user's existing Report record `AUTHORIZATION_DENIED`; the Report API retains its existing 404 response for ownership failures.

`SESSION_EXPIRED` is recorded only when refresh encounters an existing Session document whose `expiresAt` is in the past. MongoDB TTL deletes expired sessions without an application callback. If TTL removes one first, the failed refresh is audited as `SESSION_NOT_FOUND`, but no expiry event can be reconstructed. Expired JWTs are likewise only refresh failures because their claims are not trusted for session attribution.

## Failure behavior and privacy

`recordAuditLog` awaits `AuditLog.create`, catches failures, and logs a short action-specific error with `console.error`. An audit failure does not roll back a Report, block login/refresh/logout, stop cron, or prevent email/Socket.IO continuation. There are no retries or queues.

Call sites pass only explicit metadata fields. Audit documents never include passwords, access or refresh tokens, token hashes, cookies, Authorization headers, raw authentication bodies, SMTP credentials, or environment secrets. User agent is bounded to 200 characters; attempted email and search input are bounded as well. The browser renders log values with `textContent`.

## ADMIN inspection

- `GET /api/admin/reports/:reportId/logs`: validate Report ID, find `resourceType: REPORT` with that ID, newest first, populate actor email.
- `GET /api/admin/logs`: filter by `category`, `action`, `actorType`, `resourceType`, `resourceId`, and `sessionId`; default to descending `createdAt`. Use `sort=createdAt&order=asc` for oldest first. `page` and `limit` provide bounded pagination (25 by default, 100 maximum).

Both endpoints use `authenticate` and `authorize('ADMIN')`. A normal user receives the existing 403 response; that denial can itself become a security log, with no recursive logging on audit failure.

Support Reports has a **Logs** action for each Report and an in-page history panel. The ADMIN sidebar links to `/logs.html`, which has search, filters, date order, loading/empty/error states, and readable key/value metadata. Links are exposed only after an ADMIN role check. Frontend hiding is a convenience; the APIs enforce authorization.

Search uses escaped, case-insensitive matching on action and attempted email, a matching User email lookup for actor IDs, and exact resource/session ID matching when the term is a valid ObjectId. It does not search arbitrary metadata or historical actor emails after a User is deleted. Filters and search are applied in MongoDB before pagination.

## Validation

Run `npm run build` and `npm test`. `tests/audit-logs.test.ts` covers Report and security events, the natural session lifecycle, access control, per-Report isolation/order, global filtering/search/sorting, write failure behavior, and sensitive-value exclusion. Existing Report, auth, cron, email, and Socket.IO tests remain in the suite.
