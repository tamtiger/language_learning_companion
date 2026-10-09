# PRD: Mở rộng schema chương trình để nhận nội dung mới

## Vấn đề

Đợt mở rộng nội dung (task 10 đến 13) cần các loại nội dung mà schema hiện chưa biểu đạt được. Các điểm dưới đây đã được xác minh trên `src/content/schema.ts`, `src/features/lesson/SectionRenderer.tsx` và các test hiện có.

1. **Không có A2.** `cefrLevel` của `LessonV3Schema` và `CanonicalLesson` chỉ nhận `B1 | B2 | C1`; bộ lọc level của `CatalogPage` cũng vậy. Task 10 cần 6 mission A2.
2. **Từ vựng chưa ôn lại được.** `VocabularyItemSchema` có `collocations` (mặc định rỗng, không bắt buộc) nhưng không có phần ôn từ vựng gắn với từ đã học; không thể kiểm một bài có ôn lại các từ của nó.
3. **Không có nguồn nghe hội thoại nhiều người.** `SourceSectionSchema` có `format: 'dialogue'` nhưng chỉ là một chuỗi văn bản: không có người nói, giọng đọc, transcript ẩn, câu hỏi gist và detail, ghi chú khi nghe.
4. **Không có bài đọc dài có cấu trúc.** `SourceSectionSchema.content` là một khối chuỗi: không có mục lục, không có câu hỏi định vị (skim/scan) trỏ về đúng phần.
5. **Không có story bank.** Mission phỏng vấn behavioral cần câu chuyện của chính người học; không có chỗ khai báo năng lực mà mission dùng, cũng không có chỗ lưu metadata các câu chuyện (nhãn và năng lực) trong tiến độ.
6. **Rubric chỉ có đề tài chung.** `RubricItemSchema` chỉ có `label` và `description`: không phân biệt tiêu chí ngôn ngữ (accuracy, range, register) với tiêu chí nhiệm vụ, và không có mẫu neo "đạt trông như thế nào, chưa đạt trông như thế nào". Rubric bị giới hạn 3 đến 5 mục.
7. **Lịch ôn thiếu biểu đạt.** `ReviewPolicySchema.intervalDays` chấp nhận số nguyên dương tăng dần nhưng không có cận trên và không có cách nói "xen kẽ các lesson khi ôn"; `buildTodayQueue` sắp xếp review theo ngày đến hạn rồi capability.
8. **Không có phiên bản nội dung.** Progress không biết lesson đã đổi sau khi người học bắt đầu; `LessonProgress` không lưu phiên bản nội dung.
9. **Số bài hard-code trong test.** `catalog.test.ts` (12 mission, 6 legacy), `content.test.ts` (12, 6), `contentQuality.test.ts` (18 lesson, 12 v3, 6 v1, 75 source, 18 file), `validateAllLessons.test.ts` (12, 6). Thêm một bài là phải sửa 4 file test.
10. **Validator trùng lặp.** `validateAllLessons.test.ts` kiểm id duy nhất của lesson, section và exercise, trùng với `superRefine` của schema và với `catalog.test.ts` ("loads every bundled JSON"). Không có tài liệu hướng dẫn thêm bài.
11. **`SectionRenderer` rơi vào nhánh cuối cho mọi loại section lạ.** Nhánh cuối giả định `language-support` và truy cập `section.vocabulary`; một loại section mới sẽ làm vỡ trang nếu không có nhánh riêng.

## Mục tiêu

Schema, rubric, lịch ôn và test cho phép thêm bài A2, bài nghe, bài đọc dài, mission phỏng vấn và từ vựng mà không phải sửa test hay làm hỏng tiến độ cũ.

## Không thuộc phạm vi

- Viết bài học mới (task 10 đến 13) và giao diện phong phú cho nghe, đọc dài, story bank (task 11 và 12); task này chỉ thêm kiểu, kiểm tra, trạng thái lưu và bộ render tối thiểu để không vỡ.
- Hiển thị tiến độ nghe và đọc dài ở Progress (task 12).
- Thay đổi hành vi của 12 mission hiện có hoặc backfill rubric ngôn ngữ cho chúng (task 13).
- Sửa chi tiết UI ôn từ vựng theo lịch riêng (chỉ có phần ôn nằm trong bài).

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Schema hỗ trợ: CEFR A2; phần ôn từ vựng (`vocabulary-review`) tham chiếu từ đã học; nguồn nghe nhiều người (`listening-source`: người nói, giọng, transcript ẩn, gist/detail, ghi chú khi nghe); bài đọc dài (`long-reading`: mục lục, câu hỏi định vị skim/scan); story bank (khai báo năng lực ở lesson, metadata câu chuyện ở progress, không lưu nội dung). `SectionRenderer` có nhánh riêng cho mọi loại section. |
| ac-2 | `contentRevision` của lesson và của progress được thêm kèm migration `storageVersion` 5 lên 6 không làm hỏng backup và dữ liệu cũ (v3, v4, v5 đều nhập được). |
| ac-3 | Số bài không còn hard-code trong test (suy ra từ nội dung); validator trùng lặp được gộp; có `docs/ADDING_LESSONS.md` checklist từng bước, được test khóa; một test chứng minh thêm bài không cần sửa test. |
| ac-4 | Rubric có `dimension` (task, accuracy, range, register) và mẫu neo đạt/chưa đạt; lesson A2 bắt buộc có tiêu chí ngôn ngữ kèm mẫu neo; `reviewPolicy` hỗ trợ khoảng ôn dài đến 45 ngày (cận trên 180) và `interleave`; Today xen kẽ review theo capability khi lesson bật `interleave`. |

## Quyết định thiết kế

- **Phần lớn thay đổi là thêm tùy chọn.** Mọi trường mới trong lesson đều tùy chọn hoặc có mặc định; 12 mission và 6 bài pronunciation hiện có không đổi và vẫn qua mọi test.
- **Loại section mới.** Ba loại, đều có `id`, `title`:
  - `vocabulary-review`: `wordRefs` (≥ 3 từ phải có trong `language-support` của cùng lesson) và `exercises` (≥ 3). Kiểm ở `LessonV3Schema.superRefine`.
  - `listening-source`: `speakers` (2 đến 4: `id`, `label`, `locale`, `voiceHints`), `turns` (≥ 4: `speakerId` phải thuộc `speakers`, `text`), `durationSeconds` (30 đến 600), `gist` (≥ 1 câu hỏi) và `detail` (≥ 2) là `ExerciseSchema`, `listeningNotes` tùy chọn (`prompt` và 1 đến 5 `fields`; ghi chú chỉ ở phiên), `provenance` tùy chọn như `SourceSection`. Transcript luôn ẩn cho đến khi người học trả lời gist hoặc detail.
  - `long-reading`: `format` (`rfc | api-reference | changelog | log | issue | tutorial | prose`), `parts` (≥ 3: `id`, `heading`, `content`), tổng số từ 300 đến 2000, `skim` (≥ 1 câu hỏi gist) và `scan` (≥ 2 câu hỏi, mỗi câu có `locatePartId` thuộc `parts`), `provenance` tùy chọn.
  - Id exercise của các nhóm câu hỏi mới nằm trong kiểm tra id duy nhất toàn lesson.
- **Bộ render tối thiểu nhưng đủ dùng.** `SectionRenderer` render `vocabulary-review` bằng `AutoCheck` sẵn có; `long-reading` bằng mục lục liên kết tới từng phần, nội dung các phần và `AutoCheck` cho skim và scan; `listening-source` bằng trình phát từng lượt qua `ModelAudioPlayer` (giọng theo người nói), transcript ẩn đến khi trả lời một câu hỏi, ô ghi chú không lưu và `AutoCheck` cho gist và detail. Task 11 và 12 mở rộng giao diện sau.
- **Story bank.**
  - Lesson khai báo `storyBank?: { competencies: string[] (1 đến 6, thuộc `STORY_COMPETENCIES`), minStories: 1 đến 5 }`.
  - `STORY_COMPETENCIES` (ownership, conflict, failure, leadership, ambiguity, influence, mentoring, delivery) là hằng số dùng chung.
  - Progress có `storyBank` ở mức envelope: tối đa 30 mục `{ id, label (1 đến 60 ký tự), competencyIds (1 đến 4), createdAt, lastPracticedAt | null }`. Chỉ metadata: không có nội dung câu chuyện; nhãn là chuỗi ngắn người học tự đặt, được ghi nhận như metadata và hiển thị trong backup.
  - Store có `addStory`, `updateStory`, `removeStory`, `markStoryPracticed`; giao diện soạn thảo để task 11.
- **Phiên bản nội dung và migration v6.** `LessonV3Schema.contentRevision` là số nguyên dương, mặc định 1. `LessonProgress.contentRevision` (bắt buộc ở v6) ghi phiên bản nội dung mà vòng học hiện tại bắt đầu; `createEmptyLessonProgress(contentRevision = 1)`. Migration 5 lên 6 thêm `contentRevision: 1` cho mọi lesson và `storyBank: []`; v3, v4 đi qua chuỗi migration sẵn có rồi lên 6. Hàm thuần `isLessonProgressStale(progress, lesson)` cho UI dùng sau. Persist version của Zustand lên 6 và vẫn nhận 3, 4, 5.
- **Rubric.** `RubricItemSchema` thêm `dimension?: 'task' | 'accuracy' | 'range' | 'register'` và `anchors?: { met, notMet }`; số mục tối đa 6. Quy tắc: lesson `A2` phải có ít nhất một tiêu chí `accuracy`, `range` hoặc `register` và mọi tiêu chí của nó có anchors. Lesson khác không bắt buộc (không làm vỡ 12 mission). `RubricEditor` hiển thị anchors khi có.
- **Lịch ôn.** `intervalDays` mỗi giá trị ≤ 180 (khoảng 21 và 45 hợp lệ); `reviewPolicy.interleave?: boolean`. Khi nhiều review đến hạn và các lesson tương ứng bật `interleave`, `buildTodayQueue` xếp xen kẽ theo capability (vòng tròn, trong mỗi capability giữ thứ tự đến hạn); lesson không bật giữ thứ tự cũ.
- **Test không hard-code.** Helper `tests/helpers/contentInventory.ts` đọc `content/**` từ đĩa và trả về file thô, catalog, số lesson theo phiên bản, số nguồn và số nguồn thô; các test so sánh quan hệ (catalog nhận đủ mọi file, số nguồn duyệt được bằng số nguồn thô, mỗi capability có ít nhất hai mission, đường dẫn theo capability) thay vì số tuyệt đối. `validateAllLessons.test.ts` bị gộp vào `catalog.test.ts`.
- **`docs/ADDING_LESSONS.md`** và test khóa trong `scripts/check-docs-layout.mjs`: file tồn tại, nêu đủ các bước (chọn capability và level, tạo file đúng đường dẫn, các trường bắt buộc theo level, provenance, cổng chất lượng, chạy lệnh kiểm), được README và `docs/CONTENT.md` liên kết.

## Rủi ro

- Nâng `storageVersion` lên 6 chạm nhiều test (kiểm `storageVersion: 5`) và `docs/ARCHITECTURE.md`; sửa cùng slice, dữ liệu cũ vẫn nhập được (test migration).
- Story bank thêm dữ liệu người dùng vào backup: nhãn có thể chứa thông tin nhạy cảm; giới hạn 60 ký tự, ghi rõ trong tài liệu privacy, không lưu nội dung câu chuyện.
- Bộ render tối thiểu có thể kém trải nghiệm; task 11 và 12 hoàn thiện.
- `listening-source` dựa vào TTS của thiết bị (giọng khác nhau theo máy); locale và voiceHints theo người nói chỉ là yêu cầu, không đảm bảo giọng.
- Interleaving đổi thứ tự Today cho lesson bật nó; mặc định tắt để không đổi hành vi hiện có.
- Gộp validator có thể làm mất một khẳng định đang chỉ nằm ở một file; rà từng khẳng định trước khi xóa.
