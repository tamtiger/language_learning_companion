# Thêm luyện nghe hội thoại và bài đọc dài

- **ID:** 20261009-103719-add-listening-and-long-reading
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-12 08:31:03 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 4/4 met or waived |
| Required checks | 100% | 3/3 passed |

## Goal

Mục tiêu 2, 3 và 6 có luyện nghe thật và đọc tài liệu đủ dài.

## Non-goals

- Không ghi âm hay thu thập giọng người thật
- Không chép nguyên văn nguồn không có giấy phép

## Relevant paths

- `content`
- `src/content`
- `src/features/progress`
- `src/features/practice`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Ít nhất 6 bài nghe hội thoại 1-3 phút nhiều giọng (standup, planning/estimation, retro, incident call, design review, tech talk) có transcript ẩn, gist/detail và ghi chú khi nghe.
- [x] `ac-2` (met): Ít nhất 6 bài đọc dài 400-1.500 từ (RFC, API reference, changelog, stack trace/log, GitHub issue, tutorial) có skim/scan và câu hỏi định vị; không trùng kịch bản.
- [x] `ac-3` (met): Mỗi nguồn có provenance và license rõ; dùng reference-only khi không được chép.
- [x] `ac-4` (met): Tiến độ nghe và đọc dài hiển thị trong Progress.

## Required checks

- [x] `check-listening-reading-content` (focused): Nội dung nghe, đọc dài và provenance — pass (2026-10-12 08:29:28 +07:00)
- [x] `check-progress-listening` (focused): Progress hiển thị nghe và đọc dài — pass (2026-10-12 08:29:33 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-12 08:30:26 +07:00)

## Evidence

- `check-listening-reading-content` — pass (2026-10-12 08:29:28 +07:00): npx vitest run tests/content/listeningReading.test.ts — exit 0 _(1 earlier rerun not shown; see task.json for full history)_
- `check-progress-listening` — pass (2026-10-12 08:29:33 +07:00): npx vitest run tests/features/progress — exit 0 _(1 earlier rerun not shown; see task.json for full history)_
- `check-suite` — pass (2026-10-12 08:30:26 +07:00): npm test — exit 0
