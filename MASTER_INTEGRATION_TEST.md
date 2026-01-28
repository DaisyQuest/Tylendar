# Master Integration Test

## Purpose
This document defines the **Master Integration Test (MIT)** that validates all major features of the Tylendar calendar system. It must be updated **with every commit** to reflect feature coverage and ensure end-to-end validation remains comprehensive.

## Test Principles
- Validates **core user journeys** across the system.
- Exercises **permissions and access control** across roles.
- Ensures **feature flags** correctly enable/disable functionality.
- Confirms **fault tolerance** and graceful error handling.
- Serves as the **single source of truth** for cross-feature integration testing.

## Master Integration Test Scenarios
1. **User Onboarding & Profile**
   - Create user, authenticate session, update profile, verify permissions.
   - Validate User Management + Profile UI sections render notifications and activity feed.
   - Confirm feature flags toggle profile modules without breaking navigation.
   - Verify profile edits persist across session refresh and re-login.
2. **Organization Lifecycle**
   - Create organization, assign roles, configure permissions.
   - Validate Role & Permission Management UI for role definitions and assignments.
   - Confirm Organization Dashboard shows compliance score, calendar count, and department tags.
   - Validate organization switching updates all scoped data in the UI and API.
   - Ensure role assignment changes take effect immediately for active sessions.
3. **Calendar Creation & Sharing**
   - Create calendar, assign shared owners, verify visibility.
   - Confirm shared owners can manage calendar metadata and see shared events.
   - Validate calendar list updates in real time for new shares.
4. **Calendar Permissions Enforcement**
   - Validate each permission type across API and UI.
   - Enforce permissions middleware during event create/update/delete flows across multiple calendars.
   - Verify permission changes immediately restrict existing sessions without cache leaks.
   - Confirm audit logs capture denied actions with clear reasons.
5. **Event Lifecycle**
   - Create, update, delete events across multiple calendars.
   - Validate event metadata (time zone, reminders, attendees) persists across edits.
   - Confirm event visibility honors calendar-level permissions and shared ownership.
6. **MessageBoard Comments**
   - Post, edit, delete comments; permission checks.
   - Confirm MessageBoard UI displays threaded comments and timestamps.
   - Validate comment notifications appear in user activity feed.
7. **Calendar Views**
   - Month/2-week/week/day rendering with event correctness.
   - Verify navigation between views preserves selected date and filters.
8. **Event List Views**
   - Year/n-month/month/week/day filtering.
   - Confirm list view filtering respects calendar permissions.
9. **Manage Access Flow**
   - Assign granular permissions; verify immediate enforcement.
   - Confirm Manage Access UI table lists assigned permissions accurately.
   - Validate permission revocation removes access across all UI entry points.
10. **Audit History**
    - Ensure audit logs surface readable history.
    - Confirm audit entries map to user actions in multiple modules (calendar, permissions, auth).
    - Validate audit history UI highlights embed, sharing, and role changes.
11. **Embed Widget**
    - Load embedded calendar and validate API access.
    - Confirm embed respects calendar visibility and permission boundaries.
    - Verify embed renders correctly in unauthenticated contexts with public calendars.
12. **Social Sharing & Export**
    - Validate exports and shareable links.
    - Confirm export formats include correct time zones and event metadata.
    - Ensure developer portal documents sharing and export endpoints.
13. **Monitoring & Admin Dashboards**
    - Validate service health, metrics, and operational views.
    - Verify operational metrics align with Embed Widget usage and availability.
    - Confirm admin dashboards show counts for users, organizations, calendars, and events.
    - Confirm alerts trigger on simulated error rates and recover after resolution.
    - Validate observability dashboards and operational alert feeds render updated data.
14. **Fault Tolerance**
    - Simulate failures and ensure graceful degradation.
    - Validate retries and fallback messaging across API and UI flows.
    - Confirm circuit breaker states reset after cooldown windows.
15. **Home Page Experience**
    - Validate the simplified hero banner and login/register actions on the home page.
    - Confirm the Home Details page renders highlights, dashboards, calendar previews, access, and MessageBoard sections.
16. **Merge & Dependency Integrity**
    - Regenerate `package-lock.json` and confirm dependency resolution remains stable.
    - Verify recent merges compile and pass full integration coverage.
    - Confirm responsive layout across desktop and mobile breakpoints.

## Coverage Requirements
- **>=95% branch coverage** across codebase.
- All features must be exercised by MIT.
- No merge without updated MIT.
