# DevTracker — Current State

**Last Updated:** 2026-07-30

---

# Purpose

This document records the repository's current implementation status so future development starts from the actual codebase state, not the roadmap.

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

# Repository Overview

DevTracker is a local-first developer activity tracker built as a pnpm/Turbo monorepo. It captures coding activity from a VS Code extension, sends it through a shared SDK to an Express backend, stores data with Prisma, and will expose analytics through a React dashboard.

The architecture is designed to support SQLite for development and PostgreSQL for production without changing core application logic.

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
| Install Bootstrap API | ✅ Complete |
| Install Token Middleware | ✅ Complete |
| Session Ingestion (Backend) | ✅ Thin endpoint complete |
| Dashboard | ⏳ Not Started |
| Persistence Layer | ⏳ Not Started |
| Authentication | ⏳ Not Started |
| Analytics | ⏳ Not Started |

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
- `/v1/install`
- Install token middleware
- `POST /v1/sessions` thin authenticated endpoint

Not yet implemented:

- Persistence layer for sessions and related entities
- Logging middleware
- Error handling middleware
- Health endpoint hardening if needed
- Repository layer
- Quarantine persistence for rejected payloads

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
- Account model
- Installation model
- InstallToken model

Pending:

- Session tables
- Project tables
- Activity tables
- Quarantine tables
- Repository layer
- Database integration inside Express

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

```text
init
```

Development database:

```text
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

```text
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

The backend has integrated the SQLite adapter required by the generated client.

---

# SDK Status

Status:

✅ Complete

Implemented:

- Axios transport
- Install bootstrap client
- Session upload client
- Shared Zod validation
- Shared wire contracts

The SDK is responsible for HTTP communication between the extension and backend.

---

# Technology Snapshot

## Backend

- Node.js
- Express
- TypeScript
- Prisma
- Zod

## Development Database

- SQLite

## Production Database

- PostgreSQL

## Extension

- VS Code API
- TypeScript

## Dashboard (planned)

- React
- Vite
- Tailwind
- TanStack Query

---

# Current Repository Milestones

Completed:

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
- Install bootstrap API
- Install token middleware
- Thin authenticated session ingest endpoint

In Progress:

- Backend API
- Database persistence

Not Started:

- Dashboard
- Authentication
- Analytics
- Public API authorization design

---

# Immediate Next Task

Implement session persistence in the backend.

Recommended order:

1. Add the repository layer.
2. Create session, project, activity, and quarantine persistence.
3. Connect the ingest endpoint to durable storage.
4. Verify account-scoped queries throughout the write path.

After session persistence is complete:

5. Begin dashboard implementation.
6. Continue into authentication and analytics work.

---

# Known Technical Notes

- The extension remains the only CommonJS package.
- Backend and shared packages use ESM.
- Prisma Client is generated into the repository rather than `node_modules`.
- SessionManager still contains the documented shallow `Readonly<Set>` issue, intentionally deferred to Phase 5.
- Licensing (DC-5) and Public API Authorization (DC-6) remain intentionally unresolved.
