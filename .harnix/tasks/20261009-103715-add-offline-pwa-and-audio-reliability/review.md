# Offline thật (PWA), bền dữ liệu trên Safari và audio mẫu tin cậy

- **ID:** 20261009-103715-add-offline-pwa-and-audio-reliability
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** completed/finishing
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 15:25:29 +07:00

**Verdict:** PASS — all acceptance criteria met or waived

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 100% | 4/4 met or waived |
| Required checks | 100% | 5/5 passed |
| Residual risks | 4 | r-no-png-icons: low, r-no-real-browser: low, r-persist-denied: low, r-sw-cache-first: low |

## Goal

App tải và chạy được khi offline, dữ liệu được bảo vệ, audio mẫu báo trạng thái thật.

## Non-goals

- Không thêm đồng bộ đám mây
- Không đổi định dạng dữ liệu tiến độ

## Relevant paths

- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/PRODUCT.md`
- `index.html`
- `public`
- `scripts`
- `src/app`
- `src/features/practice`
- `src/features/settings`
- `src/infrastructure/storage`
- `tests`
- `vite.config.ts`

## Artifacts

- [`prd.md`](./prd.md) — outcome, scope, acceptance criteria narrative.
- [`plan.md`](./plan.md) — implementation checklist and slices.

## Acceptance criteria

- [x] `ac-1` (met): Service worker precache và manifest để cài app và tải lại khi offline; build tạo được.
- [x] `ac-2` (met): Gọi navigator.storage.persist() và nhắc export định kỳ (lastExportedAt); Settings hiển thị trạng thái.
- [x] `ac-3` (met): Model audio ưu tiên voice localService, cập nhật trạng thái thật qua onerror/onend/voiceschanged và báo rõ khi không phát được.
- [x] `ac-4` (met): README và PRODUCT mô tả đúng phạm vi offline-first và TTS.

## Required checks

- [x] `check-pwa-build` (focused): Build tạo sw.js, manifest hợp lệ; plugin, service worker và đăng ký đúng hành vi — pass (2026-10-09 15:24:13 +07:00)
- [x] `check-storage-persist` (focused): persist, lastExportedAt, nhắc xuất, Settings — pass (2026-10-09 15:24:24 +07:00)
- [x] `check-model-audio` (focused): Model audio: voice tại máy, voiceschanged, trạng thái thật — pass (2026-10-09 15:24:28 +07:00)
- [x] `check-suite` (full): Toàn bộ test của dự án (suite) — pass (2026-10-09 15:25:17 +07:00)
- [x] `check-docs-offline` (focused): README và PRODUCT nêu đúng phạm vi offline và TTS — pass (2026-10-09 15:24:28 +07:00)

## Decisions

- **d-handwritten-sw** — Service worker viết tay qua plugin Vite (precache + shell fallback), không thêm workbox hay vite-plugin-pwa.
  - _Why:_ Nhu cầu nhỏ, tránh dependency; test được bằng vm với caches/fetch giả.
- **d-export-key** — lastExportedAt lưu ở khóa localStorage riêng, không đổi schema tiến độ.
  - _Why:_ Non-goal: không đổi định dạng dữ liệu tiến độ.
- **d-no-auto-reload** — Bản service worker mới có hiệu lực ở lần mở sau, không tự reload.
  - _Why:_ Tự reload có thể làm mất bản nháp.

## Residual risks

- **r-no-png-icons** (low) — Chỉ có icon SVG; iOS và một số trình duyệt có thể không cài được hoặc dùng icon chung.
- **r-no-real-browser** (low) — Chưa thử offline và speechSynthesis trên trình duyệt thật; test dùng vm và giả lập; cần kiểm tay Chrome và Safari trước phát hành.
- **r-persist-denied** (low) — persist() có thể bị từ chối khi mở app (Firefox, Safari); nút trong Settings là đường dự phòng, nhắc backup là lớp bảo vệ chính.
- **r-sw-cache-first** (low) — Asset cùng origin cache-first: một file không hash (favicon, icon, manifest) đổi nội dung sẽ chỉ cập nhật khi version precache đổi; hiện version phụ thuộc danh sách tên file, không phải nội dung file tĩnh.

## Evidence

- skipped (2026-10-09 15:23:55 +07:00): Task contract revised at persisted replan: Thêm file test modelAudioStatus.test.ts vào lệnh check
- `check-pwa-build` — pass (2026-10-09 15:24:13 +07:00): npm check:offline — exit 0
- `check-storage-persist` — pass (2026-10-09 15:24:24 +07:00): npx vitest run tests/features/settings tests/infrastructure tests/app — exit 0
- `check-model-audio` — pass (2026-10-09 15:24:28 +07:00): npx vitest run tests/features/practice/modelAudio.test.ts tests/features/practice/modelAudioStatus.test.ts tests/features/practice/ModelAudioPlayer.test.tsx — exit 0
- `check-docs-offline` — pass (2026-10-09 15:24:28 +07:00): node --test tests/scripts/check-docs-layout.test.mjs — exit 0
- `check-suite` — pass (2026-10-09 15:25:17 +07:00): npm test — exit 0
