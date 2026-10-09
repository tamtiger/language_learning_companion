# Language Learning Companion

Ứng dụng học tiếng Anh **capability-first, offline-first** dành cho Software
Engineer Việt Nam. Mục tiêu của dự án không phải hoàn thành thật nhiều quiz mà
là tạo được đầu ra tiếng Anh trong công việc, sửa điểm yếu cụ thể và transfer
sang tình huống mới.

## Sáu mục tiêu

1. Giao tiếp tiếng Anh tự tin trong công việc.
2. Đọc tài liệu kỹ thuật mà không cần bản dịch.
3. Tham gia họp với đồng nghiệp quốc tế.
4. Giải thích ý tưởng kỹ thuật bằng tiếng Anh.
5. Phỏng vấn và làm việc tại công ty nước ngoài.
6. Học công nghệ mới hoàn toàn bằng tiếng Anh.

## Tính năng hiện có

### Learning loop theo năng lực

Mỗi capability mission chạy theo chu trình:

```text
baseline → input → auto-check → performance → self-feedback
         → retry → transfer → delayed review
```

- Làm baseline trước khi được xem model response.
- Xem hợp đồng đầu ra lấy trực tiếp từ lesson: timebox, độ dài mục tiêu và các
  thành phần bắt buộc trước khi bắt đầu nói/viết.
- Nhiệm vụ dựa trên bằng chứng có thể đưa log, channel note hoặc handoff riêng
  cho từng phase, để người học viết từ dữ kiện thay vì tự bịa tình huống.
- Tạo spoken hoặc written output trong timebox.
- Timer/word count và preparation time được đo từ thao tác thật, không dùng số mặc định.
- Tự đánh giá từng tiêu chí bằng rubric `met/not-met`.
- Khi còn gap, chọn một `retry focus`, làm lại và chấm lại toàn bộ rubric.
- Làm transfer task trong ngữ cảnh mới.
- Quay lại delayed review theo `reviewPolicy.intervalDays` do từng lesson sở hữu.

### Today, Catalog và Progress

- **Today** ưu tiên review quá hạn, learning loop đang dở, baseline chưa làm và
  bài mới tiếp theo.
- **Catalog** nhóm và lọc bài theo capability, workflow và CEFR.
- **Progress** hiển thị evidence quan sát được theo từng capability: attempts,
  transfer attempts, **Transfer đạt** và lý do cụ thể của lượt chưa đạt.
- Một transfer chỉ được tính là đạt khi hoàn thành toàn bộ rubric và thỏa điều
  kiện độc lập của task, gồm giới hạn hint và việc không dùng tiếng Việt, bản
  dịch hoặc model answer.

### Speaking và writing

- Trình soạn written response có đếm số từ.
- Ghi âm cục bộ và nghe lại trong phiên hiện tại.
- Timer-only fallback khi microphone không khả dụng hoặc bị từ chối.
- Rubric, independence signals và retry focus được lưu dưới dạng metadata;
  response, transcript và audio không được persist.

### Technical reading ladder

Bốn mission đọc runbook, logs, API docs và troubleshooting docs có chuỗi:

```text
read once rồi ẩn source → extract action/constraint/evidence
→ explain/apply → retry → unseen transfer → delayed retrieval
```

- Textarea baseline/retry/transfer/review chỉ mở sau khi source đã ẩn.
- Extraction có feedback tức thời; explain/apply draft và đáp án chỉ ở session.
- Transfer/review dùng source mới cùng workflow để tránh học thuộc một passage.

### Learning loop nghe–phát âm–phản xạ

Cả sáu spoken mission có thêm chuỗi:

```text
perception pretest → training có feedback → posttest
→ pronunciation cue theo lỗi → guided shadowing → delayed imitation → variation
→ spoken output + listen-back → clarification/repair turn
```

- Dạy 4–6 functional chunks theo chức năng giao tiếp, không bắt học IPA toàn bộ.
- Chỉ hiện tối đa hai pronunciation cue có rủi ro làm sai nghĩa; IPA là ký hiệu hỗ trợ.
- Model audio dùng Web Speech API tại máy, cho chọn 0.85×/1×/1.15× và ghi rõ
  requested locale. Đây là synthetic device voice, không phải human accent sample.
- Người học có thể bỏ qua perception nếu audio không phù hợp và vẫn làm nhiệm vụ.
- App lưu count/flag của process, không lưu câu trả lời, transcript hoặc audio.

### Progress, review và backup

- Resume section hoặc learning phase an toàn sau khi reload; output session-only không được phục dựng giả.
- Lưu tối đa 50 attempt metadata gần nhất cho mỗi lesson.
- Tự đưa review đến hạn vào Today queue.
- Export/import backup v5 bằng allowlisted metadata; backup v3/v4 được migrate
  sang v5 qua cùng canonical migration, còn v1/v2 và future version bị từ chối.
- Import có schema validation, preview và xác nhận trước khi thay state.
- Dữ liệu malformed hoặc sai version bị từ chối theo cơ chế fail-closed.

### Accessibility

- Điều hướng chính và critical flow dùng native semantic controls.
- Hỗ trợ bàn phím, visible focus, heading có cấu trúc và live status.
- Recording luôn có trạng thái bằng chữ và timer fallback.
- Layout responsive cho màn hình nhỏ và desktop.

## Nội dung hiện có

Có 12 capability mission v3 — hai mission cho mỗi mục tiêu:

| Capability | Hai mission | Mode |
|---|---|---|
| Giao tiếp công việc | Actionable issue update; clarification request | Written |
| Đọc tài liệu kỹ thuật | Documentation to actions; log diagnosis | Written |
| Họp quốc tế | Daily Standup; disagree and recap | Spoken |
| Giải thích kỹ thuật | Technical trade-off; architecture walkthrough | Spoken |
| Phỏng vấn quốc tế | Technical decision; behavioral ownership | Spoken |
| Học công nghệ bằng tiếng Anh | API learning plan; troubleshooting from docs | Written |

Ngoài 12 mission trên, sáu pronunciation lesson knowledge/reference vẫn chạy được
và chỉ hoàn thành khi mọi auto-check đều đúng; kết quả quiz không đánh giá phát âm
khi nói. Taxonomy authoring đặt 12 mission v3 tại
`content/missions/<primary-capability>/<lesson-id>.json` và 6 pronunciation lesson
v1 tại `content/reference/pronunciation/<lesson-id>.json`. Cấu trúc thư mục giúp
tổ chức biên soạn, không quyết định semantics hoặc runtime behavior; content
engine vẫn khám phá `content/**/*.json`, rồi đọc schema và các field để validate,
normalize lesson v1, v2 và v3.

Mọi source artifact trong curriculum được phân loại bằng provenance chuẩn hoặc
disclosure synthetic/non-production ngay trong nội dung. Link nguồn chỉ mở khi
người học chủ động chọn; lesson vẫn chạy offline nếu không mở link.

`Actionable issue update` là realism pilot. Sáu spoken loops và bốn reading
ladders giúp kiểm
chứng content contract và UI; dự án chưa tuyên bố hiệu quả học tập nếu chưa có
thử nghiệm với người học mục tiêu và đánh giá người nghe độc lập.

Rollout P0–P2 đã có executable flow và protocol. Dự án vẫn chưa có participant
study; functional QA không được diễn giải thành learning efficacy.

## Privacy và giới hạn

- App chạy local-only trong browser; không cần account hoặc backend.
- Không upload audio, transcript, written response hoặc dữ liệu học tập.
- Không có AI scoring, speech-to-text, cloud sync hoặc server analytics.
- Self-rubric là evidence tự đánh giá, không phải chứng nhận trình độ B1/B2/C1.
- Dự án tập trung vào sáu capability nghề nghiệp, không phải khóa general
  English hoàn chỉnh.

## Yêu cầu môi trường

- Node.js 22.12 trở lên (khai báo trong `engines` của `package.json`, `.nvmrc` ghim Node 22).
  Test suite đã được kiểm chứng trên Node 25.
- npm.
- Trình duyệt hiện đại; microphone là tùy chọn.

## Quickstart

```bash
npm install
npm run dev
```

Mở URL do Vite hiển thị trong terminal.

## Scripts

```bash
npm run dev      # development server
npm test         # chạy toàn bộ Vitest suite
npm run lint     # static lint bằng Oxlint
npm run build    # TypeScript check và production build
npm run preview  # xem production build ở local
```

## Kiến trúc ngắn gọn

```text
content JSON v1/v3
  → parse + validate + normalize
  → Today / Catalog / Lesson / Progress
  → pure learning + progress domain
  → local storage v5 + validated backup/migration v3/v4
```

Stack chính: React 19, TypeScript, Vite, Zustand, Zod, Vitest và Testing
Library.

## Source of truth

- Product behavior và success evidence: [`docs/PRODUCT.md`](./docs/PRODUCT.md)
- Content schema và authoring rules: [`docs/CONTENT.md`](./docs/CONTENT.md)
- Architecture, storage và privacy: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Listener/expert evaluation: [`docs/EVALUATION_PROTOCOL.md`](./docs/EVALUATION_PROTOCOL.md)
- Hướng dẫn dành cho người học: [`docs/START_HERE.md`](./docs/START_HERE.md)
- Quy tắc release và changelog: [`docs/RELEASE.md`](./docs/RELEASE.md)
- Quy ước đặt tên file và vị trí test: [`docs/CONVENTIONS.md`](./docs/CONVENTIONS.md)
- Prompt audit người học: [`docs/prompts/LEARNER_AUDIT_PROMPT.md`](./docs/prompts/LEARNER_AUDIT_PROMPT.md)
- Lịch sử thay đổi: [`CHANGELOG.md`](./CHANGELOG.md)
- Executable curriculum: [`content/`](./content)

Khi tài liệu mâu thuẫn, owner document theo lĩnh vực ở trên là nguồn quyết định.
Không sửa backup hoặc raw content bằng tay để thay cho validation và normalization.
