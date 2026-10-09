# Kế hoạch: Mở rộng schema chương trình để nhận nội dung mới

## Checklist theo slice

- [x] S1: test không hard-code số bài, gộp validator, `docs/ADDING_LESSONS.md` và test khóa (ac-3)
- [x] S2: CEFR A2, rubric `dimension` và anchors, `reviewPolicy` (cận 180 ngày, `interleave`), Today xen kẽ review (ac-1, ac-4)
- [x] S3: section `vocabulary-review`, `listening-source`, `long-reading`: schema, kiểu canonical, bộ render tối thiểu (ac-1)
- [x] S4: story bank, `contentRevision`, migration `storageVersion` 6, store (ac-1, ac-2)
- [x] S5: tài liệu, lint, build, toàn bộ suite (ac-1 đến ac-4)

Đường dẫn tương đối với root repo. Mỗi slice viết test trước (RED) rồi sửa (GREEN); test hẹp trước, toàn bộ suite một lần ở S5.

## S1: không hard-code số bài, gộp validator, hướng dẫn thêm bài (ac-3)

Test trước:

- `tests/helpers/contentInventory.ts` (mới, không phải test): đọc `content/**/*.json` bằng `node:fs`, trả về `{ files, raw, catalog, byVersion, sourceCount, rawSourceCount, capabilityCounts }` với `sourceCount` đếm nguồn qua catalog (sections, practice contexts, reading ladder, và các nhóm mới sau S3) và `rawSourceCount` đếm node `type: 'source'` trong JSON thô.
- `tests/content/catalog.test.ts` (gộp từ `validateAllLessons.test.ts`): catalog nhận mọi file không lỗi và số lesson bằng số file; id lesson, section, exercise duy nhất; mỗi mission có rubric, prompt, retry, transfer, review và `reviewPolicy`; mỗi capability có ít nhất hai mission; không còn lesson v2. Không có con số tuyệt đối.
- `tests/content/contentQuality.test.ts` và `tests/content/content.test.ts`: thay `toHaveLength(18)`, `12`, `6`, `75` bằng so sánh với `contentInventory` (số file bằng số lesson, số nguồn duyệt được bằng số nguồn thô); các kiểm tra đường dẫn theo capability và theo thư mục pronunciation giữ nguyên.
- `tests/content/addingLessons.test.ts`: dựng catalog gồm toàn bộ lesson hiện có cộng một mission tổng hợp hợp lệ (nhân bản mission mẫu với `lessonId` mới) và chứng minh các quan hệ trên vẫn đúng với số lượng lớn hơn một, tức thêm bài không cần sửa test.
- `tests/scripts/check-docs-layout.test.mjs` và `scripts/check-docs-layout.mjs`: `docs/ADDING_LESSONS.md` tồn tại, README và `docs/CONTENT.md` liên kết tới nó, nó nêu các bước (chọn capability và level, đường dẫn `content/missions/<capability>/<lessonId>.json`, provenance và nguồn, cổng chất lượng, lệnh `npx vitest run tests/content` và `npm test`).

Mã: tạo helper, viết lại các test như trên, xóa `validateAllLessons.test.ts` sau khi rà từng khẳng định đã có chỗ ở nơi khác, viết `docs/ADDING_LESSONS.md`, thêm vào `REQUIRED_DOCS` và kiểm tra liên kết.

## S2: A2, rubric ngôn ngữ, lịch ôn và interleaving (ac-1, ac-4)

Test trước (`tests/content/schema.test.ts` và file mới `tests/content/schemaExtensions.test.ts`, `tests/domain/progress/progress.test.ts`):

- `cefrLevel: 'A2'` được chấp nhận ở `LessonV3Schema` và kiểu canonical; legacy v1, v2 vẫn chỉ B1 đến C1.
- Rubric: `dimension` hợp lệ gồm `task`, `accuracy`, `range`, `register`; giá trị lạ bị từ chối; `anchors` cần cả `met` và `notMet` không rỗng; rubric tối đa 6 mục nhưng 7 bị từ chối; lesson A2 thiếu tiêu chí ngôn ngữ hoặc thiếu anchors bị từ chối với thông báo rõ; lesson B1 hiện có vẫn hợp lệ không cần các trường này.
- `reviewPolicy`: `[1, 3, 7, 14, 21, 45]` hợp lệ; `[1, 200]` bị từ chối; `interleave` là boolean tùy chọn.
- `buildTodayQueue`: ba review đến hạn thuộc capability `A, A, B` với `interleave: true` được xếp A, B, A (trong mỗi capability giữ thứ tự đến hạn); cùng dữ liệu không bật `interleave` giữ thứ tự cũ; review chưa đến hạn không xuất hiện; không đổi vị trí của mục `resume`, `baseline`, `new`.
- `tests/features/practice/CapabilityTask.test.tsx` (hoặc file mới): `RubricEditor` hiển thị anchors đạt và chưa đạt khi tiêu chí có anchors và không hiển thị khối đó khi không có.
- `tests/features/catalog/CatalogPage.test.tsx`: bộ lọc level có A2 và lọc đúng một lesson A2 tổng hợp.

Mã: `schema.ts` (enum level, `RubricItemSchema` mở rộng, giới hạn rubric 6, `ReviewPolicySchema`, `superRefine` cho A2), kiểu `CanonicalLesson`, `CatalogPage` (option A2), `CatalogProgressItem.interleave`, `buildTodayQueue`, `TodayPage` truyền `interleave`, `RubricEditor`.

## S3: section mới (ac-1)

Test trước (`tests/content/schemaExtensions.test.ts`, `tests/features/lesson/SectionRenderer.test.tsx`):

- `vocabulary-review`: hợp lệ khi mọi `wordRefs` có trong `language-support` của lesson; từ không tồn tại, ít hơn 3 từ, ít hơn 3 bài tập bị từ chối.
- `listening-source`: hợp lệ với 2 đến 4 người nói và ít nhất 4 lượt; `speakerId` lạ, `durationSeconds` ngoài 30 đến 600, thiếu `gist` hoặc `detail` bị từ chối; `locale` sai định dạng bị từ chối; id exercise trùng giữa các nhóm hoặc với auto-check bị từ chối.
- `long-reading`: hợp lệ với ít nhất 3 phần và 300 đến 2000 từ; `locatePartId` không thuộc `parts`, ít hơn 2 câu scan, quá ít hoặc quá nhiều từ bị từ chối.
- Nguồn trong các section mới đi qua kiểm tra provenance: `sourceIds` không có trong `sourceRegistry` bị từ chối.
- `SectionRenderer`: mọi loại section trong schema có nhánh riêng (test lặp qua danh sách loại section từ schema); `long-reading` hiện mục lục có liên kết tới từng phần và câu hỏi; `listening-source` giấu transcript cho đến khi trả lời một câu hỏi, phát từng lượt bằng giọng của người nói (kiểm `locale` và `voiceHints` truyền xuống `playModelAudio`), ô ghi chú không lưu vào store; `vocabulary-review` hiện các bài tập; không loại section nào rơi vào nhánh `language-support`.

Mã: ba schema section, hợp nhất vào `LessonSectionSchema`, `superRefine` mức lesson (tham chiếu từ, id exercise duy nhất, provenance), kiểu canonical trong `normalization.ts`, các nhánh render trong `SectionRenderer.tsx` (hoặc tệp con `SectionRenderers.tsx` nếu file vượt 320 dòng), cập nhật `collectSources` trong `contentInventory`.

## S4: story bank, `contentRevision`, migration v6 (ac-1, ac-2)

Test trước:

- `tests/infrastructure/storage/progressStorage.test.ts` và `tests/infrastructure/storage/migrationV6.test.ts`: envelope v6 yêu cầu `contentRevision` ở mọi lesson progress và `storyBank`; migration từ v3, v4, v5 trả về v6 với `contentRevision: 1` và `storyBank: []` mà giữ nguyên mọi trường khác (so sánh sâu trước và sau); backup v3, v4, v5 và v6 đều parse được và xuất lại thành v6; v7 và v2 bị từ chối; `storyBank` chấp nhận tối đa 30 mục, nhãn 1 đến 60 ký tự, 1 đến 4 `competencyIds` thuộc `STORY_COMPETENCIES`, từ chối trường lạ (ví dụ `body`) và id trùng.
- `tests/content/schemaExtensions.test.ts`: `contentRevision` của lesson mặc định 1 và nhận số nguyên dương; `storyBank` ở lesson nhận năng lực hợp lệ và từ chối năng lực lạ hoặc `minStories` ngoài 1 đến 5.
- `tests/domain/progress/progress.test.ts`: `createEmptyLessonProgress(3).contentRevision` là 3; `isLessonProgressStale` đúng khi revision của lesson lớn hơn của progress.
- `tests/shared/hooks/useAppStore.test.ts`: `addStory`, `updateStory`, `removeStory`, `markStoryPracticed` cập nhật và lưu; không vượt 30 mục; hydrate từ dữ liệu v5 đã lưu migrate lên v6 và vẫn dùng được; backup xuất `storageVersion: 6` và nhập lại giữ `storyBank`.
- Cập nhật các test hiện kiểm `storageVersion: 5` sang 6 (store, storage, Settings, App).

Mã: `progressStorage.ts` (schema v6, chuỗi migration v3→v4→v5→v6, `parseBackup`), `progress.ts` (`contentRevision`, `StoryEntry`, `isLessonProgressStale`), `useAppStore.ts` (version 6, `migratePersistedAppState` nhận 3 đến 6, `storyBank` trong state và `partialize`, bốn action, `createCapabilityBackup` v6, `restoreEnvelope`), `schema.ts` (`contentRevision`, `storyBank`, `STORY_COMPETENCIES`), `Settings` (thông báo import nêu v6).

## S5: tài liệu và xác minh

Cập nhật `docs/CONTENT.md` (A2, ba loại section, rubric dimension và anchors, `reviewPolicy`, `contentRevision`, story bank), `docs/ARCHITECTURE.md` (envelope v6, story bank, interleaving), `docs/ADDING_LESSONS.md` nếu cần. Chạy `npm run lint`, `npm run build`, `npm run check:docs`, `npm run check:bundle`, `harnix workflow --run-checks --brief`.

## Mỗi check chứng minh điều gì

- `check-schema-extension`: ac-1 (A2, section mới, story bank ở lesson, render không vỡ) và ac-4 (rubric, reviewPolicy, interleaving, anchors).
- `check-migration-revision`: ac-1 (story bank trong progress) và ac-2 (v6, migration từ mọi version cũ, backup).
- `check-catalog-counts`: ac-3 (không hard-code, validator gộp, thêm bài không sửa test, tài liệu hướng dẫn).
- `check-suite`: không hồi quy toàn dự án.

## Rollback

Mọi thay đổi nằm trong git. Dữ liệu người dùng: migration chỉ thêm trường nên hoàn tác code mà không hoàn tác dữ liệu sẽ làm schema cũ từ chối envelope v6; app chưa phát hành nên chấp nhận, ghi vào rủi ro. Bản backup v5 cũ vẫn nhập được ở bản mới.
