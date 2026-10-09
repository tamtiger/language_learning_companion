# Dọn nợ kỹ thuật, đồng bộ tài liệu và quy trình release

- **ID:** 20261009-103713-clean-repo-hygiene-and-docs
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 14:04:17 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 8/8 met or waived |
| Required checks | 100% | 5/5 passed |
| Residual risks | 5 | r-moved-doc-paths: low, r-lazy-tests: low, r-bundle-content: low, r-eager-content: low, r-no-render-count-test: low |

## Goal

Repo gọn, tài liệu khớp code, quy trình release chạy được và bundle không còn cảnh báo kích thước.

## Non-goals

- Không đổi hành vi người dùng
- Không xóa dữ liệu .harnix

## Relevant paths

- `CHANGELOG.md`
- `README.md`
- `docs`
- `package.json`
- `scripts`
- `src/app`
- `src/content`
- `src/domain`
- `src/features`
- `src/infrastructure/storage`
- `src/shared`
- `tests`
- `vite.config.ts`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Quy tắc release/changelog nằm trong docs/RELEASE.md, check-changelog-rule hết gãy, check-release đọc version từ package.json, cả hai có npm script và test.
- [x] `ac-2` (met): Tài liệu khớp code: số mission nhất quán (12) ở README, CONTENT và ARCHITECTURE; CHANGELOG có mục [Unreleased] ở đầu lịch sử (mục cũ không bị sửa); PRODUCT không nhắc streak (app không có); test khóa các điều này.
- [x] `ac-3` (met): Dead code đã xóa: facade src/types/progress.ts, actions setTheme/setCefrLevel, canCompleteCapabilityMission, isQualifyingTransfer/isRubricFullyMet/isIndependentAttempt; id capability có một nguồn duy nhất (CAPABILITY_IDS trong schema.ts) cho schema, storage, catalog, Today và domain; định dạng lưu trữ không đổi.
- [x] `ac-4` (met): App, CatalogPage, ProgressPage, Settings và TodayPage dùng selector thay vì subscribe cả store; không có useAppStore() không đối số trong src/features và src/app; test khóa. Việc tách CapabilityTask.tsx thuộc task refactor-practice-feature-structure.
- [x] `ac-5` (met): Bundle tách chunk (lazy-load phần thân lesson, progress, settings và tách vendor); scripts/check-bundle-size.mjs xác nhận mọi chunk JS dưới 500 kB sau npm run build và có test.
- [x] `ac-6` (met): Toàn bộ tài liệu dự án nằm trong docs/ (ARCHITECTURE, CONTENT, PRODUCT, START_HERE chuyển vào docs/); chỉ README.md, CHANGELOG.md và AGENTS.md ở root vì công cụ yêu cầu; mọi link nội bộ không gãy.
- [x] `ac-7` (met): Bốn prompt một lần đã hoàn tất bị xóa (IMPROVEMENT_PROMPT, UX_RESEARCH_REFACTOR_PROMPT, LEARNING_FEATURE_RESEARCH_PROMPT, CURRICULUM_RESEARCH_PROMPT); LEARNER_AUDIT_PROMPT chuyển vào docs/prompts/; không còn liên kết tới prompt đã xóa trong tài liệu đang dùng.
- [x] `ac-8` (met): Mọi tham chiếu tới script kiểm tra changelog dùng tên scripts/check-changelog-rule.mjs (việc đổi tên làm ở task thống nhất quy ước file) và script nằm trong npm scripts.

## Required checks

- [x] `check-release-scripts` (focused): Script release/changelog đọc docs/RELEASE.md và package.json — pass (2026-10-09 14:03:14 +07:00)
- [x] `check-refactor` (focused): Dead code, nguồn capability duy nhất, selector — pass (2026-10-09 14:03:32 +07:00)
- [x] `check-bundle` (focused): Build và kích thước chunk — pass (2026-10-09 14:03:37 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-09 14:04:09 +07:00)
- [x] `check-docs-layout` (focused): Bố cục docs, link nội bộ, nội dung tài liệu — pass (2026-10-09 14:03:37 +07:00)

## Decisions

- **dec-docs-in-docs** — Tài liệu dự án đặt trong docs/; root chỉ giữ README.md, CHANGELOG.md, AGENTS.md.
  - _Why:_ Yêu cầu của chủ dự án; README, CHANGELOG và AGENTS.md được công cụ và quy ước đọc ở root.
- **d-release-rule-in-docs** — Quy tắc release chuyển từ AGENTS.md (Harnix quản lý, không có quy tắc) sang docs/RELEASE.md; script đọc từ đó; task giữa epic không release, task cuối viết một entry.
  - _Why:_ AGENTS.md không thuộc dự án; script hiện luôn gãy; chính sách epic của Harnix xung đột với regex chỉ nhận X.Y.Z.
- **d-keep-persisted-theme** — Chỉ xóa action setTheme/setCefrLevel; giữ trường theme và currentCefrLevel trong dữ liệu lưu và backup.
  - _Why:_ Xóa trường đổi định dạng lưu trữ và cần migration; ngoài phạm vi task không đổi hành vi.
- **d-scope-split** — Tách CapabilityTask.tsx và đặt strict trong tsconfig do task refactor-practice-feature-structure; prompt review tổng thể không tạo file vì chưa từng là file trong repo.
  - _Why:_ Tránh làm hai lần cùng một việc và tránh dựng lại nội dung từ trí nhớ.

## Residual risks

- **r-moved-doc-paths** (low) — Di chuyển tài liệu có thể làm gãy test hoặc script đọc đường dẫn cũ (check-node-engine đọc START_HERE.md).
- **r-lazy-tests** (low) — Lazy-load làm test render đồng bộ phải chờ Suspense.
- **r-bundle-content** (low) — Nếu nội dung JSON chiếm phần lớn bundle thì lazy/vendor chưa đủ; có phương án tách chunk content.
- **r-eager-content** (low) — Nội dung bài học (chunk content 197 kB) và vendor vẫn tải ngay khi mở app vì catalog dùng import.meta.glob eager; lazy chỉ giảm entry chunk, chưa giảm tổng dung lượng tải lần đầu (task offline/PWA sẽ cache).
- **r-no-render-count-test** (low) — Không có test đếm số lần render; ac-4 được khóa bằng test quét không còn useAppStore() không đối số.

## Evidence

- `check-release-scripts` — pass (2026-10-09 14:03:14 +07:00): node --test tests/scripts/check-release.test.mjs tests/scripts/check-changelog-rule.test.mjs — exit 0
- `check-refactor` — pass (2026-10-09 14:03:32 +07:00): npx vitest run tests/features tests/shared tests/domain tests/app tests/infrastructure tests/content — exit 0
- `check-bundle` — pass (2026-10-09 14:03:37 +07:00): npm check:bundle — exit 0
- `check-docs-layout` — pass (2026-10-09 14:03:37 +07:00): node --test tests/scripts/check-docs-layout.test.mjs — exit 0
- `check-suite` — pass (2026-10-09 14:04:09 +07:00): npm test — exit 0
