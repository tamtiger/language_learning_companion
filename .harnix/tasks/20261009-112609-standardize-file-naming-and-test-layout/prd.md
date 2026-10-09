# PRD: Thống nhất quy ước tên file, đuôi file và vị trí test

## Vấn đề

Khảo sát `src/`, `scripts/` và cấu hình cho thấy:

- **Tên file không đồng nhất.** Component dùng PascalCase (`SectionRenderer.tsx`, đúng chuẩn). Nhưng có 6 module dùng `snake_case` (`use_app_store.ts`, `model_audio.ts`, `media_recorder.ts`, `progress_storage.ts`, `learning_loop.ts`, `learning_loop_diagnostics.ts`) và task đầu epic vừa thêm 3 file nữa theo kiểu đó (`option_order.ts`, `exercise_grading.ts`, `answer_normalization.ts`). Phần còn lại là một từ thường (`schema.ts`, `flow.ts`). `snake_case` không phải chuẩn của hệ sinh thái TypeScript và không khớp tên hàm/hook mà file export.
- **Đuôi file.** Quy tắc đúng là `.tsx` chỉ khi file chứa JSX. Cả 35 file `.tsx` hiện có đều thỏa quy tắc này, nhưng có hai ngoại lệ: test `option_order.test.ts` dùng `createElement` để né `.tsx`, và `scripts/check-changelog-rule` không có đuôi.
- **Test nằm rải rác.** 32 file test nằm cạnh code trong 15 thư mục, setup ở `src/test/setup.ts`, test của script ở `scripts/`.
- Không có tài liệu hay kiểm tra tự động nào ghi lại quy ước, nên lỗi sẽ tái diễn ở các task sau.

## Mục tiêu

1. Một quy ước tên file duy nhất, đã được ghi lại và có kiểm tra tự động.
2. Đuôi file luôn phản ánh nội dung.
3. Toàn bộ test nằm trong `tests/`, phản chiếu cấu trúc của `src/`.
4. Không đổi hành vi, giữ lịch sử git của từng file.

## Không thuộc phạm vi

- Đổi tên component, hàm hay export (chỉ đổi tên file và đường dẫn import).
- Đổi tên thư mục `src/` hiện có (kể cả `lesson-player`) và tên file JSON nội dung (đã là kebab-case, khớp lessonId).
- Đổi tên file cấu hình mà công cụ yêu cầu tên cố định (`vite.config.ts`, `tailwind.config.js`...).
- Tái cấu trúc `src/features/practice` (thuộc task `refactor-practice-feature-structure`).

## Quy ước chốt

| Loại file | Quy ước | Ví dụ |
| --- | --- | --- |
| Component React (có JSX) | `PascalCase.tsx` | `SectionRenderer.tsx` |
| Hook | `useXxx.ts` (camelCase) | `useAppStore.ts` |
| Module khác trong `src/` | `camelCase.ts` hoặc một từ thường | `modelAudio.ts`, `schema.ts` |
| Điểm vào của Vite | giữ `main.tsx` | `src/app/main.tsx` |
| Test | tên của đối tượng được test + `.test.ts` hoặc `.test.tsx` | `modelAudio.test.ts`, `SectionRenderer.test.tsx` |
| Script Node và test của chúng | `kebab-case.mjs` | `check-release.mjs` |
| Thư mục | chữ thường, nhiều từ nối bằng `-` | `lesson-player` |

Đuôi `.tsx` chỉ dành cho file có JSX; test có JSX là `.test.tsx`, còn lại là `.test.ts`.

## Yêu cầu

| Mã | Yêu cầu |
| --- | --- |
| ac-1 | Mọi file trong `src/` theo quy ước ở bảng trên; không còn `snake_case`. |
| ac-2 | `.tsx` chỉ khi có JSX và ngược lại; `option_order.test` dùng JSX; `scripts/check-changelog-rule` đổi thành `.mjs`. |
| ac-3 | Mọi file `*.test.*` nằm trong `tests/`, thư mục con phản chiếu `src/`, `tests/setup.ts`, `tests/scripts/` cho test của script; không còn test ngoài `tests/`. |
| ac-4 | `docs/CONVENTIONS.md` ghi quy ước; `tests/conventions/fileConventions.test.ts` cưỡng chế và có test tự kiểm bằng dữ liệu giả. |
| ac-5 | Không đổi hành vi: số test trước và sau bằng nhau, build, lint và toàn bộ suite xanh; check của các task còn lại trong epic trỏ đúng đường dẫn mới. |

## Quyết định thiết kế

- Module dùng `camelCase` vì tên file khớp tên hàm hoặc hook mà file export; các ngôn ngữ họ JS hiếm dùng `snake_case`.
- Test ở thư mục `tests/` ngoài `src/` theo yêu cầu của chủ dự án; `tsconfig.app.json` thêm `tests` vào `include` để vẫn type-check.
- Test import mã nguồn qua alias `@/` trỏ tới `src/`, cấu hình ở `tsconfig.app.json` (`paths`) và `vitest.config.ts` (`resolve.alias`). Mã trong `src/` vẫn dùng đường dẫn tương đối. Alias tránh chuỗi `../../../../src/...` và không đổi khi tổ chức lại thư mục.
- Kiểm tra JSX bằng TypeScript compiler API (`typescript` đã là devDependency) thay vì regex để không nhầm với generics.
- Dùng `git mv` để lịch sử theo dõi được.

## Rủi ro

- Một lần đổi tên hàng loạt dễ bỏ sót đường dẫn trong `vi.mock`, `import()` và `import.meta.glob` của test; `npm run build` (type-check) và toàn bộ suite sẽ bắt phần lớn, nên mỗi bước đổi đều chạy lại cả hai.
- Worktree đang có thay đổi chưa commit của task trước; `git mv` vẫn hoạt động nhưng diff sẽ lẫn. Khuyến nghị commit task trước khi bắt đầu.
- Các check của task còn lại trong epic tham chiếu đường dẫn test cũ; slice cuối cập nhật bằng ánh xạ cũ sang mới.
- Test import trực tiếp từ test khác (`schema.test`) phải được di chuyển cùng nhau để giữ quan hệ.
