# Ổn định môi trường test và ghim phiên bản Node

- **ID:** 20261009-103709-stabilize-test-environment
- **Mode:** lite
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 10:55:21 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 2/2 met or waived |
| Required checks | 100% | 3/3 passed |
| Residual risks | 1 | risk-node22-unverified: low |

## Goal

npm run test chạy xanh trên Node 25 mặc định và repo khai báo rõ phiên bản Node được hỗ trợ.

## Non-goals

- Không đổi hành vi sản phẩm
- Không nâng cấp dependency

## Relevant paths

- `vitest.config.ts`
- `package.json`
- `scripts`
- `README.md`
- `START_HERE.md`

## Acceptance criteria

- [x] `ac-1` (met): npm run test chạy xanh trên Node 25 mặc định, không cần biến môi trường NODE_OPTIONS (hiện 73/267 test fail do localStorage gốc của Node 25 che localStorage của jsdom).
- [x] `ac-2` (met): Repo khai báo phiên bản Node hỗ trợ (engines trong package.json và .nvmrc), được ghi trong README và START_HERE.

## Required checks

- [x] `check-env-localstorage` (focused): Test dùng localStorage chạy xanh trên Node mặc định — pass (2026-10-09 10:50:03 +07:00)
- [x] `check-node-engine` (focused): Script kiểm tra engines và .nvmrc khớp — pass (2026-10-09 10:54:13 +07:00)
- [x] `check-suite-2` (full): Toàn bộ test của dự án (suite), chạy lại sau khi sửa test mới — pass (2026-10-09 10:54:40 +07:00)

## Decisions

- **dec-storage-polyfill** — Sửa lỗi localStorage của Node 25 bằng storage trong bộ nhớ ở src/test/setup.ts thay vì cờ --no-experimental-webstorage.
  - _Why:_ Cờ chỉ có từ Node 22.4 nên làm gãy Node cũ hơn; polyfill chỉ kích hoạt khi storage gốc không hoạt động.

## Residual risks

- **risk-node22-unverified** (low) — Test suite chỉ được kiểm chứng trên Node 25.8; engines >=22.12 dựa trên yêu cầu của Vite 8, chưa chạy thật trên Node 22 hoặc 24. Nên chạy suite trên Node 22 khi có môi trường.

## Evidence

- `check-env-localstorage` — pass (2026-10-09 10:50:03 +07:00): npx vitest run src/features/today/TodayPage.test.tsx — exit 0
- `check-node-engine` — pass (2026-10-09 10:54:13 +07:00): node --test scripts/check-node-engine.test.mjs — exit 0 _(2 earlier reruns not shown; see task.json for full history)_
- `check-suite` — fail (2026-10-09 10:51:28 +07:00): npm test — exit 1 _(1 earlier rerun not shown; see task.json for full history)_
- skipped (2026-10-09 10:54:12 +07:00): Task contract revised at persisted replan: Lỗi nằm ở test mới viết (runner node:test bị vitest quét và new URL trong jsdom); đã sửa, suite chạy tay xanh 272/272. Check mới khai báo thêm input .nvmrc mà task tạo ra
- `check-suite-2` — pass (2026-10-09 10:54:40 +07:00): npm test — exit 0
