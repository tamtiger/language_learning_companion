# Kế hoạch: Siết toàn vẹn bài kiểm tra

## Checklist theo slice

- [x] S1: `option_order.ts` (hàm xáo trộn có seed) và áp dụng cho choice, ordering, matching, perception, reading ladder (ac-1, ac-2)
- [x] S2: `exercise_grading.ts` (chuẩn hóa fill, `acceptedAnswers`) và field mới trong schema (ac-3)
- [x] S3: `assessment_quality.test.ts` viết trước, đỏ trên nội dung hiện tại (ac-4)
- [x] S4a: viết lại nội dung `content/missions/workplace-communication` và `technical-reading` (ac-5)
- [x] S4b: viết lại nội dung `content/missions/international-meetings` và `technical-explanation` (ac-5)
- [x] S4c: viết lại nội dung `content/missions/international-interview` và `technology-learning` (ac-5)
- [x] S4d: viết lại `content/reference/pronunciation/*` kể cả chuyển `q3` thành choice (ac-3, ac-5)
- [x] S5: cập nhật `CONTENT.md` với quy tắc viết đáp án (ac-4); changelog do task đóng release của epic viết vì CHANGELOG là append-only
- [x] S6: chạy lint, build và toàn bộ suite, ghi evidence (ac-1 đến ac-5)

Tất cả đường dẫn tương đối với root repo. Test theo thứ tự RED rồi GREEN; check nào chưa có file test thì viết test trước và xác nhận nó fail đúng lý do.

## S1: xáo trộn lựa chọn (ac-1, ac-2)

File mới `src/features/lesson/option_order.ts`:

- `seededShuffle<T>(items: readonly T[], seed: string): T[]`: xmur3 băm `seed` thành số 32 bit, mulberry32 sinh số, Fisher-Yates trên bản sao. Không đổi mảng gốc.
- `orderOptions(options: readonly string[], seed: string, avoid?: readonly string[]): string[]`: gọi `seededShuffle`; khi `avoid` là một thứ tự cần tránh (dùng cho `ordering` với `correctAnswer`) và kết quả trùng thứ tự đó, dịch vòng một vị trí. Với mảng 1 phần tử trả về nguyên bản.
- `useShuffleSalt(): string`: `useState(() => Math.random().toString(36).slice(2))`, ổn định trong vòng đời component.

Áp dụng:

- `SectionRenderer.tsx` (`AutoCheck`): `choice` và các `ordering` dùng seed `${lessonId}:${exercise.id}:${salt}`; `matching` xáo trộn danh sách giá trị của dropdown.
- `PerceptionPractice.tsx`: `useMemo` theo `item.id` để mỗi câu có thứ tự riêng, ổn định khi render lại.
- `ReadingLadderPractice.tsx`: tương tự cho `extractionItems`.

RED: `src/features/lesson/option_order.test.ts` gồm
1. cùng seed cho cùng thứ tự và khác seed cho ít nhất hai thứ tự khác nhau;
2. mọi phần tử được giữ nguyên, không trùng lặp;
3. `orderOptions` với `avoid` không bao giờ trả lại đúng thứ tự cần tránh, kể cả mảng 2 phần tử;
4. component: giả lập `Math.random` để render `ordering` và khẳng định các nút không theo thứ tự đáp án; render `matching` và khẳng định dropdown không liệt kê theo thứ tự cặp; render `PerceptionPractice` và `ReadingLadderPractice` với nhiều giá trị `Math.random` khác nhau và khẳng định đáp án đúng xuất hiện ở ít nhất hai vị trí khác nhau.

GREEN: triển khai tối thiểu để các test trên đạt. Test hiện có trong `SectionRenderer.test.tsx` và `CapabilityTask.test.tsx` chọn theo tên nút; nếu test nào dựa vào vị trí thì sửa test sang chọn theo tên.

## S2: chấm fill (ac-3)

- File mới `src/features/lesson/exercise_grading.ts` nhận `isExerciseCorrect` và `hasCompleteAnswer` chuyển từ `SectionRenderer.tsx` (giữ nguyên hành vi `choice`, `matching`, `ordering`).
- `normalizeAnswer(value: string): string`: NFC, thay nháy cong bằng nháy thẳng (`‘ ’` thành `'`, `“ ”` thành `"`), gộp khoảng trắng, hạ chữ thường, bỏ dấu `. , ; : ! ?` ở cuối. Không đổi ký hiệu IPA (`ˈ`, `ˌ` giữ nguyên).
- `fill` đúng khi `normalizeAnswer(answer)` nằm trong tập `[...correctAnswer, ...(acceptedAnswers ?? [])]` đã chuẩn hóa.
- Schema `ExerciseSchema` (`src/content/schema.ts`) thêm `acceptedAnswers: z.array(NonEmptyString).optional()`; superRefine chỉ cho phép khi `type === 'fill'`, các phần tử không trùng nhau và không trùng `correctAnswer` sau chuẩn hóa.
- `content/reference/pronunciation/pronunciation-sounds.json` câu `q3`: chuyển thành `choice` (ở S4d), nên không còn `fill` nào phụ thuộc U+02C8.

RED: `src/features/lesson/exercise_grading.test.ts` gồm các ca nháy cong và nháy thẳng, hoa/thường, khoảng trắng thừa, dấu chấm cuối, NFC và NFD, `acceptedAnswers` được chấp nhận, đáp án sai vẫn sai, ký hiệu `ˈ` không bị coi là `'`; cộng một test nội dung khẳng định không còn bài `fill` nào chỉ chấp nhận ký tự ngoài ASCII mà thiếu `acceptedAnswers`.

## S3: cổng chất lượng nội dung (ac-4)

File mới `src/content/assessment_quality.test.ts` dùng `getBundledCatalog()`. Ngưỡng nằm ở một hằng số `ASSESSMENT_THRESHOLDS` đầu file, đúng bảng trong `prd.md`. Quy tắc kiểm tra gồm:

- số lựa chọn 3 đến 4 cho perception, ladder và choice một đáp án;
- tỉ lệ đáp án đúng dài nhất: tối đa 45% toàn corpus, tối đa 60% trong từng bài;
- tỉ lệ độ dài lựa chọn dài nhất so với ngắn nhất tối đa 2,5;
- không có hai lựa chọn trùng nhau sau khi chuẩn hóa;
- tương đương từ khóa: nếu đáp án đúng nằm nguyên văn trong audio (`text` hoặc `transcript`) hoặc `trainingSource.content`, phải có ít nhất một distractor cũng nằm nguyên văn;
- `ordering` có `options` khác thứ tự `correctAnswer`.

Test cũng có các ca tự kiểm bằng dữ liệu giả cho từng quy tắc để chứng minh cổng thật sự bắt được lỗi. RED: chạy trên nội dung hiện tại và thấy fail cho nhiều quy tắc.

## S4: viết lại nội dung (ac-5, ac-3)

Làm theo bốn nhóm, mỗi nhóm đọc từng item, giữ nguyên ý định kiểm tra và mức CEFR:

- S4a: `workplace-communication` và `technical-reading`.
- S4b: `international-meetings` và `technical-explanation`.
- S4c: `international-interview` và `technology-learning`.
- S4d: sáu bài `pronunciation`; `q3` của `pronunciation-sounds` thành `choice` với ba lựa chọn rõ nghĩa; `runbook-recovery-order` và `pronunciation-shadowing-routine` có `options` không theo thứ tự đáp án.

Quy tắc viết: 3 đến 4 lựa chọn, distractor là nhầm lẫn có thật (đổi chủ thể, đổi số liệu, đổi quan hệ nhân quả, hiểu sai hành động), độ dài tương đương, ít nhất một distractor cũng dùng từ khóa của audio. Không đổi `id` item để không phá dữ liệu tiến độ đã lưu. Mỗi nhóm sau khi viết chạy `npx vitest run src/content` để thấy số lỗi của cổng giảm dần; cổng chỉ phải xanh hoàn toàn khi hết S4d.

## S5: tài liệu (ac-4)

Thêm vào `CONTENT.md` mục "Viết đáp án" nêu các quy tắc ở S4 và trỏ tới `src/content/assessment_quality.test.ts` kèm ý nghĩa từng ngưỡng. Không sửa `CHANGELOG.md` ở task này vì file là append-only và đã có mục `[Unreleased]` cũ sai vị trí; task đóng release của epic viết changelog cho toàn bộ epic và không tăng version ở đây.

## S6: xác minh

Chạy `npm run lint`, `npm run build` rồi các check bắt buộc bằng `harnix workflow --run-checks --brief`. Kiểm tra ngoài các check: chạy tay một lesson spoken để xem lựa chọn đã xáo trộn (nếu có thể chạy app).

## Mỗi check chứng minh điều gì

- `check-option-order`: ac-1 và ac-2, hành vi xáo trộn ở util và ở năm component.
- `check-grading`: ac-3, chuẩn hóa và `acceptedAnswers` ở engine, `q3` không còn phụ thuộc U+02C8.
- `check-assessment-gate`: ac-4 và ac-5, cổng chất lượng tự kiểm bằng dữ liệu giả và chạy trên toàn bộ nội dung đã viết lại.
- `check-suite` (toàn bộ test): không có hồi quy.

## Rollback

Mọi thay đổi nằm trong git. Nếu cổng quá chặt khiến nội dung hợp lệ bị chặn, chỉnh `ASSESSMENT_THRESHOLDS` kèm lý do thay vì tắt quy tắc. Dữ liệu tiến độ không đổi vì không có `id` item nào bị đổi.
