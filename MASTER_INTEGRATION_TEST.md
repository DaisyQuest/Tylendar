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
   - Create user, update profile, verify permissions.
   - Validate User Management + Profile UI sections render notifications and activity feed.
2. **Organization Lifecycle**
   - Create organization, assign roles, configure permissions.
   - Confirm Organization Dashboard shows compliance score, calendar count, and department tags.
3. **Calendar Creation & Sharing**
   - Create calendar, assign shared owners, verify visibility.
4. **Calendar Permissions Enforcement**
   - Validate each permission type across API and UI.
5. **Event Lifecycle**
   - Create, update, delete events across multiple calendars.
6. **MessageBoard Comments**
   - Post, edit, delete comments; permission checks.
   - Confirm MessageBoard UI displays threaded comments and timestamps.
7. **Calendar Views**
   - Month/2-week/week/day rendering with event correctness.
8. **Event List Views**
   - Year/n-month/month/week/day filtering.
9. **Manage Access Flow**
   - Assign granular permissions; verify immediate enforcement.
   - Confirm Manage Access UI table lists assigned permissions accurately.
10. **Audit History**
    - Ensure audit logs surface readable history.
11. **Embed Widget**
    - Load embedded calendar and validate API access.
12. **Social Sharing & Export**
    - Validate exports and shareable links.
13. **Monitoring & Admin Dashboards**
    - Validate service health, metrics, and operational views.
14. **Fault Tolerance**
    - Simulate failures and ensure graceful degradation.
15. **Home Page Experience**
    - Validate hero banner, login/register actions, highlights, and call-to-action components render correctly.
16. **Merge & Dependency Integrity**
    - Regenerate `package-lock.json` and confirm dependency resolution remains stable.
    - Verify recent merges compile and pass full integration coverage.

## Coverage Requirements
- **>=95% branch coverage** across codebase.
- All features must be exercised by MIT.
- No merge without updated MIT.
