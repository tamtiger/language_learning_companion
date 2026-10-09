# PRD: Sửa logic hoàn thành, ôn tập và bền vững dữ liệu

## Vấn đề

Review phát hiện trạng thái học tập không phản ánh năng lực thật và có thể mất dữ liệu mà người học không biết. Mọi điểm dưới đây đã được xác minh trên code hiện tại.

1. **Transfer chưa đạt vẫn "hoàn thành".** `recordCapabilityAttempt` (`src/shared/hooks/useAppStore.ts`) gọi `scheduleTransferReview` và đặt `status: 'completed'` cho mọi attempt phase `transfer`; `appendAttempt` đặt `transferCompleted: true` chỉ vì `phase === 'transfer'`. `assessTransfer` chỉ được gọi trong UI (`CapabilityTask.tsx`) để hiện câu "chưa qualifying" sau khi mission đã completed và đã lên lịch ôn. `ARCHITECTURE.md` nói "Transfer thành công đặt review" nên code lệch tài liệu.
2. **Review đạt quá dễ.** Store tính `passed` bằng `Object.values(rubric).every(met)`: rubric rỗng đạt (`every` trên mảng rỗng), và không xét độc lập (dùng tiếng Việt, dịch, model answer, hint) hay hợp đồng output (thời lượng, số từ).
3. **Lịch ôn theo mốc 24 giờ.** `addDays` cộng `n * 86_400_000` ms. Học 23:50 thì review "ngày mai" đến hạn lúc 23:50, không phải đầu ngày hôm sau; qua đổi giờ (DST) lệch một giờ. `TodayPage` tính queue bằng `new Date()` một lần mỗi lần render, nên bài đến hạn khi đang mở trang không xuất hiện cho tới khi có render khác.
4. **"Luyện lại" che bài ôn đến hạn.** `startLessonRepeat` đặt `status: 'in-progress'` nhưng giữ `nextReviewAt` đã đến hạn. `buildTodayQueue` xếp bài `in-progress` là `resume` trước khi xét review, và `initialSession` bỏ review khi `in-progress`. Kết quả: review đến hạn biến mất khỏi Today cho tới khi hoàn thành lại vòng mới. Luyện lại cũng chạy ngay không hỏi xác nhận (nút ở Today và ở màn hoàn thành) dù xóa `completedSectionIds`, `completedExerciseIds`, checkpoint phase.
5. **Attempt cũ bị chấm lại bằng nội dung mới.** `ProgressPage` gọi `assessTransfer(attempt, evidenceContract(lessonHienTai))`. Khi nội dung đổi (rubric, giới hạn thời gian, số từ), transfer cũ đổi từ "Đạt" sang "Chưa đạt" hoặc ngược lại, và đếm "Transfer đạt" thay đổi ngầm. Attempt không lưu kết quả đánh giá và không lưu phiên bản hợp đồng đã dùng.
6. **Mất dữ liệu âm thầm.**
   - Không có trạng thái persistence hiển thị: khi localStorage bị chặn, app chuyển sang `memoryStorage` mà người học không biết, tiến độ mất khi đóng tab.
   - Khi hydrate bị từ chối, quarantine chặn mọi ghi tự động (đúng) nhưng không có thông báo hay hướng xử lý.
   - `setItem` ném lỗi (quota đầy) trong `set` của zustand sẽ ném ra khỏi hành động UI, làm phase kẹt giữa chừng.
   - Hai tab cùng mở ghi đè lẫn nhau vì không nghe sự kiện `storage`.

## Mục tiêu

Chuyển các quyết định "đạt, hoàn thành, đến hạn ôn" về domain thuần (có test, có đồng hồ), lưu kết quả đánh giá cùng attempt, và làm cho trạng thái lưu trữ nhìn thấy được và không chặn người học.

## Không thuộc phạm vi

- Đổi giao diện ngoài banner persistence, bước xác nhận luyện lại, nhãn trạng thái transfer chưa đạt và nhãn bản ghi cũ ở Progress.
- Đổi `storageVersion` hoặc định dạng backup theo cách phá tương thích: chỉ thêm trường tùy chọn vào attempt; backup v3/v4/v5 cũ vẫn nhập được.
- Giải quyết xung đột ghi đồng thời nhiều tab bằng merge (chỉ đồng bộ theo "bản ghi sau cùng thắng").
- Thêm nội dung, đổi `reviewPolicy.intervalDays` của lesson.

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Transfer chưa đạt hợp đồng không đặt mission `completed`, không đặt `transferCompleted`, không lên lịch ôn; người học ở lại phase transfer để thử lại. Quyết định nằm trong domain (`applyTransferOutcome`), khớp `ARCHITECTURE.md`. |
| ac-2 | Review chỉ tính đạt khi rubric không rỗng và `assessReview` (domain) không có lý do thất bại, gồm cả độc lập lẫn hợp đồng output. |
| ac-3 | Lịch ôn tính theo ngày lịch địa phương (đến hạn từ 00:00 địa phương của ngày đích); test với `TZ` cố định ở ranh 23:59 và 00:01 và qua đổi giờ; Today cập nhật khi qua giờ đến hạn mà không cần thao tác. |
| ac-4 | Luyện lại không che bài ôn đến hạn (Today hiện cả mục ôn và mục tiếp tục), giữ nguyên `reviewStage` và `nextReviewAt`, và có bước xác nhận trước khi xóa tiến độ vòng hiện tại. |
| ac-5 | Attempt transfer và review lưu kèm `assessment` (qualifies, reasons) và `contentRevision` của hợp đồng; Progress dùng kết quả đã lưu, không chấm lại bằng nội dung hiện tại; bản ghi cũ không có assessment hiển thị là "chưa có đánh giá" và không tính đạt. |
| ac-6 | Có trạng thái persistence `ok`, `quarantined`, `memory-only`, `write-failed` kèm banner có hướng xử lý; lỗi `setItem` hoặc quota không ném ra khỏi hành động UI và không làm kẹt phase; thay đổi ở tab khác được đồng bộ qua sự kiện `storage`. |

## Quyết định thiết kế

- **Domain trước, UI chỉ hiển thị.** `applyTransferOutcome(progress, attempt, assessment, intervalDays, now)` và `assessReview` nằm trong `src/domain/progress/progress.ts`. Store gọi domain với hợp đồng truyền vào; UI nhận assessment trả về từ store để hiển thị. Hợp đồng được dựng bằng một hàm dùng chung `buildEvidenceContract(lesson)` (hiện bị nhân đôi ở `CapabilityTask.tsx` và `ProgressPage.tsx`).
- **Chữ ký store.** `recordCapabilityAttempt(attempt, policy)` với `policy = { reviewIntervals, contract }` và trả về `AttemptAssessment | null`. Không đổi thứ tự phase hiện có.
- **Ngày lịch địa phương.** Review "n ngày" đến hạn từ 00:00 địa phương của ngày (ngày làm + n), tính bằng `new Date(y, m, d + n)` (không cộng mili giây) và lưu ISO. So sánh đến hạn vẫn là `nextReviewAt <= now`, nên dữ liệu đã lưu không cần migration. Review chưa đạt: lặp vào 00:00 ngày kế tiếp.
- **Today tick.** Hook `useNow` cập nhật mỗi 60 giây và khi tab được hiển thị lại; Today tính queue từ `now` đó. Không dùng timer chính xác đến giây.
- **Luyện lại không loại trừ review.** `buildTodayQueue` trả hai mục cho cùng một lesson khi lesson đang `in-progress` và review đã đến hạn: `review` và `resume`. Lối vào mang ý định (`entry: 'review' | 'continue'`) từ Today qua `App` tới `CapabilityTask`; `initialSession` chọn phase theo ý định. `startLessonRepeat` giữ `reviewStage` và `nextReviewAt` (đã đúng) và được bảo vệ bằng xác nhận ở cả hai nút "Luyện lại".
- **Dữ liệu attempt.** Thêm hai trường tùy chọn vào `AttemptEvidenceSchema` (v5): `assessment: { qualifies, reasons[] }` và `contentRevision` (băm ổn định của `EvidenceContract` gồm id rubric). `storageVersion` giữ 5 vì thay đổi chỉ thêm trường tùy chọn; backup cũ vẫn hợp lệ, attempt cũ không có trường. Backup mới không nhập được vào bản app cũ hơn (chấp nhận, ghi rủi ro).
- **Persistence.** Trạng thái `persistence` nằm trong store, không được lưu. Bọc `setItem` bằng try/catch: lỗi đặt `write-failed` và không ném; lần ghi thành công kế tiếp đặt lại `ok`. `memory-only` khi `getSafeStorage` rơi về bộ nhớ. `quarantined` khi hydrate bị từ chối. Banner nằm ở `App`, dùng `role="status"` cho memory-only/write-failed và `role="alert"` cho quarantined, có liên kết tới Cài đặt (xuất backup, khôi phục, reset). Đồng bộ tab: lắng nghe `storage` của khóa persist và gọi `persist.rehydrate()` khi không bị quarantine.

## Rủi ro

- Đổi chữ ký `recordCapabilityAttempt` ảnh hưởng nhiều test hiện có; sửa cùng slice và giữ test cũ làm hồi quy.
- Hai mục cùng lesson trong Today có thể làm UI lặp; chỉ hiện mục `resume` ở danh sách phụ và gắn nhãn rõ.
- Băm hợp đồng khiến chỉ sửa nhỏ nội dung (ví dụ rubric id) đổi `contentRevision`; chỉ dùng để gắn nhãn "bài đã đổi sau lượt này", không tự chấm lại.
- Đồng bộ tab "bản ghi sau cùng thắng" vẫn có thể mất một lượt ghi khi hai tab ghi cùng lúc; ghi nhận, không xử lý trong task này.
- Test múi giờ phụ thuộc `process.env.TZ` đặt lúc chạy; kiểm chứng trên Node 22 và 25, khôi phục giá trị cũ sau mỗi test.
