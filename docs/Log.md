# Log

## Date

2026-07-23

---

# Backend Development Begins

Development officially moved from **Phase 2 (VS Code Extension)** to **Phase 3 (Backend API)** after all Phase-DC blocker decisions (DC-1, DC-2, DC-3, DC-4 and DC-9) were completed.

The objective of this session was **not** to implement backend functionality, but to establish a clean backend scaffold that future work can safely build upon.

---

# Decisions

## Module System

**Decision:** Use **ES Modules (ESM)** for the backend.

Reason:

* Matches the rest of the monorepo.
* The VS Code extension remains the only CommonJS package because the VS Code runtime requires it.
* Avoids unnecessary ESM/CommonJS interoperability issues.

Classification: **Locked-core**

---

# Backend Scaffold

Created the backend workspace.

```text
apps/backend/
├── src/
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

Classification: **Flexible-shell**

---

## package.json

Added the initial backend package configuration.

Runtime dependencies:

* Express
* CORS
* Helmet
* Pino
* Pino HTTP

Development dependencies:

* TypeScript
* tsup
* tsx
* @types/node
* @types/express

Configured scripts for:

* development
* build
* typecheck
* lint
* clean

Classification: **Flexible-shell**

---

## Build Configuration

Created `tsup.config.ts`.

Configured:

* ESM output
* Node platform
* Node 22 target
* Build output in `dist`
* Source maps
* Automatic cleaning
* Bundled application build

Classification: **Flexible-shell**

---

## TypeScript Configuration

Created `tsconfig.json`.

Originally attempted to use:

```json
"moduleResolution": "Bundler"
```

This produced errors with the current project configuration and was removed. The backend currently relies on the inherited settings from the root TypeScript configuration.

Classification: **Flexible-shell**

---

## Express Application

Created `src/app.ts`.

Responsibilities:

* Create the Express application.
* Register JSON body parsing middleware.
* Export the application instance.

No routes or middleware were introduced at this stage.

Classification: **Flexible-shell**

---

## Server Entry

Created `src/server.ts`.

Responsibilities:

* Import the Express application.
* Select the listening port.
* Start the HTTP server.

No database, authentication, routing, or business logic was added.

Classification: **Flexible-shell**

---

## Tooling

During verification, pnpm blocked `esbuild` because its build scripts had not yet been approved.

The required build scripts were approved, allowing `tsup` to build correctly.

Classification: **Flexible-shell**

---

## Verification

Confirmed that:

* TypeScript configuration is functioning.
* The backend builds successfully.
* The development server starts successfully.
* Visiting:

```
http://localhost:3000
```

returns:

```
Cannot GET /
```

which is the expected response before routes exist.

Backend scaffolding is considered complete.

---

# Shared Wire Contract Review

Reviewed the shared event definitions in `packages/types/src/events.ts`.

Confirmed:

* `DevTrackerEvent` is the single source of truth shared between the extension and backend.
* `SessionPayload` correctly represents the network payload.
* Internal extension sessions continue using `Set<string>` for efficient deduplication.
* Conversion from `Set<string>` to `string[]` occurs only once when a session completes.
* `accountId` is intentionally absent from the payload. Identity will be resolved server-side using the install token defined by DC-9.

No architectural changes were required.

Classification: **Locked-core**

---

# Current Status

Completed:

* Backend scaffold
* Build configuration
* TypeScript configuration
* Express application setup
* Server startup
* Shared wire contract review

Not Started:

* Zod schemas
* Install bootstrap endpoint (`POST /v1/install`)
* Token resolution
* Database integration
* Prisma
* Logging middleware
* Error handling
* Health endpoint
* Session ingestion

---

# Next Task

Implement the shared **Zod validation schemas** that mirror the locked-core wire contract. These schemas will become the validation boundary for every backend endpoint before any API routes are implemented.


## Date

2026-07-24

## Shared Validation Layer

### Zod Validation
- Established Zod as the single source of truth for runtime validation.
- Created shared validation schemas in `packages/types`.
- Defined strongly typed DTOs for communication between the extension, backend, and future dashboard.
- Configured TypeScript types to be inferred directly from Zod schemas, eliminating duplicate interface definitions.
- Centralized validation logic to ensure consistent request and event validation across all applications.

### Event Contracts
Implemented the initial event schema set for the DevTracker protocol, including:

- Editor activity events
- Event metadata
- Timestamp validation
- Common event base types

### Architecture Decisions
- Validation occurs at the API boundary using shared Zod schemas.
- The extension validates outbound payloads before transmission.
- The backend validates all inbound payloads before processing.
- All applications consume the same shared schemas from `@devtracker/types`.
- API contracts are versioned through shared packages rather than duplicated definitions.

## Date

2026-07-25

## Backend Development Log — Prisma Initialization

### Prisma Installation
- Installed `prisma` as a development dependency.
- Installed `@prisma/client` as a runtime dependency.
- Verified Prisma CLI through the workspace using:
  ```bash
  pnpm --filter @devtracker/backend exec prisma --version
  ```

### Prisma Project Initialization
- Initialized Prisma within `apps/backend`.
- Generated:
  - `prisma/schema.prisma`
  - `prisma.config.ts`
- Removed AI assistant artifacts generated by Prisma:
  - `.claude/`
  - `.windsurf/`
  - `.agents/`
  - `skills-lock.json`
- Added the above artifacts to `.gitignore` to keep the repository clean.

### Prisma Configuration
- Configured `prisma.config.ts` to load environment variables using:
  ```ts
  import "dotenv/config";
  ```
- Enabled datasource configuration through `process.env.DATABASE_URL`.
- Added explicit runtime validation for `DATABASE_URL` to fail fast if the variable is missing.

### TypeScript Integration
- Updated backend TypeScript configuration to include `prisma.config.ts` in the project.
- Enabled Node.js type definitions for Prisma configuration.
- Resolved `process` type resolution issues.
- Resolved `exactOptionalPropertyTypes` incompatibility by validating `DATABASE_URL` before passing it to Prisma.

### Initial Database Schema
Created the initial locked-core data model consisting of:

#### Account
- Primary user identity.
- Email-based authentication.
- Optional username and display name.
- Password hash storage.
- Email verification timestamp.
- Automatic creation/update timestamps.

#### Installation
- Represents a registered DevTracker extension installation.
- Linked to an owning account.
- Stores:
  - Device name
  - Platform
  - Extension version
  - Last seen timestamp

#### InstallToken
- Temporary installation pairing tokens.
- Stores only hashed tokens.
- Tracks expiration and usage timestamps.
- Linked to an owning account.

### Architecture Decisions
- Established one-to-many relationships:
  - Account → Installations
  - Account → InstallTokens
- Configured cascade deletion from Account to dependent records.
- Added indexes for foreign keys and token expiration.

### Pending
- Decide on the development database strategy:
  - Local PostgreSQL (preferred)
  - Prisma Postgres
- Configure `DATABASE_URL`.
- Run:
  ```bash
  pnpm --filter @devtracker/backend exec prisma migrate dev --name init
  ```
- Generate the first migration.
- Generate the Prisma Client.
- Integrate Prisma Client into the Express backend.

# date

2026-07-25 9:54 am

### Architecture Review

During the initial Prisma setup, the database provider was temporarily configured as **PostgreSQL**.

A review of the canonical project documentation (`DevTracker-Development-Phases.md` and `DevTracker-Technology-Stack.md`) identified that the current locked-core architecture specifies:

- Development: SQLite
- Production: PostgreSQL

The PostgreSQL configuration was introduced before re-verifying the project documentation and therefore diverged from the recorded architecture.

### Resolution

No migration has been generated and no database has been created yet.

Because the project is still before the first migration, reverting the datasource provider to SQLite (or formally revising the architecture to PostgreSQL-only) remains a zero-cost decision.

No schema redesign is required. The existing Prisma models (`Account`, `Installation`, and `InstallToken`) are provider-independent and remain valid regardless of the chosen database engine.

### Current Status

The project is paused pending confirmation of the development database strategy.

The first migration (`init`) will not be generated until the database provider decision is finalized and synchronized with the project documentation.

Classification: **Locked-core**

# date

2026-07-25 10:01 am

## SQLite Development Database Initialized

### Development Database

The project architecture was aligned with the canonical technology stack before creating the first database migration.

Development database configuration:

- Provider: SQLite
- Database file: `prisma/dev.db`

The production database remains PostgreSQL as originally specified in the project architecture.

Classification: **Locked-core**

---

### First Migration

Successfully generated and applied the initial Prisma migration:

```
20260725043352_init
```

Migration created:

```
apps/backend/prisma/migrations/
└── 20260725043352_init/
    └── migration.sql
```

The migration established the initial database schema consisting of:

- `Account`
- `Installation`
- `InstallToken`

with:

- Primary keys
- Foreign key relationships
- Cascade deletion
- Unique constraints
- Supporting indexes

Classification: **Locked-core**

---

### Local Development Database

Prisma successfully created the local SQLite database:

```
apps/backend/prisma/dev.db
```

The database schema is now synchronized with the Prisma schema.

No manual SQL changes were required.

Classification: **Flexible-shell**

---

### Milestone

The project now has:

- Prisma configured
- Initial schema finalized
- First migration committed to migration history
- Development database initialized
- Prisma Client not generated 
- Foundation not ready for backend persistence and API development

This completes the database initialization milestone and unblocks implementation of the backend data layer, install bootstrap endpoint, and session ingestion pipeline.

## 2026-07-27

### Task

Install Prisma SQLite Adapter

### Completed

- Installed `@prisma/adapter-better-sqlite3` for the backend workspace.
- Verified successful installation using `pnpm list`.
- Confirmed the dependency is recorded in `apps/backend/package.json`.
- Prepared the project for Prisma 7 driver adapter integration.

### Files

- apps/backend/package.json
- pnpm-lock.yaml

### Verification

Verified with:

```bash
pnpm --filter @devtracker/backend list @prisma/adapter-better-sqlite3

## 2026-07-27

### Task

Configure Prisma SQLite Adapter

### Completed

- Configured Prisma 7 to use `@prisma/adapter-better-sqlite3`.
- Created a SQLite adapter using `DATABASE_URL` with a development fallback.
- Updated the Prisma client to use `new PrismaClient({ adapter })`.
- Retained the global Prisma singleton pattern for development.
- Verified successful TypeScript compilation.

### Files

- apps/backend/src/lib/prisma.ts

### Verification

Verified with:

```bash
pnpm --filter @devtracker/backend typecheck
```

Result:

```text
$ tsc --noEmit
Done
```

### Remaining

- Integrate the configured Prisma client throughout the backend.
- Implement `POST /v1/install`.
- Implement install token generation and validation middleware.

### Notes

This completes the runtime configuration required by Prisma 7's `prisma-client` generator for SQLite. The backend is now configured to construct `PrismaClient` with the required driver adapter.

## 2026-07-27

### Task
Implement POST /v1/install

### Completed
- Implemented POST /v1/install endpoint.
- Integrated shared Prisma singleton.
- Created default Account when one does not exist.
- Created Installation records for each install request.
- Generated and stored install tokens.
- Returned installationId and install token in the API response.

### Files
- apps/backend/src/routes/v1/install.ts

### Verification
- Backend starts successfully.
- POST /v1/install returns HTTP 201.
- installationId returned in response.
- Account created only once.
- Installation created per request.
- InstallToken created per request.
- `pnpm --filter @devtracker/backend typecheck` passed.

### Remaining
- Implement token hashing.
- Implement token validation middleware.
- Implement authenticated ingest endpoints.

### Notes
- Tokens are currently stored in plaintext as an intentional temporary implementation. Hashing will be added in the next task.

## 2026-07-27

### Task
Implement install token hashing

### Completed
- Replaced plaintext install token storage with SHA-256 hashing.
- Continued generating opaque install tokens using `randomUUID()`.
- Stored only the SHA-256 digest in the database.
- Preserved the existing API contract by returning the original token to the client.
- Verified database persistence contains only hashed tokens.

### Files
- apps/backend/src/routes/v1/install.ts

### Verification
- `pnpm --filter @devtracker/backend typecheck`
- `POST /v1/install` returns HTTP 201.
- API response contains the original install token.
- Database stores only the SHA-256 hash.
- Install endpoint continues to function correctly.

### Remaining
- Implement install token validation middleware.
- Implement the first authenticated endpoint.
- Add health endpoint.

### Notes
- Password hashing will continue to use bcrypt during the authentication phase.
- Install tokens use SHA-256 because they are high-entropy server-generated secrets and do not require adaptive password hashing.

## 2026-07-28

### Task

Implement install token validation middleware

### Completed

- Implemented Bearer token authentication middleware.
- Validated Authorization header format.
- Resolved install tokens by SHA-256 hash.
- Rejected missing, malformed, invalid, and expired tokens.
- Attached the resolved accountId to the Express request.
- Introduced Express Request type augmentation for accountId.
- Enforced server-side identity resolution in accordance with DC-9.

### Files

- apps/backend/src/middleware/installToken.ts
- apps/backend/src/types/express.d.ts

### Verification

- Missing Authorization header returns HTTP 401.
- Invalid Bearer format returns HTTP 401.
- Unknown token returns HTTP 401.
- Expired token returns HTTP 401.
- Valid token resolves the correct accountId.
- Route handlers receive the resolved accountId.
- No client-supplied accountId is used.
- `pnpm --filter @devtracker/backend typecheck` passed.

### Remaining

- Implement the first authenticated session ingest endpoint.

### Notes

The authentication boundary now resolves identity entirely on the server. Downstream routes consume `req.accountId` and never trust client-supplied account identifiers.

## 2026-07-29 18:26

### Task
Repair extension wiring after shared type migration

### Completed
- Restored Session → SessionPayload conversion
- Added event tracking to Session
- Updated SessionManager to accumulate events
- Fixed SessionProcessor to build SessionPayload correctly
- Restored compatibility with @devtracker/types
- Monorepo builds successfully

### Files
- apps/extension/src/sessions/session.ts
- apps/extension/src/sessions/sessionManager.ts
- apps/extension/src/processors/sessionProcessor.ts

### Verification
- `pnpm turbo build --force` completed successfully
- All six packages built successfully

### Remaining
- Verify SDK `axios` dependency declaration
- Begin Phase 3 backend implementation

### Notes
- Extension wiring is now aligned with the shared session contract.

## 2026-07-29

### Task

Complete SDK integration and repair SessionPayload pipeline.

### Completed

- Added session event collection to SessionManager.
- Repaired Session → SessionPayload generation.
- Integrated SessionProcessor with the shared SDK.
- Added Axios as the SDK transport dependency.
- Verified successful monorepo build.

### Verification

- `pnpm turbo build --force` completed successfully.
- All workspace packages built successfully.

### Remaining

- Implement POST /v1/install.
- Implement installation token middleware.
- Begin authenticated backend session ingestion.

### Next Task

Backend installation bootstrap.

## 2026-07-29 20:40

### Task
Implement install bootstrap endpoint (`POST /v1/install`)

### Completed
- Added shared install request/response schemas to `@devtracker/types`.
- Implemented Route → Controller → Service architecture for the install endpoint.
- Implemented automatic default `Account` provisioning.
- Implemented `Installation` creation.
- Implemented secure install token generation using `randomUUID()`.
- Implemented SHA-256 hashing before token persistence.
- Persisted install tokens with expiration.
- Added response validation using `InstallResponseSchema`.
- Resolved schema validation failure caused by UUID/CUID mismatch.
- Successfully verified the endpoint through an HTTP request.

### Files
- `packages/types/src/events.ts`
- `apps/backend/src/routes/v1/install.ts`
- `apps/backend/src/controllers/install.controller.ts`
- `apps/backend/src/services/install.service.ts`

### Verification
- `pnpm turbo build` completed successfully.
- `POST /v1/install` returned `201 Created`.
- Account, Installation, and InstallToken records were created successfully.
- Install token hash was persisted while returning the plaintext token only once.

### Remaining
- Implement install-token authentication middleware.
- Protect authenticated backend endpoints.
- Begin backend session ingestion (`POST /v1/sessions`).

### Notes
- Refactored endpoint into Route → Controller → Service architecture while keeping the implementation lightweight.
- Updated the install response contract to align with the project's identifier format.

## 2026-07-29 HH:MM

### Task
Extension status and launch readiness review

### Completed
- Reviewed phase docs and recent session log.
- Confirmed the extension capture layer is functionally complete.
- Confirmed the latest build/wiring repair compiled successfully.
- Identified remaining launch blockers in the SDK/backend handoff and release-hardening path.

### Files
- docs/DevTracker-Development-Phases.md
- docs/DevTracker-Phase-DC.md
- DevTracker-Session-Log-2026-07-29.txt

### Verification
- Phase docs indicate Phase 2 complete and later phases still pending.
- Session log reports successful build after wiring repair.
- Review notes show remaining transport/API contract work.

### Remaining
- Complete SDK `install()` / `sendSession()` flow.
- Finish backend persistence path.
- Add packaging, release, and launch validation.

### Notes
- Extension is close to internal-alpha ready, not public-launch ready.

## 2026-07-30 11:06

### Task
Implement install-token authentication middleware

### Completed
- Added install-token authentication middleware.
- Implemented Bearer token validation.
- Implemented SHA-256 hashing for incoming install tokens.
- Implemented InstallToken lookup using Prisma.
- Added expiration validation for install tokens.
- Attached authenticated account context to `req.auth.accountId`.
- Returned appropriate 401 responses for missing, invalid, and expired tokens.

### Files
- apps/backend/src/middleware/installToken.ts
- apps/backend/src/types/express.d.ts (if added)

### Verification
- Middleware validates Authorization headers.
- Backend resolves install token to accountId server-side.
- Authentication boundary now aligns with the Phase-DC install-token design.

### Remaining
- Protect `/v1/sessions` with the middleware.
- Implement authenticated session ingestion.

### Notes
- Authentication is centralized in reusable middleware rather than duplicated across controllers.

## 2026-07-30 11:52

### Task
Implement thin authenticated session ingestion endpoint (`POST /v1/sessions`)

### Completed
- Implemented `POST /v1/sessions`.
- Protected the endpoint with `installTokenMiddleware`.
- Validated incoming requests using the shared `SessionPayloadSchema`.
- Resolved authenticated identity through `req.auth.accountId`.
- Registered the session router in the v1 route index.
- Established the initial backend ingestion boundary for session payloads.

### Files
- apps/backend/src/routes/v1/session.ts
- apps/backend/src/routes/v1/index.ts

### Verification
- Session router successfully registered.
- Endpoint protected by install-token authentication.
- Invalid payloads return validation errors.
- Valid payloads are accepted.
- Shared contracts are used for request validation.
- Authentication continues to rely on server-side account resolution.

### Remaining
- Replace the temporary endpoint implementation with persistence.
- Create and integrate the Prisma session persistence layer.
- Implement quarantined event persistence for rejected payloads.
- Connect the SDK to the authenticated `/v1/sessions` endpoint.

### Notes
- This milestone completes the thin authenticated ingestion endpoint defined for the early Phase 3 backend work. Persistence will be implemented in the next task.

## 2026-07-30 13:57 UTC

### Task
Resolve `exactOptionalPropertyTypes` build failures in the extension package.

### Completed
- Fixed `Readonly<Set>` encapsulation by preventing external mutation of the session file set.
- Updated extension event creation to correctly omit optional `project` when undefined instead of assigning `project: undefined`.
- Applied the optional property fix consistently across event listeners and session payload creation.
- Verified `SessionManager`, session processing, and shared event types for compatibility with `exactOptionalPropertyTypes`.
- Reviewed and validated the shared event schemas and interfaces.
- Successfully restored a consistent implementation after investigating a potential `z.infer` refactor.
- Resolved all TypeScript build errors.
- All unit tests passed.
- Full project build completed successfully.

### Files
- `apps/extension/src/session/SessionManager.ts`
- `apps/extension/src/session/session.ts`
- `apps/extension/src/processors/sessionProcessor.ts`
- `apps/extension/src/listeners/activeEditor.ts`
- `apps/extension/src/listeners/documentOpen.ts`
- `apps/extension/src/listeners/documentSave.ts`
- `apps/extension/src/listeners/documentClose.ts`
- `packages/types/src/events.ts`
- Associated extension tests

### Verification
- `pnpm test` ✅
- `pnpm build` ✅
- No remaining TypeScript errors related to `exactOptionalPropertyTypes`.

### Remaining
- Continue Phase DC implementation tasks.
- Consider migrating shared types to `z.infer` in a future dedicated refactor if runtime schemas are intended to be the single source of truth.

### Notes
- The final compiler error originated from optional property semantics introduced by `exactOptionalPropertyTypes`, not from the shared schema definitions.
- A broad schema/type refactor was investigated but intentionally deferred after confirming the existing implementation was correct and the build passed without it.

## 2026-07-30 14:55

### Task
TaskList.md sync check

### Completed
- Compared the uploaded TaskList.md against the current project state documents.
- Confirmed the list is partially synced with recent backend progress.
- Identified remaining gaps around session persistence, database models, repositories, and backend middleware.

### Files
- TaskList.md
- DevTracker-Development-Phases.md
- DevTracker-Phase-DC.md
- CurrentState.md
- Log.md

### Verification
- Cross-checked the task list against the current-state and phase documents.
- Confirmed backend/database work is still incomplete in the project docs.

### Remaining
- Reconcile remaining Phase 3 and Phase 4 tasks against repository implementation.
- Update checklist status for persistence and middleware work after verification.

### Notes
- The uploaded TaskList.md should be treated as the current working checklist, but it is not fully synchronized with the repo truth yet.

## 2026-07-31 11:58

### Task
Implement SessionRepository

### Completed
- Created `SessionRepository`.
- Added persistence method accepting `accountId` and `SessionPayload`.
- Persisted the initial `Session` entity using Prisma.
- Kept HTTP handling, validation, and authentication outside the repository.

### Files
- apps/backend/src/repositories/session.repository.ts

### Verification
- Repository depends only on Prisma and shared types.
- Contains persistence logic only.
- No Express dependencies.

### Remaining
- Implement `ProjectRepository`.
- Link sessions to projects.
- Implement `ActivityRepository`.
- Integrate repositories into the session ingestion route.


## 2026-07-31 12:15

### Task
Implement project.repository.ts

### Completed
- Added ProjectRepository.
- Implemented findOrCreate(accountId, name).
- Used Prisma upsert() with the composite unique key (accountId, name).
- Kept the repository persistence-only.

### Files
- apps/backend/src/repositories/project.repository.ts

### Verification
- Verified the Prisma schema defines @@unique([accountId, name]).
- Confirmed upsert() can use the generated accountId_name unique selector.

### Remaining
- Integrate ProjectRepository into SessionRepository.
- Implement ActivityRepository.

### Notes
- Repository follows the persistence-only architecture with no HTTP or authentication concerns.

## 2026-07-31 12:30

### Task
Implement ActivityRepository

### Completed
- Created `ActivityRepository`.
- Added bulk activity persistence using `createMany()`.
- Mapped `DevTrackerEvent` objects to `Activity` records.
- Associated each activity with the authenticated account and session.
- Handled empty event collections without issuing database writes.

### Files
- apps/backend/src/repositories/activity.repository.ts

### Verification
- Repository depends only on Prisma and shared types.
- Uses efficient bulk persistence.
- Contains no HTTP or authentication logic.

### Remaining
- Orchestrate repositories in `SessionRepository` using a Prisma transaction.
- Integrate the persistence layer into the `/v1/sessions` endpoint.
- Implement quarantined event persistence.


## 2026-07-31 12:45

### Task
Implement transactional session persistence

### Completed
- Introduced a shared `TransactionClient` type.
- Updated `ProjectRepository` and `ActivityRepository` to use the transaction client.
- Refactored `SessionRepository` to orchestrate project resolution, session creation, and activity persistence.
- Wrapped all persistence operations in a single Prisma transaction.

### Files
- apps/backend/src/lib/prisma.ts
- apps/backend/src/repositories/session.repository.ts
- apps/backend/src/repositories/project.repository.ts
- apps/backend/src/repositories/activity.repository.ts

### Verification
- All repository operations execute within a single transaction.
- No repository uses the global Prisma client inside transactional work.
- Persistence is atomic across related entities.

### Remaining
- Integrate `SessionRepository` into `POST /v1/sessions`.
- Verify end-to-end session ingestion.
- Implement quarantined event persistence.


## 2026-07-31 12:55

### Task
Integrate SessionRepository into POST /v1/sessions

### Completed
- Replaced temporary console logging with SessionRepository.
- Kept authentication in middleware.
- Kept request validation in the route.
- Delegated all persistence to SessionRepository.
- Removed Prisma usage from the route.

### Files
- apps/backend/src/routes/v1/session.ts

### Verification
- Route now validates, authenticates, invokes SessionRepository, and returns a success response.
- SessionRepository performs transactional persistence.

### Remaining
- Remove the unused `created` variable or return the created session if desired * Done

### Notes
- The HTTP layer is now cleanly separated from the persistence layer.

### Remaining
- Implement quarantined event persistence.
- Add logging middleware.
- Add error handling middleware.
- Perform end-to-end verification using the extension and SDK.