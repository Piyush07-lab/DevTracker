# DevTracker Development Phases

**Last updated:** 2026-07-19 — expanded to fold in all Phase-DC decisions (DC-1 through DC-9) and to define the multi-AI workflow constraints below.

**Workflow note:** development is now split across multiple AI models — primarily ChatGPT for hands-on coding, with Gemini/DeepSeek/Codex used for isolated, well-specified tasks. Claude's role has shifted from "writes the code" to **architecture decisions, code review, security audit, and checkpoint inspection**. See the two new sections at the bottom of this document before assigning any task to another model.

---

## Phase 1 — Foundation

**Goal:** Establish the project structure.

**Status:** ✅ Complete.

### Tasks
- Create monorepo structure
- Configure TypeScript
- Configure ESLint & Prettier
- Initialize Git
- Configure environment variables
- Configure shared types

**Deliverable** — Project builds successfully.

---

## Phase 2 — VS Code Extension

**Goal:** Capture coding activity.

**Status:** ✅ Functionally complete. Hardened via Phase-DC.

### Tasks
- Extension activation
- Detect editor changes
- Detect file switches
- Idle detection
- Heartbeat service
- Local configuration
- Send activity to backend

### Resolved during Phase-DC
- **DC-3 (path normalization):** all four listeners (`activeEditor`, `documentOpen`, `documentSave`, `documentClose`) emit workspace-relative paths via `toTrackedPath()`, never absolute filesystem paths. Verified against the external-file case (`external:<basename>`).
- **DC-7 (idle-boundary tests):** `SessionManager` covered by Vitest — exact-boundary (`>` not `>=`), same-timestamp non-completion, file dedup, and the shallow-`Readonly` Set-mutation issue (documented, not yet fixed — see Phase 5).
- **Tooling fix:** extension build moved from raw `tsc` emit to **esbuild bundling** (CommonJS output, `vscode` marked external). Root cause: `apps/extension` is CommonJS by default (no `"type"` field) while shared packages (`@devtracker/types`, etc.) are ESM (`"type": "module"`) — without bundling, any real (non-type-only) cross-package import throws `ERR_REQUIRE_ESM` at runtime. `tsconfig.json` for the extension uses `moduleResolution: "Bundler"` and `noEmit: true`; `tsc --noEmit` is typecheck-only, esbuild does the actual emit.

**Deliverable** — Extension reliably sends activity events with clean, safe data.

---

## Phase 3 — Backend API

**Goal:** Receive and process extension events.

**Status:** 🔲 Not started. Fully unblocked as of Phase-DC closure.

### Tasks
- Express server
- REST API
- Validation with Zod
- Logging
- Error handling
- Health endpoint

### Locked-in decisions from Phase-DC (do not re-litigate these mid-phase)
- **DC-2 (stack):** Express + Prisma. SQLite for dev, PostgreSQL for prod, via Prisma's dual-mode support. `DevTracker_Project_Status_and_Tech_Stack.md`'s Fastify+Drizzle+Postgres-only stack was purged as a stray/mistaken generation.
- **DC-4 (wire contract):**
  - Batch unit is **one session per request** (with its constituent events), not raw individual events.
  - Partial-batch failure: valid sessions accepted, invalid ones rejected individually — never reject a whole batch for one bad item.
  - Rejected items go to a `quarantined_events` table (raw payload + validation error + timestamp) — **never silently discarded.**
  - All routes versioned under `/v1/...` from day one.
  - Shared types (`DevTrackerEvent`, `SessionPayload`) live in `packages/types/src/events.ts`, imported by both extension and backend. Zod schemas mirror these types and run first on every route, before business logic.
- **DC-9 (pre-auth identity):** `POST /v1/install` bootstrap route. Backend creates the default `Account` row (per DC-1) and returns an opaque install token. Client stores and sends the token on every request; **backend resolves token → `accountId` server-side.** The client must never be able to assert its own `accountId` in a payload — treat any code path that reads a client-supplied account/tenant ID as a bug, not a feature.

**Deliverable** — Stable, versioned REST backend enforcing the DC-4 contract at the boundary.

---

## Phase 4 — Database

**Goal:** Persist coding activity.

**Status:** 🔲 Not started.

### Tasks
- Prisma setup
- SQLite schema
- Session model
- Project model
- Activity model
- Migrations

### Locked-in decisions from Phase-DC
- **DC-1 (tenancy):** every table (`Session`, `Project`, `Activity`) carries a **non-nullable, indexed, foreign-keyed `accountId`** from the first migration. No table gets designed without it — this was the single most expensive-to-retrofit decision in the whole project, and it's now closed.
- **DC-4 follow-on:** a `quarantined_events` table for rejected/malformed ingest payloads (raw JSON + validation error + timestamp), separate from the main schema.
- Every query written against these tables — in every phase from here forward — must include `WHERE accountId = ?`. This is not optional per-route; it is the actual enforcement mechanism for tenancy, and skipping it even once is a cross-tenant data leak.

**Deliverable** — Data stored and queried successfully, correctly scoped per account from day one.

---

## Phase 5 — Session Engine

**Goal:** Convert heartbeats into coding sessions.

**Status:** 🔲 Not started.

### Tasks
- Merge consecutive events
- Idle timeout
- Session duration
- Language tracking
- Project tracking

### Carried over from Phase-DC — fix this here, not before
- **DC-7 follow-up:** `SessionManager.getCurrentSession()` returns `Readonly<Session>`, but `Readonly<T>` is shallow — `files: Set<string>` is still mutable through the returned reference. Fix by returning a shallow clone (`{ ...currentSession, files: new Set(currentSession.files) }`) when this file is touched for the session queue work. Confirmed by test, not hypothetical.
- The `Set<string> → string[]` conversion (internal `Session` → wire `SessionPayload`) happens **exactly once**, when a session completes — not on every file-add. Don't let this conversion creep into the hot path.

**Deliverable** — Accurate coding sessions, safely exposed, correctly serialized for the wire.

---

## Phase 6 — React Dashboard

**Goal:** Visualize collected data.

**Status:** 🔲 Not started.

### Tasks
- React + Vite
- Authentication-ready layout
- Dashboard shell
- Session list
- Statistics cards
- Charts
- Heatmap
- Settings page

**Note:** dashboard consumes the same `/v1/...` API and `SessionPayload`/account-scoped model established in Phase 3–4. Any dashboard-side type should import from `@devtracker/types`, not redeclare shapes locally — this is exactly the kind of drift DC-4 was meant to prevent.

**Deliverable** — Interactive dashboard.

---

## Phase 7 — Authentication

**Goal:** Secure user accounts.

**Status:** 🔲 Not started. Gated by DC-5 decision (see below) before any payment/licensing-adjacent code is written.

### Tasks
- User registration
- Login
- Password hashing
- JWT authentication
- Refresh tokens
- Protected routes

### Locked-in decisions from Phase-DC
- **DC-1:** this phase is deliberately sequential, not parallel with Phase 3–5. It attaches a resolved `accountId` to a real login/session token — the install-token mechanism from DC-9 becomes one of possibly several ways to obtain a valid token, not replaced by it.
- **DC-5 (licensing enforcement — must be decided before this phase writes any payment code):** is "configurability" gated client-side (unenforceable — accept it as a trust-based paywall) or server-side (requires a licensing/entitlement service)? Client-side gating in shipped extension code is inspectable and patchable; it cannot be made secure, only obfuscated. **This decision has not been made yet — do not write licensing/payment code until it is.**

**Deliverable** — Authenticated users, with the licensing model explicitly decided (not implied) before payment code exists.

---

## Phase 8 — Analytics

**Goal:** Generate meaningful insights.

**Status:** 🔲 Not started.

### Tasks
- Daily summaries
- Weekly summaries
- Monthly summaries
- Language analytics
- Project analytics
- Productivity metrics
- Dev log generation

**Note:** every analytics query inherits the Phase 4 tenancy requirement — `WHERE accountId = ?` on every aggregate query, no exceptions, including admin/debug tooling.

**Deliverable** — Analytics engine.

---

## Phase 9 — Public API

**Goal:** Allow external integrations.

**Status:** 🔲 Not started. Gated by DC-6 decision before it starts.

### Tasks
- API keys
- Public endpoints
- Rate limiting
- Swagger documentation

### Locked-in decisions from Phase-DC
- **DC-6 (API authorization scoping — must be decided before this phase starts):** per-tenant scoping model for API keys — what can a key read/write, and is it enforced at the query layer or the route layer. "API keys exist" is not an authorization model on its own. This is downstream of DC-1 (closed) and DC-3 (closed), so it's unblocked to decide whenever you're ready to start this phase — just don't skip deciding it and ship bare API keys with no scoping.
- All public routes inherit the `/v1/...` versioning from DC-4.

**Deliverable** — Documented, scoped public API.

---

## Phase 10 — Polish & Testing

**Goal:** Production readiness.

**Status:** 🔲 Not started.

### Tasks
- Unit testing
- Integration testing
- Performance improvements
- Security review
- UI polish
- Bug fixes
- Documentation

**Note:** this phase is where broader test coverage gets built out — but per DC-7, do not treat that as license to skip unit tests on logic-sensitive code (session merging, quarantine handling, token resolution) as those phases are written. Test the sensitive stuff when it's written, not retroactively.

**Deliverable** — Stable v1.0 release.

---

# Future Phases

- Cloud synchronization
- Multi-device support
- GitHub OAuth
- Team workspaces
- Licensing
- Payments
- Marketplace integrations
- AI-powered coding insights

---

# AI Model Delegation Constraints

You're distributing work across multiple models with different strengths and different blind spots. The risk isn't that ChatGPT/Gemini/DeepSeek/Codex write bad code — it's that they write code that **looks correct, compiles, and passes a casual read**, while quietly violating a decision made in Phase-DC that they have no way of knowing about, because that context doesn't travel with a prompt unless you explicitly paste it in.

The rule is not "is this task hard" — it's **"if this is wrong, how would I find out, and what does it cost me?"**

### 🔴 Never delegate without giving full Phase-DC context, and always route the result through a Claude review before merging
These touch a locked-core decision. Getting them subtly wrong doesn't fail loudly — it fails as a data leak, a cross-tenant bug, or a security hole discovered in production.

- Anything touching **tenancy / `accountId` scoping** — any query, any new table, any endpoint. A model that doesn't know about DC-1 will write an unscoped query that "works" in testing (single account) and leaks data the moment a second account exists.
- Anything touching **the install-token / auth boundary** (DC-9) — token issuance, token validation middleware, anything that resolves identity.
- **Zod schema definitions for the wire contract** — these are the actual enforcement point for DC-4. A schema that's slightly too permissive (optional field that should be required, wrong type) silently reopens a hole DC-4 was written to close.
- **Any schema migration** (Prisma) — irreversible on real data once applied; get this reviewed before running it against anything but a throwaway dev DB.
- **Licensing/payment code** — do not let any model write this until DC-5 is actually decided (it isn't yet).
- **Public API route authorization** (Phase 9 / DC-6) — same reasoning as tenancy.

### 🟠 Safe to delegate to ChatGPT directly, but bring the diff back to Claude at the next checkpoint (not necessarily before merging)
Correctness matters, but a mistake here is visible, contained, and doesn't leak data or corrupt state.

- Express route handlers that just call already-reviewed business logic (thin controllers)
- Dashboard UI components (React/Tailwind) — visual bugs are self-evident
- Chart/heatmap rendering logic
- Logging setup (Pino), error-handling middleware shape
- Swagger/OpenAPI documentation generation
- Analytics aggregation logic that's already scoped correctly (i.e., the `WHERE accountId = ?` clause was written/reviewed by you first, ChatGPT fills in the aggregation math around it)

### 🟢 Safe to delegate to Gemini / DeepSeek / Codex for quick, isolated tasks — no review checkpoint required, spot-check only
Self-contained, no architectural knowledge required, wrong output is obvious and cheap to redo.

- Pure unit tests against an already-finalized interface (like DC-7 — give the model the exact interfaces, be explicit about what NOT to assume, as we did)
- Boilerplate CRUD scaffolding once the schema is finalized and reviewed
- Formatting/lint fixes
- Simple utility/pure functions with no dependency on your account/session model (string formatting, date math, etc.)
- Writing documentation prose for already-decided architecture

### Practical instruction for prompting ChatGPT specifically
Since ChatGPT is your primary coding model, paste in the **relevant closed DC-item(s)** from this document as literal context before asking it to write anything backend-adjacent. Don't summarize from memory — copy the actual "Decision (final)" paragraph. A model given "build the ingest route" with no DC-4/DC-9 context will invent its own auth pattern, and it usually invents the client-asserted-`accountId` version, because that's the naive default every tutorial teaches.

---

# Claude Review Checkpoints

These are the points where you stop, bring the work back here, and get an inspection before continuing. Don't skip a checkpoint because "it looked fine" — the entire reason this list exists is that things that look fine are exactly what gets past a single model working alone.

### Checkpoint A — End of every phase (mandatory)
Bring the full diff/PR for the phase. Report will cover:
- Whether the phase's Phase-DC-derived requirements were actually implemented (not just "does it run") — e.g., for Phase 3: is `accountId` actually on every query, not just present in the schema?
- New locked-core risks surfaced during the phase that aren't logged anywhere (the DC-9 pattern — log first, don't quietly absorb it into other work)
- Bug check on the delegated code specifically, since that's where drift from decisions made here is most likely to appear

### Checkpoint B — Before any Prisma migration is applied to anything beyond a disposable local dev DB
Non-negotiable. Migrations are the one thing on this list that's expensive to undo once real data exists behind it.

### Checkpoint C — Before merging anything touching the auth boundary (install token, later real login) or tenancy scoping
Even mid-phase, don't wait for the phase-end checkpoint for this category specifically.

### Checkpoint D — Before DC-5 (licensing) or DC-6 (API scoping) get decided
Both are still open. Bring the decision here before it's implemented, the same way DC-1 through DC-4 went through this process — don't let a coding session with ChatGPT quietly settle one of these by just... writing code that implies an answer.

### Checkpoint E — Before any public-facing deployment (Phase 9 onward)
Full security pass: tenancy scoping audit across all routes, rate-limiting check, confirm no client-asserted identity fields survived into the public API, confirm quarantine table isn't publicly readable.

### What to bring to each checkpoint
- The diff or the changed files
- Which AI model(s) touched which parts
- Anything that felt "off" even if you can't articulate why — that instinct is worth flagging, not filtering out before you ask

### What the report will contain, every time
1. **Bugs found** — concrete, with the specific failure mechanism, not "this might be an issue"
2. **Phase-DC compliance check** — did the code actually implement the decision, or something that superficially resembles it
3. **New locked-core risks surfaced**, logged as new DC-items if found
4. **Classification of every suggested change** — locked-core vs. flexible-shell, same as always
5. **Explicit go/no-go** on whether it's safe to continue to the next phase, not just a list of comments