# Content Contract — Schema v3

## Mục tiêu

JSON dưới `content/**/*.json` là executable curriculum và source of truth cho lesson. UI chỉ hiểu canonical content, không hardcode lesson ID, topic hoặc capability.

Authoring contract mới dùng `schemaVersion: "v3"`. Parser vẫn đọc `v1` và `v2`, sau đó migration/normalization sang `CanonicalLesson`; không rewrite source legacy tại chỗ.

Taxonomy authoring hiện tại:

```text
content/
├── missions/
│   └── <primary-capability>/
│       └── <lesson-id>.json       # 12 mission schema v3
└── reference/
    └── pronunciation/
        └── <lesson-id>.json       # 6 knowledge/reference lesson schema v1
```

Với mission, `<primary-capability>` khớp `capabilities[0]`; tên file
`<lesson-id>.json` khớp field `lessonId`. Thư mục chỉ là taxonomy để biên soạn và
tìm nội dung, không quyết định schema, capability, mode, completion semantics
hoặc runtime behavior. Schema và các field trong JSON vẫn quyết định semantics;
catalog tiếp tục khám phá toàn bộ corpus bằng glob `content/**/*.json`.

## Sáu capability ID

- `workplace-communication`
- `technical-reading`
- `international-meetings`
- `technical-explanation`
- `international-interview`
- `technology-learning`

Mỗi mission v3 có đúng một primary capability; catalog hiện có 12 mission, hai
mission cho mỗi capability. `workflowTags` mô tả workflow như `issue-update`,
`documentation`, `standup`, `tradeoff`, `interview`, `api-learning`.

## Lesson v3

Ví dụ dưới đây minh họa một policy hợp lệ; `intervalDays` là content-owned và có
thể dùng cadence khác ở từng lesson.

```json
{
  "schemaVersion": "v3",
  "lessonId": "workplace-issue-update-b1",
  "title": "Write an actionable issue update",
  "summary": "Communicate impact, next step and request.",
  "cefrLevel": "B1",
  "durationMinutes": 12,
  "learningObjectives": ["Write an actionable update without translation"],
  "capabilities": ["workplace-communication"],
  "workflowTags": ["issue-update", "async-communication"],
  "sections": [],
  "performanceTask": {},
  "reviewPolicy": { "intervalDays": [1, 3, 7] }
}
```

`sections` là ordered discriminated union:

- `brief`: `id`, `type`, `title`, `body`.
- `language-support`: `id`, `type`, `title`, `vocabulary`, `expressions`.
- `source`: `id`, `type`, `title`, `format`, `content`, cùng optional
  `provenance`; format là `prose | dialogue | meeting-notes | technical-doc |
  code-snippet`.
- `auto-check`: `id`, `type`, `title`, `exercises`; exercise hỗ trợ `choice | fill | matching | ordering`.

`performanceTask` bắt buộc với mission v3:

- identity/context: `id`, `mode: spoken | written`, `title`, `scenario`;
- loop prompts: `baselinePrompt`, `performancePrompt`, `modelResponse`, `retryPrompt`, `transferPrompt`, `reviewPrompt`;
- `outputContract`: `timeLimitSeconds`, `requiredElements`, cùng `targetSeconds` cho spoken hoặc `minWords/maxWords` cho written;
- `independenceContract`: `noVietnamese`, `noTranslation`, `noModelAnswer`, `maxHints`, `preparationSeconds`;
- `feedbackPriorities`: 1–4 strings;
- `rubric`: 3–5 item có `id`, `label`, `description`.
- `practiceContexts` (optional): bộ input riêng cho `baseline`, optional `retry`,
  `transfer` và `review`. Mỗi context có `title`, `brief` và 1–4 `artifacts` theo shape của
  section `source`; artifact ID phải duy nhất trong context.
- Spoken task có thể khai báo `learningLoop.version: "v1"`: perception
  `pretest/training/posttest`, 1–2 pronunciation cues, 4–6 functional chunks,
  năm `shadowingSteps`, 2–4 listen-back checks và 1–3 interaction turns.
- Written task có thể khai báo `readingLadder.version: "v1"`: một
  `trainingSource`, 3–6 `extractionItems` có options/correct answer/feedback,
  một `applicationPrompt` và 2–5 `applicationChecklist` items. Ladder không hợp
  lệ trên spoken task; extraction ID phải unique và đáp án phải thuộc options.

`ModelAudioSource` là discriminated union:

- `bundled`: chỉ nhận đường dẫn tương đối an toàn `/audio/...`, transcript,
  `speakerId` và provenance;
- `speech-synthesis`: text, locale và voice hints; UI phải gắn nhãn TTS thử nghiệm.

Player hỗ trợ tốc độ 0.85×/1×/1.15×. `locale` chỉ là requested locale cho voice
tổng hợp có trên thiết bị; content và UI không được gọi nó là human accent sample.

Learning loop chỉ hợp lệ trên spoken v3 task. Perception cần ít nhất 4 pretest,
6 training có feedback và 4 posttest items. ID trong toàn loop phải duy nhất;
pronunciation cue chỉ được tham chiếu perception item tồn tại. Không dùng URL
audio bên ngoài hoặc pronunciation score không được đo/validate.

Khi có `practiceContexts`, UI phải chỉ hiện context của phase hiện tại. Baseline
không được thấy input giảng dạy, model response hoặc artifact của transfer/review.
Contract này phù hợp với nhiệm vụ cần tổng hợp nhiều bằng chứng; mission cũ không
bị ép migration nếu một prompt độc lập đã cung cấp đủ dữ kiện.

UI phải render một learner-facing summary trực tiếp từ `outputContract` trước khi
chấm output: time limit, target duration hoặc word range, và toàn bộ
`requiredElements`. Summary này không được hardcode hay thay đổi ngưỡng qualifying
transfer. Với reading ladder, retry là read-once phase giống baseline/transfer/review:
source phải được ẩn trước khi editor mở.

## Source registry và provenance

Lesson v3 có thể khai báo `sourceRegistry` opt-in. Mỗi record bắt buộc có
`sourceId`, `kind`, `title`, `publisher`, HTTPS `canonicalUrl`,
`versionOrPublishedAt`, ngày `accessedAt` dạng `YYYY-MM-DD`, `exactLocation`,
HTTPS `licenseIdOrRightsUrl`, `reuseMode` và optional `requiredAttribution`.
Registry ID phải duy nhất.

Một source artifact có thể khai báo `provenance` gồm `origin: original | adapted |
synthetic`, một hoặc nhiều `sourceIds` duy nhất và optional `adaptationNote`.
Reference phải tồn tại trong registry; `synthetic` và `adapted` bắt buộc giải thích
phần dự án biên soạn hoặc thay đổi. Validation áp dụng đồng nhất cho source trong
`sections`, mọi `practiceContexts.*.artifacts` và
`readingLadder.trainingSource`.

Normalization resolve reference thành canonical `resolvedSources` trước khi dữ
liệu tới feature UI. Renderer không đọc registry, không suy luận license và không
fetch metadata. Link canonical/quyền chỉ mở khi người học chủ động chọn; lesson
vẫn hoạt động offline khi không mở link. Source-backed v3 dùng provenance; artifact
synthetic độc lập không được gắn nguồn trang trí và phải tự ghi learner-visible
`Synthetic training artifact — non-production.` trong content. Artifact synthetic
có `sourceIds` (đã điều chỉnh từ nguồn có thật) dùng `adaptationNote` làm phần ghi
nguồn hiển thị cho người học, nên không cần thêm dòng nhãn trên; `adaptationNote`
phải không rỗng và được khóa bằng test. Legacy không bị ép
metadata mà schema không biểu đạt, nhưng reading phải ghi rõ tình huống mô phỏng
hoặc hướng dẫn do sản phẩm biên soạn.

Pilot `daily-standup-b1` dùng Scrum Guide 2020 và CEFR Companion Volume 2020 ở
chế độ `reference-only`. Tên, metric, ticket và sự cố là mô phỏng. Khung
`yesterday–today–blocker` được ghi đúng là quy ước nhóm, không phải yêu cầu của
Scrum; B1 là rationale tham chiếu descriptor, không phải chứng nhận hay endorsement.

`learn-api-from-docs-b2` dùng RFC 9110 cho 202/503/`Retry-After` và RFC 6585 cho
429 ở chế độ `reference-only`. Pulse/Jobs/Exports/Quanta, endpoint, request token,
metric và implementation plan vẫn là fictional training data; RFC không bảo chứng
các chi tiết sản phẩm đó.

## Invariants

- Lesson, section và rubric IDs duy nhất trong scope tương ứng; exercise ID phải duy nhất trên toàn lesson, kể cả giữa nhiều section `auto-check`.
- V3 có 1 primary capability, ít nhất 1 source/input section và đúng 1 performance task.
- Spoken task chỉ có `targetSeconds`; written task chỉ có `minWords/maxWords` và `minWords <= maxWords`.
- Baseline không hiển thị `modelResponse` trước attempt đầu.
- Mọi câu factual trong model response phải trace tới evidence packet hiện tại;
  phần chưa được chứng minh phải được viết thành hypothesis, proposal hoặc question.
- Transfer thay content/context nhưng giữ workflow để kiểm tra procedural transfer.
- Evidence-based prompt phải cung cấp đủ artifact ngay tại phase làm bài; không
  yêu cầu người học bịa log, tài liệu, meeting note hoặc chi tiết sự cố.
- Baseline, transfer và review dùng evidence khác nhau khi mục tiêu là kiểm tra
  khả năng áp dụng quy trình vào ngữ cảnh mới.
- Toàn bộ mission v3 có context riêng cho baseline/retry/transfer/review; retry
  giữ communicative function nhưng dùng evidence packet cập nhật hoặc khác ngữ cảnh.
- Learning-loop pilot phải có context riêng cho baseline/retry/transfer/review;
  pre/post dùng item khác nhau, không lộ transcript trước khi learner trả lời và
  không dùng tên, số, quyết định hoặc consequence distinctive của phase sau.
- Bốn technical docs missions có reading ladder và context riêng cho
  baseline/retry/transfer/review. Baseline, transfer và delayed retrieval review
  dùng unseen source; UI ẩn source trước khi learner nhập output từ trí nhớ.
- Toàn bộ 6 spoken v3 missions phải có learning loop; training miss nhận feedback
  ngay nhưng chỉ pre/post diagnostic miss mới kích hoạt pronunciation cue.
- Mỗi spoken loop có 2–3 interaction turns và ít nhất một clarification,
  misunderstanding, repair hoặc interruption.
- Functional chunks mô tả chức năng, nghĩa, slot biến đổi và model audio; variation
  phải thay dữ kiện thay vì chỉ lặp nguyên câu.
- Pronunciation lesson v1 chỉ hoàn thành knowledge quiz khi tất cả exercise trong
  auto-check đã đúng; completion này không đo spoken production, accent accuracy
  hoặc learning efficacy.
- `reviewPolicy.intervalDays` là dãy số nguyên dương tăng dần do từng lesson sở
  hữu; runtime phải dùng đúng policy của lesson thay vì áp một cadence toàn cục.
- Mọi source surface phải có provenance/reference thật hoặc disclosure synthetic
  rõ; không tạo fake registry và không copy proprietary docs.
- Không đưa secret, personal data, remote runtime asset hoặc URL bắt buộc network
  vào lesson. HTTPS canonical reference được phép nếu chỉ là link người dùng chủ động mở.

## Legacy policy

- V1: vocabulary/expressions/reading/exercises, completion theo quiz để giữ
  compatibility. Objective chỉ tuyên bố knowledge/awareness có thể kiểm tra bằng
  quiz; General American là reference dialect, còn device TTS không phải authority.
- V2: cùng base fields và spoken performance task hiện hành; được normalize sang canonical spoken task.
- Legacy lesson không bị ép có evidence giả. `sourceSchemaVersion` được giữ cho diagnostics và completion rule.

## Learning-design quality gate

Mỗi baseline mission phải có authentic input, observable output, timebox, independence conditions, rubric, retry, transfer và delayed review. Auto-check chỉ hỗ trợ comprehension; capability completion cần performance + self-rubric + transfer.

Mỗi mission v3 có đúng một `language-support` section với ít nhất ba expression
có thể tái sử dụng trong nhiệm vụ, tối thiểu ba auto-check exercise có explanation
và `performancePrompt` nói rõ đầu ra bằng tiếng Anh. Scaffold và auto-check giúp
người học hiểu input trước lượt chính; chúng không thay thế performance, rubric,
transfer hoặc chứng minh năng lực.

Renderer hiển thị đầy đủ `definition`, `technicalMeaning`, `collocations`,
`example`, `commonMistake`, `tone` và `alternatives` đã được authoring. Sáu lesson
pronunciation v1 vẫn là knowledge/reference: rule, dictionary notation và quiz
không phải audio perception, spoken production hay evidence về pronunciation
accuracy.

`practiceContexts` đã được rollout tới toàn bộ 12 mission v3 với evidence packet
riêng cho baseline/retry/transfer/review. Đây là coverage của content contract và
generic flow, không phải bằng chứng efficacy.

Cả 6 spoken missions dùng learning loop P1. TTS/metadata chỉ chứng minh flow có
thể chạy; human listener protocol ở `docs/EVALUATION_PROTOCOL.md` mới định nghĩa
intent, critical-fact, comprehensibility và agreement evidence cần thu, nhưng hiện
chưa có dữ liệu để kết luận learner phát âm đúng hoặc giao tiếp tốt hơn.

## Viết đáp án (assessment gate)

Auto-check, perception và reading ladder phải đo hiểu thật, không đo khả năng đoán.
Runtime xáo trộn thứ tự `choice`, `ordering`, `matching`, perception và reading ladder
theo seed riêng cho mỗi lần mở bài (`src/features/lesson/optionOrder.ts`), nên vị trí
tác giả viết không có tác dụng. Điều tác giả phải đảm bảo được kiểm bằng
`tests/content/assessmentQuality.test.ts`; mọi ngưỡng nằm ở hằng số
`ASSESSMENT_THRESHOLDS` ở đầu file đó:

- 3 đến 4 lựa chọn cho mỗi perception, reading ladder và `choice` một đáp án.
- Lựa chọn dài nhất không quá 2,5 lần lựa chọn ngắn nhất, và đáp án đúng không được
  là lựa chọn dài nhất ở quá 45% item toàn corpus (60% trong một bài có từ 5 item).
- Không có hai lựa chọn trùng nhau sau khi chuẩn hóa.
- Nếu đáp án đúng xuất hiện nguyên văn trong audio hoặc source thì phải có ít nhất một
  distractor cũng xuất hiện nguyên văn; distractor là hiểu nhầm có thật (sai chủ thể,
  số liệu, nguyên nhân hoặc hành động), không phải phương án vô lý.
- Bài `ordering` không được viết `options` theo đúng thứ tự `correctAnswer`.

Chấm `fill` chuẩn hóa Unicode NFC, nháy cong/thẳng, hoa/thường, khoảng trắng và dấu câu
cuối; ký hiệu IPA giữ nguyên để các ký hiệu khác nhau vẫn khác nhau. Trường tùy chọn
`acceptedAnswers` (chỉ cho `fill`) liệt kê các dạng đáp án hợp lệ khác. Khi người học
khó gõ một ký tự, dùng `choice` thay vì `fill`.
