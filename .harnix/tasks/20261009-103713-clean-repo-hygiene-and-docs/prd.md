# PRD: Dọn repo, đồng bộ tài liệu và quy trình release

## Vấn đề

Các điểm dưới đây đã được xác minh trên repo hiện tại.

1. **Quy trình release gãy.** `scripts/check-changelog-rule.mjs` đòi 12 câu quy tắc trong `AGENTS.md` nhưng `AGENTS.md` (do Harnix quản lý) không có quy tắc nào, nên script luôn ném lỗi. Script không có npm script. `scripts/check-release.mjs` hard-code `expectedVersion = '1.1.5'` và ngày `2026-08-28`, nên đổi version là gãy dù repo đúng. Không script nào có test. Regex release `^## \[(\d+\.\d+\.\d+)\]` không nhận version pre-release.
2. **Tài liệu lệch code.**
   - `PRODUCT.md:54` nhắc "streak" trong khi app không có streak (không có từ này trong `src/`).
   - `CHANGELOG.md` không có mục `[Unreleased]`, dòng đầu nói "chưa phát hành version công khai" trong khi đang có 1.1.5; một mục cũ ghi số test hard-code nhưng là lịch sử nên giữ nguyên.
   - Số mission và mô tả test ở `ARCHITECTURE.md` ("six mission flows") cần đối chiếu với 12 mission hiện có.
3. **Tài liệu rải ở root.** `ARCHITECTURE.md`, `CONTENT.md`, `PRODUCT.md`, `START_HERE.md` nằm cùng `README.md`, `CHANGELOG.md` và 5 file prompt ở root, trong khi `docs/` đã có `CONVENTIONS.md` và `EVALUATION_PROTOCOL.md`.
4. **Prompt một lần còn tồn tại.** `IMPROVEMENT_PROMPT.md`, `UX_RESEARCH_REFACTOR_PROMPT.md`, `LEARNING_FEATURE_RESEARCH_PROMPT.md` và `CURRICULUM_RESEARCH_PROMPT.md` đã hoàn thành vai trò (đợt review đã chạy) và chỉ tham chiếu lẫn nhau. `LEARNER_AUDIT_PROMPT.md` còn dùng lại được.
5. **Dead code.**
   - `src/types/progress.ts` là facade re-export không có nơi nào import.
   - Actions `setTheme` và `setCefrLevel` của store chỉ được test gọi, không có UI.
   - `canCompleteCapabilityMission` (`src/domain/learning/flow.ts`) chỉ có test dùng.
   - `isQualifyingTransfer`, `isRubricFullyMet`, `isIndependentAttempt` (`src/domain/progress/progress.ts`) chỉ có test dùng và trùng với `assessTransfer`.
6. **Id capability lặp ở 6 nơi.** `src/content/content.ts`, `src/content/schema.ts`, `src/domain/progress/progress.ts` (`CAPABILITY_ORDER`), `src/features/catalog/CatalogPage.tsx`, `src/features/today/TodayPage.tsx` và `src/infrastructure/storage/progressStorage.ts` mỗi nơi tự liệt kê danh sách.
7. **Subscribe cả store.** `App`, `CatalogPage`, `ProgressPage`, `Settings`, `TodayPage` gọi `useAppStore()` không selector nên render lại mỗi khi bất kỳ trường nào đổi (ví dụ mỗi lần lưu section).
8. **Bundle một chunk 588 kB.** `npm run build` cảnh báo chunk trên 500 kB; toàn bộ app, nội dung và thư viện nằm trong một file.

## Mục tiêu

Một repo gọn, tài liệu có một vị trí và khớp code, quy trình release chạy được và được test, bundle không còn cảnh báo kích thước.

## Không thuộc phạm vi

- Đổi hành vi người dùng, định dạng lưu trữ hay schema backup (nên không xóa trường `theme` và `currentCefrLevel` khỏi dữ liệu lưu, chỉ xóa action không dùng).
- Sửa `AGENTS.md` (Harnix quản lý) hoặc xóa dữ liệu `.harnix`.
- Tách `CapabilityTask.tsx` và đặt `strict` trong tsconfig: thuộc task `refactor-practice-feature-structure`.
- Viết bản mới cho prompt review tổng thể: nó chỉ từng tồn tại trong hội thoại, không phải file trong repo.
- Tăng version hay viết mục changelog cho cả đợt remediation: thuộc task `final-docs-and-release-sync`.

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Quy tắc release/changelog nằm trong `docs/RELEASE.md`; `check-changelog-rule` hết gãy và đọc quy tắc từ đó; `check-release` đọc version từ `package.json`; cả hai có npm script và test. |
| ac-2 | Số mission nhất quán (12) ở README, CONTENT, ARCHITECTURE; CHANGELOG có `[Unreleased]` ở đầu lịch sử; PRODUCT không nhắc streak; test khóa. |
| ac-3 | Xóa dead code ở mục 5; id capability có một nguồn duy nhất `CAPABILITY_IDS`; định dạng lưu trữ không đổi. |
| ac-4 | Năm component dùng selector; test khóa không có `useAppStore()` không đối số trong `src/features` và `src/app`. |
| ac-5 | Bundle tách chunk; `scripts/check-bundle-size.mjs` xác nhận mọi chunk JS dưới 500 kB; có test. |
| ac-6 | Tài liệu dự án nằm trong `docs/`; root chỉ còn `README.md`, `CHANGELOG.md`, `AGENTS.md`; mọi link nội bộ không gãy. |
| ac-7 | Bốn prompt một lần bị xóa; `LEARNER_AUDIT_PROMPT.md` chuyển vào `docs/prompts/`; không còn liên kết tới prompt đã xóa trong tài liệu đang dùng. |
| ac-8 | Mọi tham chiếu tới script kiểm tra changelog dùng `scripts/check-changelog-rule.mjs`; script nằm trong npm scripts. |

## Quyết định thiết kế

- **Quy tắc release thành tài liệu của dự án.** `docs/RELEASE.md` viết lại 12 điều script đang đòi (thêm entry changelog ở đầu lịch sử sau implement có thay đổi production; chọn MAJOR/MINOR/PATCH; đồng bộ `package.json` và `package-lock.json`; `docs-only` hoặc `prompt-only` không tăng version; task trộn tính là production; không sửa mục cũ; completion gate). Thêm một điều cho epic: các task giữa epic không tự release, task cuối epic viết một entry và tăng version một lần. Script đọc câu bắt buộc từ `docs/RELEASE.md` thay vì `AGENTS.md`.
- **`check-release` không hard-code.** Lấy version từ `package.json`, ngày từ heading CHANGELOG đầu tiên, và kiểm tra `package-lock.json` cùng heading khớp; chấp nhận hậu tố pre-release. Logic nằm trong hàm export để test được với thư mục tạm.
- **Một nguồn id capability.** `schema.ts` export `CAPABILITY_IDS` (tuple `as const`) và `CapabilityId`; `progressStorage` dùng `z.enum(CAPABILITY_IDS)`; `CAPABILITY_ORDER` dùng lại; `content.ts` import. Thứ tự hiển thị riêng (nhãn Catalog, ý định Today) giữ ở nơi dùng nhưng được kiểu `Record<CapabilityId, …>` để thiếu id là lỗi biên dịch.
- **Selector từng trường.** Mỗi trường một selector, hành động lấy riêng; không dùng `useShallow` trừ khi cần lấy object.
- **Giảm bundle bằng lazy và tách vendor.** `React.lazy` cho `LessonFlow`, `ProgressPage` và `Settings` bọc `Suspense` có nhãn tải; tách `node_modules` thành chunk `vendor` qua `build.rolldownOptions.output.codeSplitting`. Nếu chunk chính vẫn trên 500 kB (nội dung JSON bundle chung), tách `content` thành chunk riêng. Không nâng `chunkSizeWarningLimit` để che cảnh báo.
- **Di chuyển tài liệu bằng `git mv`** để giữ lịch sử, sau đó cập nhật link bằng một test quét mọi `.md`: mọi link tương đối trỏ tới file tồn tại.
- **`LEARNER_AUDIT_PROMPT.md` giữ lại** vì còn dùng cho persona testing và đang được tài liệu khác tham chiếu.

## Rủi ro

- Di chuyển tài liệu làm gãy test đọc đường dẫn cũ (`check-node-engine` đọc `START_HERE.md`; test nội dung có thể đọc `CONTENT.md`); sửa cùng slice và chạy toàn bộ suite.
- Lazy-load làm test render đồng bộ phải chờ `Suspense`; cập nhật bằng `findBy*` và giữ test hành vi cũ.
- Xóa `setTheme`/`setCefrLevel` đổi bề mặt store; kiểm tra không còn nơi dùng và giữ nguyên dữ liệu lưu.
- CHANGELOG là lịch sử; chỉ thêm mục `[Unreleased]`, không sửa mục cũ (theo chính quy tắc release), kể cả số test hard-code trong lịch sử.
- Cảnh báo chunk có thể không hết nếu nội dung JSON chiếm phần lớn; có phương án tách chunk `content`.
