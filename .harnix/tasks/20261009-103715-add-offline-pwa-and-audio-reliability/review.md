# Offline thật (PWA), bền dữ liệu trên Safari và audio mẫu tin cậy

- **ID:** 20261009-103715-add-offline-pwa-and-audio-reliability
- **Mode:** full
- **Epic:** 20261009-103708-learning-companion-remediation
- **Status:** planning/planning
- **Created:** 2026-10-09 10:37:08 +07:00
- **Updated:** 2026-10-09 11:37:06 +07:00

**Verdict:** PENDING — 0/4 acceptance criteria met

## Summary

| Item | Progress | Details |
| --- | --- | --- |
| Acceptance criteria | 0% | 0/4 met or waived |
| Required checks | 0% | 0/4 passed |

## Goal

App tải và chạy được khi offline, dữ liệu được bảo vệ, audio mẫu báo trạng thái thật.

## Non-goals

- Không thêm đồng bộ đám mây
- Không đổi định dạng dữ liệu tiến độ

## Relevant paths

- `PRODUCT.md`
- `README.md`
- `public`
- `src/features/practice/modelAudio.ts`
- `src/features/settings`
- `vite.config.ts`

## Acceptance criteria

- [ ] `ac-1` (pending): Service worker precache và manifest để cài app và tải lại khi offline; build tạo được.
- [ ] `ac-2` (pending): Gọi navigator.storage.persist() và nhắc export định kỳ (lastExportedAt); Settings hiển thị trạng thái.
- [ ] `ac-3` (pending): Model audio ưu tiên voice localService, cập nhật trạng thái thật qua onerror/onend/voiceschanged và báo rõ khi không phát được.
- [ ] `ac-4` (pending): README và PRODUCT mô tả đúng phạm vi offline-first và TTS.

## Required checks

- [ ] `check-pwa-build` (focused): Build sinh service worker và manifest — chưa chạy / not yet run
- [ ] `check-storage-persist` (focused): Persist và nhắc export — chưa chạy / not yet run
- [ ] `check-model-audio` (focused): Voice và trạng thái phát — chưa chạy / not yet run
- [ ] `check-suite` (full): Toàn bộ test của dự án (suite) — chưa chạy / not yet run

## Evidence

_None recorded yet._
