# DevTracker Development Phases — Phase-DC (Damage Control)

## Purpose

Phase-DC is a **conditional, non-sequential phase**. It does not sit permanently between two numbered phases — it triggers whenever locked-core decisions are found unresolved ahead of a phase that depends on them. Its job is to force resolution of architecture-level risk *before* code that's expensive to unwind gets written.

**Current trigger:** Phase 2 (Extension Core) is functionally complete. Phase 3 (Backend API) and Phase 4 (Database) cannot start until the items below are resolved — both phases build directly on top of these decisions.

**Rule going forward:** any time a new locked-core risk is identified mid-phase, it gets logged here and blocks progress to the next numbered phase until closed. This doc is the audit trail for that.

---

## Entry Criteria

- Phase 2 deliverable met (extension reliably captures and dispatches events). ✅ Done.
- Phase 3 has not started. Blocked pending this phase.

## Exit Criteria

- All 🔴 BLOCKER items closed with a written decision (not just discussed).
- All 🟠 HIGH items have an explicit decision — either resolved now or explicitly deferred with a documented reason and re-trigger condition.
- This document updated with final decisions, then frozen as a reference — not edited retroactively once Phase 3 starts.

---

## 🔴 BLOCKER Tasks — must close before Phase 3 starts

### DC-1: Tenancy / auth model — ✅ CLOSED
- **Decision needed:** single-tenant local install vs. multi-user cloud accounts from day one.
- **Type:** locked-core.
- **Why it's here:** Phase 4 (DB schema) is scheduled before Phase 7 (auth). Building tables without a `user_id`/tenant column baked in means a live-data migration later, not a schema edit.
- **Decision (final):** Option C — schema-ready single-tenant. Every table (`Session`, `Project`, `Activity`) carries a non-nullable, indexed, foreign-keyed `accountId` from the first migration. Each local install auto-provisions one default `Account` row at first run — no login screen, no password, nothing user-facing changes in v1. Every backend query is scoped with `WHERE accountId = ?` from the first line of query code written, not retrofitted later. Full auth (login, JWT, refresh tokens, protected routes) is deliberately deferred to Phase 7 and stays sequential, not parallel — it will attach a resolved `accountId` to a session token when it lands, requiring zero schema change at that point. Rejected Option A (no tenant column) because it blocks the already-planned Cloud Sync/Multi-device/Team Workspaces features and would force the exact live-data migration this decision exists to avoid. Rejected full Option B (complete auth system now) and parallel-Phase-7 because both attach security-critical code to an API surface and query-scoping pattern that are still being defined in Phase 3–5 — building auth against a moving target risks permission checks silently going stale against a changed data model (the IDOR-class failure mode), and dormant auth code that ships before anything exercises it tends to hide bugs longest.
- **Output artifact:** decision paragraph above.
- **Unblocks:** Phase 4 schema design.

### DC-2: Stack reconciliation (Prisma+SQLite/Postgres vs Fastify+Drizzle+Postgres-only)
- **Decision needed:** single authoritative tech stack. Kill the losing doc.
- **Type:** locked-core.
- **Why it's here:** `docs/DevTracker-Technology-Stack.md` and `DevTracker_Project_Status_and_Tech_Stack.md` actively disagree on framework and ORM. Can't scaffold `apps/backend` with two conflicting sources of truth.
- **Output artifact:** delete or archive the losing doc; update the surviving one as canonical.
- **Unblocks:** Phase 3 scaffolding.

### DC-3: Path normalization at capture — ✅ CLOSED
- **Decision needed:** normalize `document.uri.fsPath` to workspace-relative path inside the listener, before it reaches the dispatcher.
- **Type:** locked-core.
- **Why it's here:** absolute paths leak OS username and folder/client names. Fixing this at ingestion (backend) is too late — the raw path already left the client and may already be cached/logged locally.
- **Output artifact:** updated `activeEditor.ts`, `documentOpen.ts`, `documentSave.ts`, `documentClose.ts` to emit relative paths; update `DevTrackerEvent.file` type/docs accordingly.
- **Unblocks:** Phase 4 schema (don't design a `file` column around the wrong data shape), Phase 9 public API.

### DC-4: Wire contract + validation boundary
- **Decision needed:** define the exact JSON shape for events/sessions crossing extension → SDK → backend, and enforce it with Zod at the backend boundary.
- **Type:** locked-core.
- **Why it's here:** SDK, backend, and eventual public API all need to agree on one contract simultaneously. Defining it after the backend exists means renegotiating a contract with live consumers.
- **Output artifact:** a schema file (e.g. `packages/types/src/events.ts` + corresponding Zod schema) treated as the single source of truth, imported by both extension and backend.
- **Unblocks:** Phase 3 backend implementation, Phase 5 session engine (queue needs a stable shape to serialize).

---

## 🟠 HIGH Tasks — must close before Phase 7 (auth) / Phase 9 (public API)

### DC-5: Licensing enforcement model
- **Decision needed:** is "configurability" gated client-side (unenforceable, accept it as a trust-based paywall) or server-side (requires a licensing/entitlement service)?
- **Type:** locked-core.
- **Why it's here:** client-side gating in shipped extension code is inspectable and patchable — it cannot be made secure, only obfuscated. This decision determines whether Phase 9 needs a licensing API at all.
- **Output artifact:** one paragraph decision + note on whether it changes Phase 9 scope.
- **Can defer to:** immediately before Phase 7, but must be decided before any payment/licensing code is written.

### DC-6: Public API authorization scoping
- **Decision needed:** per-tenant scoping model for API keys — what can a key read/write, and is it enforced at the query layer or the route layer.
- **Type:** locked-core (downstream of DC-1 and DC-3).
- **Why it's here:** "API keys exist" (current Phase 9 plan) is not an authorization model. Needs explicit scope design once DC-1 (tenancy) is settled.
- **Can defer to:** immediately before Phase 9, once DC-1 is closed.

---

## 🟡 MEDIUM — address opportunistically, not gating

### DC-7: SessionManager idle-boundary unit tests
- **Type:** flexible-shell, logic-sensitive.
- **Action:** add unit tests for the `>` vs `>=` idle-timeout boundary and equal-timestamp edge cases now, while `SessionManager` is small and isolated — before Phase 5 builds the session queue on top of it.
- **Outsourceable:** yes — pure unit test generation against existing `SessionManager`/`Session` interfaces, no architecture decisions involved. Can be handed to another model with the two source files as context.

### DC-8: Per-workspace session tracking
- **Type:** flexible-shell.
- **Action:** none required now. Revisit only if multi-root workspace support becomes a goal.

---

## 🟢 LOW — no action this phase

- Empty `.prettierrc` / `.env.example` — fill in when Phase 3 introduces actual env vars.
- Broad `onStartupFinished` activation event — revisit only if startup performance complaints arise.
- No test suite beyond DC-7 — on schedule per Phase 10, not a defect.

---

## Phase-DC Completion Log

| Item | Status | Decision | Date |
|---|---|---|---|
| DC-1 | ✅ Closed | Schema-ready single-tenant, `accountId` on all tables, auth deferred sequentially to Phase 7 | 2026-07-19 |
| DC-2 | ✅ Closed | `docs/DevTracker-Technology-Stack.md` canonical (Express+Prisma+SQLite/Postgres); losing doc's stack section purged | 2026-07-19 |
| DC-3 | ✅ Closed | Path normalization implemented via `toTrackedPath()`; all 4 listeners updated; verified external-file case | 2026-07-19 |
| DC-4 | ⬜ Open | — | — |
| DC-5 | ⬜ Deferred (pre-Phase 7) | — | — |
| DC-6 | ⬜ Deferred (pre-Phase 9) | — | — |
| DC-7 | ⬜ Open | — | — |
| DC-8 | ⬜ No action | — | — |

*Fill in "Decision" and "Date" columns as each item closes. Do not proceed to Phase 3 until DC-1 through DC-4 show ✅.*