# DevTracker Technology Stack

## Guiding Principles

-   Keep the extension lightweight.
-   Prioritize TypeScript across the stack.
-   Support local-first development.
-   Build cloud features without changing the core architecture.

------------------------------------------------------------------------

# VS Code Extension

  Purpose                         Technology
  ------------------------------- -----------------------
  Language                        TypeScript
  API                             VS Code Extension API
  HTTP Client                     Axios
  Validation                      Zod
  Secure Token Storage (future)   Keytar

------------------------------------------------------------------------

# Backend

  Purpose             Technology
  ------------------- --------------------
  Runtime             Node.js
  Framework           Express.js
  Language            TypeScript
  ORM                 Prisma
  Validation          Zod
  Authentication      JWT
  Password Hashing    bcrypt
  Logging             Pino
  Security            Helmet
  CORS                cors
  Rate Limiting       express-rate-limit
  Scheduled Jobs      node-cron
  API Documentation   Swagger / OpenAPI

------------------------------------------------------------------------

# Database

## Development

-   SQLite

## Production

-   PostgreSQL

Prisma will be used to support both databases with minimal code changes.

------------------------------------------------------------------------

# Dashboard

  Purpose         Technology
  --------------- -----------------
  Framework       React
  Build Tool      Vite
  Routing         React Router
  Styling         Tailwind CSS
  Data Fetching   TanStack Query
  Forms           React Hook Form
  Validation      Zod
  Charts          Recharts

------------------------------------------------------------------------

# Testing

-   Vitest
-   VS Code Extension Test API

------------------------------------------------------------------------

# Future Features (Not Initial Development)

-   Stripe (Licensing & Payments)
-   GitHub OAuth
-   Team Workspaces
-   Public API Keys
-   Webhooks
-   Cloud Synchronization
-   Device Management

------------------------------------------------------------------------

# Initial Scope

The first milestone focuses on:

1.  VS Code extension for coding activity tracking.
2.  Express backend with REST API.
3.  SQLite database.
4.  React dashboard.
5.  Session aggregation and analytics.
6.  Local-first architecture.

Licensing, payments, and commercial features will be added after the
core platform is complete.
