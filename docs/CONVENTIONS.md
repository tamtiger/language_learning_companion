# Quy ước đặt tên file và vị trí test

Quy ước này được cưỡng chế tự động bởi `tests/conventions/fileConventions.test.ts`. Chạy
`npx vitest run tests/conventions` sau khi thêm, đổi tên hoặc di chuyển file.

## Tên file

| Loại file | Quy ước | Ví dụ |
| --- | --- | --- |
| Component React (có JSX) | `PascalCase.tsx` | `SectionRenderer.tsx` |
| Hook | `useXxx.ts` | `useAppStore.ts` |
| Module khác trong `src/` | `camelCase.ts`, hoặc một từ thường | `modelAudio.ts`, `schema.ts` |
| Điểm vào của Vite | giữ nguyên `main.tsx` | `src/app/main.tsx` |
| Script Node | `kebab-case.mjs` trong `scripts/` | `check-release.mjs` |
| Thư mục | chữ thường; nhiều từ nối bằng `-` | `lesson-player` |
| File nội dung bài học | `kebab-case.json`, trùng `lessonId` | `daily-standup-b1.json` |
| File cấu hình công cụ | giữ tên mà công cụ yêu cầu | `vite.config.ts` |

Không dùng `snake_case` trong tên file. Tên file module khớp tên hàm hoặc hook mà nó export.

## Đuôi file

`.tsx` chỉ dành cho file có JSX. Mọi file khác dùng `.ts`. Không né `.tsx` bằng
`createElement`; nếu test cần render component thì dùng JSX và đặt đuôi `.test.tsx`.

## Vị trí test

- Mọi test nằm trong `tests/`, không đặt cạnh mã nguồn.
- Thư mục con của `tests/` phản chiếu thư mục có thật trong `src/`:
  `src/features/lesson/optionOrder.ts` có test ở `tests/features/lesson/optionOrder.test.ts`.
- Ngoại lệ: `tests/conventions/` (kiểm tra cấu trúc repo), `tests/scripts/` (test của `scripts/`,
  tên `kebab-case.test.mjs`, chạy được cả bằng `node --test tests/scripts/*.test.mjs`) và
  `tests/helpers/` (hàm dùng chung cho test như `axe.ts`, `aria.ts`, `flow.ts`) và
  `tests/setup.ts` (thiết lập chung của Vitest).
- Tên test là tên đối tượng được test cộng `.test.ts` hoặc `.test.tsx`. Test kiểm tra nội dung hoặc
  nhiều module cùng lúc đặt theo chủ đề, ví dụ `tests/content/assessmentQuality.test.ts`.

## Import trong test

Test import mã nguồn qua alias `@/` trỏ tới `src/`, kể cả trong `vi.mock` và `import()`:

```ts
import { orderOptions } from '@/features/lesson/optionOrder'
```

Mã trong `src/` vẫn dùng đường dẫn tương đối. Đường dẫn tới thư mục nội dung dùng gốc của Vite,
ví dụ `import.meta.glob('/content/**/*.json')`. Test import lẫn nhau dùng đường dẫn tương đối
trong `tests/`.

## Thêm một file mới

1. Chọn tên theo bảng trên; component có JSX thì dùng `.tsx`.
2. Đặt test tương ứng ở `tests/<thư mục tương ứng trong src>/`.
3. Chạy `npx vitest run tests/conventions` rồi `npm test`.
