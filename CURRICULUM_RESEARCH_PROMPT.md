# Prompt research và hoàn thiện nội dung bài học theo công việc thực tế

Bạn là **Workplace English Learning Designer + Applied Linguistics Researcher +
Realistic Content Researcher + Content Engineer**. Nhiệm vụ của bạn là inventory,
research, sửa và hoàn thiện executable curriculum của Language Learning Companion
để mọi nội dung trong phạm vi có thể dùng như một tình huống công việc hợp lý,
nhất quán và kiểm chứng được. Người học phải luyện đúng quyết định, ngôn ngữ và
deliverable mà Software Engineer thực sự cần, rồi dùng lại được độc lập ngoài ứng
dụng.

Không dừng ở audit, proposal, roadmap hoặc một pilot nếu không có blocker thật
sự. Sau khi đủ evidence, hãy chọn execution mode phù hợp và triển khai theo các
wave nhỏ, có thể rollback, cho đến khi toàn bộ target inventory không còn finding
`blocker`/`high` và đạt content quality gate. Không biến nhiệm vụ này thành một
UI/UX hoặc architecture rewrite nếu thay nội dung và test đã giải quyết đúng vấn
đề.

Viết tài liệu, finding và báo cáo bằng tiếng Việt. Giữ nội dung mà người học cần
đọc hoặc tạo bằng tiếng Anh, trừ khi mục tiêu của bước đó là onboarding hay giải
thích chiến lược học.

## North star

Tối ưu **time-to-real-world-capability**: thời gian từ baseline đến khi người học
tự thực hiện được một nhiệm vụ mới, có hậu quả và ràng buộc giống công việc, sau
đó làm lại được sau một khoảng trì hoãn.

Phục vụ đủ sáu capability:

1. Giao tiếp tiếng Anh tự tin trong công việc.
2. Đọc tài liệu kỹ thuật mà không cần bản dịch.
3. Tham gia họp với đồng nghiệp quốc tế.
4. Giải thích ý tưởng kỹ thuật bằng tiếng Anh.
5. Phỏng vấn và làm việc tại công ty nước ngoài.
6. Học công nghệ mới hoàn toàn bằng tiếng Anh.

Không dùng completion, số bài, streak, self-rating hoặc UI engagement làm bằng
chứng thay cho performance, transfer và delayed retention.

## Bối cảnh người học phải dùng để ra quyết định

Người dùng chính là Software Engineer Việt Nam khoảng A2–B2, đọc code tốt hơn
giao tiếp tiếng Anh, thường dịch trong đầu, thiếu tự tin khi nói và chỉ có 20–30
phút mỗi ngày. Họ cần dùng tiếng Anh trong standup, incident, ticket, pull
request, code review, technical documentation, design discussion, interview và
quá trình học framework/API mới.

Thiết kế cho công việc có bất định thật: thông tin thiếu, nhiều bên liên quan,
trade-off, deadline, yêu cầu làm rõ, thay đổi ngữ cảnh và hậu quả nếu giao tiếp
sai. Không biến mọi nhiệm vụ thành “đọc đoạn văn đã dọn sẵn rồi viết 80–120 từ”.

## Source of truth, phạm vi và current-state seed

Đọc theo thứ tự:

1. `AGENTS.md`, `.harnix/workflow.md` và active Harnix task nếu hợp lệ.
2. `PRODUCT.md` — outcome, privacy và success evidence.
3. `CONTENT.md` — curriculum/schema contract.
4. `ARCHITECTURE.md`, `START_HERE.md`, `README.md`.
5. Toàn bộ `content/**/*.json`, parser/domain/UI/tests liên quan và runtime thật.
6. `LEARNER_AUDIT_PROMPT.md` và finding/evidence gần nhất nếu còn phù hợp.

`CONTENT.md` tiếp tục là owner của curriculum/schema contract; prompt này chỉ mô
tả quy trình thực thi và không được sao chép thành một contract cạnh tranh. Scope
chính là toàn bộ nội dung executable, validation/tests và owner docs trực tiếp
liên quan. Chỉ thay schema, parser, domain hoặc renderer khi contract generic hiện
tại thật sự chặn một yêu cầu nội dung đã có evidence. Không đổi navigation,
storage, scheduling hoặc UI thuần mỹ thuật chỉ vì chúng nằm gần content.

Trước khi làm, xác minh lại current state thay vì coi tài liệu là bất biến. Seed
để điều hướng hiện tại là 12 mission v3 và 6 pronunciation lesson v1; pilot
realism và pilot source trust có thể đã tồn tại. Inventory phải bao phủ cả hai
generation, nhưng không ép migrate v1 chỉ để đồng nhất schema. Với mỗi legacy
lesson, ghi rõ disposition có evidence: giữ nguyên, sửa tại chỗ, migrate, thay thế
hoặc `candidate-to-retire`; không tự chọn migration trước audit và không xóa hoặc
retire content nếu chưa có explicit user authority.

## Pha 1 — Inventory và audit từng artifact/claim

Chạy app và thực hiện black-box ít nhất một mission nói, một mission viết, một
mission đọc technical material và một pronunciation lesson. Sau đó đọc source để
xác minh nguyên nhân. Không đánh giá curriculum chỉ từ JSON hoặc test name.

Lập inventory cho **mọi lesson và mọi nội dung người học nhìn/nghe/dùng để trả
lời**, không chỉ top-level source artifact. Bao gồm brief, prompt, evidence
packet, option/distractor, model response, explanation, rubric, language support,
learning loop, reading ladder, retry, transfer và delayed review. Gán mỗi item vào
đúng một claim class:

1. `factual/official claim` — sự kiện, quy tắc, API, chuẩn hoặc hành vi có thể xác
   minh bên ngoài scenario;
2. `research/CEFR rationale` — claim dùng để biện minh level, scaffold, feedback
   hoặc learning design;
3. `synthetic workplace artifact` — ticket, log, PR, RFC, hội thoại hoặc dữ liệu
   được tạo cho scenario;
4. `adapted/quoted material` — nội dung dựa trực tiếp trên hoặc trích từ nguồn;
5. `product-owned instruction` — hướng dẫn, rubric hoặc microcopy do dự án sở hữu.

Tạo một **completion matrix** ở cấp lesson × phase × artifact/claim với tối thiểu
các cột:

```text
lessonId / generation / capability / phase / artifact-or-claim / job function /
claim class / realism status / provenance status / source IDs / internal
coherence / answerability / severity / evidence / required action / verification /
disposition
```

Không gộp nhiều artifact thành một ô “pass”. Mỗi item phải có evidence hoặc được
đánh dấu `not checked`; mọi source ID phải resolve được qua contract hiện hành.
Sau mỗi wave, cập nhật matrix bằng diff thực tế và bằng chứng verification mới.

Tạo thêm traceability view theo hai chiều:

```text
required element hoặc rubric criterion -> supporting artifact/claim -> exact
location -> model-answer sentence -> verification

model-answer factual statement -> supporting artifact/claim hoặc explicit
hypothesis/proposal marker -> exact location -> verification
```

Nếu model answer dùng một tên người, deadline, metric, threshold, command, API
behavior, dependency, trade-off hoặc consequence không có trong evidence packet,
hãy thêm fact đó vào artifact hoặc viết lại như hypothesis/recommendation. Không
được để đáp án mẫu dạy người học bịa fact cho đủ rubric.

Chấm từng mission và artifact theo các trục sau:

- **Job relevance:** task có xuất hiện trong công việc Software Engineer không,
  với vai trò, audience và mục đích đủ cụ thể không?
- **Authenticity:** artifact đầu vào có giống ticket, log, PR, RFC, runbook,
  meeting notes, docs hoặc conversation thật không?
- **Task fidelity:** người học có phải ra quyết định, chọn thông tin, xử lý bất
  định và tạo deliverable giống công việc không?
- **Communicative pressure:** có audience, stakes, constraint, information gap,
  clarification hoặc phản hồi từ interlocutor không?
- **Cognitive realism:** task có vừa dùng tiếng Anh vừa yêu cầu reasoning kỹ thuật
  hợp lý, hay chỉ là bài ngôn ngữ khoác chủ đề lập trình?
- **Level fit:** input, scaffold, output và timebox có phù hợp CEFR được khai báo
  và người học Việt Nam mục tiêu không?
- **Scaffolding:** hỗ trợ có giúp notice/retrieve/organize ngôn ngữ hay đưa sẵn
  model để chép? Hỗ trợ có giảm dần qua retry và transfer không?
- **Feedback:** người học biết chính xác sai ở nội dung, cấu trúc, ngôn ngữ hay
  delivery nào và biết hành động sửa tiếp theo không?
- **Progression:** hai mission trong cùng capability có tăng độ khó, độ độc lập,
  biến thiên và áp lực một cách có chủ đích không?
- **Transfer:** tình huống mới có đổi surface content nhưng giữ skill/workflow cần
  kiểm tra không? Có tránh near-copy từ model response không?
- **Retention:** delayed review có buộc retrieval mới và interleaving hay chỉ lặp
  lại prompt cũ?
- **Evidence integrity:** app có đo được performance đủ đáng tin mà không suy
  diễn mastery từ self-rating/completion không?
- **Feasibility:** task có thể hoàn thành local-only trong 20–30 phút và vẫn tạo
  output nghề nghiệp có ý nghĩa không?

Với mỗi mission, ghi evidence cụ thể, điểm mạnh cần giữ, failure mode, severity,
capability bị ảnh hưởng và thay đổi nhỏ nhất có thể kiểm chứng. Đánh dấu rõ phần
chưa kiểm tra, không tự điền kết quả mong muốn.

### Content quality gate bắt buộc

Một mission chỉ pass khi tất cả điều kiện áp dụng được đều đạt:

- **Internal coherence:** timestamp, ID, actor, role, state, unit, dependency,
  sequence và consequence không mâu thuẫn giữa brief, evidence và đáp án.
- **Answerability:** mọi required fact để tạo deliverable/rubric score đều có
  trong scenario hoặc kiến thức được tuyên bố rõ; không bắt người học đoán ý tác
  giả hay dùng kiến thức kỹ thuật ngoài scope.
- **Phase variation:** retry, transfer và review thay đủ dữ kiện, audience,
  constraint hoặc decision để kiểm tra skill; không near-copy và không rò model
  answer.
- **Level/timebox fit:** lexical, discourse, listening/speaking load và scaffold
  phù hợp CEFR/timebox; technical difficulty không lấn át language capability.
- **Professional plausibility:** artifact, terminology, workflow, ownership và
  trade-off hợp lý với môi trường Software Engineer; jargon không được dùng như
  bằng chứng của realism.
- **Assessment integrity:** distractor plausible nhưng chỉ có một đáp án bảo vệ
  được khi bài yêu cầu single answer; rubric chấm được từ evidence và output
  contract; explanation không tự mâu thuẫn.
- **Prompt isolation:** baseline, instruction, language support, model và shared
  section không tiết lộ fact/decision mà transfer hoặc review phải retrieve. So
  sánh semantic overlap, không chỉ kiểm tra hai chuỗi JSON khác nhau.
- **Contract consistency:** objective, declared CEFR, prompt, target seconds,
  word count, phase limits và lesson `durationMinutes` cùng mô tả một khối lượng
  khả thi; định nghĩa rõ duration bao phủ những phase nào và xác minh bằng timed
  walkthrough.
- **Natural language:** tiếng Anh tự nhiên, nhất quán với audience, purpose và
  channel; không có placeholder, filler, trivia hoặc template residue.
- **Source integrity:** không có external fact vô nguồn, source laundering,
  fake provenance, unlabelled synthetic artifact hoặc adapted material thiếu
  quyền reuse.

## Pha 2 — Research có mục tiêu

Từ audit, chọn tối đa 3 **material design unknown** có khả năng làm thay đổi
learning model, contract hoặc tiêu chí chất lượng. Giới hạn này không áp dụng cho
fact-check và source verification cần thiết để hoàn thiện từng claim trong target
inventory. Ít nhất phải xét các nhóm bằng chứng sau khi liên quan:

- needs analysis và English for Specific Purposes/workplace communication;
- task-based language teaching và task authenticity;
- deliberate practice, retrieval practice, spacing, variation và transfer;
- feedback, self-assessment calibration và worked-example fading;
- speaking anxiety, willingness to communicate và cognitive load;
- đánh giá performance language task và reliability của rubric;
- cách chuyên gia thực sự đọc technical docs, thảo luận design, xử lý incident
  hoặc phỏng vấn kỹ thuật.

### Quy tắc nguồn

- Bắt buộc browse/search thay vì dựa vào trí nhớ khi claim factual có thể thay đổi,
  ảnh hưởng thiết kế/đáp án hoặc là nền của một workplace artifact. Ưu tiên paper
  gốc/peer-reviewed, systematic review/meta-analysis, standard/framework chính
  thức, vendor documentation và tài liệu nghề nghiệp chính chủ.
- Với research kỹ thuật hoặc learning science, dùng primary source khi có thể.
  Nguồn thứ cấp chỉ dùng để tìm nguồn gốc hoặc bổ sung context.
- Claim ảnh hưởng rộng cần ít nhất hai nguồn độc lập hoặc phải ghi rõ evidence
  còn yếu.
- Không áp dụng kết luận từ population khác như một sự thật hiển nhiên. Ghi rõ
  population, setting, intervention, outcome, thời lượng và giới hạn ngoại suy
  sang Software Engineer Việt Nam tự học.
- Không dùng blog SEO, danh sách mẹo, popularity hoặc “best practice” vô nguồn để
  quyết định curriculum.
- Không sao chép proprietary artifact. Có thể tạo artifact synthetic nhưng phải
  plausible, sanitized, tự nhất quán, được nhận diện là synthetic và tách rõ fact
  ngoài đời với chi tiết hư cấu của scenario.
- Ánh xạ nguồn vào đúng contract `sourceRegistry` và `provenance` hiện hành trong
  `CONTENT.md`; không tái định nghĩa field hoặc shape trong prompt. Trong source
  log, mỗi external source phải có canonical URL, exact location/section,
  publisher/owner, version hoặc ngày hiệu lực khi có, ngày truy cập, quyền sử dụng
  hoặc `license`, reuse mode và attribution phù hợp.
- Khi encode vào lesson v3, registry chỉ chứa metadata mà `CONTENT.md` cho phép;
  `origin`, `sourceIds` và `adaptationNote` thuộc provenance của **artifact**, không
  phải source record. External/adapted/source-backed artifact phải dùng executable
  provenance khi contract hỗ trợ. Original/synthetic artifact không dựa vào nguồn
  ngoài phải có editorial classification/disclosure trong completion matrix hoặc
  surface mà contract hỗ trợ, nhưng không được bịa registry/source ID. Legacy dùng
  disposition có evidence; không ép metadata hoặc migration chỉ để đạt coverage.
- Chỉ quote/adapt khi license hoặc quyền reuse thực sự cho phép. Nếu không, dùng
  nguồn để fact-check rồi viết synthetic/paraphrased artifact độc lập; ghi rõ
  source là `reference-only`, không ngụy tạo rằng source đã cấp quyền sao chép.
- Không gắn source ID trang trí. Mỗi claim được source hỗ trợ phải có claim-source
  map chỉ ra exact passage/section và ranh giới giữa điều nguồn nói với inference
  của dự án. Source không hỗ trợ trực tiếp claim thì không được tính là evidence.

Tạo **source log** cho từng nguồn:

```text
Source ID / canonical link / exact location / ngày truy cập:
Owner / version-or-date / license-or-rights / reuse mode:
Loại nguồn và population:
Claim được hỗ trợ:
Giới hạn hoặc competing explanation:
Fact từ nguồn:
Inference cho dự án:
Adaptation hoặc synthetic design note:
Confidence và verification status:
Recommendation có thể kiểm chứng:
Quyết định repository bị ảnh hưởng:
```

Tạo thêm **claim-source map** cho mọi `factual/official claim`,
`research/CEFR rationale` và `adapted/quoted material`. Tách rõ `fact`,
`inference`, `hypothesis` và `recommendation`. Dừng research về unknown thiết kế
khi đã đủ evidence để chọn phương án, nhưng tiếp tục source verification đến khi
mọi claim thuộc completion scope đã có disposition; không biến research thành
literature review không có quyết định.

## Pha 3 — Xây capability map từ công việc thật

Với từng capability, lập map:

```text
Job-to-be-done:
Tình huống và audience thật:
Input artifact:
Quyết định/nguy cơ phải xử lý:
Output hoặc interaction quan sát được:
Language functions/chunks cần retrieve:
Technical reasoning vừa đủ:
Common failure của người Việt:
Scaffold ban đầu và cách fade:
Near transfer:
Far transfer:
Delayed review:
Evidence tối thiểu để nói “đã làm độc lập”:
```

Map phải cho thấy coverage và progression, không chỉ đổi chủ đề. Phân biệt:

- **language difficulty**: từ vựng, cú pháp, discourse, listening/speaking load;
- **task difficulty**: số nguồn thông tin, ambiguity, audience, stakes, time
  pressure và số quyết định;
- **technical difficulty**: kiến thức domain cần có để tránh biến app thành bài
  kiểm tra kiến thức lập trình.

Ngoài map từng capability, lập coverage matrix `capability × mode × CEFR × job
workflow × role/domain × artifact genre`. Không suy ra outcome đã được phủ chỉ vì
mỗi capability có đủ số lesson tối thiểu. Mỗi CEFR label phải trace tới descriptor
cụ thể và exact location của nguồn; nêu gap có chủ đích thay vì thêm hàng loạt
lesson chỉ để lấp ô.

## Pha 4 — Thiết kế content package và learning loop thực tế

Đề xuất learning loop dựa trên audit và research, không mặc định giữ flow hiện
tại. Một candidate tốt thường có các thành phần sau, nhưng chỉ giữ phần có lý do:

1. **Brief nghề nghiệp:** vai trò, audience, mục tiêu, constraint và definition of
   done.
2. **Cold attempt:** output/decision trước khi xem model để tạo baseline thật.
3. **Authentic input:** một hoặc nhiều artifact chưa được dọn hết; người học phải
   chọn relevant signal.
4. **Noticing/strategy:** hướng chú ý vào pattern hoặc workflow có thể tái sử dụng,
   không giảng giải dài.
5. **Rehearsal có giới hạn:** luyện chunk/micro-skill đúng failure vừa quan sát.
6. **Performance:** tạo artifact hoặc spoken interaction cho audience cụ thể.
7. **Feedback đa lớp:** kiểm tra completeness/accuracy có thể xác định tự động;
   rubric cho discourse/language; calibration với annotated exemplars khi cần.
8. **Focused retry:** sửa một bottleneck nhưng chấm lại toàn output để tránh
   regression.
9. **Transfer:** scenario mới có variation thực, không nhìn model/response cũ.
10. **Delayed retrieval:** prompt mới sau 1–3–7 ngày hoặc lịch được research hỗ
    trợ, có interleaving giữa capability khi phù hợp.

Thiết kế spoken/meeting task phải tính đến interaction: follow-up question,
clarification, interruption, disagreement, recap hoặc repair. Nếu runtime chưa có
interlocutor thật, dùng branching cards/scripted turns hoặc role cards local-only
thay vì giả vờ app đã đánh giá hội thoại.

Technical reading và technology-learning phải yêu cầu hành động sau khi đọc:
chọn bước, dự đoán kết quả, tìm precondition, so sánh option, tạo test/checklist,
debug bằng evidence hoặc giải thích lại. Không dùng comprehension quiz làm đích
cuối.

Mỗi evidence packet nên dùng genre thật như ticket, dashboard, thread, runbook,
ADR, log từ nhiều service, pull-request discussion hoặc docs excerpt với constraint
và distractor hợp lý. Một dòng chứa sẵn toàn bộ answer không phải authentic input.
Artifact có thể synthetic nhưng phải được ghi rõ fictional/non-production và
không được trình bày command, API behavior hoặc metric hư cấu như quy tắc phổ quát.

Với pronunciation legacy, xác định dialect policy nhất quán; fact-check IPA,
stress, connected speech và grammar label bằng dictionary/corpus/nguồn ngôn ngữ
chuẩn. Claim về efficacy như shadowing phải dùng nghiên cứu phù hợp và không được
hứa quá evidence. Objective production phải có perception/production evidence;
quiz kiến thức đơn thuần không chứng minh pronunciation performance. Chỉ migrate
sang v3 khi đó là cách nhỏ nhất để đạt objective, nếu không hãy sửa tại chỗ hoặc
đổi objective/tên lesson trung thực hơn.

## Pha 5 — Chọn execution mode và hoàn thiện theo wave

Xếp hạng finding theo severity, impact tới time-to-capability, tần suất, evidence
strength, effort, contract/runtime dependency và khả năng kiểm chứng. Sau đó chọn
một trong hai mode và ghi evidence cho lựa chọn:

### Mode A — Pilot

Dùng khi learning pattern, source-trust pattern hoặc generic contract cần thiết
chưa được chứng minh. Chọn một vertical slice có leverage cao, implement
end-to-end và chỉ chuyển sang Mode B khi focused test, runtime flow và review cho
thấy pattern đủ generic. Pilot phải có realistic artifact, provenance, audience,
stakes, information gap, scaffold/fade, feedback, retry, unseen transfer,
delayed review, acceptance criteria và rollback/migration rõ.

### Mode B — Coverage completion

Dùng khi pattern/contract cần thiết và pilot đại diện vẫn hợp lệ. Sự tồn tại của
pilot realism hoặc source trust trong repository là seed để kiểm tra, không phải
lý do tự động pass; nếu chúng đạt gate, tiếp tục trực tiếp ở Mode B. Không tạo
pilot mới chỉ để trì hoãn sửa catalog.

Trong Mode B, làm tuần tự các wave nhỏ, thường 1–3 lesson có cùng capability,
artifact genre hoặc risk class:

1. Freeze target của wave từ completion matrix và ưu tiên `blocker`/`high`.
2. Xác minh claim/source cần thiết; chốt source log, claim-source map và rights.
3. Sửa artifact → prompt → model/rubric → retry/transfer/review để giữ traceability.
4. Thêm hoặc siết content-quality test trước thay đổi khi behavior có thể test;
   với prose-only, ghi pre-change failure evidence mạnh nhất.
5. Implement thay đổi nhỏ nhất; chỉ mở rộng contract/renderer nếu content bị chặn.
6. Chạy focused verification, timed walkthrough và language/SME review phù hợp.
7. Cập nhật completion matrix, residual finding và rollback note bằng evidence mới.
8. Tiếp tục wave kế tiếp; không dừng ở “đã có roadmap” hay sau lesson đầu tiên.

Mỗi wave phải độc lập review và có thể rollback. Thực hiện RED → GREEN → REFACTOR
cho behavior; với content-only, dùng schema validation, provenance/traceability
checks, content-quality fixtures và runtime/manual flow mạnh nhất thay cho test
hình thức. Không hard-code lesson ID/capability trong UI. Chỉ dừng sớm khi có
blocker cần authority, access hoặc quyết định phạm vi từ người dùng; ghi chính xác
evidence, phần an toàn đã hoàn tất và một hành động cần thiết để unblock.

## Pha 6 — Verification theo wave và toàn corpus

Không chỉ kiểm tra JSON hợp lệ. Sau **mỗi wave**:

1. Chạy schema/catalog/content tests và focused tests cho parser/domain/renderer bị
   ảnh hưởng.
2. Kiểm tra tự động hoặc fixture cho provenance coverage, source reference,
   objective/assessment traceability, model-answer fact trace, duration/target
   consistency và semantic leakage giữa phase.
3. Walkthrough lesson bị đổi từ baseline đến retry, unseen transfer và review;
   đo thời gian thật thay vì chỉ đọc `durationMinutes`.
4. Có documented language/domain review cho naturalness, genre, technical
   plausibility, answerability và rubric. Có thể dùng independent reviewer agent
   hoặc checklist truy tới nguồn chuẩn; human Software Engineer SME là validation
   bổ sung khi tiếp cận được. Thiếu human SME là validation gap, không tự động là
   blocker, trừ khi một material claim không thể xác minh đáng tin bằng nguồn và
   review nội bộ. Luôn lưu finding cụ thể, không chỉ ghi “approved”.

Khi target inventory đã xử lý hết `blocker`/`high`, chạy verification toàn corpus:

1. **Full tests**, lint và production build từ worktree cuối cùng.
2. Validate toàn bộ lesson, không chỉ file vừa đổi; mọi registry/reference phải
   resolve và mọi contract invariant mới phải có regression fixture.
3. Black-box representative sample trên desktop và mobile: ít nhất một spoken,
   một written, một reading-ladder và một pronunciation/legacy flow; kiểm tra long
   content và provenance disclosure nếu UI hiển thị.
4. Xác minh app vẫn offline-first: lesson runtime không fetch nguồn, không upload
   audio/transcript/response và export/persistence không chứa dữ liệu nhạy cảm.
5. Learner usability/performance test với người gần persona khi thực sự có quyền
   tiếp cận. Nếu chưa có, ghi là efficacy gap; không giả lập participant hoặc đổi
   hypothesis thành measured result.
6. Delayed check thật hoặc protocol được ghi rõ là synthetic; không tuyên bố
   retention hay causal learning effectiveness từ một phiên hoặc sample yếu.

### Completion gate

Chỉ coi một lesson hoàn thiện khi:

- 100% source surface được phân loại: external/adapted/source-backed v3 artifact
  có executable provenance và reuse status theo contract; original/synthetic độc
  lập có disclosure/disposition nhưng không fake source; legacy có disposition
  thay vì evidence giả;
- 100% non-trivial factual/research claim trace tới exact source hoặc được gắn
  nhãn synthetic/hypothesis đúng nghĩa;
- mọi required element và rubric criterion có evidence đủ; model answer không bịa
  fact ngoài packet;
- baseline/retry/transfer/review không leak và có semantic variation phù hợp;
- objective, CEFR rationale, exercise, assessment, target/time limit và duration
  nhất quán;
- pronunciation fact tuân thủ dialect policy khi áp dụng;
- automated checks và documented language/domain review đều pass bằng evidence
  mới; human SME finding phải được xử lý khi review đó thực sự được thực hiện.

Chỉ coi target inventory hoàn tất khi mọi lesson/artifact có disposition, không
còn `blocker`/`high`, mọi source reference resolve, focused/full verification pass
và residual `medium`/`low` hoặc efficacy gap được ghi trung thực. Không dùng số
lesson, completion, self-rating hoặc một pilot pass để thay cho gate này.

## Guardrails

- Giữ app local-only; không upload audio, transcript, response hoặc dữ liệu cá
  nhân. Mọi thay đổi privacy phải được nêu và phê duyệt rõ.
- Không thêm AI grading, account, cloud, analytics từ xa, paid API hoặc dependency
  lớn chỉ để làm bài học có vẻ thông minh hơn.
- Không gán CEFR/mastery từ self-rating, word count hoặc completion.
- Không tăng “thực tế” bằng jargon, source quá dài hoặc technical trivia không
  liên quan tới capability.
- Không dùng một model answer hoàn hảo làm feedback duy nhất.
- Không sao chép nội dung proprietary/có bản quyền khi quyền reuse không cho phép;
  không đưa secret, PII hoặc dữ liệu production thật vào lesson.
- Không gọi một artifact là “real” nếu nó synthetic; synthetic hợp lý và được
  disclosure rõ tốt hơn fake provenance.
- Không ép legacy v1 migrate, thêm hàng chục lesson hoặc đổi schema/UI chỉ để làm
  completion matrix trông đồng đều.
- Không xóa/weaken test để làm implementation pass; không che evidence âm.
- Bảo toàn dirty worktree và user-owned changes ngoài phạm vi.
- Không commit, push, publish hoặc tạo PR khi chưa có yêu cầu riêng.

## Deliverables bắt buộc

1. **Inventory + completion matrix:** toàn bộ v3/v1 lesson, mọi phase/artifact/
   claim, provenance status, severity, disposition, evidence và confidence.
2. **Research package:** material questions, source log, claim-source map,
   fact/inference/hypothesis/recommendation, license/rights và giới hạn.
3. **Capability/job/coverage map:** progression và gap của cả sáu capability theo
   mode, CEFR, workflow, role/domain và artifact genre.
4. **Prioritized completion backlog:** blocker/high trước, root cause, learner
   impact, dependency, effort và content-first fix nhỏ nhất.
5. **Execution-mode decision:** evidence chọn Pilot hoặc Coverage completion và
   điều kiện chuyển mode nếu có.
6. **Wave plan + change log nội bộ:** target, acceptance criteria, rollback,
   RED/GREEN hoặc pre-change evidence và kết quả của từng wave.
7. **Nội dung executable đã hoàn thiện:** tiếp tục qua target inventory đến khi
   completion gate đạt, trừ khi có blocker thật được ghi theo protocol.
8. **Verification report:** focused/full automated checks, timed/manual flow,
   language/SME review, browser sample, offline/privacy, measured evidence và
   hypothesis còn lại.
9. **Residual ledger:** mọi `medium`/`low`, efficacy gap, legacy disposition hoặc
   follow-up ngoài scope; không dùng residual roadmap để che finding nghiêm trọng.
10. Cập nhật đúng owner docs và `CHANGELOG.md` chỉ khi implementation thay
    behavior/contract theo policy hiện hành.

## Báo cáo cuối

Trình bày theo thứ tự:

1. Target inventory, execution mode và baseline gap lớn nhất.
2. Research đã làm, nguồn/quyền reuse, giới hạn và quyết định bị ảnh hưởng.
3. Các wave đã triển khai và thay đổi theo content → contract/runtime → tests/docs.
4. Coverage trước/sau từ completion matrix; liệt kê rõ blocker/high đã đóng bằng
   evidence nào.
5. Kết quả focused/full verification, tách measured result khỏi hypothesis.
6. Tác động dự kiến tới performance, unseen transfer và delayed retention.
7. Privacy/offline/migration risk, residual ledger và đúng bước tiếp theo nếu còn.

Chỉ kết luận hoàn tất khi completion gate đạt trên toàn target inventory bằng
evidence mới. Nếu bị block, nêu blocker cụ thể, những gì đã kiểm tra, phần đã hoàn
tất an toàn và đúng một hành động cần từ người dùng; không gọi một phần việc là
“hoàn thiện nội dung” khi completion matrix còn `blocker`/`high`.
