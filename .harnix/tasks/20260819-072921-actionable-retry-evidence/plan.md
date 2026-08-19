# Plan — Actionable retry evidence

## Implementation checklist

- [x] `S1` — Domain/storage RED → GREEN.
- [x] `S2` — Focused retry UI RED → GREEN.
- [x] `S3` — Truthful Progress evidence RED → GREEN.
- [x] `S4` — Docs, full verification và review.

### Slice `S1`
Criteria: `AC-2`, `AC-3`
Checks: `check-domain-storage`, `check-all-tests`
Paths: `src/domain/progress/**`, `src/infrastructure/storage/**`

Test optional focus, compatibility, privacy và selectors; implement field cùng pure helpers không bump version.

### Slice `S2`
Criteria: `AC-1`, `AC-2`
Checks: `check-practice-ui`, `check-all-tests`
Paths: `src/features/practice/CapabilityTask.tsx`, `src/features/lesson/LessonFlow.test.tsx`

Test focus guard/retry rerating; implement accessible selector, focus card, persisted real ratings; resume cũ không crash.

### Slice `S3`
Criteria: `AC-3`
Checks: `check-progress-ui`, `check-all-tests`
Paths: `src/features/progress/**`, `src/domain/progress/progress.ts`

Test đạt/chưa đạt/non-transfer và content-owned maxHints; aggregate bằng pure helpers và giải thích định nghĩa.

### Slice `S4`
Criteria: `AC-4`, `AC-5`
Checks: `check-docs`, `check-all-tests`, `check-lint`, `check-build`
Paths: `PRODUCT.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `src/**`

Đồng bộ docs; focused/content/full tests, lint, build; manual hai paths, keyboard/resume; diff review. Giữ pre-existing prompt/CHANGELOG work, không commit.
