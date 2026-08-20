# PRD — Capability learning loop P0

## Outcome

Người học Software Engineer Việt Nam A2–B2 có thể đi từ nghe/nhận biết tới tự phản hồi một tình huống công việc mới trong 8–12 phút: nghe mẫu có biến thiên, nhận cue phát âm vừa đủ, guided shadowing, delayed imitation, tự nói và nghe lại, xử lý follow-up/repair, retry có variation, transfer không model và review trễ.

## Vì sao không triển khai mọi thứ một lần

“Đầy đủ” được hiểu là đầy đủ dependency và roadmap, không bulk rollout trước evidence. Milestone A/P0 tạo contract và hai vertical slices. Milestone B/P1 mở rộng các mission chỉ khi usability/transfer gate đạt. Milestone C/P2 thêm reading/listening breadth và human-calibrated efficacy work. Cách chia này giữ rollback khả thi và tránh nhân content cost trước khi loop được chứng minh usable.

## In scope P0

- Fix baseline source của `technical-doc-action-b1` và stale `SpokenResponse` state.
- Thêm `LearningLoopV1` optional cho spoken v3 tasks; v1/v2 và v3 không khai báo loop giữ nguyên behavior.
- Local model-audio provider, perception practice, pronunciation micro-cue, guided shadowing, delayed imitation, functional chunks, record/listen-back checklist và scripted interaction/repair.
- Tích hợp retry, unseen transfer, D2/D7 review và process evidence trung thực.
- Migrate storage V3→V4 mà không lưu learner output.
- Hai pilot missions: meeting disagree/recap và technical trade-off explanation.
- Owner docs, tests và desktop/mobile black-box QA.

## Ngoài phạm vi P0

- Full IPA syllabus, shadowing-only curriculum, ASR/AI/native-accent score.
- Human listener rating bên trong app hoặc efficacy claim.
- Rollout sang toàn catalog, extensive reading ladder, remote audio/analytics/account.
- Bundled copyrighted audio. P0 content dùng synthetic text + local provider contract; bundled assets sau này phải có provenance.

## Learner journey

1. Cold baseline không model/chunk/transcript đáp án.
2. Perception pretest: item mới, không feedback.
3. Training: nghe nhiều voice/context khả dụng, trả lời và nhận feedback ngay.
4. Posttest: item tương đương nhưng không lặp.
5. Chỉ khi sai pattern, hiện tối đa hai IPA/articulatory/meaning-risk cues.
6. Guided shadowing: listen → chunk-shadow → full-shadow → delayed imitation; transcript/stress marks fade theo step.
7. Variation: thay slot của functional chunk bằng facts của scenario.
8. Record → playback/listen-back → checklist; microphone unavailable dùng timer-only nhưng không ghi nhận listen-back.
9. Scripted follow-up/clarification/misunderstanding; learner repair/recap không model.
10. Focused retry với facts/context khác.
11. Unseen transfer không chunk bank/model.
12. D2/D7 review bằng cue/context mới trước khi được xem support.

## Content contracts

`LearningLoopV1Schema` là optional field `learningLoop` chỉ trên `SpokenPerformanceTaskSchema`:

- `version: 'v1'`.
- `perception`: `pretest`, `training`, `posttest`; mỗi phase có stable item IDs; training có feedback, tests không lộ feedback trước answer.
- `pronunciationCues`: tối đa 2 targets, mỗi cue có `id`, optional `ipa`, `articulatoryCue`, `meaningRisk`, `triggerItemIds`.
- `chunks`: 4–6 items theo communicative function, gồm `id`, `text`, `meaning`, `slots`, optional `stressPattern`, `modelAudio`.
- `shadowingSteps`: exact enum `listen | chunk-shadow | full-shadow | delayed-imitation | variation`.
- `listenBackChecklist`: 2–4 listener-oriented items; không được dùng native-likeness wording.
- `interactionTurns`: 1–3 scripted turns, enum `follow-up | clarification | misunderstanding | repair | recap`; mỗi turn có prompt/audio và expected communicative function, không chứa automatic correctness claim.
- Existing `practiceContexts` tiếp tục sở hữu job artifacts; contract được mở rộng với `retry` optional. Hai pilot bắt buộc có `baseline`, `retry`, `transfer`, `review` với distinct titles/artifact IDs/facts; mission cũ không có `retry` giữ behavior hiện tại.

`ModelAudioSourceSchema`:

- `bundled`: relative `/audio/...` only, transcript, speakerId, provenance; reject protocol-relative, `http:`, `https:`, `data:` và path traversal.
- `speech-synthesis`: text, BCP-47 locale, ordered voice hints; badge “TTS thử nghiệm”. App không gọi fetch, không tuyên bố human/high variability.
- Runtime trả `availableVariantCount` và `variabilityQualified = count >= 3`; UI không giả vờ đủ voice khi thiếu.

## Runtime boundaries

- Tách pure `LearningLoopState` khỏi React; legal transitions được kiểm tra theo phase.
- Component mới dự kiến: `ModelAudioPlayer`, `PerceptionPractice`, `PronunciationCueCard`, `GuidedShadowing`, `InteractionPractice`.
- `SpokenResponse` nhận `attemptKey` hoặc được key theo `lessonId:phase:turnId`; đổi key phải dispose recorder/object URL và reset về idle.
- Không phân tích waveform/phoneme, không transcript, không network scoring.
- Audio-only step có caption/transcript sau khi answer và một opt-out accessible; opt-out không được tính perception pass.

## Progress/storage V4

`AttemptEvidence.process` chỉ chứa:

- pre/post correct + total, training completed count;
- `availableVariantCount`, `variabilityQualified`;
- completed shadowing-step IDs;
- `listenedBack` boolean;
- `cueToSpeechStartMs | null`;
- completed interaction-turn IDs;
- support/opt-out flags.

Không chứa response text, transcript, prompt copy, audio URL/blob, device/voice fingerprint hoặc pronunciation score. V3 migration thêm process defaults và giữ attempts/progress/settings; backup import chấp nhận V3/V4 rồi normalize sang V4. Unknown/newer version fail closed với message phục hồi rõ.

## Feature gate và rollback

- `LearningLoopV1` chỉ render khi content khai báo; xóa field hoặc tắt static local flag quay về v3 flow.
- Không xóa/mutate progress V3 trước khi migration parse thành công.
- Pilot không rollout nếu content/runtime thiếu required accessibility/privacy behavior.
- P1 chỉ mở khi 3–5 learner usability test đạt ≥75% completion không trợ giúp, median ≤12 phút và không có state/privacy defect; learning outcome thresholds cần listener pilot riêng.

## Roadmap đầy đủ

### Milestone A — P0, active task

Hai loop foundation, shadowing có mục tiêu, interaction repair, process evidence, two-mission pilot và prerequisite fixes.

### Milestone B — P1, follow-up sau gate

- Mở rộng `practiceContexts`/LearningLoopV1 sang workplace clarification, architecture/trade-off, interview và các mission còn lại theo giá trị.
- Thêm 2–3 scripted turns: ask-back, interruption, misunderstanding, repair, recap.
- Cá nhân hóa cue từ diagnostic history local, không stereotype theo L1.
- Calibrate rubric qua listener/expert protocol; thử spacing theo task.
- Thay TTS bằng bundled multi-speaker assets có provenance khi có nguồn hợp lệ.

### Milestone C — P2, task riêng

- Extensive technical-reading ladder: read once → extract constraints/actions → explain/apply → delayed unseen source.
- International accent/speed listening set có licensed provenance.
- Human-calibrated study lớn hơn; chỉ nghiên cứu on-device ASR khi privacy/validity/browser support đổi đáng kể.

## Acceptance criteria

### AC `AC-1`

Schema hỗ trợ LearningLoopV1 optional chỉ cho spoken v3 tasks, gồm perception pretest/training/posttest, pronunciation cues, functional chunks, guided shadowing/delayed imitation, listen-back checklist và scripted interaction turns; validation từ chối duplicate IDs, external audio URLs và contract thiếu phase.

### AC `AC-2`

Hai pilot missions chạy đúng learner journey: cold baseline → perception → just-in-time cue → guided shadowing/delayed imitation → production/listen-back → follow-up/repair → focused retry → unseen transfer → delayed review, với model/chunks bị khóa trước cold/transfer/review.

### AC `AC-3`

Audio model dùng provider local-first có bundled-relative source và speech-synthesis fallback được gắn nhãn; UI hỗ trợ play/replay, transcript/caption phù hợp phase, keyboard/screen reader và graceful opt-out khi audio hoặc microphone không khả dụng, không giả vờ đủ speaker variability.

### AC `AC-4`

Learner audio/text chỉ tồn tại trong phiên, được release khi reset/unmount/đổi phase; SpokenResponse không hiển thị stale attempt, listen-back được ghi nhận trung thực và app không persist hoặc gửi response/transcript/raw audio ra network.

### AC `AC-5`

ProgressEnvelopeV4 chỉ persist process metadata tối thiểu (perception counts, listen-back, cue latency, interaction/shadowing completion và qualification flags), migrate V3 an toàn, giữ backup/import/reset và không chứa response text, transcript, audio URL/blob hoặc pronunciation score.

### AC `AC-6`

meeting-disagree-and-recap-b2 và technical-tradeoff-explanation-b2 có synthetic P0 content: 4–6 functional chunks, tối đa 2 pronunciation targets, pre/training/post items, guided shadowing, repair turns và ba context variants; content validation và cold-model isolation pass.

### AC `AC-7`

Hai defect prerequisite được sửa bằng regression tests: technical-doc-action baseline có source hợp lệ trước yêu cầu read-from-memory và spoken capture reset sạch khi retry chuyển sang transfer/review.

### AC `AC-8`

Owner docs mô tả feature, privacy, fallback, measured-vs-unmeasured evidence và P0→P1→P2 rollout gate; focused/full tests, lint, production build và desktop/mobile black-box QA pass mà không có app-origin error.