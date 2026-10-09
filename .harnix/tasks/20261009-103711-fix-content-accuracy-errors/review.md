# Sửa lỗi chính xác nội dung đã phát hiện khi review

- **ID:** 20261009-103711-fix-content-accuracy-errors
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** planning/planning
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 10:48:14 +07:00

**Verdict:** PENDING — 0/5 acceptance criteria met

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 0% | 0/5 met or waived |
| Required checks | 0% | 0/2 passed |

## Goal

Mọi lỗi trọng âm, câu hỏi, ngữ pháp, model response và provenance đã liệt kê được sửa và có test chặn tái diễn.

## Non-goals

- Không thêm mission mới
- Không đổi cấu trúc schema

## Relevant paths

- `content`
- `src/content/content_quality.test.ts`
- `CONTENT.md`

## Acceptance criteria

- [ ] `ac-1` (pending): Cue trọng âm nhấn đúng từ nội dung, không nhấn hư từ (meeting-disagree-and-recap-b2 dòng 74-77, architecture-walkthrough-b2:84, technical-interview-decision-b2:63,82, technical-tradeoff-explanation-b2:76) và có test kiểm.
- [ ] `ac-2` (pending): Câu hỏi sai nghĩa hoặc mơ hồ được sửa (daily-standup-b1 stand-pre-3, meeting-disagree-and-recap-b2 meet-train-3); feedback và cue khớp với audio (interview:64, meeting:55, tradeoff:70).
- [ ] `ac-3` (pending): Lỗi ngữ pháp và cách dùng từ được sửa (rollback/roll back, clarification:30, architecture:35,71, meeting:35); model response lệch được sửa (behavioral-interview-ownership:33, learn-api:77, interview:40, issue-update:91).
- [ ] `ac-4` (pending): Thời lượng spoken khớp prompt ở tốc độ nói thực tế (130 wpm) hoặc prompt được đổi; test không còn dùng sàn 75 wpm.
- [ ] `ac-5` (pending): Định nghĩa pronunciation giống nguồn ngoài được tự viết lại; nhãn synthetic artifact nhất quán theo CONTENT.md; ngôn ngữ hướng dẫn nhất quán và prompt tiếng Việt giảm dần từ B2.

## Required checks

- [ ] `check-content-fixes` (focused): Test chất lượng nội dung mở rộng cho các lỗi đã sửa — chưa chạy / not yet run
- [ ] `check-suite` (full): Toàn bộ test của dự án (suite) — chưa chạy / not yet run

## Evidence

_None recorded yet._
