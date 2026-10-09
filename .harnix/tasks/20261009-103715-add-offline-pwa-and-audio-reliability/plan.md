# Kế hoạch: Offline thật (PWA), bền dữ liệu và audio mẫu đáng tin

## Checklist theo slice

- [x] S1: audio mẫu: chọn voice `localService`, chờ `voiceschanged`, trạng thái thật, hook đếm voice (ac-3)
- [x] S2: service worker: plugin Vite, đăng ký, manifest, icon, `index.html`, kiểm tra build (ac-1)
- [x] S3: bền dữ liệu: `storageHealth`, `ExportReminder`, Settings hiển thị và yêu cầu persist (ac-2)
- [x] S4: tài liệu README và PRODUCT, test khóa chủ đề (ac-4)
- [ ] S5: lint, build, `check:offline`, toàn bộ suite (ac-1 đến ac-4)

Đường dẫn tương đối với root repo. Mỗi slice viết test trước (RED) rồi sửa (GREEN); test hẹp trước, toàn bộ suite một lần ở S5.

## S1: audio mẫu (ac-3)

Test trước, mở rộng `tests/features/practice/modelAudio.test.ts` (giả `speechSynthesis`, `SpeechSynthesisUtterance`, `navigator.onLine`):

- Hai voice cùng locale (một `localService: false`, một `true`): chọn voice tại máy.
- `getVoices()` rỗng rồi `voiceschanged` bắn kèm voice: chưa gọi `speak` trước sự kiện, gọi đúng một lần sau sự kiện với voice mới; trạng thái đi `loading-voices` rồi `playing`.
- `getVoices()` rỗng và không có sự kiện: sau 1,5 giây (fake timers) vẫn gọi `speak` với `lang` và không treo.
- Trạng thái: `onstart` báo `playing`, `onend` báo `ended`, `onerror` với `error: 'synthesis-failed'` báo `error` kèm thông điệp; `error: 'interrupted'` hoặc `'canceled'` do `cancel()` của chính mình không báo lỗi.
- Chỉ có voice cần mạng và `navigator.onLine = false`: không gọi `speak`, báo `unavailable` với thông điệp nêu rõ.
- Không có `speechSynthesis`: báo `unavailable`.
- Audio đóng gói: `play()` reject báo `error`; `ended` báo `ended`.
- Hàm dừng trả về hủy phát và gỡ listener `voiceschanged`.

`tests/features/practice/ModelAudioPlayer.test.tsx`: dòng trạng thái hiển thị thông điệp từ callback (không còn "Đang phát mẫu" cố định khi bấm), hiện tên voice và "(tại máy)" hoặc "(cần mạng)", cập nhật số voice khi `voiceschanged` bắn.

Mã: viết lại `playModelAudio`, thêm `resolveVoice`, `useVoiceCount` (trong `modelAudio.ts` hoặc `useVoiceCount.ts` cạnh nó), cập nhật `ModelAudioPlayer`.

## S2: service worker và manifest (ac-1)

Test trước:

- `tests/scripts/vite-plugin-offline.test.mjs`: `buildServiceWorker({ precache })` chạy trong `vm` với `self`, `caches`, `fetch` giả: sự kiện `install` gọi `addAll` với đúng danh sách và `skipWaiting`; `activate` xóa cache `companion-*` có version khác và giữ cache hiện tại; `fetch` điều hướng khi mạng lỗi trả `/index.html` đã cache; asset đã cache trả từ cache không gọi mạng; asset chưa cache đi mạng rồi `put`; request không phải GET và khác origin không gọi `respondWith`; version đổi khi danh sách đổi và giữ khi không đổi. Plugin: `generateBundle` phát `sw.js` chứa tên file hash của bundle và các file tĩnh bổ sung.
- `tests/app/registerServiceWorker.test.ts`: không đăng ký khi không phải production hoặc thiếu `serviceWorker`; đăng ký `/sw.js` khi đủ điều kiện; lỗi đăng ký bị nuốt và log một lần.
- `tests/scripts/check-offline-build.test.mjs`: thư mục `dist` giả: pass khi `sw.js` chứa mọi file `assets/*`, manifest hợp lệ và `index.html` link manifest; fail với từng lỗi (thiếu `sw.js`, asset không nằm trong precache, manifest thiếu `icons` hoặc `start_url`, thiếu link manifest).

Mã: `scripts/vite-plugin-offline.mjs`, `scripts/check-offline-build.mjs`, `src/app/registerServiceWorker.ts` và gọi trong `main.tsx`, `public/manifest.webmanifest`, `public/icon.svg`, `index.html` (link manifest, `theme-color`, icon), `vite.config.ts` dùng plugin, npm script `check:offline` (`npm run build && node scripts/check-offline-build.mjs`).

## S3: bền dữ liệu (ac-2)

Test trước:

- `tests/infrastructure/storage/storageHealth.test.ts`: `requestPersistentStorage` trả `persisted` khi đã persist, gọi `persist()` khi chưa và trả theo kết quả, `unsupported` khi thiếu API, `denied` khi bị từ chối hoặc ném lỗi; `getLastExportedAt` và `setLastExportedAt` đọc ghi khóa riêng, bỏ qua giá trị rác, không ném khi `localStorage` lỗi; `isExportOverdue` với các ranh (chưa từng xuất và có tiến độ, đúng 7 ngày, trước và sau 7 ngày, không có tiến độ).
- `tests/features/settings/Settings.test.tsx`: hiển thị "Lưu trữ bền vững" theo trạng thái, nút "Yêu cầu lưu trữ bền vững" gọi `persist()` và cập nhật; xuất backup ghi `lastExportedAt` và dòng "Lần xuất cuối" cập nhật; chưa từng xuất hiện "chưa từng".
- `tests/app/ExportReminder.test.tsx`: có tiến độ và quá hạn thì hiện nhắc `role="status"` có nút tới Cài đặt; không tiến độ hoặc đã xuất gần đây thì không hiện; `App` gọi xin persist một lần khi mở.

Mã: `src/infrastructure/storage/storageHealth.ts`, `src/app/ExportReminder.tsx`, nối vào `App` và `Settings`, `Settings.exportBackup` ghi `lastExportedAt`.

## S4: tài liệu (ac-4)

Test trước (thêm vào `tests/scripts/check-docs-layout.test.mjs` và `scripts/check-docs-layout.mjs`): `README.md` và `docs/PRODUCT.md` phải nhắc service worker, lần mở đầu cần mạng, `navigator.storage.persist` hoặc "lưu trữ bền vững", backup định kỳ, và TTS dùng voice của máy có thể cần mạng; fixture tự kiểm bắt tài liệu thiếu chủ đề.

Mã: cập nhật README (mục offline, cài đặt PWA, giới hạn Safari/iOS và icon), `docs/PRODUCT.md` (mục Offline-first và privacy, phần TTS), `docs/ARCHITECTURE.md` (mục offline), và `docs/RELEASE.md` nếu cần nhắc `npm run check:offline`.

## S5: xác minh

`npm run lint`, `npm run check:offline` (build rồi kiểm tra), `npm run check:bundle`, `harnix workflow --run-checks --brief`. Ghi vào evidence phần chưa kiểm tay được: thử offline thật ở Chrome và Safari.

## Mỗi check chứng minh điều gì

- `check-pwa-build`: ac-1 (bản build thật có `sw.js` precache đầy đủ, manifest hợp lệ và link trong `index.html`; plugin và service worker đúng hành vi qua `vm`; đăng ký có điều kiện).
- `check-storage-persist`: ac-2 (persist, `lastExportedAt`, nhắc xuất, Settings).
- `check-model-audio`: ac-3 (chọn voice, `voiceschanged`, trạng thái thật, offline).
- `check-docs-offline`: ac-4 (tài liệu nêu đúng phạm vi).
- `check-suite`: không hồi quy toàn dự án.

## Rollback

Mọi thay đổi nằm trong git. Nếu service worker gây lỗi sau phát hành, xóa đăng ký (đổi `registerServiceWorker` thành gỡ đăng ký và xóa cache `companion-*`); dữ liệu tiến độ không bị ảnh hưởng vì khóa `lastExportedAt` tách riêng và schema không đổi.
