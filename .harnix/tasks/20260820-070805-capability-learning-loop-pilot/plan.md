# Plan — Capability learning loop P0

## Implementation checklist

- [x] `S1` — Regression fixes cho technical-reading baseline và phase-safe spoken capture.
- [x] `S2` — LearningLoopV1/audio content contracts và validation.
- [x] `S3` — Pure learning-loop state, process evidence và ProgressEnvelopeV4 migration.
- [x] `S4` — Local model audio + perception pre/training/post UI.
- [x] `S5` — Pronunciation cue + guided shadowing/delayed imitation + listen-back.
- [x] `S6` — Scripted interaction/repair, retry, transfer và delayed-review integration.
- [x] `S7` — Hai synthetic pilot missions và isolation/variation tests.
- [x] `S8` — Owner docs, full verification và desktop/mobile rollout gate.

Mỗi behavioral slice dùng RED → GREEN → REFACTOR. Không thêm dependency. Giữ nguyên v1/v2 và v3 task không có `learningLoop`.

### Slice `S1`

RED tests tái hiện source bị ẩn ở `technical-doc-action-b1` baseline và stale timer/audio khi phase đổi. GREEN bằng phase-specific `attemptKey`/remount-dispose contract và baseline `practiceContexts` phù hợp; không branch renderer theo lesson ID.

Criteria: `AC-4`, `AC-7`
Checks: `check-learning-loop`, `check-full-tests`
Paths: `content/modules/capabilities/technical-doc-action-b1.json`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/CapabilityTask.test.tsx`, `src/features/practice/SpokenResponse.tsx`, `src/features/practice/SpokenResponse.test.tsx`

### Slice `S2`

RED schema/content fixtures cho missing phases, duplicate IDs, >2 cues, unsafe/external audio paths, written-task loop và incomplete interaction contracts. GREEN thêm `LearningLoopV1Schema`/`ModelAudioSourceSchema` optional trên spoken v3 only và generic inferred types.

Criteria: `AC-1`, `AC-6`
Checks: `check-schema-content`
Paths: `src/content/schema.ts`, `src/content/schema.test.ts`, `src/content/content.test.ts`

### Slice `S3`

RED pure state/progress/storage tests cho legal order, reload semantics, qualification flags, privacy deny-list, V3→V4 migration, invalid/newer backup và bounded metadata. GREEN thêm `learning_loop.ts`, `AttemptProcessEvidence`, V4 parser/migrator và store wiring.

Criteria: `AC-2`, `AC-4`, `AC-5`
Checks: `check-learning-loop`, `check-progress-storage`
Paths: `src/domain/learning/learning_loop.ts`, `src/domain/learning/learning_loop.test.ts`, `src/domain/progress/progress.ts`, `src/domain/progress/progress.test.ts`, `src/infrastructure/storage/progress_storage.ts`, `src/infrastructure/storage/progress_storage.test.ts`, `src/shared/hooks/use_app_store.ts`, `src/shared/hooks/use_app_store.test.ts`

### Slice `S4`

RED component tests cho no-autoplay, play/replay, pretest feedback lock, training immediate feedback, posttest unseen IDs, voice availability, TTS label, caption/opt-out và keyboard flow. GREEN thêm provider adapter, `ModelAudioPlayer` và `PerceptionPractice`; không fetch hoặc persist transcript.

Criteria: `AC-2`, `AC-3`, `AC-4`
Checks: `check-learning-loop`
Paths: `src/features/practice/model_audio.ts`, `src/features/practice/model_audio.test.ts`, `src/features/practice/ModelAudioPlayer.tsx`, `src/features/practice/PerceptionPractice.tsx`, `src/features/practice/PerceptionPractice.test.tsx`

### Slice `S5`

RED tests cho cue chỉ xuất hiện sau pattern error, tối đa hai cues, transcript/stress fading, exact shadowing steps, variation slots, record/playback, required listen-back khi audio tồn tại và honest timer-only fallback. GREEN thêm `PronunciationCueCard`, `GuidedShadowing` và process evidence hooks.

Criteria: `AC-2`, `AC-3`, `AC-4`
Checks: `check-learning-loop`
Paths: `src/features/practice/PronunciationCueCard.tsx`, `src/features/practice/GuidedShadowing.tsx`, `src/features/practice/GuidedShadowing.test.tsx`, `src/features/practice/SpokenResponse.tsx`

### Slice `S6`

RED tests cho deterministic scripted follow-up/clarification/misunderstanding, multiple ephemeral attempts, repair before self-feedback, focus-specific retry with changed facts, model lock trong transfer/review và D2/D7 queue. GREEN thêm `InteractionPractice` và integrate generic `CapabilityTask` state without lesson-ID branches.

Criteria: `AC-2`, `AC-4`
Checks: `check-learning-loop`, `check-progress-storage`
Paths: `src/features/practice/InteractionPractice.tsx`, `src/features/practice/InteractionPractice.test.tsx`, `src/features/practice/CapabilityTask.tsx`, `src/features/practice/CapabilityTask.test.tsx`, `src/domain/progress/progress.ts`

### Slice `S7`

RED content/matrix tests yêu cầu đủ 4–6 chunks, ≤2 targets, non-overlapping pre/post IDs, feedback only in training, repair turns và distinct baseline/retry/transfer/review contexts. GREEN rewrite đúng hai pilot JSON bằng synthetic workplace data; TTS fallback được gắn nhãn và `variabilityQualified` phụ thuộc runtime voices.

Criteria: `AC-1`, `AC-2`, `AC-6`
Checks: `check-schema-content`, `check-full-tests`
Paths: `content/modules/capabilities/meeting-disagree-and-recap-b2.json`, `content/modules/capabilities/technical-tradeoff-explanation-b2.json`, `src/content/content.test.ts`, `src/features/lesson/MissionMatrix.test.tsx`

### Slice `S8`

Update owner docs/changelog, chạy focused → full tests → lint/build. Black-box desktop/mobile hoàn thành hai pilot và fallback paths, inspect network/localStorage/console, rồi ghi rõ learner/listener study chưa thực hiện. Không rollout P1 trong task này.

Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-5`, `AC-6`, `AC-7`, `AC-8`
Checks: `check-schema-content`, `check-learning-loop`, `check-progress-storage`, `check-full-tests`, `check-lint-build`, `check-owner-docs`, `check-manual-pilot`
Paths: `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `README.md`, `START_HERE.md`, `CHANGELOG.md`, `content/**/*.json`, `src/**/*`

## Follow-up task gates

- P1 task chỉ tạo sau usability gate và không tự suy diễn efficacy.
- P2 reading/listening task có research/asset provenance riêng.
- Human listener pilot là external/manual study cần user authorization và participant coordination; không nằm trong implementation task.