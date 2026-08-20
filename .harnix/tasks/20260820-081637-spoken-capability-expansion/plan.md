# Plan — Spoken capability expansion P1

## Implementation checklist

- [x] `S1` — RED content tests cho six-spoken invariant, Daily Standup v3 và context/interaction contract.
- [x] `S2` — RED runtime tests cho diagnostic-only cue và interruption.
- [x] `S3` — GREEN schema/domain/components cho adaptive cue và interruption.
- [x] `S4` — Learning loop/context cho ba spoken v3 missions.
- [x] `S5` — Migrate Daily Standup v2 sang v3 learning loop.
- [x] `S6` — Listener/expert protocol và owner docs/changelog.
- [x] `S7` — Focused/full/lint/build verification và review.
- [x] `S8` — Desktop/mobile smoke QA, evidence và finish.

Mỗi behavioral slice dùng RED → GREEN → REFACTOR. Không thêm dependency, không đổi ProgressEnvelopeV4 và không chạm dirty work ngoài P1.

### Slice `S1`

Thêm RED assertions trong content/schema/validator cho đúng 6 spoken v3 loops, distinct phase contexts, bounded chunks/cues và interaction repair coverage.

Criteria: `AC-1`, `AC-3`, `AC-4`
Checks: `check-spoken-content`, `check-full-tests`
Paths: `src/content/content.test.ts`, `src/content/schema.test.ts`, `src/shared/utils/validate_all_lessons.test.ts`, `content/**/*.json`

### Slice `S2`

Thêm RED component/domain tests: training-only miss không mở cue, diagnostic miss mở đúng cue, wording không chấm phát âm và interruption yêu cầu response mới.

Criteria: `AC-2`, `AC-3`, `AC-6`
Checks: `check-adaptive-loop`, `check-full-tests`
Paths: `src/domain/learning/learning_loop.test.ts`, `src/features/practice/LearningLoopPractice.test.tsx`, `src/features/practice/PronunciationCueCard.test.tsx`, `src/features/practice/InteractionPractice.test.tsx`

### Slice `S3`

Cập nhật schema và runtime: enum `interruption`, `diagnosticMissedItemIds`, cue filtering/honest copy và interaction renderer. Giữ process persistence hiện tại.

Criteria: `AC-2`, `AC-3`, `AC-6`
Checks: `check-adaptive-loop`, `check-full-tests`, `check-lint-build`
Paths: `src/content/schema.ts`, `src/domain/learning/learning_loop.ts`, `src/features/practice/PerceptionPractice.tsx`, `src/features/practice/LearningLoopPractice.tsx`, `src/features/practice/PronunciationCueCard.tsx`, `src/features/practice/InteractionPractice.tsx`

### Slice `S4`

Author synthetic learning loop và four-phase context banks cho architecture walkthrough, ownership interview và technical-decision interview; model audio là local speech synthesis gắn nhãn.

Criteria: `AC-1`, `AC-3`
Checks: `check-spoken-content`, `check-full-tests`, `check-manual-spoken`
Paths: `content/modules/capabilities/architecture-walkthrough-b2.json`, `content/modules/capabilities/behavioral-interview-ownership-b2.json`, `content/modules/capabilities/technical-interview-decision-b2.json`

### Slice `S5`

Migrate Daily Standup sang v3 với sections, performance/independence/output/review contracts, four contexts và complete learning loop; giữ communicative function yesterday–today–blocker.

Criteria: `AC-1`, `AC-4`
Checks: `check-spoken-content`, `check-full-tests`, `check-manual-spoken`
Paths: `content/modules/workplace-communication/daily_standup.json`, `src/content/normalization.test.ts`, `src/content/catalog.test.ts`

### Slice `S6`

Tạo listener/expert protocol với consent, blind labels, observer outcomes, agreement/missing-data/interpretation rules; update owner docs dùng “evidence observed”, không mastery/efficacy claim.

Criteria: `AC-5`, `AC-6`
Checks: `check-protocol-docs`, `check-full-tests`
Paths: `docs/EVALUATION_PROTOCOL.md`, `PRODUCT.md`, `CONTENT.md`, `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`

### Slice `S7`

Chạy focused checks rồi full suite, lint/build; review schema/content privacy, model isolation, compatibility và complexity. Sửa lỗi theo RED–GREEN nếu có.

Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-5`, `AC-6`
Checks: `check-spoken-content`, `check-adaptive-loop`, `check-protocol-docs`, `check-full-tests`, `check-lint-build`
Paths: `content/**/*.json`, `src/**/*`, `docs/EVALUATION_PROTOCOL.md`, `PRODUCT.md`, `CONTENT.md`, `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`

### Slice `S8`

Smoke bốn mission mới ở desktop/mobile, complete ít nhất một journey, kiểm tra model isolation, cue/interaction, console và local-only boundary; ghi rõ synthetic QA không phải efficacy evidence.

Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-6`
Checks: `check-manual-spoken`
Paths: `content/modules/capabilities/*.json`, `content/modules/workplace-communication/daily_standup.json`, `src/features/practice/**/*`