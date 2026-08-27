# Plan — Hoàn thiện curriculum thực tế và có nguồn

## Checklist

- [x] `S1` — Hoàn thiện item-level research package và source trace.
- [x] `S2` — Mở rộng RED regression cho các gap review.
- [x] `S3` — Sửa content/runtime v3 theo contract đã khóa.
- [x] `S4` — Sửa knowledge-only và source coverage cho sáu lesson v1.
- [x] `S5` — Đồng bộ owner docs và kiểm tra patch release portable.
- [x] `S6` — Verification toàn corpus, review độc lập và browser đại diện.

### Slice `S1`

Criteria: `AC-1`, `AC-4`, `AC-8`
Checks: `check-research-integrity`, `check-research-matrix`, `check-research-package-detailed`
Paths: `CURRICULUM_RESEARCH_PROMPT.md`, `content/**/*.json`, `.harnix/tasks/20260827-224143-complete-realistic-curriculum/research/*.md`, `scripts/check-curriculum-research.mjs`

Replan 2: mở rộng nested option/answer/explanation thành judgment riêng; resolve evidence ID; khóa semantic trace, exact reverse claim-source, synthetic classification và anti-self-validation.

Inventory từng visible/listened/response-used artifact và material claim; lập trace hai chiều, source detail/claim-source map, capability/coverage map, wave log, verification report và residual ledger. Validator phải so exact corpus coverage, required fields và zero blocker/high; một row/lesson chỉ là summary, không thay item matrix.

### Slice `S2`

Criteria: `AC-5`, `AC-9`
Checks: `check-content-focused`, `check-runtime-focused`, `check-legacy-completion-copy`
Paths: `src/content/content_quality.test.ts`, `src/features/practice/CapabilityTask.test.tsx`, `content/**/*.json`, `src/features/practice/CapabilityTask.tsx`

Tạo RED test thất bại đúng lý do cho learner-facing output contract, retry evidence visibility, model-duration plausibility, meeting proposal semantics, lesson 06 knowledge-only assessment, HTTP/model fact trace và full IPA fixture.

### Slice `S3`

Criteria: `AC-2`, `AC-4`, `AC-9`
Checks: `check-content-focused`, `check-runtime-focused`, `check-legacy-completion-copy`
Paths: `content/modules/capabilities/*.json`, `content/modules/workplace-communication/daily_standup.json`, `src/content/content_quality.test.ts`, `src/features/practice/CapabilityTask.test.tsx`, `src/features/practice/CapabilityTask.tsx`

Render summary trực tiếp từ `outputContract`, hiển thị `practiceContexts.retry` đúng phase, sửa exemplar duration và meeting assignment/proposal. Giữ offline/privacy, không thêm network, persistence hoặc schema.

### Slice `S4`

Criteria: `AC-3`, `AC-4`, `AC-5`, `AC-9`
Checks: `check-content-focused`, `check-runtime-focused`, `check-legacy-completion-copy`
Paths: `content/modules/pronunciation/*.json`, `src/content/content_quality.test.ts`, `src/features/lesson/LessonFlow.test.tsx`, `src/features/lesson/LessonFlow.tsx`, `.harnix/tasks/20260827-224143-complete-realistic-curriculum/research/*.md`, `CONTENT.md`, `PRODUCT.md`

Khóa exact headword/rule source cho toàn bộ IPA/cues hiện dùng, sửa lesson 06 và completion copy để quiz chỉ chứng minh hiểu kiến thức quy trình, rồi bổ sung fixture assessment/source trace. Ghi rõ dialect, population/limits và residual human-SME/listener gap.

### Slice `S5`

Criteria: `AC-7`
Checks: `check-release`, `check-release-portable`, `check-release-portable-file`
Paths: `CONTENT.md`, `PRODUCT.md`, `README.md`, `START_HERE.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`

Đồng bộ owner docs với behavior cuối cùng và append release `1.1.3`; chạy validator Node portable. Giữ evidence lịch sử của check PowerShell nhưng không dùng nó làm bằng chứng portability.

### Slice `S6`

Criteria: `AC-2`, `AC-3`, `AC-5`, `AC-6`, `AC-8`, `AC-9`
Checks: `check-content-focused`, `check-runtime-focused`, `check-legacy-completion-copy`, `check-research-package-detailed`, `check-full-tests`, `check-lint`, `check-build`, `check-browser-representative`
Paths: `content/**/*.json`, `src/**/*.ts`, `src/**/*.tsx`, `.harnix/tasks/20260827-224143-complete-realistic-curriculum/research/*.md`, `CONTENT.md`, `PRODUCT.md`, `README.md`, `START_HERE.md`, `package.json`, `package-lock.json`

Review compliance trước quality/security, chạy snapshot trước/sau mọi required check, walkthrough spoken/written reading-ladder/pronunciation trên desktop và mobile, xác minh không network/persistence/dependency mới, rồi ghi measured evidence và residual risk trung thực.