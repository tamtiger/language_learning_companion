# Plan — Realistic curriculum pilot

## Checklist
- [x] `S1` — Complete runtime/content audit and research evidence.
- [x] `S2` — RED tests for the practice-context contract.
- [x] `S3` — Schema and generic phase-context renderer.
- [x] `S4` — Issue-update content pilot.
- [x] `S5` — Owner docs and complete verification.

Each behavioral slice uses RED → GREEN → REFACTOR. The additive content contract does not migrate storage and missions without practiceContexts remain unchanged.

### Slice `S1`
Complete black-box observations, persist the 12-mission matrix and verify the source-backed decision selecting multi-artifact phase contexts over more model support or a branching engine.

Criteria: `AC-1`, `AC-2`
Checks: `check-audit-research`
Paths: `CURRICULUM_RESEARCH_PROMPT.md`, `.harnix/tasks/20260819-224523-realistic-curriculum-pilot/research/current-state-audit.md`, `.harnix/tasks/20260819-224523-realistic-curriculum-pilot/research/learning-design-decision.md`

### Slice `S2`
Add failing schema/content/component tests for complete baseline-transfer-review contexts, unique artifact IDs, cold-attempt visibility, instructional/model lock and phase-specific transfer artifacts.

Criteria: `AC-3`, `AC-4`
Checks: `check-all-tests`
Paths: `src/content/schema.test.ts`, `src/content/content.test.ts`, `src/features/practice/CapabilityTask.test.tsx`

### Slice `S3`
Add PracticeContextSchema and optional practiceContexts to PerformanceTaskV3; render only the active baseline/transfer/review context through generic SectionRenderer without persistence or lesson-ID branches.

Criteria: `AC-3`, `AC-4`
Checks: `check-all-tests`
Paths: `src/content/schema.ts`, `src/features/practice/CapabilityTask.tsx`, `src/features/lesson/SectionRenderer.tsx`

### Slice `S4`
Rewrite workplace-issue-update-b1 with synthetic monitoring/channel/handoff artifacts for baseline, a worked signal-selection input, evidence-safe model/rubric and different transfer/review incidents.

Criteria: `AC-3`, `AC-4`
Checks: `check-all-tests`, `check-manual-pilot`
Paths: `content/modules/capabilities/workplace-issue-update-b1.json`, `src/content/content.test.ts`, `src/features/practice/CapabilityTask.test.tsx`

### Slice `S5`
Update owner docs and CHANGELOG; run full tests, lint/build and desktop/mobile black-box flows. Record expert/learner testing and delayed retention as unperformed unless actual evidence exists.

Criteria: `AC-1`, `AC-5`, `AC-6`
Checks: `check-audit-research`, `check-all-tests`, `check-docs`, `check-lint-build`, `check-manual-pilot`
Paths: `PRODUCT.md`, `CONTENT.md`, `README.md`, `START_HERE.md`, `CHANGELOG.md`, `content/**/*.json`, `src/**/*`