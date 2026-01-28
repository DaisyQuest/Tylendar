# AGENTS.md - Tylendar Workflow

## Purpose
This document defines the working agreement for all agents contributing to this repository.

## Required Workflow
### Before working
1. Read `PROJECT_SPEC.md`.
2. Read `PROJECT_CHECKLIST.md`.
3. Read `MASTER_INTEGRATION_TEST.md`.

### During work
- Keep changes modular and aligned to feature flags.
- Update tests alongside code changes to maintain **>=95% branch coverage**.
- Update the **Master Integration Test** to reflect any new features or changes.

### Before commit
- Run all relevant tests and verify coverage requirements are met.
- Ensure the **Master Integration Test** document is updated for the changes.
- Update `PROJECT_CHECKLIST.md` by checking completed items.

### After working
1. Check off completed items in `PROJECT_CHECKLIST.md`.
2. Create `worksummary-$uuid.md` describing the completed work, tests run, and coverage results.
3. Verify `MASTER_INTEGRATION_TEST.md` has been updated.

## Testing & Coverage
- Agents must always run tests and verify coverage before committing.
- Target: **95%+ branch coverage** for all code branches.

## Pull Request Hygiene
- Provide clear, concise summaries.
- Include testing and coverage results.
