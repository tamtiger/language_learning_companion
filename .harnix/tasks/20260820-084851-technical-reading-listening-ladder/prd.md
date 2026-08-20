# PRD — Technical reading & listening ladder P2

## Outcome

Bốn mission đọc documentation/log dành cho `technical-reading` và `technology-learning` có một ladder thực hành thật: đọc source một lần rồi ẩn, trích action/constraint/evidence, giải thích hoặc áp dụng, sau đó transfer và delayed review bằng source chưa thấy. Sáu spoken loops đồng thời cho người học điều chỉnh tốc độ TTS và thấy rõ locale chỉ là yêu cầu synthetic, không phải human-accent evidence.

## In scope

- Thêm optional `ReadingLadderV1` chỉ cho written v3 task: `trainingSource`, 3–6 `extractionItems`, `applicationPrompt`, 2–5 `applicationChecklist`.
- Runtime đọc một lần cho baseline/transfer/review của task có ladder: source phải được đóng trước khi nhập output và không có nút mở lại trong phase.
- Runtime ladder ở input: source → extraction có đáp án/feedback → explain/apply bằng draft session-only + checklist.
- Author đủ ladder và bốn phase contexts khác facts cho `technical-doc-action-b1`, `technical-log-diagnosis-b1`, `learn-api-from-docs-b2`, `technology-troubleshooting-from-docs-b2`.
- TTS player có 0.85×/1×/1.15×, truyền rate vào Web Speech API, hiển thị requested locale và limitation synthetic/device voice.
- Sáu spoken loops giữ ít nhất ba requested locales; docs không gọi đây là human accent training.
- Mở rộng evaluation protocol thành study design có preregistration, primary outcomes, sampling/power rationale, exclusions, subgroup/fairness và stopping rule; không ghi kết quả chưa đo.

## Out of scope

- Không thêm licensed/human audio khi repository chưa có asset và provenance.
- Không triển khai ASR, pronunciation score, cloud API, analytics, account, upload hoặc dependency mới.
- Không đổi `ProgressEnvelopeV4`, không persist draft/extraction/application text.
- Không chạy hoặc bịa learner/listener study; không claim efficacy, mastery hay accent coverage.
- Không ép hai written workplace missions không dựa trên docs vào reading ladder P2.
- Không sửa hoặc commit dirty task/prompt/journal ngoài P2.

## Contracts

`ReadingLadderV1` có shape cố định: `version: "v1"`, `trainingSource` theo source section schema, `extractionItems[]` gồm `id`, `question`, `options`, `correctAnswer`, `feedback`, cùng `applicationPrompt` và `applicationChecklist[]`. Item ID unique; `correctAnswer` phải thuộc options. Field chỉ hợp lệ trên `mode: "written"`.

Với written task có ladder và context của phase `baseline|transfer|review`, textarea cùng action button bị khóa cho đến khi learner bấm “Đã đọc một lần — ẩn tài liệu”. Sau đó artifact biến mất cho đến khi đổi phase hoặc reload; đây là instructional constraint, không phải anti-cheat guarantee. Retry vẫn cho xem focused evidence.

`playModelAudio(source, rate)` nhận rate 0.85, 1 hoặc 1.15 từ player; bundled audio cũng dùng `HTMLAudioElement.playbackRate`. UI dùng wording “TTS tổng hợp trên thiết bị”, “requested locale” và “không thay thế human accent sample”.

## Acceptance criteria

### AC `AC-1`

Schema có optional `ReadingLadderV1` chỉ cho written v3 task, validate source, 3–6 extraction items unique/có đáp án hợp lệ, application prompt và 2–5 checklist items; đúng bốn bundled technical docs missions khai báo ladder.

### AC `AC-2`

Task có ladder buộc learner đọc rồi ẩn source trước khi nhập baseline/transfer/review; input ladder chạy source → extraction có feedback → explain/apply với checklist, và mọi draft/answer chỉ sống trong component session.

### AC `AC-3`

Bốn mission technical-reading/technology-learning có baseline/retry/transfer/review contexts với facts khác nhau, transfer/review dùng unseen source cùng function và delayed review tiếp tục dùng scheduler hiện có.

### AC `AC-4`

Model audio player hỗ trợ 0.85×/1×/1.15× và truyền rate thật cho Web Speech/bundled audio; UI ghi requested locale, synthetic device limitation, không gọi là human accent sample; sáu spoken loops có ít nhất ba requested locales.

### AC `AC-5`

Evaluation protocol có preregistration, primary outcomes, sampling/power rationale, exclusions, missing data, subgroup/fairness, agreement và stopping rule nhưng không ghi participant result hoặc efficacy claim.

### AC `AC-6`

Focused/full tests, lint, production build và desktop/mobile smoke QA pass; model isolation, local-only privacy, no horizontal overflow và no app-origin console error không regress.

## Risks and rollback

- Ladder quá dài: component có ba bước nhỏ, mỗi task 3 extraction items và checklist ngắn; rollback bằng bỏ `readingLadder` khỏi content.
- Read-once gây khó truy cập: chỉ áp dụng task có ladder, source được đọc đầy đủ trước khi khóa; reload có thể mở lại và app không claim chống gian lận.
- Device không có locale voice: UI công khai requested locale và voice count, fallback không được gọi là accent sample.
- Nội dung response lộ vào storage: component giữ state React session-only; regression scan storage/progress contract.