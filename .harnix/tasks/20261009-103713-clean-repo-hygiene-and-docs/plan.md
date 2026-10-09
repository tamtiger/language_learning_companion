# Kế hoạch: Dọn repo, đồng bộ tài liệu và quy trình release

## Checklist theo slice

- [x] S1: bố cục tài liệu: `git mv` vào `docs/`, xóa 4 prompt, chuyển `LEARNER_AUDIT_PROMPT`, sửa link, test `check-docs-layout` (ac-6, ac-7, ac-8)
- [x] S2: quy tắc release trong `docs/RELEASE.md`, sửa `check-changelog-rule` và `check-release`, npm script, test (ac-1, ac-8)
- [x] S3: đồng bộ nội dung tài liệu: `[Unreleased]`, streak, số mission, test khóa (ac-2)
- [x] S4: xóa dead code và `CAPABILITY_IDS` một nguồn (ac-3)
- [x] S5: selector thay cho subscribe cả store, test khóa (ac-4)
- [x] S6: giảm bundle (lazy, vendor), `check-bundle-size`, test (ac-5)
- [x] S7: lint, build, toàn bộ suite, đọc lại diff (ac-1 đến ac-8)

Đường dẫn tương đối với root repo. Mỗi slice viết test trước (RED), rồi sửa (GREEN); chạy test hẹp trước, toàn bộ suite một lần ở S7.

## S1: bố cục tài liệu (ac-6, ac-7, ac-8)

Test trước: `tests/scripts/check-docs-layout.test.mjs` (dual runner như `check-node-engine.test.mjs`), kiểm tra:

- Root chỉ chứa `.md` thuộc `README.md`, `CHANGELOG.md`, `AGENTS.md`.
- `docs/` có `ARCHITECTURE.md`, `CONTENT.md`, `PRODUCT.md`, `START_HERE.md`, `CONVENTIONS.md`, `EVALUATION_PROTOCOL.md`, `RELEASE.md` và `docs/prompts/LEARNER_AUDIT_PROMPT.md`.
- Bốn prompt cũ không còn trong repo và không có `.md` đang dùng (ngoài `CHANGELOG.md` lịch sử) nhắc tên chúng.
- Mọi link markdown tương đối (`[x](./y.md)`, `[x](../y.md#a)`) trong `README.md`, `AGENTS.md` và `docs/**` trỏ tới file tồn tại; bỏ qua URL tuyệt đối và neo.
- `package.json` có script `check:changelog` trỏ `scripts/check-changelog-rule.mjs`, và không file nào ngoài `CHANGELOG.md` nhắc script đó bằng tên không đuôi.
- Test tự kiểm bằng cây thư mục giả để chứng minh bộ kiểm bắt link gãy và file thừa ở root.

Mã: `git mv` bốn tài liệu và `LEARNER_AUDIT_PROMPT.md`; `git rm` bốn prompt; sửa link trong `README.md`, các `docs/*.md` (đường dẫn tương đối giữa các tài liệu và tới `content/`, `src/`), và `scripts/check-node-engine.mjs` cùng test của nó (đổi `START_HERE.md` thành `docs/START_HERE.md`). Quét `tests/` và `scripts/` tìm đường dẫn cũ đọc từ đĩa (`git grep -E "(ARCHITECTURE|CONTENT|PRODUCT|START_HERE)\.md"`).

## S2: quy trình release (ac-1, ac-8)

Test trước:

- `tests/scripts/check-changelog-rule.test.mjs`: với thư mục tạm có `docs/RELEASE.md` đủ 12 câu, `package.json`, `package-lock.json`, `CHANGELOG.md` khớp thì pass; thiếu một câu, lệch version giữa `package.json` và lock, hoặc heading release đầu tiên khác version thì fail đúng thông báo; heading pre-release `1.2.0-dev.1` được nhận; mục `[Unreleased]` đứng trước heading release không làm lỗi.
- `tests/scripts/check-release.test.mjs`: version lấy từ `package.json` (không hard-code); fail khi lock lệch hoặc thiếu heading đúng version.

Mã:

- `docs/RELEASE.md`: 12 câu quy tắc script đang đòi, thêm điều cho epic (task giữa epic không release, task cuối viết một entry và tăng version một lần) và điều về `[Unreleased]` (nội dung chưa phát hành ghi ở đó, khi release thì đổi thành heading version).
- `scripts/check-changelog-rule.mjs`: đọc `docs/RELEASE.md`, nhận root qua đối số hoặc `process.cwd()` để test; regex heading cho phép hậu tố pre-release và bỏ qua `[Unreleased]`; export hàm `checkChangelogRule(root)`.
- `scripts/check-release.mjs`: bỏ `expectedVersion` và ngày hard-code, đọc từ `package.json` và heading release đầu tiên; export `checkRelease(root)`.
- `package.json`: thêm `check:changelog` và `check:release`.
- Mỗi script chạy được trực tiếp bằng `node` (kiểm `import.meta.url` so với `process.argv[1]`) và import được từ test.

## S3: đồng bộ nội dung tài liệu (ac-2)

Test trước (thêm vào `check-docs-layout.test.mjs`):

- `CHANGELOG.md` có `## [Unreleased]` trước heading release đầu tiên.
- `docs/PRODUCT.md` không chứa "streak".
- README, CONTENT và ARCHITECTURE không còn cụm "six mission" và mọi chỗ nêu số mission đều là 12; số 12 phải bằng số file mission thật trong `content/missions/**` (đọc từ đĩa).

Mã: thêm `[Unreleased]` (nội dung "Chưa có thay đổi nào được phát hành" cho tới task cuối epic) và đổi câu mở đầu CHANGELOG cho đúng; xóa "streak" ở `PRODUCT.md`; sửa "six mission flows" ở `ARCHITECTURE.md` thành "các luồng mission"; rà `README.md` và `CONTENT.md` các câu về số mission và link.

## S4: dead code và nguồn id capability (ac-3)

Test trước: `tests/domain/capabilityIds.test.ts` kiểm `CAPABILITY_IDS` là nguồn duy nhất: schema chấp nhận đúng các id đó, `CAPABILITY_ORDER` bằng `CAPABILITY_IDS`, enum trong `progressStorage` bằng `CAPABILITY_IDS`, `Record` nhãn của Catalog có đủ khóa; và một test quét `src/` không có literal `'international-interview'` ngoài `schema.ts`, `CatalogPage.tsx` (nhãn) và `TodayPage.tsx` (ý định). Xóa các test chỉ gọi hàm đã xóa (`isQualifyingTransfer`, `isRubricFullyMet`, `isIndependentAttempt`, `canCompleteCapabilityMission`, `setTheme`, `setCefrLevel`) và giữ test hành vi còn lại.

Mã: xóa `src/types/progress.ts`; xóa các hàm và action trên; `schema.ts` export `CAPABILITY_IDS`, `content.ts`, `progress.ts` và `progressStorage.ts` dùng lại; kiểu hóa nhãn Catalog và ý định Today bằng `Record<CapabilityId, …>`. Không đụng `theme`, `currentCefrLevel` trong dữ liệu lưu.

## S5: selector (ac-4)

Test trước: `tests/conventions/storeSelectors.test.ts` quét `src/app` và `src/features` không có `useAppStore()` không đối số (regex `useAppStore\(\)`), kèm test tự kiểm; và một test render đếm số lần render của `Settings` hoặc `CatalogPage` không đổi khi một trường không liên quan thay đổi.

Mã: đổi `App`, `CatalogPage`, `ProgressPage`, `Settings`, `TodayPage` sang selector từng trường (`useAppStore((state) => state.lessons)` và tương tự), hành động lấy riêng. `Settings` cần `theme` và `lessonProgress` để xuất backup: dùng `useAppStore.getState()` trong handler thay vì subscribe cả store.

## S6: bundle (ac-5)

Test trước: `tests/scripts/check-bundle-size.test.mjs` với thư mục `dist/assets` giả: chunk trên 500 kB fail, dưới ngưỡng pass, thiếu thư mục thì báo lỗi rõ.

Mã: `scripts/check-bundle-size.mjs` (ngưỡng 500 kB, nhận `dist` qua đối số) và npm script `check:bundle` (`npm run build && node scripts/check-bundle-size.mjs`). `App.tsx` dùng `React.lazy` + `Suspense` (nhãn "Đang tải…" trong `role="status"`) cho `LessonFlow`, `ProgressPage`, `Settings`; `vite.config.ts` thêm `build.rolldownOptions.output.codeSplitting` tách `vendor`. Nếu chunk chính còn trên 500 kB thì tách thêm chunk `content`. Cập nhật test render để chờ `findBy*` khi mở lesson.

## S7: xác minh

Chạy `npm run lint`, `npm run build`, `npm run check:changelog`, `npm run check:release`, rồi `harnix workflow --run-checks --brief`. Đọc lại diff của file di chuyển (`git status` phải hiện rename, không phải xóa rồi thêm), và `git grep` xác nhận không còn đường dẫn tài liệu cũ.

## Mỗi check chứng minh điều gì

- `check-release-scripts`: ac-1 (quy tắc, script và test release).
- `check-refactor`: ac-3, ac-4 (dead code đã xóa, nguồn id duy nhất, selector) mà hành vi UI vẫn đúng.
- `check-bundle`: ac-5 (build thật và mọi chunk dưới 500 kB).
- `check-docs-layout`: ac-2, ac-6, ac-7, ac-8 (bố cục, link, nội dung tài liệu, tham chiếu script).
- `check-suite`: không hồi quy toàn dự án.

## Rollback

Mọi thay đổi nằm trong git; di chuyển tài liệu là rename nên hoàn tác không mất lịch sử. Không đụng dữ liệu lưu trữ hay `.harnix`.
