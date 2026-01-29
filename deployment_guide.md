# Tylendar Production Deployment Guide

## Overview
Tylendar is a Node.js + Express application that serves a static client bundle and JSON APIs. In production the server expects a MongoDB database and relies on environment variables for configuration. This guide covers provisioning, configuration, deployment, health checks, and release validation for Azure App Service.

## Architecture Snapshot
- **Runtime:** Node.js (Express server + static client assets in `/client`).
- **Database:** MongoDB (connection string via environment variable).
- **Configuration:** Environment variables (session secrets, feature flags, DB URI).
- **Health & Metrics:** Monitoring endpoints under `/api/monitoring/*`.

## Prerequisites
- **Node.js 18+** (or the version configured in Azure App Service).
- **MongoDB** (Atlas, Cosmos DB for MongoDB API, or self-hosted).
- **Azure App Service** or equivalent Node.js hosting.
- (Optional) **Azure CLI** for provisioning and deployment automation.

## Required Environment Variables
Set these in Azure App Service **Configuration > Application settings** (or your hosting provider).

| Variable | Required | Purpose | Notes |
| --- | --- | --- | --- |
| `MONGODB_URI` | ✅ | MongoDB connection string | If missing, the app falls back to in-memory storage (not production-safe). |
| `SESSION_SECRET` | ✅ | Session signing secret | Use a strong, rotated secret. |
| `NODE_ENV` | ✅ | Runtime environment | Set to `production`. |
| `PORT` | ✅ | Listening port | Set automatically by App Service. |
| `FEATURE_FLAGS` | ❌ | Feature flag overrides | JSON object, e.g. `{ "calendarViews": true }`. |
| `USE_IN_MEMORY_DB` | ❌ | Force in-memory DB | Must be `false` in production. |
| `MONGO_URL` | ❌ | Alternate MongoDB URI | Used only if `MONGODB_URI` is not set. |

### Example Application Settings
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
SESSION_SECRET=<long-random-secret>
FEATURE_FLAGS={"auditHistory":true,"observability":true}
USE_IN_MEMORY_DB=false
```

## Azure App Service Setup (Recommended)
1. **Provision the App Service**
   - Create a Resource Group and App Service Plan (Linux/Node).
   - Create a Web App and set the Node.js version (ex: `18 LTS`).
2. **Configure Application Settings**
   - Add all environment variables listed above.
   - Configure **Health check path** to `/api/monitoring/health`.
3. **Configure Deployment Source**
   - GitHub Actions, Azure DevOps, or Zip Deploy are all supported.
   - Ensure `npm ci --omit=dev` runs on build and `npm start` runs on runtime.
4. **Enable HTTPS Only**
   - Turn on TLS/HTTPS enforcement in App Service.

## Deployment Steps (Zip Deploy Example)
1. Install dependencies locally and run tests:
   ```bash
   npm ci
   npm run test:coverage
   ```
2. Build a deployment artifact (exclude `node_modules`):
   ```bash
   zip -r tylendar.zip . -x "node_modules/*" "**/.git/*" "**/.DS_Store"
   ```
3. Upload via Azure CLI:
   ```bash
   az webapp deployment source config-zip \
     --resource-group <rg-name> \
     --name <app-name> \
     --src tylendar.zip
   ```
4. Validate health endpoints:
   - `GET /api/monitoring/health`
   - `GET /api/monitoring/metrics`

## Operational Checks
- **Health:** `/api/monitoring/health` returns `{ "status": "ok" }` and the storage mode.
- **Metrics:** `/api/monitoring/metrics` returns user/event counts and uptime.
- **Observability:** `/api/monitoring/observability` and `/api/monitoring/alerts` validate dashboard and alert feeds.
- **Admin Dashboard:** `/api/monitoring/admin/dashboard` requires authenticated access.

## Release Validation Checklist
Use this checklist before promoting a release to production:
1. ✅ `npm run test:coverage` passes with **>=95% branch coverage**.
2. ✅ `MONGODB_URI` and `SESSION_SECRET` are set in production.
3. ✅ `NODE_ENV=production` and `USE_IN_MEMORY_DB=false` are configured.
4. ✅ Health check returns `status: ok` on `/api/monitoring/health`.
5. ✅ Feature flags match the expected release plan.
6. ✅ Manual smoke test of core flows (login, calendar view, events list).

## Scaling & Resilience Notes
- **Session storage is in-memory.** For multi-instance deployments, enable sticky sessions or plan to migrate sessions to a shared store (Redis, Cosmos DB) before scaling out.
- **Database availability:** Use a production MongoDB cluster with automatic backups and failover.
- **Fault tolerance endpoints:** `/api/monitoring/fault-tolerance` can be used to validate retry and circuit breaker behavior.

## Rollback Strategy
- Keep the previous deployment artifact in the pipeline.
- Use App Service deployment slots or redeploy the previous zip artifact.
- Verify health endpoints and core flows after rollback.
