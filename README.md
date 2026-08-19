# Language Learning Companion

Offline-first capability learning engine cho Software Engineers Việt Nam.

## Quickstart

```bash
npm install
npm run dev
```

Verification:

```bash
npm test
npm run lint
npm run build
```

## Product model

App hướng đến six outcomes: workplace communication, technical reading, international meetings, technical explanation, international interview/work và learning technology in English. Learning loop chuẩn là baseline → input → performance → self-feedback → retry → transfer → delayed review.

## Source of truth

- Product behavior: `PRODUCT.md`
- Content/schema v3: `CONTENT.md`
- Architecture/migration/local-only privacy: `ARCHITECTURE.md`
- Learner guide: `START_HERE.md`
- Executable curriculum: `content/**/*.json`

Raw lessons schema v1/v2 được giữ tương thích qua normalization; không sửa backup hoặc content legacy bằng tay.
