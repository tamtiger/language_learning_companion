# Plan — Technical reading & listening ladder P2

## Implementation checklist

- [x] `S1` — RED schema/content tests cho `ReadingLadderV1`, bốn mission và six-spoken locale invariant.
- [x] `S2` — RED UI tests cho read-once gate, extraction→apply ladder và TTS speed/limitation copy.
- [x] `S3` — GREEN schema, `ReadingLadderPractice`, read-once integration và model-audio rate.
- [x] `S4` — Author ladder + four-phase unseen contexts cho bốn technical docs missions.
- [x] `S5` — Update owner docs, changelog và preregistered human-study design.
- [x] `S6` — Focused/full/lint/build verification và compliance/quality review.
- [x] `S7` — Desktop/mobile browser smoke, privacy scan, finish và commit riêng P2.

Mỗi behavioral slice dùng RED → GREEN → REFACTOR. Không đổi progress schema, không thêm dependency và không stage dirty work ngoài P2.

### Slice `S1`

Mở rộng RED assertions cho optional written-only ladder, shape/uniqueness, đúng bốn target missions, context khác facts, review source unseen và sáu spoken loops có ít nhất ba requested locales.

Criteria: `AC-1`, `AC-3`, `AC-4`
Checks: `check-reading-content`, `check-listening-variation`, `check-full-tests`
Paths: `src/content/schema.test.ts`, `src/content/content.test.ts`, `src/shared/utils/validate_all_lessons.test.ts`, `content/**/*.json`

### Slice `S2`

Thêm RED component tests: baseline source visible trước, hidden trước textarea; extraction sai có feedback và chưa qua; apply cần draft + checklist; TTS chọn 0.85×/1×/1.15×, rate được truyền và copy không claim human accent.

Criteria: `AC-2`, `AC-4`, `AC-6`
Checks: `check-reading-ui`, `check-listening-variation`, `check-full-tests`
Paths: `src/features/practice/ReadingLadderPractice.test.tsx`, `src/features/practice/CapabilityTask.test.tsx`, `src/features/practice/ModelAudioPlayer.test.tsx`, `src/features/practice/model_audio.test.ts`

### Slice `S3`

Implement `ReadingLadderV1Schema`, read-once panel, `ReadingLadderPractice` session state, input gate và playback-rate support; giữ response/extraction text ngoài progress/storage.

Criteria: `AC-1`, `AC-2`, `AC-4`, `AC-6`
Checks: `check-reading-content`, `check-reading-ui`, `check-listening-variation`, `check-full-tests`, `check-lint-build`
Paths: `src/content/schema.ts`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/ReadingLadderPractice.tsx`, `src/features/practice/ModelAudioPlayer.tsx`, `src/features/practice/model_audio.ts`

### Slice `S4`

Author concise synthetic ladders và baseline/retry/transfer/review evidence packets cho runbook, log diagnosis, API learning và docs troubleshooting; mỗi transfer/review thay facts/source nhưng giữ function.

Criteria: `AC-1`, `AC-3`
Checks: `check-reading-content`, `check-full-tests`, `check-manual-p2`
Paths: `content/modules/capabilities/technical-doc-action-b1.json`, `content/modules/capabilities/technical-log-diagnosis-b1.json`, `content/modules/capabilities/learn-api-from-docs-b2.json`, `content/modules/capabilities/technology-troubleshooting-from-docs-b2.json`

### Slice `S5`

Update PRODUCT/CONTENT/ARCHITECTURE/README/CHANGELOG và evaluation protocol: synthetic locale/speed limitation, reading ladder invariant, preregistered outcomes/power/exclusion/subgroup/fairness/stopping rule, không result claim.

Criteria: `AC-4`, `AC-5`, `AC-6`
Checks: `check-study-docs`, `check-full-tests`
Paths: `docs/EVALUATION_PROTOCOL.md`, `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `README.md`, `CHANGELOG.md`

### Slice `S6`

Chạy focused checks rồi full suite/lint/build; review compliance trước correctness, privacy, compatibility và unnecessary complexity.

Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-5`, `AC-6`
Checks: `check-reading-content`, `check-reading-ui`, `check-listening-variation`, `check-study-docs`, `check-full-tests`, `check-lint-build`
Paths: `content/**/*.json`, `src/**/*`, `docs/EVALUATION_PROTOCOL.md`, `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `README.md`, `CHANGELOG.md`

### Slice `S7`

Smoke technical-doc ladder qua baseline→input→performance và TTS controls ở desktop/390px; kiểm tra no overflow, console và no network/upload path. Functional QA không được diễn giải là efficacy study.

Criteria: `AC-2`, `AC-3`, `AC-4`, `AC-6`
Checks: `check-manual-p2`
Paths: `content/modules/capabilities/*.json`, `src/features/practice/**/*`