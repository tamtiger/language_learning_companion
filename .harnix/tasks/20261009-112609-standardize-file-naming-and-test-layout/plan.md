# Kế hoạch: Thống nhất quy ước tên file và gom test vào tests/

## Checklist theo slice

- [x] S1: ghi nhận số test hiện có, cấu hình alias `@/` và vùng quét của vitest, viết `fileConventions.test.ts` (RED) (ac-4)
- [x] S2: đổi tên module snake_case sang camelCase bằng `git mv` và cập nhật import (ac-1, ac-5)
- [x] S3: gom test vào `tests/`, đổi tên file test theo module, chuyển `optionOrder.test` sang JSX (ac-2, ac-3, ac-5)
- [x] S4: chốt cấu hình (`vitest.config.ts`, `tsconfig.app.json`) và đổi tên `scripts/check-changelog-rule` (ac-2, ac-3)
- [x] S5: viết `docs/CONVENTIONS.md`, cập nhật tham chiếu tài liệu và check của các task còn lại trong epic (ac-4, ac-5)
- [x] S6: chạy build, lint, toàn bộ suite, so sánh số test (ac-1 đến ac-5)

Đường dẫn tương đối với root repo. Mỗi bước đổi tên chạy `npm run build` và vitest trước khi sang bước sau.

## S1: nền cho kiểm tra (ac-4)

1. Chạy `npx vitest run` và ghi số file test cùng số test hiện tại vào `.harnix` bằng một `--add-decision` (làm mốc cho ac-5).
2. `vitest.config.ts`: thêm `resolve.alias` `{ '@': <src tuyệt đối> }` (dùng `fileURLToPath(new URL('./src', import.meta.url))`) và `test.include` gồm cả `src/**/*.test.{ts,tsx,mjs}` lẫn `tests/**/*.test.{ts,tsx,mjs}` (tạm thời đến S4). `tsconfig.app.json`: thêm `compilerOptions.paths: { "@/*": ["./src/*"] }`.
3. Viết `tests/conventions/fileConventions.test.ts`. Các quy tắc là hàm thuần nhận danh sách `{ path, content }`, gồm:
   - tên file trong `src/`: `.tsx` là PascalCase trừ `main.tsx`; `.ts` là `useXxx` hoặc camelCase hoặc một từ thường; không chứa `_` hay `-`;
   - `.tsx` phải có node JSX khi phân tích bằng `typescript` (`ts.createSourceFile`, tìm `JsxElement`, `JsxSelfClosingElement`, `JsxFragment`); `.ts` không có JSX;
   - mọi `*.test.*` nằm dưới `tests/`; thư mục con đầu tiên của test phải tồn tại trong `src/` (trừ `conventions` và `scripts`);
   - tên test: `tests/scripts/` là kebab-case, nơi khác là PascalCase hoặc camelCase;
   - `scripts/` chỉ chứa file `.mjs` kebab-case.
4. Test tự kiểm bằng dữ liệu giả cho từng quy tắc, rồi các test chạy trên cây file thật (đọc bằng `fs`, bỏ `node_modules`). RED: các test thật fail vì tên snake_case, test ngoài `tests/` và script không đuôi.

## S2: đổi tên module (ac-1, ac-5)

Dùng `git mv` rồi cập nhật mọi specifier trong `src/` và test (tương đối, `vi.mock`, `import()`); một script Node chạy một lần bằng `node -e` (không tạo file) áp dụng ánh xạ dưới đây và in các file đã sửa:

| Cũ | Mới |
| --- | --- |
| `src/shared/hooks/use_app_store.ts` | `useAppStore.ts` |
| `src/features/practice/model_audio.ts` | `modelAudio.ts` |
| `src/features/practice/learning_loop_diagnostics.ts` | `learningLoopDiagnostics.ts` |
| `src/features/lesson-player/media_recorder.ts` | `mediaRecorder.ts` |
| `src/infrastructure/storage/progress_storage.ts` | `progressStorage.ts` |
| `src/domain/learning/learning_loop.ts` | `learningLoop.ts` |
| `src/features/lesson/option_order.ts` | `optionOrder.ts` |
| `src/features/lesson/exercise_grading.ts` | `exerciseGrading.ts` |
| `src/content/answer_normalization.ts` | `answerNormalization.ts` |

Test tương ứng đổi tên theo trong S3. Sau bước này `npm run build` và vitest phải xanh.

## S3: gom test (ac-2, ac-3, ac-5)

`git mv` từng `src/<dir>/<tên>.test.<ext>` thành `tests/<dir>/<tên mới>.test.<ext>`, giữ các test import lẫn nhau cùng nhau. Quy tắc viết lại specifier trong test:

- đường dẫn tương đối trỏ vào mã nguồn chuyển thành `@/<dir>/<module>` (kể cả `vi.mock` và `import()`);
- đường dẫn trỏ sang test khác giữ tương đối trong `tests/` (ví dụ `./schema.test`);
- `import.meta.glob('../../content/**/*.json')` đổi thành `/content/**/*.json` (gốc Vite);
- `scripts/*.test.mjs` chuyển sang `tests/scripts/` và import `../../scripts/<tên>.mjs`.

Tên mới của test module: `use_app_store.test.ts` thành `useAppStore.test.ts`, `model_audio.test.ts` thành `modelAudio.test.ts`, `content_quality.test.ts` thành `contentQuality.test.ts`, `assessment_quality.test.ts` thành `assessmentQuality.test.ts`, `validate_all_lessons.test.ts` thành `validateAllLessons.test.ts`, `option_order.test.ts` thành `optionOrder.test.tsx` (viết lại bằng JSX thay `createElement`, `exercise_grading.test.ts` thành `exerciseGrading.test.ts`, test của component giữ PascalCase). Setup: `src/test/setup.ts` thành `tests/setup.ts`.

## S4: cấu hình cuối (ac-2, ac-3)

- `vitest.config.ts`: `include` chỉ còn `tests/**/*.test.{ts,tsx,mjs}`, `setupFiles: ['./tests/setup.ts']`.
- `tsconfig.app.json`: `include: ["src", "tests"]`.
- `scripts/check-changelog-rule` thành `scripts/check-changelog-rule.mjs` (`git mv`, cập nhật tham chiếu còn sống; các bản ghi lịch sử trong `.harnix/tasks` giữ nguyên).
- Cập nhật `oxlint` nếu cấu hình có đường dẫn cũ.

## S5: tài liệu và state epic (ac-4, ac-5)

- Tạo `docs/CONVENTIONS.md` mô tả bảng quy ước, cấu trúc `tests/`, alias `@/` và cách thêm test mới.
- `CONTENT.md` và các tài liệu khác: sửa đường dẫn cũ (`src/features/lesson/option_order.ts` và `src/content/assessment_quality.test.ts` sang tên mới).
- Với từng task còn lại trong epic, dùng `harnix workflow --batch --task <id>` cập nhật `command` và `inputs` của các check và `relevantPaths` theo ánh xạ cũ sang mới; viết một bước kiểm tra in ra mọi chuỗi đường dẫn cũ còn sót lại trong state của các task chưa hoàn thành.
- Sửa tiêu chí ac-8 của task `clean-repo-hygiene-and-docs` để không còn yêu cầu đổi tên `check-changelog-rule` (đã làm ở đây).

## S6: xác minh (ac-1 đến ac-5)

Chạy `npm run lint`, `npm run build` rồi `harnix workflow --run-checks --brief`. So số file test và số test với mốc ghi ở S1; chênh lệch khác 0 phải có giải thích (ví dụ test mới của `fileConventions`). Chạy `git status` để xác nhận Git ghi nhận các thay đổi là rename.

## Mỗi check chứng minh điều gì

- `check-conventions`: ac-1 đến ac-4, bằng chính cây file thật cộng test tự kiểm của từng quy tắc.
- `check-rename-build`: ac-5, `tsc -b` type-check cả `src/` lẫn `tests/` và build production thành công.
- `check-suite`: không có hồi quy hành vi, số test khớp mốc.

## Rollback

Tất cả là rename nên có thể hoàn tác bằng git. Nếu một bước phát sinh lỗi khó sửa, quay lại commit trước bước đó; không có dữ liệu người dùng hay định dạng lưu trữ nào bị ảnh hưởng.
