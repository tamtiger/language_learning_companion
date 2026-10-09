# PRD: Offline thật (PWA), bền dữ liệu và audio mẫu đáng tin

## Vấn đề

Các điểm dưới đây đã được xác minh trên repo hiện tại.

1. **App chỉ "offline-first" trên giấy.** README và `docs/PRODUCT.md` gọi app là offline-first, nhưng không có service worker, không có manifest, `public/` chỉ có `favicon.svg` (logo Vite mặc định) và `index.html` không khai báo manifest hay theme color. Tải lại trang khi mất mạng là thất bại; không cài được như ứng dụng. `src/app/main.tsx` không đăng ký gì.
2. **Dữ liệu có thể bị trình duyệt xóa.** Toàn bộ tiến độ nằm trong `localStorage`. Không có lời gọi `navigator.storage.persist()`, nên trình duyệt được phép xóa khi thiếu dung lượng; Safari còn xóa dữ liệu site không dùng trong 7 ngày. Không có nhắc xuất backup: người dùng không biết lần backup gần nhất, và `Settings` không cho biết dữ liệu có đang được bảo vệ hay không.
3. **Audio mẫu báo trạng thái giả.** `playModelAudio` (`src/features/practice/modelAudio.ts`):
   - gọi `speechSynthesis.getVoices()` một lần; trên Chrome danh sách thường rỗng cho tới sự kiện `voiceschanged`, nên lần phát đầu dùng giọng mặc định không đúng locale mà vẫn báo "Đang phát mẫu";
   - không phân biệt voice tại máy (`localService`) với voice cần mạng, nên offline có thể không có tiếng;
   - không nghe `onstart`, `onend`, `onerror`; `ModelAudioPlayer` đặt trạng thái "Đang phát mẫu" ngay khi bấm và không bao giờ báo lỗi hay kết thúc;
   - với audio đóng gói, `audio.play()` bị từ chối (autoplay, lỗi mạng) chỉ bị nuốt bằng `void`;
   - số voice khả dụng được tính lúc render và không cập nhật khi voice nạp xong.
4. **Tài liệu mô tả quá mức.** README và PRODUCT nói offline-first nhưng không nêu phạm vi thật (cần tải lần đầu có mạng, dữ liệu chỉ ở một trình duyệt, TTS phụ thuộc voice của máy).

## Mục tiêu

Sau lần mở đầu có mạng, app mở và học được khi offline; dữ liệu được xin bảo vệ và người dùng được nhắc backup; trạng thái audio mẫu phản ánh đúng điều đang xảy ra; tài liệu mô tả đúng phạm vi.

## Không thuộc phạm vi

- Đồng bộ đám mây; đổi định dạng dữ liệu tiến độ (`storageVersion` và schema giữ nguyên; `lastExportedAt` lưu ở khóa riêng).
- Icon PNG và `apple-touch-icon` cho iOS (cần công cụ raster không có trong repo); manifest dùng icon SVG. Ghi vào rủi ro.
- Tự tải lại khi có bản mới (tránh mất bản nháp); bản mới có hiệu lực ở lần mở sau.
- Tải trước audio bundled hay voice mới; thêm thư viện TTS.

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Build tạo `sw.js` precache toàn bộ asset của bản build và `manifest.webmanifest` hợp lệ; trang được đăng ký service worker ở production; tải lại khi offline ra shell của app. |
| ac-2 | Gọi `navigator.storage.persist()` khi mở app; lưu `lastExportedAt` (khóa riêng) khi xuất backup; nhắc xuất khi có tiến độ và quá 7 ngày chưa xuất (hoặc chưa từng); Settings hiển thị trạng thái bền vững, lần xuất cuối và có nút yêu cầu lưu trữ bền vững. |
| ac-3 | Model audio ưu tiên voice `localService`, chờ `voiceschanged` khi danh sách rỗng, báo trạng thái thật qua `onstart`/`onend`/`onerror` và `play()` bị từ chối, và báo rõ khi không phát được (không có voice, cần mạng khi đang offline); số voice cập nhật khi voice nạp. |
| ac-4 | README và `docs/PRODUCT.md` mô tả đúng phạm vi offline-first (cần mở lần đầu có mạng, dữ liệu theo trình duyệt, persist và backup) và TTS (voice của máy, có thể cần mạng); test khóa các chủ đề này. |

## Quyết định thiết kế

- **Service worker viết tay, không thêm dependency.** Một plugin Vite nhỏ (`scripts/vite-plugin-offline.mjs`) phát `sw.js` trong `generateBundle` từ danh sách asset thật của bundle cộng các file tĩnh (`manifest.webmanifest`, `icon.svg`, `favicon.svg`). Lý do: workbox/`vite-plugin-pwa` kéo nhiều dependency cho nhu cầu "precache + shell fallback"; mã tự viết ngắn và test được bằng `vm` với `caches`/`fetch` giả.
- **Chiến lược cache.** Cache tên `companion-<version>`, version là băm danh sách precache (đổi khi asset đổi). Cài đặt: `addAll(precache)`, `skipWaiting`. Kích hoạt: xóa cache `companion-*` khác version, `clients.claim`. Fetch: bỏ qua không phải GET và khác origin; điều hướng (`mode: 'navigate'`) thử mạng rồi rơi về `/index.html` đã cache; asset cùng origin cache-first, miss thì mạng rồi lưu. Không tự reload trang.
- **Đăng ký.** `src/app/registerServiceWorker.ts` chỉ đăng ký ở production và khi trình duyệt hỗ trợ; lỗi đăng ký không làm hỏng app.
- **Manifest.** `public/manifest.webmanifest` (name, short_name, start_url `/`, display `standalone`, theme/background, icon `icon.svg` với `sizes: any` và một bản `purpose: maskable`); icon riêng thay logo Vite; `index.html` thêm link manifest và `theme-color`.
- **Bền dữ liệu.** `src/infrastructure/storage/storageHealth.ts` bọc `navigator.storage.persist/persisted` (trả `persisted`, `denied`, `unsupported`) và `lastExportedAt` ở khóa `language-learning-companion-last-export` (try/catch mọi truy cập). `isExportOverdue(lastExportedAt, hasProgress, now, 7)` là hàm thuần. `App` gọi xin persist một lần khi mở và hiện `ExportReminder` (role `status`, có nút tới Cài đặt) khi quá hạn. Nhắc không bao giờ chặn người dùng.
- **Audio.** `playModelAudio(source, rate, onStatus)` giữ chữ ký trả về hàm dừng; thêm callback trạng thái `{ state: 'loading-voices' | 'playing' | 'ended' | 'error' | 'unavailable', message, voice? }`. Chọn voice theo thứ tự hiện có (locale + hint, locale, ngôn ngữ + hint, ngôn ngữ), trong mỗi nhóm ưu tiên `localService`; nếu chỉ có voice cần mạng và `navigator.onLine === false` thì báo `unavailable` thay vì im lặng. Khi chưa có voice, chờ `voiceschanged` tối đa 1,5 giây rồi phát bằng locale. `ModelAudioPlayer` hiển thị trạng thái này và dùng hook `useVoiceCount` nghe `voiceschanged`. Hủy do chính mình (`cancel`) không bị coi là lỗi.
- **Kiểm tra build.** `scripts/check-offline-build.mjs` (`npm run check:offline` = `npm run build` rồi kiểm tra) xác nhận `dist/sw.js` chứa mọi file trong `dist/assets`, manifest hợp lệ và `index.html` link tới manifest.

## Rủi ro

- Service worker cache-first có thể giữ bản cũ nếu băm danh sách không đổi khi nội dung file đổi; tên asset Vite đã có hash nên danh sách đổi theo nội dung. Test chứng minh version đổi khi danh sách đổi.
- Không có PNG: một số trình duyệt (đặc biệt iOS) không cài được hoặc dùng icon chung; ghi chú trong README.
- Chưa thử trên trình duyệt thật (không có trong môi trường); test dùng `vm` và giả lập API; cần kiểm tay offline ở Chrome và Safari trước khi phát hành.
- `speechSynthesis` rất khác nhau giữa trình duyệt (Safari ít voice, `voiceschanged` không luôn bắn); phần chờ có giới hạn thời gian để không treo.
- Gọi `persist()` ngay khi mở có thể bị từ chối ở Firefox/Safari cho tới khi có tương tác; nút "Yêu cầu lưu trữ bền vững" trong Settings là đường dự phòng.
- Nhắc xuất backup quá mức gây phiền; chỉ nhắc khi có tiến độ và quá 7 ngày.
