# Session 16: Report Audit Log live coding starter

This branch, `tv-hub-v6.5-logs-base`, starts from the complete V6.5 instructor implementation. The `AuditLog` model, `recordAuditLog` helper, ADMIN read API, per-Report history panel, and global Logs page are ready. Security Audit Logs are complete and outside this session's live-coding scope.

## Objective

Connect Report lifecycle changes to the existing Audit Log infrastructure. For each operation, identify the actor and Report, finish the business database change first, and record what happened before continuing the existing notifications.

## Sequence

1. `REPORT_CREATED` — after creating a Report in `createReport()`.
2. `REPORT_UPDATED` — after saving a changed Report in `updateReport()`; use the existing change summary.
3. `REPORT_ESCALATED` — after the cron job saves the new status; the actor is the system.
4. `REPORT_RESOLVED` — after an ADMIN saves the resolved state in `closeSupportReport()`.
5. `REPORT_DELETED` — optional final example, after deletion; use the Report data captured before deleting it.

After completing each step, trigger that operation and inspect its history through **Support → Logs**. The global **Logs** page can filter by REPORT. Before an integration point is completed, its Report operation still works and its history may be empty.

The four instructor-solution tests in `tests/audit-logs.test.ts` are skipped on this starter branch. Re-enable them as the Report integrations are completed. Security audit tests and the ADMIN read API tests remain active.
