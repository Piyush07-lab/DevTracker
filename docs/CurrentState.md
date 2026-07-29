# DevTracker — Current State

**Last Updated:** 2026-07-25

---

# Purpose

This document represents the current implementation status of the project.

Unlike the development phases document, which describes the roadmap, this file records the project's actual state so future development sessions begin with accurate context.

---

# Canonical Documents

Development should follow these documents in order of precedence:

1. DevTracker-Development-Phases.md
2. Log.md
3. DevTracker-Phase-DC.md
4. CurrentState.md
5. DevTracker-Technology-Stack.md

If this document conflicts with the Development Phases or Phase-DC documents, those documents take precedence.

---

# Overall Status

| Area | Status |
|-------|--------|
| Monorepo | ✅ Complete |
| Shared Packages | ✅ Complete |
| VS Code Extension | ✅ Complete |
| Backend Scaffold | ✅ Complete |
| Shared Validation | ✅ Complete |
| SDK | ✅ Complete |
| Prisma Integration | ✅ Complete |
| Initial Database Schema | ✅ Complete |
| First Migration | ✅ Complete |
| Install Bootstrap API | ⏳ Not Started |
| Authentication | ⏳ Not Started |
| Session Ingestion (Backend) | ⏳ Not Started |
| Dashboard | ⏳ Not Started |

---

# Current Phase Status

## Phase 1 — Foundation

Status:

✅ Complete

Deliverable achieved.

---

## Phase 2 — VS Code Extension

Status:

✅ Complete

Implemented:

- Event dispatcher
- Session manager
- Idle detection
- Path normalization
- Shared event contracts
- SessionPayload generation
- Session event collection
- SDK integration
- esbuild bundling
- SessionManager unit tests

Remaining work intentionally deferred to later phases:

- Readonly Session clone improvement (Phase 5)

---

## Phase 3 — Backend API

Status:

🟡 In Progress

Completed:

- Backend workspace
- Express application
- HTTP server
- Build tooling
- Shared validation layer
- Project structure

Not yet implemented:

- `/v1/install`
- Token middleware
- Health endpoint
- Logging middleware
- Error handling
- Session ingest endpoints

---

## Phase 4 — Database

Status:

🟡 In Progress

Completed:

- Prisma installed
- Prisma configured
- SQLite development database
- Initial schema
- Initial migration
- Prisma Client generation

Implemented models:

- Account
- Installation
- InstallToken

Pending:

- Repository layer
- Database integration inside Express
- Session tables
- Project tables
- Activity tables
- Quarantine tables

---

# Locked-Core Decisions

The following decisions are considered frozen.

## Architecture

- Express backend
- Prisma ORM
- SQLite for development
- PostgreSQL for production

---

## Tenancy

Every future table must include:

- accountId
- foreign key
- index

Every backend query must be account scoped.

---

## Identity

Identity is resolved through an installation token.

The client never sends an accountId.

Future authentication extends this mechanism rather than replacing it.

---

## API

- Versioned under `/v1`
- Zod validation first
- Shared contracts from `@devtracker/types`

---

# Database State

Current migration history:

```
init
```

Development database:

```
apps/backend/prisma/dev.db
```

Current models:

- Account
- Installation
- InstallToken

No session persistence exists yet.

---

# Prisma Status

Current Prisma version:

```
7.9.0
```

Client generator:

```prisma
generator client {
    provider = "prisma-client"
    output = "../src/generated/prisma"
}
```

Important note:

Prisma 7's `prisma-client` generator requires a database driver adapter when constructing `PrismaClient`.

The backend has not yet integrated the generated client because the SQLite driver adapter has not yet been installed and configured.

This is an implementation task, not an architectural blocker.

---

# SDK Status

Status:

✅ Complete

Implemented

- Axios transport
- Install bootstrap client
- Session upload client
- Shared Zod validation
- Shared wire contracts

The SDK is now responsible for all HTTP communication between the extension and backend.

# Technology Snapshot

Backend

- Node.js
- Express
- TypeScript
- Prisma
- Zod

Development Database

- SQLite

Production Database

- PostgreSQL

Extension

- VS Code API
- TypeScript

Dashboard (planned)

- React
- Vite
- Tailwind
- TanStack Query

---

# Current Repository Milestones

Completed

- Monorepo established
- Shared packages
- Extension event system
- Session engine foundation
- SessionPayload pipeline
- SDK transport layer
- Shared validation contracts
- Backend scaffold
- Prisma setup
- First migration
- Development database

In Progress

- Backend API

Not Started

- Install bootstrap
- Token resolution
- Session persistence
- Dashboard
- Authentication
- Analytics

---

# Immediate Next Task

Implement the backend installation bootstrap.

Recommended order:

1. Implement POST /v1/install.
2. Generate installation token.
3. Persist installation and token.
4. Implement install-token middleware.
5. Implement the first authenticated endpoint.

After installation bootstrap is complete:

6. Verify end-to-end extension registration.
7. Begin backend session ingestion.

---

# Known Technical Notes

- The extension remains the only CommonJS package.
- Backend and shared packages use ESM.
- Prisma Client is generated into the repository rather than `node_modules`.
- SessionManager still contains the documented shallow `Readonly<Set>` issue, intentionally deferred to Phase 5.
- Licensing (DC-5) and Public API Authorization (DC-6) remain intentionally unresolved.