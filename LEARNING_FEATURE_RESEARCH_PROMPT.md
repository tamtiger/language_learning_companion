# Prompt nghiên cứu tính năng học tập dựa trên bằng chứng

Bạn là **Applied Linguistics Researcher + Learning Scientist + Workplace English
Curriculum Designer + Product Engineer**. Nhiệm vụ của bạn là audit Language
Learning Companion, research các can thiệp học tập đã có bằng chứng và đề xuất
những tính năng thực sự cần bổ sung. Không biến hai ý tưởng ban đầu của người
dùng — học IPA và học `sentence chunks` — thành kết luận có sẵn. Hãy xem chúng
như hai candidate cần được kiểm chứng cùng các phương án khác.

Đây là nhiệm vụ **research và ra quyết định sản phẩm**, không phải cuộc thi liệt
kê feature. Không implement, cài dependency, thay đổi privacy hoặc sửa product
files nếu người dùng chưa yêu cầu riêng sau khi nhận báo cáo.

Viết toàn bộ audit, research synthesis và recommendation bằng tiếng Việt. Giữ
nguyên thuật ngữ nghiên cứu, code identifier, tên schema và trích dẫn nguồn khi
cần để tránh làm sai nghĩa.

## North star

Tìm tập tính năng nhỏ nhất giúp người dùng tiến nhanh nhất từ “biết” sang **tự
thực hiện được nhiệm vụ bằng tiếng Anh trong tình huống mới**, phục vụ sáu mục
tiêu:

1. Giao tiếp tiếng Anh tự tin trong công việc.
2. Đọc tài liệu kỹ thuật mà không cần bản dịch.
3. Tham gia họp với đồng nghiệp quốc tế.
4. Giải thích ý tưởng kỹ thuật bằng tiếng Anh.
5. Phỏng vấn và làm việc tại công ty nước ngoài.
6. Học công nghệ mới hoàn toàn bằng tiếng Anh.

Người học chính là Software Engineer Việt Nam khoảng A2–B2, thường đọc code tốt
hơn nghe/nói, dễ dịch trong đầu, thiếu tự tin khi phản xạ và chỉ có 20–30 phút
mỗi ngày. Tối ưu **time-to-capability, independent transfer và delayed
retention**, không tối ưu số màn hình, streak, completion hay thời gian trong app.

## Nguyên tắc không thiên vị

- Bắt đầu từ job-to-be-done và gap quan sát được, không bắt đầu từ tên feature.
- Phân biệt **learning intervention** (cơ chế giúp học) với **product feature**
  (cách app triển khai cơ chế đó).
- Không kết luận “phổ biến nên hiệu quả”, “AI nên tốt hơn” hoặc “native-like nên
  là mục tiêu”. Với pronunciation, ưu tiên intelligibility và comprehensibility
  trong công việc hơn accent imitation.
- IPA có thể là công cụ chẩn đoán, một curriculum riêng, hoặc không cần thiết;
  `sentence chunks` có thể hỗ trợ automaticity nhưng cũng có nguy cơ học thuộc
  không transfer. Chỉ quyết định sau khi có evidence.
- Một can thiệp hiệu quả trong lớp học, với trẻ em, hoặc người học trình độ khác
  không tự động phù hợp với người lớn Việt Nam tự học trong app local-only.
- Không gộp confidence, enjoyment, engagement, knowledge test và performance
  thành cùng một outcome.

## Nguồn quyết định

Đọc và đối chiếu theo thứ tự:

1. `AGENTS.md`, `.harnix/workflow.md` và active task hợp lệ.
2. `PRODUCT.md`, `CONTENT.md`, `ARCHITECTURE.md`, `START_HERE.md`, `README.md`.
3. Toàn bộ `content/**/*.json`, schema/normalization, learning flow, progress,
   storage, tests và runtime thật liên quan.
4. `CURRICULUM_RESEARCH_PROMPT.md`, `LEARNER_AUDIT_PROMPT.md` và audit gần nhất;
   coi finding cũ là lead cần kiểm tra lại, không phải fact vĩnh viễn.
5. Nguồn bên ngoài đáp ứng tiêu chuẩn evidence ở phần Research.

Nếu docs, content, tests và runtime mâu thuẫn, ghi rõ khác biệt và ưu tiên hành vi
quan sát được. Không để prompt này trở thành source of truth cạnh tranh với owner
docs của sản phẩm.

## Pha 1 — Audit nhu cầu và feature hiện tại

Chạy app như một người học mới trên desktop và mobile. Hoàn thành tối thiểu:

- một pronunciation lesson;
- một spoken workplace mission;
- một meeting hoặc technical-explanation mission;
- một technical-reading hoặc learn-from-docs mission;
- một retry, một unseen transfer và một delayed-review path nếu app hỗ trợ.

Sau black-box QA, đọc code/content để xác minh nguyên nhân. Lập inventory tất cả
feature học tập hiện có và ghi cho từng feature:

```text
Feature/learning activity:
Job-to-be-done được phục vụ:
Learner action thực tế:
Input → processing → output:
Feedback và retry:
Scaffold và cách fade:
Transfer/delayed retrieval:
Outcome app đang đo:
Evidence runtime/content/test:
Điểm mạnh cần giữ:
Gap hoặc failure mode:
Confidence của kết luận:
```

Audit phải trả lời ít nhất các câu hỏi sau:

- Người học có **nghe và tạo speech thật**, hay chỉ đọc lý thuyết/trả lời quiz?
- Có luyện perception trước production, âm–từ–chunk–câu và connected speech
  không? Có model audio, playback, recording và focused retry thật không?
- Người học có retrieve câu dưới cue và time pressure, hay chỉ chép/soạn câu khi
  nhìn scaffold?
- Spoken task có interaction, clarification, repair, follow-up, interruption và
  recap không?
- Reading task có buộc dùng thông tin để quyết định/debug/giải thích, hay chỉ hỏi
  comprehension?
- Vocabulary và expressions có được retrieval, spacing, variation và tái sử
  dụng trong ngữ cảnh mới không?
- Feedback có chỉ ra hành động sửa cụ thể mà không giả vờ app đo được điều nó
  không đo không?
- Progress có phản ánh unaided performance, transfer và retention hay chỉ phản
  ánh completion/self-rating?

Tạo gap map theo đủ sáu mục tiêu; không suy ra feature cần xây chỉ từ việc content
đang thiếu một trường dữ liệu.

## Pha 2 — Research các cơ chế có khả năng tạo capability

Từ audit, chọn tối đa 5 câu hỏi nghiên cứu có thể thay đổi quyết định. Bắt buộc
xét, nhưng không bắt buộc chọn, các nhóm candidate sau:

### Listening và pronunciation

- explicit phonetic instruction và mức IPA tối thiểu;
- perceptual training, minimal pairs và high-variability phonetic training;
- articulatory instruction, visual mouth/tongue guidance;
- word stress, sentence stress, rhythm, linking và intonation;
- listen–imitate, shadowing, recording/playback và comparison với model;
- intelligibility/comprehensibility feedback so với accent scoring.

### Speaking automaticity và interaction

- formulaic sequences/lexical bundles/`sentence chunks`;
- retrieval from situational cue, substitution drill và response timebox;
- role-play, branching dialogue, information gap, conversation repair;
- rehearsal, repeated task, task repetition có variation và scaffold fading;
- planning time, speaking anxiety và willingness to communicate;
- self-explanation, self-assessment calibration và peer/expert feedback.

### Vocabulary, reading và learning from technical material

- retrieval practice, spacing, interleaving và expanding review;
- contextualized vocabulary, collocations và productive retrieval;
- extensive/intensive reading, glosses, captions và transcript fading;
- summarization, prediction, question generation và action-after-reading;
- authentic task-based learning và learning-by-explaining.

### Sequencing, feedback và measurement

- mastery learning, adaptive difficulty và deliberate practice;
- worked examples, completion problems và gradual scaffold fading;
- immediate so với delayed feedback; feedback theo bottleneck;
- transfer task, delayed retention check và performance rubric reliability;
- giới hạn của browser TTS, speech recognition, ASR pronunciation scoring và
  automated feedback đối với accent/người học Việt Nam.

Danh sách trên là search space, không phải backlog. Bổ sung candidate khác nếu
audit hoặc literature cho thấy leverage cao hơn.

## Quy tắc Research và tiêu chuẩn nguồn

- Bắt buộc browse/search cho mọi claim ảnh hưởng tới quyết định feature.
- Ưu tiên systematic review/meta-analysis, paper gốc peer-reviewed, replication,
  framework/chỉ dẫn chính thức và documentation kỹ thuật chính chủ.
- Dùng blog, video hoặc trang thương mại chỉ như mô tả implementation, không dùng
  làm bằng chứng learning effectiveness.
- Với kết luận ảnh hưởng rộng, tìm ít nhất hai nguồn độc lập. Nếu literature bất
  đồng, trình bày competing explanation thay vì chọn nguồn thuận ý.
- Với mỗi study, ghi population, proficiency, L1, setting, sample, duration,
  intervention, comparator, outcome, effect direction/size nếu có, retention
  interval và limitation.
- Phân biệt evidence về nhận biết kiến thức, performance ngay sau luyện, far
  transfer và delayed retention.
- Không biến correlation, learner preference hoặc self-report thành causal
  effect.
- Không dùng một nghiên cứu để biện minh cho cả feature bundle có nhiều cơ chế.
- Dừng research khi có đủ evidence để chọn/loại candidate; ghi rõ candidate nào
  vẫn inconclusive.

Tạo source log:

```text
Nguồn / link / ngày truy cập:
Loại nguồn và chất lượng:
Population và setting:
Intervention / comparator / dosage:
Outcome và thời điểm đo:
Kết quả liên quan:
Limitation / competing explanation:
Fact từ nguồn:
Inference cho persona của app:
Quyết định feature bị ảnh hưởng:
```

## Pha 3 — Tổng hợp evidence thành ma trận quyết định

Lập một hàng cho mỗi candidate feature/intervention:

| Candidate | Gap được xử lý | Cơ chế học | Outcome có evidence | Độ mạnh evidence | Transfer/retention | Fit với persona | Fit local-only/privacy | UX/accessibility | Effort/dependency | Rủi ro/tác dụng phụ | Quyết định |
|---|---|---|---|---|---|---|---|---|---|---|---|

Phân loại độ mạnh evidence theo định nghĩa nhất quán:

- **Strong:** nhiều nghiên cứu chất lượng hoặc synthesis nhất quán, outcome gần
  capability mục tiêu và có transfer/retention phù hợp.
- **Moderate:** kết quả khá nhất quán nhưng population, dosage hoặc outcome cần
  ngoại suy sang app.
- **Weak:** study nhỏ, short-term, self-report, thiếu comparator hoặc evidence
  gián tiếp.
- **Inconclusive/conflicting:** chưa đủ để ra quyết định hoặc kết quả bất đồng.

Không cộng điểm giả chính xác để che judgment. Nếu dùng score, công khai thang
điểm và giải thích từng điểm theo:

1. tác động tới sáu mục tiêu và bottleneck thực;
2. chất lượng và độ gần của evidence;
3. khả năng cải thiện independent transfer/delayed retention;
4. tần suất sử dụng trong công việc;
5. phù hợp A2–B2 và 20–30 phút/ngày;
6. feasibility, local-only privacy, accessibility và độ tin cậy đo lường;
7. chi phí content/runtime, dependency, migration và maintenance;
8. nguy cơ tạo illusion of learning hoặc lock-in vào proprietary service.

Xếp candidate vào đúng một nhóm:

- **Must-have foundation:** thiếu nó khiến learning loop không thể đạt outcome.
- **High-value experiment:** promising nhưng cần pilot đo trước khi rollout.
- **Useful later:** có giá trị nhưng không phải bottleneck hiện tại.
- **Reject/defer:** evidence yếu, không fit, rủi ro cao hoặc có giải pháp đơn giản
  hơn.

## Pha 4 — Chuyển intervention thành feature phù hợp app

Với mỗi candidate được chọn, mô tả:

```text
Tên feature:
Learner problem và job outcome:
Evidence-supported mechanism:
Một phiên 20–30 phút diễn ra thế nào:
Trigger/cue → learner action → feedback → retry → transfer → delayed review:
Content/schema/runtime/UI/storage cần thay đổi:
Điều app có thể đo trung thực:
Điều app không được tuyên bố đo:
Offline/privacy/accessibility behavior:
Failure mode và cách giảm rủi ro:
Smallest testable vertical slice:
Success/failure threshold của pilot:
Điều kiện rollout hoặc rollback:
```

Nếu đề xuất pronunciation:

- xác định mục tiêu là intelligibility/comprehensibility cho workplace speech;
- nói rõ vai trò của IPA, model audio, perception, production và feedback;
- không dùng TTS/ASR score như ground truth nếu chưa chứng minh độ tin cậy;
- tránh bắt học toàn bộ phonetic inventory trước khi được giao tiếp.

Nếu đề xuất chunks/automaticity:

- tổ chức theo communicative function và cue thật, không chỉ danh sách câu mẫu;
- có retrieval không nhìn mẫu, timebox vừa sức, substitution/variation, repair và
  transfer sang scenario mới;
- kiểm tra nguy cơ memorization without comprehension và fossilized
  pronunciation.

Nếu feature cần cloud, account, AI grading, upload audio/transcript, paid API
hoặc dependency lớn, tách nó thành phương án cần phê duyệt riêng và đưa ra một
local-only baseline để so sánh.

## Pha 5 — Ưu tiên roadmap và thiết kế pilot

Đề xuất roadmap theo dependency và evidence, không theo độ hấp dẫn của UI:

- **P0:** tối đa 1–2 foundation/vertical slice giải quyết bottleneck lớn nhất.
- **P1:** feature chỉ mở sau khi P0 đạt success threshold.
- **P2:** experiment hoặc enhancement có evidence yếu hơn.
- **Không làm:** feature bị loại và lý do.

Mỗi P0 phải có before/after learner journey, contract bị ảnh hưởng, content mẫu,
acceptance criteria và kế hoạch verification. Ưu tiên pilot nhỏ có thể so sánh
với baseline hiện tại; không bulk rewrite curriculum.

Định nghĩa success signal gần capability, ví dụ:

- pronunciation: listener hiểu đúng key information, giảm omission/substitution
  của âm ảnh hưởng nghĩa, cải thiện comprehensibility trong câu mới;
- speaking: giảm response latency nhưng vẫn đúng communicative function, xử lý
  follow-up/repair không nhìn mẫu và transfer sang scenario mới;
- reading: dùng source mới để chọn hành động hoặc giải thích đúng constraint mà
  không cần bản dịch;
- vocabulary/chunks: productive recall và sử dụng phù hợp sau trì hoãn, không chỉ
  recognition;
- workplace task: deliverable/interaction đáp ứng audience, stakes và definition
  of done.

Tách rõ signal đo tự động, expert/listener rating, learner study và hypothesis
chưa đo. Không tuyên bố efficacy từ synthetic QA.

## Guardrails

- Giữ local-only theo product contract; không upload hoặc persist response text,
  transcript, raw audio hay dữ liệu cá nhân.
- Không thêm AI/cloud/account/remote analytics/paid API/dependency lớn chỉ vì
  feature có vẻ hiện đại.
- Không tối ưu accent bản ngữ, gamification, streak hoặc engagement thay cho khả
  năng giao tiếp được hiểu và hoàn thành công việc.
- Không coi quiz correctness, word count, self-rating hoặc completion là mastery.
- Không đề xuất feature mà không nêu mechanism, evidence, dosage và outcome.
- Không sao chép proprietary curriculum/audio; content mẫu phải synthetic,
  licensed hoặc có provenance hợp lệ.
- Không giả lập expert/learner test thành measured result. Thiếu participant thì
  ghi research gap và protocol cần chạy.
- Không sửa/xóa test, user-owned files hay dirty worktree ngoài phạm vi.
- Không commit, push, publish hoặc tạo PR khi chưa có yêu cầu riêng.

## Deliverables bắt buộc

1. **Current feature audit:** inventory runtime và gap map theo sáu mục tiêu.
2. **Research questions và protocol:** inclusion/exclusion criteria, search terms,
   databases/sites và stopping rule.
3. **Source log:** đủ population, intervention, comparator, outcome và limits.
4. **Evidence synthesis:** tách fact, inference, hypothesis và recommendation.
5. **Candidate matrix:** evidence–fit–impact–cost–risk cho mọi candidate đã xét,
   bao gồm IPA và `sentence chunks`.
6. **Decision register:** chọn, thử nghiệm, hoãn hoặc loại từng candidate và lý do.
7. **Prioritized roadmap:** P0/P1/P2/không làm, dependency và rollout gate.
8. **P0 pilot brief:** learner journey, content/runtime impact, privacy,
   acceptance criteria, success/failure threshold và rollback.
9. **Measurement plan:** immediate performance, unseen transfer, delayed retention
   và expert/learner validation; ghi rõ điều chưa thể đo.
10. **Báo cáo cuối:** kết luận ngắn gọn, nguồn mạnh nhất, uncertainty còn lại và
    đúng một bước tiếp theo có leverage cao nhất.

## Cấu trúc báo cáo cuối

Trình bày theo thứ tự:

1. Bottleneck thực tế lớn nhất từ audit.
2. Những gì evidence ủng hộ, phản bác hoặc chưa kết luận được.
3. Kết luận riêng về IPA và `sentence chunks`, không trả lời nhị phân nếu vai trò
   của chúng khác nhau.
4. Top feature nên bổ sung và feature không nên làm lúc này.
5. P0 pilot nhỏ nhất, success threshold và rủi ro.
6. Roadmap sau pilot và research gap còn lại.

Không kết luận “đã chứng minh hiệu quả cho app” chỉ vì literature ủng hộ một cơ
chế. Literature cho phép chọn hypothesis tốt hơn; app chỉ được tuyên bố hiệu quả
sau khi pilot có learner evidence, transfer và delayed retention phù hợp.
