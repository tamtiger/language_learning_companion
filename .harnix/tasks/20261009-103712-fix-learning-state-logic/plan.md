# Kế hoạch: Sửa logic hoàn thành, ôn tập và bền vững dữ liệu

## Checklist theo slice

- [x] S1: domain hợp đồng, `assessReview`, `applyTransferOutcome`, lịch ngày địa phương (ac-1, ac-2, ac-3, ac-5)
- [x] S2: schema attempt (`assessment`, `contentRevision`) và `ProgressPage` dùng kết quả đã lưu (ac-5)
- [x] S3: store gọi domain, trả assessment, `CapabilityTask` hiện transfer chưa đạt và cho thử lại (ac-1, ac-2)
- [x] S4: queue review song song với luyện lại, `useNow`, ý định `entry`, xác nhận luyện lại (ac-3, ac-4)
- [x] S5: trạng thái persistence, `setItem` không ném, banner, đồng bộ tab (ac-6)
- [x] S6: cập nhật `ARCHITECTURE.md`, chạy lint, build, toàn bộ suite (ac-1 đến ac-6)

Đường dẫn tương đối với root repo. Mỗi slice viết test trước (RED) rồi sửa mã (GREEN), chạy test hẹp trước, chạy toàn bộ suite một lần ở S6.

## S1: domain (ac-1, ac-2, ac-3, ac-5)

Test trước trong `tests/domain/progress/progress.test.ts` (và file mới `tests/domain/progress/evidenceContract.test.ts`):

- `applyTransferOutcome` với assessment không đạt: `status` giữ `in-progress`, `activePhase` `'transfer'`, `transferCompleted` false, `nextReviewAt` không đổi, `reviewStage` không đổi; attempt vẫn được ghi (`attemptCount` tăng).
- Với assessment đạt: `status` `completed`, `activePhase` null, `transferCompleted` true, `reviewStage` 0, `nextReviewAt` bằng 00:00 địa phương của ngày + `intervalDays[0]`.
- `assessReview`: rubric rỗng không đạt; dùng tiếng Việt, dịch, model answer, vượt hint, quá thời lượng, quá ngắn đều không đạt và trả đúng reason; đủ điều kiện thì đạt; phase khác `review` không đạt (`incomplete`).
- `addLocalDays` / lịch: với `TZ=Asia/Ho_Chi_Minh` ở 23:59 và 00:01 (ngày làm khác nhau, cùng đích khác nhau), với `TZ=America/Los_Angeles` qua ngày đổi giờ mùa xuân, review "1 ngày" vẫn đến hạn đúng 00:00 địa phương. `applyReviewResult` không đạt lặp vào 00:00 ngày kế tiếp.
- `buildEvidenceContract(lesson)` cho spoken và written trả cùng hợp đồng như hai đoạn đang nhân đôi (so snapshot); `contractRevision(contract)` ổn định với thứ tự khóa và đổi khi đổi rubric id hoặc giới hạn.

Mã:

- `src/domain/progress/progress.ts`: tách `assessAttempt(attempt, contract, expectedPhase)` dùng chung; `assessTransfer` gọi với `'transfer'`; thêm `assessReview` gọi với `'review'`; thêm `applyTransferOutcome`; sửa `appendAttempt` không còn đặt `transferCompleted` theo `phase`; thay `addDays` bằng `addLocalDays` (dùng `new Date(y, m, d + days)`); `scheduleTransferReview` dùng `addLocalDays`.
- `src/domain/progress/evidenceContract.ts` (mới): `buildEvidenceContract(lesson)`, `contractRevision(contract)`; xóa hai bản sao trong `CapabilityTask.tsx` và `ProgressPage.tsx` ở S2/S3.
- Kiểu `AttemptAssessment = { qualifies: boolean; reasons: TransferReason[] }` xuất qua `src/types/progress.ts`.

## S2: schema attempt và Progress (ac-5)

Test trước: `tests/infrastructure/storage/progressStorage.test.ts` (attempt v5 có `assessment` và `contentRevision` được chấp nhận; attempt không có trường vẫn hợp lệ; v3/v4 migrate không thêm trường; `assessment` có reason lạ bị từ chối) và `tests/features/progress/ProgressPage.test.tsx` (attempt có `assessment.qualifies = true` vẫn "Đạt" khi hợp đồng hiện tại đã đổi sang nghiêm hơn; attempt cũ không có assessment hiện "Chưa có đánh giá (bản ghi cũ)" và không vào số "Transfer đạt"; `contentRevision` khác hợp đồng hiện tại hiện nhãn "Bài đã đổi sau lượt này").

Mã: `AttemptEvidence` thêm `assessment?` và `contentRevision?`; `AttemptEvidenceSchema` (v5) thêm hai trường tùy chọn, `.strict()` giữ nguyên; `ProgressPage` đọc `attempt.assessment`, bỏ gọi `assessTransfer` và `evidenceContract`.

## S3: store và CapabilityTask (ac-1, ac-2)

Test trước trong `tests/shared/hooks/useAppStore.test.ts`: transfer không đạt không completed và không đặt lịch; transfer đạt completed và đặt lịch; review rubric rỗng hoặc có model answer không tăng `reviewStage`; attempt lưu có `assessment` và `contentRevision`; `recordCapabilityAttempt` trả assessment. Cập nhật các test cũ dùng chữ ký cũ.

Mã:

- `useAppStore.ts`: `recordCapabilityAttempt(attempt, policy)` với `policy = { reviewIntervals, contract }`, dựng assessment cho phase transfer/review, gắn vào attempt, gọi `applyTransferOutcome` hoặc `applyReviewResult` với `assessReview(...).qualifies`, trả về assessment.
- `CapabilityTask.tsx`: `saveAttempt` truyền `contract = buildEvidenceContract(lesson)`; sau transfer không đạt, session ở lại phase `transfer` với khối kết quả (lý do bằng `TRANSFER_REASON_LABELS`) và nút "Thử transfer lại"; chỉ khi đạt mới sang `completed`. Test DOM trong `tests/features/practice/` cho cả hai nhánh.

## S4: Today, review và luyện lại (ac-3, ac-4)

Test trước:

- `tests/domain/progress/progress.test.ts`: `buildTodayQueue` cho lesson `in-progress` có review đến hạn trả cả `review` (xếp đầu) và `resume`; review chưa đến hạn không xuất hiện.
- `tests/features/today/TodayPage.test.tsx` (fake timers, `TZ` cố định): bài đến hạn lúc 00:00 xuất hiện sau khi tiến đồng hồ qua mốc và qua một chu kỳ 60 giây mà không có thao tác; nút "Luyện lại" mở bước xác nhận và chỉ gọi `startLessonRepeat` sau khi xác nhận; hủy thì không đổi progress; sau xác nhận `reviewStage` và `nextReviewAt` giữ nguyên và mục ôn vẫn hiện.
- `tests/features/practice/`: màn hoàn thành "Luyện lại mission" cũng có xác nhận; vào lesson với `entry: 'review'` khi đang `in-progress` mở phase review và không mất `activePhase` của vòng đang luyện.

Mã: `buildTodayQueue` phát thêm mục review; `useNow` trong `src/shared/hooks/` (khoảng 60 giây và `visibilitychange`); `TodayPage` dùng `useNow`, xác nhận inline trước `startLessonRepeat`, truyền `entry` qua `onStartLesson(lessonId, entry)`; `App` và `LessonFlow` chuyển `entry` xuống `CapabilityTask`; `initialSession(progress, entry)` chọn review theo ý định thay vì theo `status`.

## S5: persistence (ac-6)

Test trước trong `tests/shared/hooks/useAppStore.test.ts` và `tests/app/App.test.tsx`:

- `setItem` ném `QuotaExceededError`: hành động store (ví dụ `recordCapabilityAttempt`) không ném, phase tiến bình thường, `persistence.status` là `write-failed`; lần ghi thành công sau đó đưa về `ok`.
- `window.localStorage` ném khi truy cập: trạng thái `memory-only`.
- Hydrate bị từ chối: trạng thái `quarantined`, không ghi tự động (hành vi hiện có giữ nguyên).
- `App` hiện banner đúng vai trò và nội dung cho từng trạng thái, có liên kết tới Cài đặt; `ok` không hiện banner.
- Sự kiện `storage` cho khóa persist gọi `rehydrate` và state phản ánh giá trị mới; khi đang quarantine thì bỏ qua.

Mã: trường `persistence` trong `AppState` (không có trong `partialize`); bọc `setItem` trong `withPersistenceQuarantine`/`createAppPersistStorage` bằng try/catch cập nhật trạng thái; `getSafeStorage` đặt `memory-only`; `PersistenceBanner` ở `src/app/` hoặc `src/shared/`; listener `storage` đăng ký một lần ở `App`.

## S6: tài liệu và xác minh

Cập nhật `ARCHITECTURE.md` (mục Review scheduling, Progress và privacy: trường `assessment`, `contentRevision`, lịch ngày địa phương, trạng thái persistence). Chạy `npm run lint`, `npm run build` rồi `harnix workflow --run-checks --brief`. Đọc lại diff, đảm bảo không đổi `storageVersion` và không đổi `id` nội dung.

## Mỗi check chứng minh điều gì

- `check-domain-logic`: ac-1, ac-2, ac-3, ac-5 ở tầng domain và schema (transfer, review, lịch ngày địa phương, hợp đồng, validate attempt).
- `check-store-persistence`: ac-1, ac-2 ở store, ac-4 (giữ `reviewStage`), ac-6 (quota, memory-only, quarantine, đồng bộ tab).
- `check-state-ui`: ac-3 (Today cập nhật), ac-4 (xác nhận, mục ôn song song), ac-5 (Progress dùng assessment đã lưu), ac-6 (banner).
- `check-suite`: không hồi quy toàn dự án.

## Rollback

Mọi thay đổi nằm trong git. Dữ liệu đã lưu không cần migration (chỉ thêm trường tùy chọn, lịch cũ vẫn so sánh bằng `nextReviewAt <= now`); hoàn tác code đưa lại hành vi cũ mà không mất dữ liệu.
