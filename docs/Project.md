# DevTracker Project

## Overview

DevTracker is a local-first coding activity tracker built as a monorepo. It captures developer activity from a VS Code extension, sends it through a shared SDK to an Express backend, stores data with Prisma, and is planned to expose analytics through a React dashboard. The project is intentionally structured to support both a local SQLite development database and PostgreSQL production database without changing the core architecture. fileciteturn1file0

## What the repository contains

### 1. VS Code extension
The extension is responsible for capturing editor activity. The current implementation includes activation, event dispatching, listeners for active editor / open / save / close events, idle detection, heartbeat generation, session management, path normalization, shared event contracts, SDK integration, and bundling with esbuild. The extension is functionally complete, with a shallow `Readonly<Set>` follow-up deferred to Phase 5. fileciteturn1file2 fileciteturn1file9

### 2. Shared packages
The repository includes shared packages for reusable code:
- `packages/types` for the shared wire contract and Zod-backed validation
- `packages/sdk` for HTTP communication between the extension and backend
- `packages/tooling` and `packages/utils` for shared project utilities and build support

The shared contract is the source of truth for event/session payloads across the extension, backend, and future dashboard. fileciteturn1file2 fileciteturn1file6

### 3. Backend API
The backend is an Express application written in TypeScript. It is scaffolded and already includes a server, build tooling, shared validation, a health endpoint, `POST /v1/install`, install-token middleware, and an initial authenticated session ingest endpoint. Remaining backend work includes persistence, logging middleware, error handling middleware, and repository layers. fileciteturn1file2 fileciteturn1file7 fileciteturn1file16

### 4. Database layer
Prisma is installed and initialized. The project currently has a SQLite development database, a first migration, Prisma Client generation, and initial models for `Account`, `Installation`, and `InstallToken`. Session, project, activity, and quarantine tables are still pending. fileciteturn1file2 fileciteturn1file7

### 5. Dashboard
A dashboard package exists, but the React/Vite UI has not been implemented yet. It is planned to present sessions, charts, statistics, heatmaps, and settings. fileciteturn1file7 fileciteturn1file9

## Architecture decisions already locked in

The repository has several frozen decisions that guide implementation:
- Express backend with Prisma ORM
- SQLite for development and PostgreSQL for production
- Every future data table must include `accountId`
- Backend queries must always be account-scoped
- Identity is resolved through an installation token; the client never sends `accountId`
- All API routes are versioned under `/v1`
- Shared Zod contracts from `@devtracker/types` are validated first at the backend boundary fileciteturn1file2 fileciteturn1file3 fileciteturn1file17

## Current implementation status

The repository is past the foundation and extension phases and is now in backend/database work. The current state document marks the monorepo, shared packages, VS Code extension, backend scaffold, shared validation, SDK, Prisma integration, initial schema, and first migration as complete. The next major gaps are session persistence, install bootstrap hardening, authentication, analytics, and the dashboard. fileciteturn1file2

## Repository structure

At the top level, the repository is organized into:
- `apps/` for the backend, extension, and dashboard
- `packages/` for shared SDK, types, tooling, and utilities
- `docs/` for roadmap, current state, task list, technology stack, and Phase-DC decisions
- workspace and tooling files such as `pnpm-workspace.yaml`, `turbo.json`, `eslint.config.mjs`, and TypeScript config files fileciteturn1file18

## Practical reading order

The documentation indicates this order of precedence for understanding the project:
1. `DevTracker-Development-Phases.md`
2. `Log.md`
3. `DevTracker-Phase-DC.md`
4. `CurrentState.md`
5. `DevTracker-Technology-Stack.md` fileciteturn1file2

## Summary

DevTracker is a monorepo for tracking coding activity end to end: extension capture, shared event contracts, backend ingestion, account-scoped persistence, and future dashboard analytics. The current codebase is structurally complete enough to continue backend and database work, but the main remaining product pieces are persistence, authentication, analytics, and dashboard UI. fileciteturn1file2 fileciteturn1file7
