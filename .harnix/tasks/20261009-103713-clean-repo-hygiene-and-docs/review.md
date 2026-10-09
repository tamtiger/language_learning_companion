# Dọn nợ kỹ thuật, đồng bộ tài liệu và quy trình release

- **ID:** 20261009-103713-clean-repo-hygiene-and-docs
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** planning/planning
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 10:48:15 +07:00

**Verdict:** PENDING — 0/8 acceptance criteria met

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 0% | 0/8 met or waived |
| Required checks | 0% | 0/5 passed |

## Goal

Repo gọn, tài liệu khớp code, quy trình release chạy được và bundle không còn cảnh báo kích thước.

## Non-goals

- Không đổi hành vi người dùng
- Không xóa dữ liệu .harnix

## Relevant paths

- `scripts`
- `docs`
- `CHANGELOG.md`
- `ARCHITECTURE.md`
- `PRODUCT.md`
- `src/features/practice/CapabilityTask.tsx`
- `src/types`
- `vite.config.ts`

## Acceptance criteria

- [ ] `ac-1` (pending): Quy tắc release/changelog nằm trong docs/RELEASE.md, check-changelog-rule hết gãy, check-release đọc version từ package.json, cả hai có npm script và test.
- [ ] `ac-2` (pending): Tài liệu khớp code: ARCHITECTURE (12 mission), CHANGELOG (vị trí Unreleased, số test), PRODUCT (bỏ streak), tsconfig ghi rõ strict.
- [ ] `ac-3` (pending): Dead code đã xóa (facade src/types/progress.ts, theme/setTheme/currentCefrLevel, canCompleteCapabilityMission, isQualifyingTransfer thừa); enum capability có một nguồn duy nhất.
- [ ] `ac-4` (pending): Component dùng selector thay vì subscribe cả store; CapabilityTask.tsx tách xuống dưới 400 dòng; buildEvidenceContract dùng chung với ProgressPage.
- [ ] `ac-5` (pending): Bundle tách chunk (lazy phần thân lesson), build không còn cảnh báo chunk trên 500 kB.
- [ ] `ac-6` (pending): Toàn bộ tài liệu dự án nằm trong docs/ (ARCHITECTURE, CONTENT, PRODUCT, START_HERE chuyển vào docs/); chỉ README.md, CHANGELOG.md và AGENTS.md ở root vì công cụ yêu cầu; mọi link nội bộ không gãy.
- [ ] `ac-7` (pending): Các prompt dùng một lần đã hoàn tất bị xóa (IMPROVEMENT_PROMPT, UX_RESEARCH_REFACTOR_PROMPT, LEARNING_FEATURE_RESEARCH_PROMPT, CURRICULUM_RESEARCH_PROMPT); LEARNER_AUDIT_PROMPT và prompt review tổng thể được chuyển vào docs/prompts/.
- [ ] `ac-8` (pending): scripts/check-changelog-rule đổi tên thành .mjs, mọi tham chiếu được cập nhật và script nằm trong npm scripts.

## Required checks

- [ ] `check-release-scripts` (focused): Script release và changelog — chưa chạy / not yet run
- [ ] `check-refactor` (focused): Refactor, selector và dead code — chưa chạy / not yet run
- [ ] `check-bundle` (focused): Build không cảnh báo chunk lớn — chưa chạy / not yet run
- [ ] `check-suite` (full): Toàn bộ test của dự án (suite) — chưa chạy / not yet run
- [ ] `check-docs-layout` (focused): Bố cục tài liệu, link nội bộ và tên script — chưa chạy / not yet run

## Decisions

- **dec-docs-in-docs** — Tài liệu dự án đặt trong docs/; root chỉ giữ README.md, CHANGELOG.md, AGENTS.md.
  - _Why:_ Yêu cầu của chủ dự án; README, CHANGELOG và AGENTS.md được công cụ và quy ước đọc ở root.

## Evidence

_None recorded yet._
