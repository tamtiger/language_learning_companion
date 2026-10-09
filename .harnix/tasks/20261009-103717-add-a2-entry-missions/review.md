# Thêm mission A2 làm lối vào cho người mới

- **ID:** 20261009-103717-add-a2-entry-missions
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 17:06:25 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 3/3 met or waived |
| Required checks | 100% | 3/3 passed |
| Residual risks | 3 | r-no-native-review: low, r-answer-length-corpus: low, r-future-facts-heuristic: low |

## Goal

Người học A2 có đường vào từng capability và đường lên B1.

## Non-goals

- Không viết mission B1/B2 (task khác)

## Relevant paths

- `README.md`
- `content/missions`
- `docs`
- `src/content`
- `src/domain/progress`
- `src/features/catalog`
- `src/features/today`
- `tests`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Mỗi capability có đúng một mission A2 theo bảng trong PRD (sáu mission); chunk đơn giản (tối đa 8 từ), câu model response ngắn, đầu ra 20-40 giây (nói) hoặc 40-60 từ (viết), prompt song ngữ giảm dần và vòng ôn chỉ còn tiếng Anh.
- [x] `ac-2` (met): Mỗi mission A2 qua schema và mọi cổng chất lượng: perception đúng ba lựa chọn, mọi nguồn có khai báo synthetic hoặc provenance, rubric có tiêu chí ngôn ngữ kèm anchors, trọng âm và cue phát âm hợp lệ (cổng suy ra từ catalog), không lộ dữ kiện phase sau vào learning loop.
- [x] `ac-3` (met): Today xếp bài theo level trong cùng capability và không đề xuất A2 cho người đã bắt đầu hoặc hoàn thành bài cao hơn của capability đó; Catalog gắn nhãn A2, hiện 'Tiếp theo' (đường lên B1) và có lối 'Bắt đầu với A2' cho người mới.

## Required checks

- [x] `check-a2-content` (focused): Sáu mission A2 qua cổng A2 và mọi cổng nội dung — pass (2026-10-09 17:05:00 +07:00)
- [x] `check-a2-path` (focused): Lộ trình A2 đến B1 trong Today và Catalog — pass (2026-10-09 17:05:07 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-09 17:05:57 +07:00)

## Decisions

- **d-synthetic-disclosure** — Nguồn của mission A2 là synthetic có khai báo 'Synthetic training artifact — non-production.', không dùng sourceRegistry.
  - _Why:_ Không bịa vị trí trích dẫn ngoài mà không kiểm chứng được; tình huống đều là mô phỏng.
- **d-derived-gates** — SPOKEN_LESSONS và quy tắc dữ kiện phase sau được suy ra từ catalog thay vì viết cứng theo bài.
  - _Why:_ Cổng cứng không chạm mission nói mới, nên A2 sẽ không qua cổng trọng âm và cue.
- **d-spoken-min-duration** — Spoken targetSeconds tối thiểu 15 và timeLimitSeconds tối thiểu 20 (trước 30).
  - _Why:_ Mục tiêu A2 là 20 đến 40 giây; mission cũ không đổi.
- **d-level-order-today** — Today sắp theo level tăng dần trong capability và bỏ A2 mới khi đã có tiến độ ở bài cao hơn cùng capability.
  - _Why:_ Người mới thấy A2 trước, người đã học cao hơn không bị kéo xuống; review và resume không bị lọc.

## Residual risks

- **r-no-native-review** (low) — Nội dung A2 viết tay chưa có người bản ngữ hoặc giáo viên rà soát; mức vừa sức thật chỉ kiểm được với người học.
- **r-answer-length-corpus** (low) — Thêm nhiều mục lựa chọn có thể làm tỷ lệ đáp án đúng là phương án dài nhất toàn kho vượt 45%; cần cân bằng phương án nhiễu.
- **r-future-facts-heuristic** (low) — Quy tắc từ đặc trưng của phase sau là heuristic, có thể báo nhầm với từ phổ biến.

## Evidence

- `check-a2-content` — pass (2026-10-09 17:05:00 +07:00): npx vitest run tests/content — exit 0
- `check-a2-path` — pass (2026-10-09 17:05:07 +07:00): npx vitest run tests/features/catalog tests/features/today tests/domain/progress — exit 0
- `check-suite` — pass (2026-10-09 17:05:57 +07:00): npm test — exit 0
