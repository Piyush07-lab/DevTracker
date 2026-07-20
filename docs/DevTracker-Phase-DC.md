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

### DC-2: Stack reconciliation (Prisma+SQLite/Postgres vs Fastify+Drizzle+Postgres-only) — ✅ CLOSED
- **Decision needed:** single authoritative tech stack. Kill the losing doc.
- **Type:** locked-core.
- **Why it's here:** `docs/DevTracker-Technology-Stack.md` and `DevTracker_Project_Status_and_Tech_Stack.md` actively disagree on framework and ORM. Can't scaffold `apps/backend` with two conflicting sources of truth.
- **Decision (final):** `docs/DevTracker-Technology-Stack.md` is canonical — **Express + Prisma + SQLite (dev) / PostgreSQL (prod)**. Reason: this is the only one of the two stacks that satisfies the day-one product requirement stated in `DevTracker - Extension.txt` — "it should work with a cloud database or a local database" — and Prisma's dual-mode support is the mechanism that delivers it without forking the codebase. `DevTracker_Project_Status_and_Tech_Stack.md`'s Fastify+Drizzle+Postgres-only stack was determined to be a stray/mistaken generation that silently dropped the local-DB requirement without documenting why. It is purged rather than archived — no reason to keep a contradicting source of truth on disk.
- **Output artifact:** `DevTracker_Project_Status_and_Tech_Stack.md`'s Technology Stack section deleted; document now defers to `docs/DevTracker-Technology-Stack.md` for stack questions.
- **Unblocks:** Phase 3 scaffolding.

### DC-3: Path normalization at capture — ✅ CLOSED
- **Decision needed:** normalize `document.uri.fsPath` to workspace-relative path inside the listener, before it reaches the dispatcher.
- **Type:** locked-core.
- **Why it's here:** absolute paths leak OS username and folder/client names. Fixing this at ingestion (backend) is too late — the raw path already left the client and may already be cached/logged locally.
- **Output artifact:** updated `activeEditor.ts`, `documentOpen.ts`, `documentSave.ts`, `documentClose.ts` to emit relative paths; update `DevTrackerEvent.file` type/docs accordingly.
- **Unblocks:** Phase 4 schema (don't design a `file` column around the wrong data shape), Phase 9 public API.

### DC-4: Wire contract + validation boundary — ✅ CLOSED
- **Decision needed:** define the exact JSON shape for events/sessions crossing extension → SDK → backend, and enforce it with Zod at the backend boundary.
- **Type:** locked-core.
- **Why it's here:** SDK, backend, and eventual public API all need to agree on one contract simultaneously. Defining it after the backend exists means renegotiating a contract with live consumers.
- **Decision (final):**
  - **Batch unit:** one session (with its constituent events) per request — not arbitrary event grouping.
  - **Partial failure handling:** valid sessions in a batch are accepted; invalid ones are rejected individually, not the whole batch.
  - **Bad data recovery:** rejected items are never discarded. Raw payload + validation error + timestamp are written to a `quarantined_events` table, reprocessable later once the cause (schema drift, stale extension version, etc.) is fixed. No silent data loss.
  - **Identity/auth (pre-Phase-7):** see DC-9 — resolved via opaque install token, not client-asserted `accountId`.
  - **Versioning:** all routes prefixed `/v1/...` from day one.
  - **Shared types:** `DevTrackerEvent` (currently extension-local in `dispatcher/event.ts`) and `Session` (currently `files: Set<string>`, must become `files: string[]` for JSON serialization) move to `packages/types/src/events.ts` as the single source of truth, imported by extension and backend both. Zod schemas mirror these types and are the first check every backend route runs.
- **Output artifact:** decision summary above; implementation (shared types + Zod schemas) tracked as a Phase 3 task, not re-decided.
- **Unblocks:** Phase 3 backend implementation, Phase 5 session engine.

### DC-9: Pre-auth identity resolution (install token bootstrap) — ✅ CLOSED
- **Surfaced:** mid-DC-4 discussion. Not originally in the blueprint — logged here per the Phase-DC rule that new locked-core risks found mid-phase get recorded, not silently absorbed into another item's decision.
- **Decision needed:** how does the backend know which `accountId` a request belongs to, given DC-1 deferred real login to Phase 7?
- **Type:** locked-core.
- **Why it's here:** if the client is trusted to simply state its own `accountId` in the payload, any request can claim any account with zero verification — the same trust failure behind IDOR-class vulnerabilities (client-supplied identifiers accepted without server-side verification). Wrong even for a single-user local install, because it stays wrong once Phase 7/9 add real multi-user and public API consumers on top of the same endpoints.
- **Decision (final):** on first run, the extension calls a bootstrap endpoint (`POST /v1/install`); the backend creates the default `Account` row (per DC-1) and returns an opaque token. The extension stores the token locally and sends it on every subsequent request. The backend resolves token → `accountId` server-side — the client never asserts its own account identity. Phase 7 login and Phase 9 API keys later become additional ways to obtain a valid token against this same resolution mechanism, requiring no rework of the ingest path.
- **Output artifact:** decision summary above; `POST /v1/install` route and token-resolution middleware tracked as a Phase 3 implementation task.
- **Unblocks:** Phase 3 backend implementation (specifically the ingest route's auth boundary).

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
| DC-1 | ✅ Closed | Option C — schema-ready single-tenant, `accountId` on all tables, auth deferred sequentially to Phase 7 | 2026-07-19 |
| DC-2 | ✅ Closed | `docs/DevTracker-Technology-Stack.md` canonical (Express+Prisma+SQLite/Postgres); losing doc's stack section purged | 2026-07-19 |
| DC-3 | ✅ Closed | Path normalization implemented via `toTrackedPath()`; all 4 listeners updated; verified external-file case | 2026-07-19 |
| DC-4 | ✅ Closed | Batch by session; partial-failure accepted; bad data quarantined not discarded; identity via DC-9 token; `/v1/` versioned | 2026-07-19 |
| DC-5 | ⬜ Deferred (pre-Phase 7) | — | — |
| DC-6 | ⬜ Deferred (pre-Phase 9) | — | — |
| DC-7 | ⬜ Open | — | — |
| DC-8 | ⬜ No action | — | — |
| DC-9 | ✅ Closed | Opaque install-token bootstrap (`POST /v1/install`); backend resolves token→accountId server-side, never client-asserted | 2026-07-19 |

*Fill in "Decision" and "Date" columns as each item closes. Do not proceed to Phase 3 until DC-1 through DC-4 and DC-9 show ✅.*