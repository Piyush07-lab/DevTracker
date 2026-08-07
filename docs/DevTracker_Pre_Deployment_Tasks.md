# DevTracker --- Pre-Deployment Tasks (Temporary)

> Temporary checklist for reaching the first deployable release.

## 1. End-to-End Verification (Highest Priority)

Verify the complete flow:

``` text
VS Code Extension
        ↓
SDK
        ↓
POST /v1/install
        ↓
Install Token
        ↓
POST /v1/sessions
        ↓
Backend
        ↓
Database
```

### Checklist

-   [ ] Extension successfully performs `POST /v1/install`
-   [ ] Install token is stored locally
-   [ ] SDK sends authenticated `POST /v1/sessions`
-   [ ] Backend resolves install token to `accountId`
-   [ ] Session is persisted successfully
-   [ ] Activities are persisted successfully
-   [ ] Invalid payloads are quarantined
-   [ ] Logging middleware behaves correctly
-   [ ] Error-handling middleware behaves correctly

------------------------------------------------------------------------

## 2. Integration Testing

-   [ ] Install bootstrap test
-   [ ] Authenticated session upload test
-   [ ] Database persistence test
-   [ ] Quarantined payload test
-   [ ] Middleware behavior test

------------------------------------------------------------------------

## 3. Phase 5 Session Engine

-   [ ] Merge consecutive events
-   [ ] Idle timeout engine
-   [ ] Session duration calculation
-   [ ] Language aggregation
-   [ ] Project aggregation
-   [ ] Queue completed sessions

------------------------------------------------------------------------

## 4. Pre-Deployment Hardening

### Logging

-   [ ] Log native `Error` objects with Pino

### Security

-   [ ] Register `helmet()` globally
-   [ ] Register `cors()` globally

------------------------------------------------------------------------

## Deployment Readiness

Release only after:

-   [ ] All items above are complete
-   [ ] Production build succeeds
-   [ ] Clean install of the extension succeeds
-   [ ] First-run bootstrap succeeds
-   [ ] Session upload verified end-to-end
-   [ ] Database persistence verified
