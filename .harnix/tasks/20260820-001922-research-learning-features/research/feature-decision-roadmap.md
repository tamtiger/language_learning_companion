# Feature decision roadmap

## Quyết định

Không xây full IPA course và không giả định học sentence chunks sẽ tự làm phát âm đúng. Tập P0 nhỏ nhất gồm hai loop gắn vào mission công việc hiện có:

1. **Audio-first perception → production:** nghe nhiều speaker/context, nhận biết contrast hoặc stress mang nghĩa, nhận feedback ngay; xem IPA/articulatory cue đúng lúc; nghe model chunk/câu; record và nghe lại; nói trong câu mới.
2. **Cue-driven interaction → transfer:** nhận situational cue, truy xuất functional chunks không thấy model, trả lời một follow-up/repair turn, nhận focused prompt, retry với dữ kiện đổi, làm unseen transfer và delayed retrieval.

IPA là công cụ chẩn đoán/ghi chú ngắn. Sentence chunks là vật liệu cho retrieval và biến đổi. Hai thứ chỉ có ý nghĩa khi nằm trong loop có perception, production, interaction và measurement.

## Nguyên tắc quyết định

- Tối ưu intelligibility, comprehensibility, correct intent và time-to-response; không tối ưu native accent.
- Ưu tiên capability sáu mục tiêu, đặc biệt meeting/workplace/technical explanation.
- App vẫn local-only: không account, cloud speech, analytics, paid API hay lưu audio/text.
- Không gọi quiz completion, duration hoặc self-confidence là learning efficacy.
- Mỗi feature mới phải có failure condition và rollback rõ.

## Candidate matrix

Thang 1–5: Evidence/fit/impact càng cao càng tốt; Cost/risk càng cao càng khó. Classification: Must-have, experiment, later, reject/defer.

| Candidate | Evidence | Persona fit | Expected impact | Cost | Risk | Classification | Lý do |
|---|---:|---:|---:|---:|---:|---|---|
| High-variability audio perception (nhiều voice/context + immediate feedback) | 5 | 5 | 5 | 3 | 2 | Must-have — P0 | vá trực tiếp khoảng trống nghe/nhận biết; production vẫn cần loop riêng |
| Record → listen-back → transparent checklist | 3 | 5 | 4 | 2 | 2 | Must-have — P0 | local, honest; không auto-diagnose nhưng tạo noticing và evidence sản xuất |
| Targeted IPA + articulatory cue just-in-time | 4 | 4 | 3 | 2 | 2 | Must-have hỗ trợ — P0 | symbol là map cho contrast cá nhân; không biến thành syllabus prerequisite |
| Functional sentence chunks theo cue | 3 | 5 | 4 | 2 | 3 | Experiment — P0 | evidence fluency mức vừa, population chưa khớp; phải đo retrieval/transfer |
| Scripted interlocutor follow-up/clarification/repair | 4 | 5 | 5 | 3 | 2 | Must-have — P0 | biến monologue thành interaction mà không cần AI/cloud |
| Context-varied focused retry | 4 | 5 | 4 | 2 | 2 | Must-have — P0 | giữ function, đổi facts/context để giảm memorized replay |
| Delayed cue-based retrieval + unseen transfer | 5 | 5 | 5 | 2 | 2 | Must-have — P0 | cần để biết gain có giữ và dùng được; schedule cụ thể vẫn cần test |
| Mở rộng `practiceContexts` cho 10 mission v3 | 3 | 5 | 4 | 3 | 2 | P1 | tăng variation sau khi P0 contract được chứng minh usable |
| Human listener/expert calibration protocol | 4 | 4 | 4 | 4 | 2 | P1 | cần cho efficacy validation, nhưng không phải daily feature |
| Extensive technical reading ladder | 5 | 5 | 4 | 5 | 2 | Later — P2 | evidence tốt nhưng opportunity cost lớn; current reading seed đã khá hơn speaking |
| Full IPA course trước khi giao tiếp | 2 | 2 | 2 | 4 | 4 | Reject | dễ tối ưu symbol/isolated accuracy và trì hoãn meaningful use |
| Shadowing-only track | 2 | 4 | 2 | 2 | 4 | Reject | model imitation không đủ chứng minh retrieval, interaction hoặc transfer |
| ASR/AI pronunciation score | 3 | 3 | 3 | 5 | 5 | Reject/defer | validity/fairness, false precision, browser support và privacy không khớp boundary |
| Streak, XP, leaderboard | 1 | 2 | 1 | 3 | 4 | Reject | không sửa learning bottleneck; dễ tối ưu engagement proxy |

## P0 — Pilot “Understand → Retrieve → Repair”

### Phạm vi

Chỉ pilot trên hai communicative functions có giá trị cao:

- meeting: disagree constructively + recap decision;
- technical explanation: explain a trade-off + answer a clarification.

Mỗi function có 4–6 functional chunks, 2 target pronunciation cues tối đa, 3 speaker voices và ít nhất 3 context variants. Không mở rộng toàn catalog trước khi đạt threshold.

### Learner journey 8–12 phút

1. **Cold cue (60–90 giây):** learner nghe/đọc một workplace cue, phản hồi không model; app chỉ record local và giữ metadata tạm.
2. **Perception pretest + set (2 phút):** 4 item untrained-speaker không feedback để lấy baseline, rồi 6–10 training item từ ≥3 voices và nhiều sentence contexts với immediate feedback; kết thúc bằng posttest tương đương nhưng không lặp item.
3. **Micro-cue (≤45 giây):** chỉ khi sai pattern: IPA symbol + mouth/tongue/final-release cue + meaning impact. Có nút bỏ qua.
4. **Notice model (1 phút):** nghe full sentence/chunk, đánh dấu stress/final sound/linking liên quan; không bắt chép IPA.
5. **Produce & listen-back (2 phút):** record câu có dữ kiện của learner, nghe lại bắt buộc một lần, đánh checklist listener-oriented: intent, critical words/final sounds, stress focus, pace.
6. **Interaction turn (1 phút):** app phát một follow-up/clarification cố định theo branch; learner phải repair/clarify bằng cue, không thấy model.
7. **Focused retry (1–2 phút):** một prompt ứng với tiêu chí chưa đạt; context/facts đổi, structure có thể giữ.
8. **Unseen transfer (1–2 phút):** scenario mới cùng function, không model/chunk bank.
9. **Delayed review:** cue mới ở D2 và D7; không replay model trước retrieval.

### Nội dung pronunciation

- Không dạy toàn bộ IPA. Diagnostic chọn tối đa hai feature gây rủi ro hiểu sai trong task, ví dụ final consonant/cluster phân biệt `test`/`tests`, stress của technical terms, hoặc thought-group stress.
- Audio ưu tiên human-recorded/bundled assets với nhiều speaker nếu khả thi; browser TTS có thể làm prototype fallback nhưng không được gọi là high-variability human speech.
- Feedback nói rõ “đây là cue để tự kiểm”, không nói “phát âm đúng/sai” nếu app không có listener hoặc validated scorer.

### Sentence chunks

Chunk phải biểu diễn function và có slot để thay dữ kiện:

- `I see the benefit, but I'm concerned about ___ because ___.`
- `So the decision is ___, and the next owner is ___.`
- `The trade-off is ___ versus ___; for this release, I'd choose ___.`
- repair: `Let me rephrase that: ___.`

Không tính thành công bằng việc chọn/đọc lại nguyên chunk. Success chỉ được tính khi learner lấy chunk từ cue, thay slot hợp lý, phản hồi follow-up và dùng được ở unseen context.

## Measurement contract

### App-observable, local-only

- perception accuracy ở pretest/posttest và trên trained/untrained-speaker items;
- cue-to-speech-start latency (không lưu audio);
- learner có record + listen-back hay không;
- rubric item và independence declaration;
- transfer/delayed completion và task duration;
- mọi metadata nằm trong local storage, có nút reset; audio/text chỉ trong memory/object URL và bị bỏ khi rời attempt.

Những metric này là behavior/process evidence, không tự động là pronunciation quality hoặc efficacy.

### Pilot evaluation ngoài product claim

Recruit 12–20 learner A2–B2 đúng persona, cân bằng tương đối theo band; dùng within-person baseline/transfer/D7. Với consent riêng, 2 listener không biết phase chấm:

- **intent/critical-fact recovery:** listener ghi đúng intended action, risk, owner hoặc decision;
- **comprehensibility:** effort scale ngắn đã định nghĩa trước;
- **interaction success:** learner trả lời đúng follow-up mà không lộ model;
- **independence:** không mở model/chunk bank trong transfer.

Sample này là feasibility pilot, không đủ để tuyên bố causal efficacy rộng.

### success threshold

Pilot đạt để mở rộng P1 khi đồng thời:

1. ≥75% participant hoàn thành journey không trợ giúp kỹ thuật và median ≤12 phút;
2. perception trên untrained-speaker item tăng ≥20 percentage points từ pre tới post và D7 còn ≥10 points trên pre;
3. ≥70% unseen transfer truyền đúng intent + critical facts cho cả hai listener;
4. ≥60% D7 task truyền đúng intent + critical facts, không xem model trước;
5. median cue-to-start giảm ≥20% từ baseline tới transfer nhưng intent recovery không giảm;
6. không có audio/text được persist hoặc gửi network; 0 false claim kiểu “phát âm chính xác” từ self-rubric.

Threshold là go/no-go cho iteration, không phải chuẩn proficiency.

### Failure threshold và rollback

Rollback P0 slice hoặc giữ sau feature flag nếu xảy ra một trong các điều kiện:

- completion giảm >20 percentage points so với current mission flow;
- >20% participant không hiểu IPA/cue hoặc cue làm task chậm hơn mà transfer không tăng;
- D7 intent recovery không cao hơn baseline hoặc observer agreement quá thấp để dùng rubric;
- state/audio leak, network request ngoài static assets, hoặc stale recording state giữa phase;
- learner chỉ thuộc template: trained prompt tăng nhưng unseen transfer không tăng.

Rollback không xóa progress cũ: tắt static/local feature flag, quay về v3 mission renderer, giữ schema backward-compatible cho đến khi quyết định migration riêng.

### Rollout

1. Internal content/UX dry run với hai functions.
2. 3–5 learner usability test; sửa instruction/state trước khi đo learning proxy.
3. Feasibility pilot 12–20 learner + blinded listener rating.
4. Chỉ mở rộng nếu toàn bộ success threshold đạt; nếu chỉ usability đạt, iterate chứ không scale.

## P1 — Sau khi P0 qua gate

- Sửa hai defect prerequisite: source của technical-reading baseline và reset/key `SpokenResponse` theo phase.
- Mở rộng context bank cho 10 mission v3 còn lại, ưu tiên workplace clarification, architecture/trade-off và interviews.
- Calibrate rubric bằng listener/expert; hiển thị “evidence observed” thay cho mastery.
- Cá nhân hóa target cue từ diagnostic, không từ giả định “mọi người Việt”.
- Thử equal vs longer spacing theo task; không hard-code lịch tối ưu từ meta-analysis.
- Thêm multi-turn scripted branches: ask-back, interruption, misunderstanding, repair, recap.

## P2 — Later

- Extensive technical reading ladder: graded độ dài/độ khó, read once → action extraction → explain/apply, delayed retrieval.
- Listening variety theo accent quốc tế và tốc độ nói, sau khi content production pipeline ổn định.
- Human-calibrated assessment study lớn hơn để ước lượng efficacy và subgroup effects.
- Chỉ xem xét on-device ASR khi browser support, privacy, bias/validity và fallback được chứng minh; transcript không được biến thành pronunciation score mặc định.

## Những gì không nên build lúc này

- Full IPA inventory, IPA quiz farm hoặc unlock giao tiếp bằng bài thi IPA.
- Phrasebook dài không có cue, slots, follow-up, transfer và delayed retrieval.
- Shadowing streak, native-accent score, leaderboard hoặc “AI coach” không giải thích căn cứ.
- Cloud transcription/recording, account/analytics hoặc dependency mới trong pilot local-only.

## Decision risks

| Risk | Mitigation |
|---|---|
| learner bắt chước model nhưng không retrieve | cold cue, model-after-attempt, unseen transfer, D7 |
| template dependence | slot variation + follow-up/repair + context change |
| self-rating optimism | listener outcome ở pilot, process metrics ghi đúng tên |
| IPA overload | diagnostic + tối đa 2 cue/task + skip |
| TTS variability | bundled human audio cho pilot; TTS chỉ fallback được gắn nhãn |
| content cost tăng | chỉ 2 functions trước, reuse interaction contract |
| privacy regression | no-persist audio/text, network inspection, reset contract |

## Kết luận ưu tiên

P0 không phải “IPA hay sentence chunks”. P0 là một loop nhỏ kết hợp **perception có biến thiên, cue IPA đúng lúc, production + listen-back, functional chunks được truy xuất, interaction repair, unseen transfer và delayed retention**. IPA và chunks là hai thành phần có vai trò giới hạn; chính loop và phép đo mới phục vụ capability thật.