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
- Prisma Client generated
- Foundation ready for backend persistence and API development

This completes the database initialization milestone and unblocks implementation of the backend data layer, install bootstrap endpoint, and session ingestion pipeline.