# Plan — Rà soát và bổ sung nội dung bài học thực tế

## Checklist

- [x] `S1` — Thêm RED regression cho mission scaffold, alignment và full language-support rendering.
- [x] `S2` — Sửa năm mission B1 và đưa focused contract về GREEN.
- [x] `S3` — Sửa bảy mission B2 và đưa focused contract về GREEN.
- [x] `S4` — Sửa pronunciation knowledge content và renderer metadata.
- [x] `S5` — Đồng bộ owner docs và patch release 1.1.5.
- [x] `S6` — Chạy verification đầy đủ, review compliance rồi quality/security.

### Slice `S1`

Criteria: `AC-1`, `AC-2`, `AC-3`
Checks: `check-content-focused`, `check-renderer-focused`
Paths: `src/content/content_quality.test.ts`, `src/features/lesson/SectionRenderer.test.tsx`, `content/missions/**/*.json`, `content/reference/pronunciation/*.json`

Thêm test yêu cầu 12 mission có một `language-support`, tối thiểu ba expression, ba auto-check và explicit English output; khóa các alignment fix có thể kiểm máy. Thêm renderer test cho definition, collocations, common mistake, tone và alternatives. Chạy focused tests trước content/UI edit để ghi nhận RED đúng nguyên nhân.

### Slice `S2`

Criteria: `AC-1`, `AC-2`
Checks: `check-content-focused`
Paths: `content/missions/workplace-communication/*.json`, `content/missions/technical-reading/*.json`, `content/missions/international-meetings/daily-standup-b1.json`

Bổ sung F-I-A-R, clarification, runbook và fact-hypothesis-test scaffold; sửa đầy đủ prerequisite/recovery, evidence trend, falsification và expected-result contract. Thêm exercise mapping/ordering/near-choice rồi chạy focused gate.

### Slice `S3`

Criteria: `AC-1`, `AC-2`
Checks: `check-content-focused`
Paths: `content/missions/international-interview/*.json`, `content/missions/international-meetings/meeting-disagree-and-recap-b2.json`, `content/missions/technical-explanation/*.json`, `content/missions/technology-learning/*.json`

Bổ sung option-cost-result, architecture flow, disagreement recap, troubleshooting và safe API scaffold; sửa source→model→contract→rubric theo các quyết định đã đóng. Giữ source count, provenance và phase isolation, sau đó chạy focused gate.

### Slice `S4`

Criteria: `AC-3`
Checks: `check-content-focused`, `check-renderer-focused`
Paths: `content/reference/pronunciation/*.json`, `src/features/lesson/SectionRenderer.tsx`, `src/features/lesson/SectionRenderer.test.tsx`

Sửa `BUG/TIMEOUT`, bổ sung bảng regular `-ed` và assessment `ˈ`/`ˌ`. Render các field vocabulary/expression bị ẩn bằng semantic markup; không thêm audio/performance hoặc claim efficacy.

### Slice `S5`

Criteria: `AC-4`
Checks: `check-docs`, `check-release`
Paths: `CONTENT.md`, `CHANGELOG.md`, `package.json`, `package-lock.json`, `scripts/check-release.mjs`

Ghi quality floor mới, giới hạn knowledge-only, thêm release `1.1.5` ngày `2026-08-28` ở đầu lịch sử và đồng bộ package/release validator.

### Slice `S6`

Criteria: `AC-1`, `AC-2`, `AC-3`, `AC-4`, `AC-5`
Checks: `check-build`, `check-content-focused`, `check-diff`, `check-docs`, `check-full-tests`, `check-lint`, `check-release`, `check-renderer-focused`
Paths: `CHANGELOG.md`, `CONTENT.md`, `content/**/*.json`, `package-lock.json`, `package.json`, `scripts/check-release.mjs`, `src/**/*.ts`, `src/**/*.tsx`

Chuyển sang verifying, snapshot ngay trước/sau từng required check, đọc toàn bộ output, kiểm compliance trước quality/security, giữ mọi failure evidence và chỉ hoàn tất khi toàn bộ criterion cùng check fresh/pass.