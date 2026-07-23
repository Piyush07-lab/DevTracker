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
