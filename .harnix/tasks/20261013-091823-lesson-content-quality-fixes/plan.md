# Kế hoạch: Sửa chất lượng nội dung bài học

Checklist (đánh dấu từng lát khi xong):

- [x] S0 (RED): viết `tests/content/contentRegression.test.ts`, chạy thấy đỏ trên nội dung hiện tại (ac-2, ac-3, ac-4, ac-9)
- [x] S1: sửa 6 Blocker về trọng âm, IPA, đáp án mâu thuẫn (ac-1)
- [x] S2: bỏ cụm đệm và viết lại distractor thật (ac-2)
- [x] S3: thêm gợi ý nghĩa hoặc `acceptedAnswers` cho fill của vocabulary-review (ac-3)
- [x] S4: sửa transferPrompt, số từ prompt, minSeconds so với mẫu (ac-4)
- [x] S5: đồng bộ modelResponse, baseline và hội thoại nghe (ac-5)
- [x] S6: sửa Major về tiếng Anh, dịch, đáp án, thứ tự, bài hậu kiểm (ac-6)
- [x] S7: sửa Minor về commonMistake, rubric, metadata, thuật ngữ (ac-7)
- [x] S8: bổ sung pronunciation cho người Việt và -s/-es (ac-8)
- [x] S9: chạy toàn bộ test, lint, build và các `check:*` (ac-9)

## Nguyên tắc chung
- Không đổi `id` của exercise, `lessonId`, `schemaVersion`. Không đổi schema hay UI.
- Trước khi đổi `options` hoặc `correctAnswer`, đọc mục `contentRevision` trong `docs/CONTENT.md` để biết khi nào phải tăng revision (ảnh hưởng tiến độ đã lưu); làm đúng quy ước đó.
- Sau mỗi lát chạy `npm test -- tests/content`; chỉ chạy toàn bộ ở S9.
- Chia việc theo capability cho subagent chạy song song (mỗi agent một thư mục, không ghi chồng file). Agent sửa file nhưng không chạm `.harnix` và không dùng git.
- Mục báo cáo ghi "cần xác nhận": kiểm lại với nguồn trong file; nếu không chắc, giữ nguyên và ghi vào residual risk.

## S0: test chống tái phát (RED trước)
File mới: `tests/content/contentRegression.test.ts`, dùng helper có sẵn để duyệt catalog và các file JSON.
Kiểm tra (đỏ trên nội dung hiện tại):
1. Không option, câu hỏi hay `correctAnswer` nào chứa cụm `for the team`, `at work`, `right now` làm hậu tố, và không có ". " theo sau bởi chữ thường trong một option (ac-2).
2. Mọi exercise `fill` trong section `vocabulary-review` có `acceptedAnswers` nhiều hơn một hoặc câu hỏi chứa gợi ý trong ngoặc (ac-3).
3. Mọi bài có `outputContract`: số cuối trong cụm "A đến B từ" / "A to B words" của `baselinePrompt`, `performancePrompt` bằng `maxWords` (ac-4).
4. `transferPrompt` không chứa chuỗi nhận diện context của `retry` (ví dụ so khớp từ khóa nổi bật trong `practiceContexts.retry.title` không có trong `practiceContexts.transfer.title`) (ac-4).
5. Không còn `p0-pilot` trong `workflowTags` (ac-7, bảo vệ bởi ac-9).
6. Một số xác nhận ghim cho Blocker: `/əˈlaʊ lɪst/`, "re-QUIRE-ments" trong cue clarify, v.v. (ac-1).
Chạy: `npm test -- tests/content/contentRegression.test.ts`, ghi nhận RED, sau đó mỗi lát làm xanh dần.

## S1: Blocker (ac-1)
- `interview-system-design-walkthrough-b2.json`: cue `sdw-cue-clarify`.
- `interview-ask-the-interviewer-b1.json`: cue `ati-cue-expect`.
- `interview-behavioral-story-bank-b2.json`: `competency.commonMistake`, cue `bsb-cue-resolve`.
- `interview-negotiate-offer-b2.json`: cue `neg-cue-offer`.
- `interview-tell-me-about-yourself-b1.json`: cue `tmay-cue-current`.
- `listen-design-review-feedback-b2.json`: IPA của "allow list".
- `explain-a-bug-to-a-colleague-b1.json`: cue và meaningRisk của "symptom".
- `daily-standup-b1.json`: `commonMistake` của "ETA".
- `read-stack-trace-timeout-b2.json`: tách fact và guess; sửa `rst-q3` và đoạn `metrics`/`trace`.
- Pronunciation: sửa `commonMistake` của fixed và database (người Việt bỏ âm cuối).

## S2: cụm đệm (ac-2)
Mọi file trong `content/missions/**` có `for the team`, `at work`, `right now` trong options. Thay bằng distractor là hiểu nhầm có thật, độ dài gần đáp án đúng để vẫn qua `assessmentQuality` (tỉ lệ 2,5; đáp án đúng dài nhất không quá 45% corpus). Sửa luôn các câu bị hỏng (". for the team"). Giữ nguyên id exercise.

## S3: fill của vocabulary-review (ac-3)
Mỗi câu `fill` trong báo cáo (và mọi câu cùng mẫu còn lại): thêm gợi ý nghĩa tiếng Việt trong ngoặc ở câu hỏi và/hoặc `acceptedAnswers` cho đáp án đồng nghĩa hợp lệ, gồm các ca đã nêu (blocked on, flexible with, brute-force, seeking, by/on, through/at...). Loại đáp án sai ngữ pháp (`looking for a`).

## S4: prompt và contract (ac-4)
- `transferPrompt` khớp `practiceContexts.transfer` ở workplace (5 bài) và interview (5 bài mới).
- "60 đến 110 từ" thành khớp `maxWords` 120 ở các bài nghe và đọc nêu trong báo cáo.
- `small-talk-b1`: prompt 40 giây so với `minSeconds` 45.
- `interview-tell-me-about-yourself-b1`: "dưới một phút" so với `minSeconds` 60.
- Mẫu ngắn hơn `minSeconds`: kéo dài mẫu hoặc hạ `minSeconds` cho khớp, chọn cách ít ảnh hưởng tiến độ.

## S5: tính nhất quán dữ kiện (ac-5)
- Đồng bộ `modelResponse` với packet baseline ở technical-reading (CHG, ISS, API, RFC, STK), technology-learning, technical-explanation, interview, meetings (daily-standup, incident-call, join-and-repeat).
- Hội thoại `listen-design-review-feedback-b2` (điều kiện duyệt), `listen-tech-talk-summary-b2` (median), `listen-incident-call-b2` (published so với will publish).
- Packet thiếu input (give-and-receive-feedback, small-talk): thêm dòng input.
- Baseline lộ đáp án (A2 describe-your-job, story-bank "Question type", issue-update ví dụ).

## S6: Major khác (ac-6)
Sai ngữ pháp trong mẫu, dịch sai nghĩa (correlate, brute force, justify...), thứ tự bài tập có nhiều đáp án hợp lệ hoặc lệch nguồn, bài hậu kiểm trùng bài huấn luyện, từ vựng lệch nhiệm vụ (issue-update, architecture-walkthrough, trade-off), distractor tương đương về nghĩa, "deciding constraint", tiền đề STAR, ví dụ idempotent.

## S7: Minor (ac-7)
`commonMistake` thành lỗi thật hoặc bỏ, `rubric.dimension` đúng chức năng, `format: "dialogue"` thành `meeting-notes` khi phù hợp, bỏ `p0-pilot`, thống nhất thuật ngữ Việt (syllable/âm tiết, claim, hypothesis, thụt lề), thống nhất ngôn ngữ metadata theo quy ước của repo, IPA nhất quán.

## S8: pronunciation (ac-8)
Thêm ghi chú đặc thù người Việt (bỏ âm cuối, đọc đều âm tiết, thanh điệu), mở rộng ending-sounds sang -s/-es và ví dụ IT (cached, logged, queued; servers, fixes), bổ sung authentication và algorithm nếu phù hợp schema hiện có, sửa distractor lộ, bỏ thuật ngữ khó.

## S9: kiểm tra cuối (ac-9)
`npm test`, `npm run lint`, `npx tsc -b`, `npm run build`, `npm run check:docs`, `npm run check:changelog`, `npm run check:release`, `npm run check:bundle`, `npm run check:offline`. Nếu cần tăng version và changelog theo quy tắc repo thì làm trước verify.

## Điều mỗi kiểm tra chứng minh
- `chk-regression` (focused): ac-2, ac-3, ac-4, ac-9 bằng test mới.
- `chk-content` (focused): ac-1, ac-5, ac-6, ac-7, ac-8 giữ nguyên hợp lệ schema và ngưỡng assessmentQuality; nội dung đúng được rà qua báo cáo đối chiếu khi verify.
- `check-suite`: toàn bộ test, không lỗi mới.
