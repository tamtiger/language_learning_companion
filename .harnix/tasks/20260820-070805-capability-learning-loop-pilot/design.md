# Design — Capability learning loop P0

## Component/data flow

```text
content JSON
  └─ LearningLoopV1Schema ──> Canonical spoken task
                                  │
                           LearningLoopState
                     ┌────────────┼────────────┐
             ModelAudioPlayer  Practice UI  Evidence builder
                 │              │                  │
       bundled/TTS adapter   Perception            └─ process metadata only
                             GuidedShadowing                 │
                             SpokenResponse             ProgressEnvelopeV4
                             InteractionPractice              │
                                                    localStorage/backup only
```

## State sequence

```text
baseline
  → input/perception-pretest
  → perception-training
  → perception-posttest
  → pronunciation-cue
  → guided-shadowing
  → performance
  → listen-back
  → interaction
  → self-feedback
  → retry
  → transfer
  → completed
  → review (D2/D7 when due)
```

Baseline, transfer và review không được đi ngược sang model/chunk bank trước attempt. Reload chỉ resume durable coarse phase; response/audio và in-step draft luôn mất. Nếu reload giữa perception/shadowing, restart current learning-loop block và không fabricate completion.

## Ownership

- `src/content/schema.ts`: shape/validation, không chứa runtime policy; `practiceContexts.retry` là optional để giữ compatibility, nhưng required bởi content tests của hai pilot.
- `src/domain/learning/learning_loop.ts`: pure state, legal transitions, derived availability/qualification.
- `src/features/practice/*`: accessible rendering, ephemeral audio/session ownership.
- `src/domain/progress/progress.ts`: process evidence and review scheduling, không giữ output.
- `src/infrastructure/storage/progress_storage.ts`: V3/V4 parsing, migration, backup boundary.
- content JSON: synthetic prompts/chunks/feedback; không branch theo lesson ID trong renderer.

## Error/fallback contract

| Failure | Behavior | Evidence |
|---|---|---|
| Không có TTS voice | hiện transcript/opt-out, `variabilityQualified=false` | không tính perception pass |
| Microphone denied | timer-only vẫn cho task; `listenedBack=false` | không claim production quality |
| Audio play reject | retry button + caption sau answer | record failure metadata only trong session |
| Reload giữa attempt | dispose output, restart block | durable coarse phase only |
| V3 migration invalid | giữ raw value, fail closed + recovery UI | không overwrite storage |
| Bundled path external/unsafe | content parse fail | build/content test fail |

## Accessibility

- Native buttons, visible focus, `aria-live` chỉ cho status ngắn.
- Không auto-play; respect reduced motion; keyboard operation đủ.
- Pretest transcript ẩn để giữ construct nhưng có accessible opt-out; sau answer transcript/caption mở.
- Không dùng màu làm tín hiệu duy nhất; feedback có text.

## Measurement semantics

App đo process: correct count, completion, latency, listen-back action, independent transfer metadata. App không đo intelligibility, comprehensibility, pronunciation correctness hay efficacy. Các outcome đó cần listener/learner study bên ngoài synthetic QA.