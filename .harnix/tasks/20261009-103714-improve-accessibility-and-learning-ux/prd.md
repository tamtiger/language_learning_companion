# PRD: Cải thiện khả năng tiếp cận và trải nghiệm học

## Vấn đề

Các điểm dưới đây đã được xác minh trên code hiện tại (đọc toàn bộ `src/features/practice`, phần liên quan của `CapabilityTask.tsx`, `Settings.tsx`, `TodayPage.tsx`).

1. **Focus và live region (ac-1).**
   - `SpokenResponse.tsx`: khi bấm "Bắt đầu ghi âm" hoặc "timer-only", hai nút biến mất và nút "Tôi đã nói xong" xuất hiện; focus rơi về `body`. Tương tự khi "Tôi đã nói xong" đổi thành "Làm lại". Nút "Tôi đã nói xong" bị `disabled` khi `seconds < 1`.
   - `PerceptionPractice.tsx`: đáp án chọn xong thì mọi nút lựa chọn `disabled`, nút vừa bấm mất focus; kết quả "Đúng"/"Đáp án" hiện trong `<div>` không có live region; nút "Câu tiếp" bắt đầu `disabled` và không nhận focus.
   - `ReadingLadderPractice.tsx`: phản hồi từng câu trích xuất và nút "Sang explain/apply" `disabled` không có thông báo.
2. **Ngữ nghĩa (ac-2).**
   - Không nơi nào có `lang="en"`; trình đọc màn hình đọc transcript, lựa chọn, câu mẫu, model response và bản nháp tiếng Anh bằng giọng tiếng Việt (chỉ `<html lang="vi">`).
   - Phase hiện ở một `<p>` ("Nhiệm vụ viết · Lượt đầu") nên thuật ngữ baseline/retry/transfer không có trong heading hay mô tả.
   - `RubricEditor` là một `<fieldset>` lớn chứa các `<div>` với nút bật/tắt; mỗi tiêu chí không phải nhóm có tên nên người dùng không nghe được nút "Đạt" thuộc tiêu chí nào.
   - Nhiều nút `disabled` (Sang transfer, Hoàn thành transfer, Lưu review, Câu tiếp, Bắt đầu lượt chính…) không nêu lý do cho người không thấy văn bản gợi ý bên cạnh.
3. **Mất bản nháp và tiến độ (ac-3).**
   - Bản nháp bài viết, đang ghi âm hoặc đã ghi chưa lưu sẽ mất khi đóng tab, bấm điều hướng chính hoặc nút "Quay lại" mà không cảnh báo.
   - Tiến độ perception (pretest/training/posttest) và reading ladder chỉ nằm trong `useState`; reload giữa chừng bắt làm lại từ đầu. Chỉ kết quả cuối (`activeProcessEvidence`) được lưu.
4. **Thời gian không công bằng (ac-4).**
   - `createSnapshot` (bài viết) tính `durationSeconds` từ lần gõ đầu tới lúc bấm Lưu, nên gồm cả thời gian chấm rubric ở retry, transfer và review (rubric nằm cùng màn hình).
   - Bài viết không có đồng hồ hiển thị.
   - `preparationStartedAt` được đặt khi vào phase; thời gian đọc source read-once được tính vào `preparationSeconds` (chuẩn bị) và có thể làm transfer "preparation-overtime".
   - `SpokenResponse` đặt `startedAt` ngay khi bấm ghi âm, nên thời gian chờ hộp thoại xin quyền microphone bị tính vào `durationSeconds`.
5. **Nhất quán và độ bền (ac-5).**
   - Không có `ErrorBoundary`: một lỗi render làm trắng toàn bộ app.
   - UI lộ enum nội bộ: `Perception · pretest · 1/4`, `Interaction · clarification`.
   - `Settings`: ô chọn file `sr-only` nằm trong label không có chỉ báo focus; `URL.revokeObjectURL` gọi ngay sau `link.click()` nên có trình duyệt hủy tải trước khi bắt đầu.
   - `TodayPage`: bài pronunciation (không có performance task) vẫn có thể trở thành "Nhiệm vụ hôm nay" khi ở trạng thái đang học.
6. **Kiểm thử axe (ac-6).** `tests/app/App.test.tsx` chỉ chạy axe trên vài màn hình; không có axe cho Catalog, Progress, Settings (import, xác nhận reset) và các phase của `LessonFlow`.

## Mục tiêu

Người dùng chỉ dùng bàn phím và trình đọc màn hình hoàn thành được vòng học mà không mất focus, bản nháp hay tiến độ, và thời gian đo được công bằng.

## Không thuộc phạm vi

- Chia mission thành phiên; đổi nội dung bài học.
- Tách `CapabilityTask.tsx` (task `refactor-practice-feature-structure`); task này chỉ sửa tại chỗ và thêm component dùng chung nhỏ.
- Kiểm tra tương phản màu bằng axe (jsdom không đo được); bảng tương phản hiện có ở `tests/app/App.test.tsx` giữ nguyên.
- Lưu nội dung bản nháp hay audio (giữ chính sách privacy: chỉ cảnh báo trước khi mất).

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Focus không rơi về `body` sau nút ghi âm, perception và reading ladder; kết quả và phản hồi nằm trong live region; không có nút `disabled` đang giữ focus. |
| ac-2 | Văn bản tiếng Anh có `lang="en"` (tiếng Việt `lang="vi"`); heading của phase nêu baseline/retry/transfer/review; mỗi tiêu chí rubric là một nhóm có tên; nút bị chặn nêu lý do cho trình đọc màn hình. |
| ac-3 | Cảnh báo khi rời trang lúc có bản nháp hoặc đang ghi âm (đóng tab và điều hướng nội bộ); tiến độ perception, sentence chunks và reading ladder được lưu metadata để reload không phải làm lại. |
| ac-4 | `durationSeconds` chốt khi xong bản nháp, tách thời gian chấm rubric; bài viết có đồng hồ hiển thị; thời gian đọc source read-once và xin quyền mic không bị tính. |
| ac-5 | Có `ErrorBoundary` với đường thoát; UI không lộ enum; ô import có focus nhìn thấy; export revoke trễ; bài pronunciation không chiếm "Nhiệm vụ hôm nay". |
| ac-6 | axe chạy cho Today, Catalog, các phase của LessonFlow, Settings và Progress ở các trạng thái chính và không có vi phạm. |

## Quyết định thiết kế

- **Nút chặn dùng `aria-disabled`, không dùng `disabled`.** Component `GuardedButton` nhận `disabledReason`; khi có lý do, nút giữ `aria-disabled="true"`, bỏ qua click, vẫn nhận focus và có `aria-describedby` trỏ tới đoạn văn bản ẩn trực quan nêu lý do. Vừa không mất focus, vừa nêu lý do. Lựa chọn đã trả lời của perception dùng `aria-disabled` tương tự.
- **Quản lý focus bằng "người nhận focus kế tiếp".** Khi một điều khiển đang giữ focus bị thay bằng điều khiển khác, nút chính mới nhận focus (chỉ khi focus đang nằm trong component hoặc trên `body`), thay vì để rơi.
- **`lang` theo nội dung.** Hàm `languageOf(text)` trả `vi` nếu có ký tự tiếng Việt có dấu, ngược lại `en`; áp dụng cho từng đoạn văn bản hiển thị từ nội dung (prompt, câu hỏi, lựa chọn, transcript, chunk, model response, source) và textarea bản nháp (`lang="en"`). Không đổi nội dung.
- **Rời trang.** Hook `useUnsavedWork` đăng ký trạng thái "có việc chưa lưu" (bản nháp không rỗng, đang ghi âm hoặc ghi xong chưa lưu); khi có, gắn `beforeunload`. Điều hướng nội bộ (`App.navigate`, nút Quay lại) gọi `confirmLeave()` dùng `window.confirm` gốc (có hỗ trợ bàn phím và trình đọc màn hình sẵn, dễ test bằng spy).
- **Lưu tiến độ input bằng trường tùy chọn.** `LessonProgress.inputProgress?` lưu metadata: `loop` (trạng thái `LearningLoopState` đã tuần tự hóa được), `perception` (phase, index, điểm, id câu sai), `shadowingIndex`, `ladder` (stage và id lựa chọn đã chọn). Không lưu bản nháp, transcript hay audio. `storageVersion` giữ 5 (thêm trường tùy chọn như task trước); xóa khi hoàn tất input, `startLessonRepeat` hoặc `restartLesson`.
- **Chốt bản nháp.** Ở retry, transfer và review có nút "Chốt bản nháp" dừng đồng hồ, khóa textarea (hoặc chốt bản ghi) rồi mới mở rubric; `durationSeconds` lấy tại thời điểm chốt. Hợp đồng độ dài và thời gian của `assessTransfer` không đổi.
- **Đồng hồ.** Bài viết hiển thị `mm:ss / giới hạn` (`role="timer"`, không live); chỉ thông báo qua `role="status"` khi tới giới hạn. Đồng hồ bắt đầu ở lần gõ đầu, dừng khi chốt.
- **Thời gian không tính.** `preparationStartedAt` đặt lại khi người dùng ẩn source read-once; `SpokenResponse` đặt lại `startedAt` khi microphone sẵn sàng hoặc khi rơi về timer-only.
- **`ErrorBoundary`** là class component bao nội dung chính, có nút "Về trang Today" và "Tải lại", không làm mất dữ liệu đã lưu.
- **Bài pronunciation không vào "Nhiệm vụ hôm nay":** `TodayPage` chỉ lấy mục queue của lesson có performance task làm nhiệm vụ chính và danh sách phụ.
- **Nhãn tiếng Việt cho enum:** map `pretest`, `training`, `posttest` và `kind` của interaction sang nhãn hiển thị.

## Rủi ro

- Đổi `disabled` thành `aria-disabled` đổi cách test hiện có kiểm tra (`.disabled`); cập nhật test sang kiểm `aria-disabled` và hành vi (click không có tác dụng).
- Chốt bản nháp thêm một bước vào luồng; cập nhật test luồng đầy đủ.
- Phát hiện ngôn ngữ bằng ký tự có dấu có thể gắn `vi` cho câu tiếng Anh có tên riêng Việt; chấp nhận được, ưu tiên không gắn sai `en` cho tiếng Việt.
- Lưu `inputProgress` làm tăng số lần ghi localStorage (mỗi câu trả lời); dữ liệu nhỏ, và lỗi ghi đã không làm kẹt (task trước).
- `window.confirm` khác phong cách giao diện nhưng đáng tin cậy về a11y; có thể thay bằng dialog tùy biến ở task UX sau.
- Task chạm nhiều file đang được task `refactor-practice-feature-structure` di chuyển sau; mô tả thay đổi theo hành vi để dễ chuyển.
