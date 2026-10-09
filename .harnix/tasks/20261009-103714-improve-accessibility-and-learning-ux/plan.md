# Kế hoạch: Cải thiện khả năng tiếp cận và trải nghiệm học

## Checklist theo slice

- [x] S1: thành phần dùng chung: `GuardedButton`, `languageOf`, `useUnsavedWork`, `ErrorBoundary` (nền cho ac-1, ac-2, ac-3, ac-5)
- [x] S2: focus và live region ở `SpokenResponse`, `PerceptionPractice`, `ReadingLadderPractice` (ac-1)
- [x] S3: ngữ nghĩa: `lang`, heading phase, rubric theo tiêu chí, lý do nút bị chặn (ac-2)
- [x] S4: thời gian: chốt bản nháp, đồng hồ viết, loại thời gian đọc source và xin quyền mic (ac-4)
- [x] S5: cảnh báo rời trang và lưu `inputProgress` (ac-3)
- [x] S6: nhất quán UI, `ErrorBoundary`, Settings, Today không lấy pronunciation (ac-5)
- [x] S7: ma trận axe cho các màn hình và phase (ac-6)
- [ ] S8: lint, build, toàn bộ suite, cập nhật tài liệu (ac-1 đến ac-6)

Đường dẫn tương đối với root repo. Mỗi slice viết test trước (RED) rồi sửa (GREEN), chạy test hẹp trước, toàn bộ suite một lần ở S8.

## S1: thành phần dùng chung

Test trước:

- `tests/shared/components/GuardedButton.test.tsx`: khi có `disabledReason`, nút có `aria-disabled="true"`, không có thuộc tính `disabled`, vẫn nhận focus bằng `focus()`, click không gọi `onClick`, `aria-describedby` trỏ tới phần tử chứa đúng lý do; khi không có lý do, click gọi `onClick` và không có `aria-disabled`.
- `tests/shared/lang.test.ts`: `languageOf('Nghe trước khi nói')` là `vi`; `languageOf('Write a 70–110 word update')` là `en`; câu trộn có ký tự có dấu là `vi`; chuỗi rỗng là `en`.
- `tests/shared/hooks/useUnsavedWork.test.tsx`: khi đăng ký `active = true`, `window` nhận `beforeunload` bị `preventDefault`; khi `active = false` hoặc component unmount thì không; `confirmLeave()` trả `true` ngay khi không có việc chưa lưu, gọi `window.confirm` đúng một lần với thông điệp tiếng Việt khi có và trả theo lựa chọn.
- `tests/app/ErrorBoundary.test.tsx`: con ném lỗi thì hiện `role="alert"` có nút "Về trang Today" và "Tải lại"; bấm "Về trang Today" gọi `onReset`; lỗi được log một lần (spy `console.error`).

Mã: `src/shared/components/GuardedButton.tsx`, `src/shared/lang.ts`, `src/shared/hooks/useUnsavedWork.ts` (đăng ký dạng bộ đếm module, hook `useUnsavedWork(active)` và hàm `confirmLeave()`), `src/app/ErrorBoundary.tsx`.

## S2: focus và live region (ac-1)

Test trước (`tests/features/practice/`):

- `SpokenResponse.test.tsx`: sau khi bấm "Bắt đầu ghi âm" hoặc "Bắt đầu timer-only", `document.activeElement` là nút "Tôi đã nói xong" (không phải `body`); sau khi bấm "Tôi đã nói xong", activeElement là nút "Làm lại"; khi `seconds < 1`, nút "Tôi đã nói xong" có `aria-disabled="true"` và không có `disabled`, kèm lý do.
- `PerceptionPractice.test.tsx`: chọn một đáp án, nút vừa chọn vẫn là activeElement và không `disabled`; vùng kết quả có `role="status"` chứa "Đúng." hoặc "Đáp án: …"; sau khi chọn, focus chuyển được tới "Câu tiếp" bằng Tab và nút này không `disabled`; trước khi chọn "Câu tiếp" có `aria-disabled` kèm lý do.
- `ReadingLadderPractice.test.tsx`: phản hồi từng câu trích xuất nằm trong `role="status"`; "Sang explain/apply" và "Hoàn thành reading ladder" dùng `aria-disabled` kèm lý do.

Mã: `SpokenResponse` giữ ref cho nút chính và chuyển focus theo `captureState` khi focus đang ở trong component hoặc ở `body`; thay `disabled` bằng `GuardedButton`; `PerceptionPractice` dùng `aria-disabled` cho lựa chọn đã trả lời (giữ kiểu hiển thị mờ) và `role="status"` cho kết quả; `ReadingLadderPractice` bọc phản hồi trong `role="status"`.

## S3: ngữ nghĩa (ac-2)

Test trước:

- `tests/features/practice/CapabilityTask.test.tsx`: heading `task-title` có tên truy cập chứa tên phase bằng cả tiếng Việt và thuật ngữ (ví dụ "Lượt đầu (baseline)"); đoạn prompt và model response có `lang` đúng theo nội dung; textarea bản nháp có `lang="en"`; `RubricEditor` hiển thị mỗi tiêu chí trong một `role="group"` có tên bằng nhãn tiêu chí và có hai nút "Đạt"/"Chưa đạt" bên trong nhóm; nút "Sang transfer", "Hoàn thành transfer", "Lưu review", "Bắt đầu lượt chính", "Lưu baseline", "Đối chiếu rubric" khi bị chặn có `aria-disabled` và mô tả nêu lý do cụ thể (chưa viết, chưa chấm đủ rubric, chưa xong auto-check).
- `PerceptionPractice`, `GuidedShadowing`, `ReadingLadderPractice`, `ModelAudioPlayer`: transcript, lựa chọn, câu mẫu và phản hồi tiếng Anh có `lang="en"`.

Mã: `PHASE_LABELS` thêm thuật ngữ (Lượt đầu (baseline), Làm lại có trọng tâm (retry), Tình huống mới (transfer), Ôn lại theo lịch (review)); `h2` tên task kèm phase bằng phần chỉ dành cho trình đọc màn hình; `RubricEditor` đổi mỗi tiêu chí thành `role="group"` với `aria-labelledby`; các nút dùng `GuardedButton` với lý do tính từ trạng thái; gắn `lang={languageOf(text)}` vào các đoạn hiển thị nội dung.

## S4: thời gian (ac-4)

Test trước (`tests/features/practice/CapabilityTask.test.tsx`, fake timers):

- Ở retry, transfer và review, nút "Chốt bản nháp" dừng đồng hồ: sau khi chốt, đợi 60 giây rồi chấm rubric và lưu, `durationSeconds` của attempt bằng thời gian lúc chốt (không cộng 60 giây); textarea chỉ đọc sau khi chốt, rubric chỉ mở sau khi chốt.
- Bài viết hiển thị `role="timer"` dạng `mm:ss / giới hạn`; khi tới giới hạn có `role="status"` thông báo một lần.
- Ở phase có source read-once, thời gian trước khi bấm "Đã đọc một lần — ẩn tài liệu" không vào `independence.preparationSeconds` của attempt.
- `SpokenResponse.test.tsx`: khi `startLocalAudioRecording` chờ 5 giây trước khi resolve, đồng hồ hiển thị và `durationSeconds` chỉ tính từ lúc microphone sẵn sàng; khi bị từ chối, đồng hồ timer-only chạy từ lúc có lỗi.

Mã: trạng thái `draftLockedAt` trong `CapabilityTask`; `createSnapshot` dùng thời điểm chốt (nếu có) thay `Date.now()`; component `WrittenClock`; `preparationStartedAt` đặt lại khi ẩn source; `SpokenResponse` đặt lại `startedAt` khi mic sẵn sàng hoặc fallback. Spoken phase đã có nút "Tôi đã nói xong" nên chốt sẵn.

## S5: cảnh báo rời trang và lưu tiến độ input (ac-3)

Test trước:

- `tests/features/practice/CapabilityTask.test.tsx` và `tests/app/App.test.tsx`: có bản nháp thì sự kiện `beforeunload` bị chặn; bấm điều hướng chính hoặc "Quay lại" gọi `window.confirm`, hủy thì ở lại và giữ bản nháp, đồng ý thì rời; không có bản nháp thì không hỏi; đang ghi âm hoặc đã ghi chưa lưu cũng hỏi.
- `tests/infrastructure/storage/inputProgress.test.ts`: `inputProgress` hợp lệ được chấp nhận, trường lạ hoặc id không phải chuỗi bị từ chối, attempt và envelope cũ không có trường vẫn hợp lệ, v3/v4 migrate không thêm trường, định dạng không chứa chuỗi bản nháp.
- `tests/shared/hooks/useAppStore.test.ts`: `setInputProgress` ghi và xóa; `startLessonRepeat` và `restartLesson` xóa; hoàn tất input xóa.
- `tests/features/practice/PerceptionPractice.test.tsx`, `ReadingLadderPractice.test.tsx`, `LearningLoopPractice.test.tsx`: render lại với tiến độ đã lưu (khởi tạo từ props) tiếp tục đúng phase, index, điểm; mỗi bước hoàn thành gọi callback lưu; hoàn tất gọi callback xóa.

Mã: `LessonProgress.inputProgress?` (kiểu, schema `.strict()` tùy chọn, hàm `createEmptyLessonProgress` không đổi); action `setInputProgress(lessonId, value | null)`; `PerceptionPractice`, `GuidedShadowing`, `LearningLoopPractice`, `ReadingLadderPractice` nhận `initial` và `onProgress`; `CapabilityTask` nối với store và `useUnsavedWork`; `App.navigate` và `LessonFlow` "Quay lại" gọi `confirmLeave()`; `App` đăng ký `beforeunload` qua hook.

## S6: nhất quán UI và độ bền (ac-5)

Test trước:

- `tests/features/practice/PerceptionPractice.test.tsx` và `InteractionPractice.test.tsx`: không còn các chuỗi `pretest`, `training`, `posttest`, `clarification`, `misunderstanding`, `repair`, `interruption` trong văn bản hiển thị; có nhãn tiếng Việt tương ứng.
- `tests/features/settings/Settings.test.tsx`: label ô chọn file có lớp focus nhìn thấy khi input trong đó nhận focus (`focus-within`); xuất backup không gọi `URL.revokeObjectURL` ngay mà sau khoảng chờ (fake timers).
- `tests/features/today/TodayPage.test.tsx`: lesson pronunciation đang `in-progress` không bao giờ là "Nhiệm vụ hôm nay" và không có trong danh sách phụ.
- `tests/app/App.test.tsx`: một component con ném lỗi trong `App` hiện `ErrorBoundary` với nút về Today; bấm nút thì hiển thị lại Today.

Mã: nhãn enum, `focus-within` ở Settings, `setTimeout` revoke, lọc lesson có performance task ở `TodayPage`, bọc `<ErrorBoundary>` quanh `<Suspense>` trong `App`.

## S7: ma trận axe (ac-6)

Thêm `tests/helpers/axe.ts` (`expectNoViolations(container)`, tắt `color-contrast` vì jsdom không đo được). Test mới `tests/features/lesson/lessonFlowAxe.test.tsx` và bổ sung vào `tests/app/App.test.tsx`, `tests/features/settings/Settings.test.tsx`, `tests/features/progress/ProgressPage.test.tsx`: axe không vi phạm cho Today (rỗng, có review đến hạn), Catalog (bộ lọc), Progress (có và không có attempt), Settings (mặc định, có import chờ xác nhận, xác nhận reset) và LessonFlow ở các phase: baseline, input (kèm perception, shadowing, reading ladder), performance, self-feedback, retry, transfer (kèm kết quả chưa đạt), completed, review, cho một mission viết và một mission nói.

## S8: xác minh và tài liệu

Cập nhật `docs/ARCHITECTURE.md` (mục Accessibility và Progress: `inputProgress`, chốt bản nháp, đồng hồ, cảnh báo rời trang) rồi chạy `npm run lint`, `npm run build`, `harnix workflow --run-checks --brief`. Kiểm tay bằng bàn phím trên một mission viết và một mission nói; ghi kết quả vào evidence.

## Mỗi check chứng minh điều gì

- `check-a11y-practice`: ac-1, ac-2, ac-3, ac-4 (focus, ngữ nghĩa, rời trang và lưu input, thời gian) trên practice, lesson, store, storage và domain.
- `check-a11y-app`: ac-5, ac-6 (ErrorBoundary, enum, Settings, Today, ma trận axe cho app, Today, Catalog, Progress, Settings).
- `check-suite`: không hồi quy toàn dự án.

## Rollback

Mọi thay đổi nằm trong git. `inputProgress` là trường tùy chọn và được xóa khi hoàn tất input nên dữ liệu đã lưu không cần migration. Nếu hoàn tác code khi người dùng đang có `inputProgress` dở, schema cũ (`.strict()`) sẽ từ chối dữ liệu đó; chấp nhận vì app chưa phát hành, ghi vào rủi ro.
