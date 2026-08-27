# PRD — Hoàn thiện curriculum thực tế và có nguồn

## Outcome

Hoàn thiện toàn bộ 18 lesson hiện hành để mọi finding blocker/high về tính thực tế, factual coherence, phase isolation, assessment, source trust và learner-facing contract được xử lý bằng content executable, UI tối thiểu, test và evidence mới mà vẫn giữ offline/privacy.

## Phạm vi

- Inventory 12 mission v3 và 6 pronunciation lesson v1 ở cấp lesson, phase, artifact và claim.
- Research nguồn official/primary cho claim kỹ thuật, CEFR, pronunciation và learning-science được dùng; tách fact, inference, hypothesis, synthetic và adapted.
- Tạo item-level completion matrix, trace hai chiều, source detail/claim-source map, capability/coverage map, wave log, verification report và residual ledger theo prompt.
- Sửa content theo wave nhỏ; sửa runtime tối thiểu khi chính UI đang ẩn contract/evidence hoặc completion copy diễn giải quá mức điều máy thực sự đo.
- Bổ sung regression test cho traceability, phase variation, timing, provenance/disclosure, objective-assessment và learner-facing runtime contract.
- Cập nhật owner docs và patch release vì executable curriculum thay đổi production.

## Ngoài phạm vi

- Không thêm cloud, account, analytics, AI grading, remote asset hoặc persistence cho response/audio.
- Không tuyên bố efficacy, mastery hoặc CEFR certification khi chưa có learner/listener data.
- Không thêm hàng loạt lesson mới chỉ để lấp coverage matrix.
- Không đổi schema, navigation hoặc storage; UI chỉ thêm summary từ contract sẵn có và hiển thị context đúng phase.
- Không commit, push, publish hoặc tạo pull request.

## Quyết định contract

- `CONTENT.md` tiếp tục sở hữu schema. External/adapted/source-backed v3 artifact dùng `sourceRegistry`/`provenance` đúng contract; synthetic độc lập được ghi rõ fictional/non-production trong content và audit, không gắn source trang trí.
- Executable provenance chỉ áp dụng cho `SourceSection` mà schema biểu đạt được. Claim traceability bao phủ rộng hơn, gồm vocabulary, exercise, distractor, model response, rubric, prompt, pronunciation cue và TTS; các claim này được ràng buộc bằng item matrix, claim-source map và regression fixture thay vì fake `sourceRegistry`.
- Legacy v1 được fact-check và sửa tại chỗ; completion chỉ là knowledge evidence. Không mô tả quiz completion như bằng chứng learner đã thực hành shadowing.
- Dialect pronunciation mặc định là General American khi lesson dùng IPA/stress; chỗ khác biệt có ý nghĩa phải được disclosure. Device TTS là công cụ nghe thử, không phải authority hay performance assessor.
- `reference-only` là reuse mặc định. Chỉ dùng quoted/adapted/redistributed khi quyền và attribution đã được xác minh; scenario, endpoint, command, metric và tên người hư cấu phải có disclosure mô phỏng.
- HTTP 202/429/503 và `Retry-After` theo RFC; Daily Scrum không bắt buộc format yesterday-today-blocker; CEFR chỉ cung cấp descriptor tham chiếu, không chứng nhận level hoặc efficacy.
- `outputContract` là nguồn duy nhất cho word/time/required-element summary hiển thị trước assessment. Written retry phải hiển thị `practiceContexts.retry`; exemplar spoken phải có độ dài hợp lý với `targetSeconds` và rubric.
- Assignment chưa xác nhận phải được nói như proposal/question, không như fact đã chốt.
- Version mục tiêu là patch `1.1.3` vì đây là correction/quality improvement của production content, không phải breaking contract.

## Research decisions đã khóa

- Sáu v1 giữ `schemaVersion: v1` và `legacy-quiz`; objective chuyển thành nhận biết/giải thích/tra cứu, không tuyên bố production.
- Cả sáu spoken learning loop phải dùng micro-scenario độc lập, không lộ tên, số, quyết định hoặc consequence của retry/transfer/review.
- Model answer chỉ được dùng observed fact trong evidence packet; phần chưa biết phải ghi là hypothesis, proposal hoặc question.
- Rubric/output contract phải answerable ở cả baseline, retry, transfer và review; reading ladder chỉ yêu cầu áp dụng trên artifact thực sự được hiển thị.
- Prompt và machine time contract dùng cùng min/max; mọi thay đổi được khóa bằng corpus-level fixture.
- Research artifact dùng row grammar machine-checkable và narrative đủ limitations; một row/lesson không được coi là item-level coverage.
- Release check mới dùng Node JSON parsing để không phụ thuộc hành vi `ConvertFrom-Json` với khóa rỗng của lockfile.

### AC `AC-1`

Có completion matrix và source log bao phủ đủ 18 lesson, mọi source surface/claim material, exact evidence, severity, disposition, fact/inference boundary, rights và verification status.

### AC `AC-2`

Mọi blocker/high trong 12 mission v3 về unsupported model fact, answerability, phase leakage/near-copy, internal coherence, professional plausibility và duration/target consistency được sửa; evidence packet đủ để learner không phải bịa fact.

### AC `AC-3`

Sáu pronunciation lesson v1 có terminology/IPA/stress/connected-speech claim đúng theo dialect policy, duration/objective/assessment nhất quán và disposition trung thực; không dùng quiz để tuyên bố production performance nếu không đo production.

### AC `AC-4`

Mọi source surface được phân loại; external/adapted/source-backed content có executable provenance khi contract hỗ trợ, synthetic/original được disclosure rõ mà không fake source, legacy có disposition và research trace.

### AC `AC-5`

Regression tests bảo vệ inventory 18 lesson, factual traceability fixtures, phase semantic isolation, timing consistency, provenance reference/disclosure và objective-assessment invariants.

### AC `AC-6`

Focused/full tests, lint, build và browser walkthrough đại diện cho spoken, written/reading-ladder và pronunciation đều pass; offline/privacy contract không đổi và measured evidence tách khỏi hypothesis.

### AC `AC-7`

Owner docs, CHANGELOG và package manifests phản ánh production content cuối cùng ở version `1.1.3` theo append-only release history.

### AC `AC-8`

Research package thực thi đầy đủ prompt: item-level matrix, trace hai chiều, source detail và claim-source map, capability/coverage map, wave log, verification report và residual ledger đều machine-checkable, không còn blocker/high.

### AC `AC-9`

Learner luôn thấy output/time contract trước khi bị chấm; retry reading-ladder hiển thị evidence đúng phase; model duration, meeting assignment và legacy quiz semantics nhất quán với runtime và rubric.

## Bổ sung sau independent review

- Completion matrix phải audit component content riêng, dùng evidence ID tồn tại và đúng năm claim class của prompt.
- Required/model/objective trace phải chọn support ngữ nghĩa, không được all-to-all theo lesson.
- Source `supportedClaims`, `CLAIM_JSON` và `CLAIM_SOURCE_JSON` phải là một graph hai chiều exact; synthetic origin không được đổi thành factual chỉ vì có source ID.
- Không chấp nhận `self-validating` như pass chung; report loại chính detailed-check khỏi input tự tham chiếu và mọi row còn lại phải resolve tới fresh pass evidence.
- Inline release check đóng băng được chạy trong shell tương thích; `scripts/check-release.mjs` là bằng chứng portability không phụ thuộc shell quoting.

## Rủi ro và rollback

- Nguồn có thể không cho phép reuse: dùng reference-only để fact-check và viết synthetic artifact độc lập.
- Automated semantic checks có false positive: dùng fixtures có chủ đích và documented language/domain review, không dùng keyword count làm bằng chứng duy nhất.
- Thêm contract summary có thể làm UI dài hơn trên mobile: dùng panel ngắn, responsive và xác minh 390 × 844.
- Wave được rollback theo nhóm lesson/test/UI; v1 raw JSON và schema hiện hành tiếp tục là compatibility anchor.
- Dirty prompt/Harnix state từ task trước được bảo toàn; không ghi đè hoặc nhận là product output của task này.