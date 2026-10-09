# Sửa lỗi chính xác nội dung đã phát hiện khi review

- **ID:** 20261009-103711-fix-content-accuracy-errors
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 11:55:16 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 5/5 met or waived |
| Required checks | 100% | 2/2 passed |
| Residual risks | 2 | risk-stress-rule-heuristic: low, risk-model-expansion-unverified: low |

## Goal

Mọi lỗi trọng âm, câu hỏi, ngữ pháp, model response và provenance đã liệt kê được sửa và có test chặn tái diễn.

## Non-goals

- Không thêm mission mới
- Không đổi cấu trúc schema

## Relevant paths

- `CONTENT.md`
- `content`
- `tests/content/contentQuality.test.ts`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Cue trọng âm nhấn đúng từ nội dung, không nhấn hư từ (meeting-disagree-and-recap-b2 dòng 74-77, architecture-walkthrough-b2:84, technical-interview-decision-b2:63,82, technical-tradeoff-explanation-b2:76) và có test kiểm.
- [x] `ac-2` (met): Câu hỏi sai nghĩa hoặc mơ hồ được sửa (daily-standup-b1 stand-pre-3, meeting-disagree-and-recap-b2 meet-train-3); feedback và cue khớp với audio (interview:64, meeting:55, tradeoff:70).
- [x] `ac-3` (met): Lỗi ngữ pháp và cách dùng từ được sửa (rollback/roll back, clarification:30, architecture:35,71, meeting:35); model response lệch được sửa (behavioral-interview-ownership:33, learn-api:77, interview:40, issue-update:91).
- [x] `ac-4` (met): Thời lượng spoken khớp prompt ở tốc độ nói thực tế (130 wpm) hoặc prompt được đổi; test không còn dùng sàn 75 wpm.
- [x] `ac-5` (met): Định nghĩa pronunciation giống nguồn ngoài được tự viết lại; nhãn synthetic artifact nhất quán theo CONTENT.md; ngôn ngữ hướng dẫn nhất quán và prompt tiếng Việt giảm dần từ B2.

## Required checks

- [x] `check-content-fixes` (focused): Test chất lượng nội dung mở rộng cho các lỗi đã sửa — pass (2026-10-09 11:54:09 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-09 11:54:37 +07:00)

## Decisions

- **dec-lengthen-model-not-shorten-target** — Giữ targetSeconds và timeLimitSeconds, kéo dài model response để nằm trong [target*110/60, limit*160/60] từ.
  - _Why:_ Giảm thời lượng làm nới điều kiện transfer đạt; model response ngắn hơn yêu cầu dạy người học nói thiếu thời lượng.
- **dec-synthetic-sourced-note** — Artifact synthetic có sourceIds dùng adaptationNote làm ghi nguồn hiển thị; nhãn Synthetic training artifact chỉ bắt buộc với synthetic độc lập.
  - _Why:_ Đúng câu chữ hiện có trong CONTENT.md; tránh gắn nhãn kép gây nhiễu cho người học.
- **dec-keep-recreate** — Giữ đáp án stand-pre-2 là Recreate the timeout, bỏ yêu cầu khôi phục Reproduce.
  - _Why:_ Cổng keyword-parity không cho phép giữ nguyên văn mà vẫn có distractor hợp lý; audio vẫn nói reproduce nên người học vẫn nghe thuật ngữ.

## Residual risks

- **risk-stress-rule-heuristic** (low) — Test trọng âm dùng danh sách function word cố định và khớp tiền tố; nó bắt hư từ và từ ngoài câu mẫu nhưng không đánh giá được trọng âm contrastive hợp lý. Đại từ như I được cố ý cho phép.
- **risk-model-expansion-unverified** (low) — Các câu mới trong 5 model response (thời lượng) được viết dựa trên dữ kiện của source nhưng chưa được người bản ngữ rà soát; nên review ngôn ngữ tự nhiên trước khi dùng cho người học thật.

## Evidence

- `check-content-fixes` — pass (2026-10-09 11:54:09 +07:00): npx vitest run tests/content/contentQuality.test.ts — exit 0
- `check-suite` — pass (2026-10-09 11:54:37 +07:00): npm test — exit 0
