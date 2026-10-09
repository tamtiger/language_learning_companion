# Mở rộng schema chương trình để nhận nội dung mới

- **ID:** 20261009-103716-extend-curriculum-schema
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** planning/planning
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 11:37:07 +07:00

**Verdict:** PENDING — 0/4 acceptance criteria met

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 0% | 0/4 met or waived |
| Required checks | 0% | 0/4 passed |

## Goal

Schema, rubric và lịch ôn đủ biểu đạt các loại nội dung của đợt mở rộng và thêm bài mới không cần sửa test.

## Non-goals

- Chưa viết bài học mới (các task sau)
- Không phá progress cũ

## Relevant paths

- `src/content/schema.ts`
- `src/content`
- `docs`
- `CONTENT.md`
- `src/infrastructure/storage`

## Acceptance criteria

- [ ] `ac-1` (pending): Schema hỗ trợ CEFR A2, vocabulary có collocation và ôn lại, nguồn nghe hội thoại nhiều người (transcript, giọng, gist/detail), bài đọc dài có mục lục và câu hỏi định vị, story bank của người học (chỉ metadata).
- [ ] `ac-2` (pending): contentRevision được thêm kèm migration không phá progress cũ.
- [ ] `ac-3` (pending): Số bài không còn hard-code trong test; có docs/ADDING_LESSONS.md checklist từng bước; validator trùng lặp được gộp.
- [ ] `ac-4` (pending): Rubric có tiêu chí ngôn ngữ (accuracy, range, register) và mẫu neo đạt/chưa đạt; reviewPolicy hỗ trợ khoảng ôn dài đến 21/45 ngày và interleaving.

## Required checks

- [ ] `check-schema-extension` (focused): Schema mới và rubric ngôn ngữ — chưa chạy / not yet run
- [ ] `check-migration-revision` (focused): Migration contentRevision — chưa chạy / not yet run
- [ ] `check-catalog-counts` (focused): Catalog không hard-code số bài — chưa chạy / not yet run
- [ ] `check-suite` (full): Toàn bộ test của dự án (suite) — chưa chạy / not yet run

## Evidence

_None recorded yet._
