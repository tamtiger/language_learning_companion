# Content Contract — Schema v3

## Mục tiêu

JSON dưới `content/**/*.json` là executable curriculum và source of truth cho lesson. UI chỉ hiểu canonical content, không hardcode lesson ID, topic hoặc capability.

Authoring contract mới dùng `schemaVersion: "v3"`. Parser vẫn đọc `v1` và `v2`, sau đó migration/normalization sang `CanonicalLesson`; không rewrite source legacy tại chỗ.

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
- `source`: `id`, `type`, `title`, `format`, `content`; format là `prose | dialogue | meeting-notes | technical-doc | code-snippet`.
- `auto-check`: `id`, `type`, `title`, `exercises`; exercise hỗ trợ `choice | matching | ordering`.

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

`ModelAudioSource` là discriminated union:

- `bundled`: chỉ nhận đường dẫn tương đối an toàn `/audio/...`, transcript,
  `speakerId` và provenance;
- `speech-synthesis`: text, locale và voice hints; UI phải gắn nhãn TTS thử nghiệm.

Learning loop chỉ hợp lệ trên spoken v3 task. Perception cần ít nhất 4 pretest,
6 training có feedback và 4 posttest items. ID trong toàn loop phải duy nhất;
pronunciation cue chỉ được tham chiếu perception item tồn tại. Không dùng URL
audio bên ngoài hoặc pronunciation score không được đo/validate.

Khi có `practiceContexts`, UI phải chỉ hiện context của phase hiện tại. Baseline
không được thấy input giảng dạy, model response hoặc artifact của transfer/review.
Contract này phù hợp với nhiệm vụ cần tổng hợp nhiều bằng chứng; mission cũ không
bị ép migration nếu một prompt độc lập đã cung cấp đủ dữ kiện.

## Invariants

- Lesson, section, exercise và rubric IDs duy nhất trong scope tương ứng.
- V3 có 1 primary capability, ít nhất 1 source/input section và đúng 1 performance task.
- Spoken task chỉ có `targetSeconds`; written task chỉ có `minWords/maxWords` và `minWords <= maxWords`.
- Baseline không hiển thị `modelResponse` trước attempt đầu.
- Transfer thay content/context nhưng giữ workflow để kiểm tra procedural transfer.
- Evidence-based prompt phải cung cấp đủ artifact ngay tại phase làm bài; không
  yêu cầu người học bịa log, tài liệu, meeting note hoặc chi tiết sự cố.
- Baseline, transfer và review dùng evidence khác nhau khi mục tiêu là kiểm tra
  khả năng áp dụng quy trình vào ngữ cảnh mới.
- Learning-loop pilot phải có context riêng cho baseline/retry/transfer/review;
  pre/post dùng item khác nhau và không lộ transcript trước khi learner trả lời.
- Functional chunks mô tả chức năng, nghĩa, slot biến đổi và model audio; variation
  phải thay dữ kiện thay vì chỉ lặp nguyên câu.
- Pronunciation lesson chỉ hoàn thành khi tất cả exercise trong auto-check đã đúng.
- `reviewPolicy.intervalDays` là số nguyên dương tăng dần; policy đầu tiên dùng `[1,3,7]`.
- Content nguyên bản hoặc có provenance/license rõ; không copy proprietary docs.
- Không đưa secret, personal data hoặc URL yêu cầu network vào lesson.

## Legacy policy

- V1: vocabulary/expressions/reading/exercises, completion theo quiz để giữ compatibility.
- V2: cùng base fields và spoken performance task hiện hành; được normalize sang canonical spoken task.
- Legacy lesson không bị ép có evidence giả. `sourceSchemaVersion` được giữ cho diagnostics và completion rule.

## Learning-design quality gate

Mỗi baseline mission phải có authentic input, observable output, timebox, independence conditions, rubric, retry, transfer và delayed review. Auto-check chỉ hỗ trợ comprehension; capability completion cần performance + self-rubric + transfer.

`workplace-issue-update-b1` là pilot đầu tiên của `practiceContexts`: ba evidence
packet độc lập cho checkout, upload và email-queue incident. Đây là rollout gate
cho tính khả thi của contract, không phải bằng chứng efficacy.

`meeting-disagree-and-recap-b2` và `technical-tradeoff-explanation-b2` là hai
learning-loop pilot. TTS/metadata chỉ chứng minh flow có thể chạy; không được dùng
làm bằng chứng learner phát âm đúng hoặc giao tiếp tốt hơn.
