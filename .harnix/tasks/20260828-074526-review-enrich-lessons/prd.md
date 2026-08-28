# PRD — Rà soát và bổ sung nội dung bài học thực tế

## Outcome

Người học nhận được 12 mission có language scaffold, câu kiểm tra và contract nhất quán với tình huống công việc; sáu bài pronunciation hiển thị đầy đủ kiến thức đã biên soạn mà không bị diễn giải thành bằng chứng nghe/nói.

## Phạm vi

- Sửa các mâu thuẫn material đã tìm thấy trong 5 mission B1 và 7 mission B2.
- Thêm đúng một `language-support` section với tối thiểu ba expression cho mỗi mission v3.
- Nâng mỗi mission lên tối thiểu ba auto-check exercise, dùng distractor gần nghĩa và kiểm tra evidence/sequence/function.
- Làm rõ mọi `performancePrompt` rằng đầu ra phải bằng tiếng Anh.
- Sửa nội dung pronunciation sai hoặc thiếu trong giới hạn schema v1 và render toàn bộ field language-support hiện có.
- Thêm executable quality gate, cập nhật `CONTENT.md` và patch release `1.1.5`.

## Ngoài phạm vi

- Không biến pronunciation v1 thành spoken assessment; việc đó cần schema, nguồn audio có quyền và listener evidence riêng.
- Không thêm source surface, registry, dependency hoặc network.
- Không thay model để đưa fact không có trong source/context tương ứng.
- Không đổi lesson ID, capability, mode, review cadence, progress/storage hoặc phase flow.
- Không sửa Harnix artifact lịch sử và không thực hiện thao tác Git bên ngoài working tree.

## Quyết định contract

- Mọi tình huống kỹ thuật mới vẫn là `Synthetic training artifact — non-production.`; các hành vi không có trong evidence phải được nêu là unknown cần xác minh, không được bịa thành product fact.
- `technical-doc-action-b1`: recovery là rollback → verify restored health → disable read-only → notify; learning drill có thể recall sau read-once nhưng actual execution phải đối chiếu approved runbook.
- `technical-log-diagnosis-b1`: mô tả memory là near-limit nếu chỉ có một sample; falsification phải quan sát backlog/throughput sau khi consumer capacity được phục hồi.
- `daily-standup-b1`: today action đi cùng expected result; output contract và model cùng yêu cầu outcome đó.
- `technical-interview-decision-b2`: batching có cost được source nêu rõ là batch-formation delay và per-item partial-failure handling; model, contract và rubric phải thừa nhận cost cùng mitigation.
- `architecture-walkthrough-b2`: DLQ chỉ áp dụng failed message deliveries; source định nghĩa outbox, at-least-once delivery, idempotent consumers và partial-result status để model có evidence.
- `meeting-disagree-and-recap-b2`: source có go/no-go threshold và decision time; recap phân biệt proposal với confirmed assignment, bắt buộc owner/deadline/confirmation state.
- `technology-troubleshooting-from-docs-b2`: failed attempt gồm returned error hoặc uncaught exception; `maxAttempts` là tổng số attempt gồm lần đầu.
- `learn-api-from-docs-b2`: không invent polling cadence, timeout hay idempotency retention; output phải gọi chúng là open questions và vẫn phân biệt 429 rate limiting với 503 temporary unavailability.
- Pronunciation giữ `completionMode: legacy-quiz`; sửa contrast thành `BUG/TIMEOUT`, dạy đầy đủ ba nhóm regular `-ed`, kiểm tra cả `ˈ` và `ˌ`, và hiển thị metadata authored hiện bị ẩn.
- Không tăng source count: scaffold dùng `language-support`, exercise và chỉnh source hiện hữu.

### AC `AC-1`

Các lỗi material đã phát hiện trong mission được sửa nhất quán từ source/context qua prompt, model, `outputContract` và rubric: runbook có recovery an toàn; log chỉ kết luận theo evidence; standup có expected result; B2 nêu đúng trade-off, delivery failure, trạng thái quyết định, retry-attempt semantics và ranh giới 429/503 hoặc unknown API behavior.

### AC `AC-2`

Cả 12 mission v3 có đúng một `language-support` section với ít nhất ba expression tái sử dụng, ít nhất ba auto-check exercise có distractor hợp lý, và `performancePrompt` yêu cầu đầu ra bằng tiếng Anh; scaffold khớp CEFR, evidence packet và nhiệm vụ của từng lesson.

### AC `AC-3`

Sáu bài pronunciation v1 được rà soát ở chế độ knowledge-only; ví dụ contrastive stress sai được sửa, quy tắc `-ed` và primary/secondary stress còn thiếu được bổ sung, đồng thời UI hiển thị `definition`, `collocations`, `commonMistake`, `tone` và `alternatives` đã có mà không tuyên bố spoken performance.

### AC `AC-4`

`CONTENT.md` mô tả quality floor mới và giới hạn pronunciation knowledge-only; patch release `1.1.5` được thêm ở đầu `CHANGELOG.md` và đồng bộ trong `package.json`, `package-lock.json` cùng `scripts/check-release.mjs` mà không sửa lịch sử cũ.

### AC `AC-5`

Focused content/renderer tests, full test suite, lint, build, release validator và git diff check đều pass với evidence fresh; inventory, provenance, phase isolation, model-evidence boundary và unrelated user work được giữ nguyên.

## Rủi ro và rollback

- Mở rộng auto-check có thể làm lesson dài hơn: giới hạn ba câu ngắn và giữ `durationMinutes` hiện tại; rollback độc lập theo mission.
- Sửa model spoken có thể vượt editorial timing gate: giữ model trong khoảng 75 wpm theo `targetSeconds/timeLimitSeconds`.
- Thêm fact vào learning loop có thể rò phase: chỉ dùng source/context hiện tại và giữ future-fact fixtures xanh.
- Renderer có thể làm card dài: dùng danh sách gọn, semantic labels và responsive wrapping; regression kiểm nội dung cùng accessible name.
- Release rollback độc lập bằng việc khôi phục version/changelog mới mà không sửa mục release cũ.