# Mở rộng schema chương trình để nhận nội dung mới

- **ID:** 20261009-103716-extend-curriculum-schema
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 15:58:13 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 4/4 met or waived |
| Required checks | 100% | 4/4 passed |
| Residual risks | 6 | r-v6-test-churn: low, r-story-label-privacy: low, r-validator-merge: low, r-listening-tts: low, r-renderers-minimal: low, r-no-content-yet: low |

## Goal

Schema, rubric và lịch ôn đủ biểu đạt các loại nội dung của đợt mở rộng và thêm bài mới không cần sửa test.

## Non-goals

- Chưa viết bài học mới (các task sau)
- Không phá progress cũ

## Relevant paths

- `README.md`
- `docs`
- `scripts`
- `src/content`
- `src/domain/progress`
- `src/features/catalog`
- `src/features/lesson`
- `src/features/practice`
- `src/features/today`
- `src/infrastructure/storage`
- `src/shared/hooks`
- `tests`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Schema hỗ trợ CEFR A2; phần ôn từ vựng (vocabulary-review) tham chiếu từ đã học; nguồn nghe nhiều người (listening-source: người nói, giọng, transcript ẩn, gist/detail, ghi chú khi nghe); bài đọc dài (long-reading: mục lục, câu hỏi định vị skim/scan); story bank (năng lực khai báo ở lesson, metadata câu chuyện ở progress, không lưu nội dung); SectionRenderer có nhánh riêng cho mọi loại section.
- [x] `ac-2` (met): contentRevision của lesson và của progress được thêm kèm migration storageVersion 5 lên 6; backup và dữ liệu v3, v4, v5 đều nhập được và giữ nguyên các trường cũ.
- [x] `ac-3` (met): Số bài không còn hard-code trong test; có docs/ADDING_LESSONS.md checklist từng bước; validator trùng lặp được gộp.
- [x] `ac-4` (met): Rubric có dimension (task, accuracy, range, register) và mẫu neo đạt/chưa đạt, lesson A2 bắt buộc có tiêu chí ngôn ngữ kèm anchors; reviewPolicy hỗ trợ khoảng ôn đến 45 ngày (cận trên 180) và interleave; Today xen kẽ review theo capability khi lesson bật interleave.

## Required checks

- [x] `check-schema-extension` (focused): Schema mở rộng: A2, section mới, rubric, reviewPolicy, interleaving, render — pass (2026-10-09 15:57:01 +07:00)
- [x] `check-migration-revision` (focused): Migration v6, contentRevision, story bank, backup — pass (2026-10-09 15:57:12 +07:00)
- [x] `check-catalog-counts` (focused): Không hard-code số bài, validator gộp, tài liệu thêm bài — pass (2026-10-09 15:57:16 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-09 15:58:06 +07:00)

## Decisions

- **d-additive-lesson-fields** — Mọi trường mới của lesson là tùy chọn hoặc có mặc định; 12 mission và 6 bài pronunciation hiện có không đổi.
  - _Why:_ Không làm vỡ nội dung và test hiện có; chỉ A2 bị ràng buộc rubric ngôn ngữ.
- **d-minimal-renderers** — Ba loại section mới có bộ render tối thiểu trong task này; giao diện phong phú để task 11 và 12.
  - _Why:_ Nhánh cuối của SectionRenderer giả định language-support nên section lạ sẽ làm vỡ trang.
- **d-storage-v6** — Nâng storageVersion lên 6: contentRevision bắt buộc ở lesson progress và storyBank ở envelope; migration từ v3, v4, v5.
  - _Why:_ Tiêu chí ac-2 yêu cầu migration; các thay đổi trước dùng trường tùy chọn không bump.
- **d-story-bank-metadata** — Story bank trong progress chỉ lưu nhãn ngắn (≤ 60 ký tự), năng lực và thời điểm; không lưu nội dung câu chuyện.
  - _Why:_ Giữ chính sách privacy: không lưu free-text dài; nhãn được xem là metadata.
- **d-interleave-optin** — interleave là tùy chọn, mặc định tắt; chỉ lesson bật mới được xen kẽ trong hàng ôn.
  - _Why:_ Không đổi thứ tự Today hiện có.

## Residual risks

- **r-v6-test-churn** (low) — Nâng storageVersion lên 6 chạm nhiều test kiểm 5 và tài liệu kiến trúc; sửa cùng slice.
- **r-story-label-privacy** (low) — Nhãn câu chuyện do người học đặt có thể chứa thông tin nhạy cảm và nằm trong backup; giới hạn 60 ký tự và ghi rõ trong tài liệu.
- **r-validator-merge** (low) — Gộp validateAllLessons.test.ts có thể làm mất khẳng định chỉ nằm ở đó; rà từng khẳng định trước khi xóa.
- **r-listening-tts** (low) — listening-source dựa vào TTS thiết bị; locale và voiceHints theo người nói chỉ là yêu cầu, giọng thực tế khác nhau giữa máy.
- **r-renderers-minimal** (low) — Ba section mới chỉ có bộ render tối thiểu (đủ dùng, kiểm thử bằng test); giao diện nghe và đọc dài phong phú, tiến độ trong Progress và editor story bank để task 11 và 12.
- **r-no-content-yet** (low) — Chưa có bài nào dùng A2, listening-source, long-reading, vocabulary-review hay storyBank; các test mới dùng fixture tổng hợp nên chất lượng nội dung thật chỉ được kiểm ở task 10 đến 13.

## Evidence

- `check-schema-extension` — pass (2026-10-09 15:57:01 +07:00): npx vitest run tests/content/schema.test.ts tests/content/schemaExtensions.test.ts tests/domain tests/features/lesson tests/features/practice tests/features/catalog tests/features/today — exit 0
- `check-migration-revision` — pass (2026-10-09 15:57:12 +07:00): npx vitest run tests/infrastructure/storage tests/shared tests/domain/progress tests/features/settings tests/app — exit 0
- `check-catalog-counts` — pass (2026-10-09 15:57:16 +07:00): npx vitest run tests/content — exit 0
- `check-suite` — pass (2026-10-09 15:58:06 +07:00): npm test — exit 0
