# Research — Workplace, technical semantics và source policy

- Task ID: `20260827-224143-complete-realistic-curriculum`
- Ngày truy cập: 2026-08-27
- Material unknown: làm sao dùng nguồn chuẩn để sửa claim kỹ thuật/workplace mà không biến scenario hư cấu thành nội dung được nguồn ngoài chứng thực?

## Repository evidence

- Corpus v3 có 75 `SourceSection`: 33 `technical-doc`, 24 `meeting-notes`, 11 `code-snippet`, 6 `dialogue`, 1 `prose`.
- Chỉ 5 artifact của `daily-standup-b1` có executable provenance; 70 artifact v3 còn lại chưa phân loại. Sáu reading v1 không có provenance field trong schema.
- `SourceProvenance` chỉ gắn vào `SourceSection`; vocabulary, exercise, model response, rubric, prompt, cue và TTS cần trace qua audit/test thay vì registry giả.
- `daily-standup-b1` dùng Scrum Guide và CEFR ở `reference-only`, đồng thời ghi rõ names, metrics, tickets và incidents là fictional training data.

## Nguồn và fact boundary

### TECH-1 — RFC 9110, HTTP Semantics

- Canonical URL: https://www.rfc-editor.org/rfc/rfc9110.html
- Exact location: Sections 10.2.3, 15.3.3 và 15.6.4; copyright notice lines 47–53.
- Version/date: RFC 9110, June 2022; accessed 2026-08-27.
- Rights: IETF Trust Legal Provisions, https://trustee.ietf.org/documents/trust-legal-provisions/
- Reuse: reference-only; paraphrase semantics, không sao chép RFC text.
- Fact: 202 nghĩa là accepted nhưng xử lý chưa hoàn tất; 503 biểu thị temporary overload/maintenance và có thể kèm `Retry-After`; `Retry-After` nhận HTTP-date hoặc số giây.
- Inference: API lesson phải tách accepted khỏi completed và không khẳng định retry header custom là chuẩn HTTP.

### TECH-2 — RFC 6585, Additional HTTP Status Codes

- Canonical URL: https://www.rfc-editor.org/rfc/rfc6585.html
- Exact location: Section 4, `429 Too Many Requests`; copyright notice và IETF TLP.
- Version/date: RFC 6585, April 2012; accessed 2026-08-27.
- Rights: IETF Trust Legal Provisions, https://trustee.ietf.org/documents/trust-legal-provisions/
- Reuse: reference-only.
- Fact: 429 biểu thị rate limiting; response nên giải thích condition và có thể có `Retry-After`.
- Inference: rubric chỉ yêu cầu rate-limit handling khi artifact cung cấp 429/rate-limit evidence; 503 không tự chứng minh rate limiting.

### WORK-1 — The 2020 Scrum Guide

- Canonical URL: https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf
- Exact location: Daily Scrum, p. 9; license notices pp. 1 và 13.
- Version/date: November 2020; accessed 2026-08-27.
- Rights: CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/
- Reuse: reference-only với attribution đang có trong `daily_standup.json`.
- Fact: Daily Scrum tập trung progress toward Sprint Goal và actionable plan; Developers tự chọn structure/technique.
- Inference: yesterday-today-blocker là team convention, không phải Scrum requirement.

### WORK-2 — CEFR Companion Volume 2020

- Canonical URL: https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4
- Exact location: Overall oral production p. 62; sustained monologue p. 63; oral interaction pp. 72, 76–79; online interaction p. 196.
- Version/date: April 2020; accessed 2026-08-27.
- Rights: Council of Europe copyright/permissions, https://www.coe.int/en/web/portal/copyright-licensing-permissions
- Reuse: reference-only với attribution; không copy descriptor vào product.
- Fact: CEFR mô tả language activities như giving information, clarification, collaboration và online interaction.
- Inference: descriptor hỗ trợ chọn task function, không chứng nhận learner đạt B1/B2 và không chứng minh efficacy.

### OPS-1 — Site Reliability Engineering, Managing Incidents

- Canonical URL: https://sre.google/sre-book/managing-incidents/
- Exact location: `Elements of Incident Management Process`, role separation, communication, planning và handoff example.
- Version/date: online edition of 2016 book; accessed 2026-08-27.
- Rights: Google/O'Reilly, CC BY-NC-ND 4.0 notice at https://sre.google/sre-book/preface/
- Reuse: reference-only; không adapt case study hoặc proprietary passage.
- Fact: source mô tả clear roles, current incident record, periodic updates và planned handoff trong một incident-management system.
- Inference: incident lesson nên phân biệt observed evidence, hypothesis, owner và next action; đây không phải universal mandatory template.

### OPS-2 — The Site Reliability Workbook, Incident Response

- Canonical URL: https://sre.google/workbook/incident-response/
- Exact location: GKE incident narrative and `Review`; preface rights at https://sre.google/workbook/preface/
- Version/date: 2018; accessed 2026-08-27.
- Rights: Google/O'Reilly, CC BY-NC-ND 4.0.
- Reuse: reference-only.
- Fact: case study records impact, investigation updates, plausible root cause, owners, coordination và handoff.
- Inference: synthetic scenarios có thể luyện concise evidence-safe updates nhưng không được gắn Google case facts hoặc tuyên bố một quy trình là duy nhất.

## Policy áp dụng

1. Nếu artifact paraphrase một standard fact trực tiếp, thêm authoritative `sourceRegistry` và `provenance` với exact location, reference-only và adaptation note tách standard fact khỏi fictional product data.
2. Nếu nguồn chỉ hỗ trợ genre/heuristic, giữ artifact synthetic và thêm disclosure `Synthetic training artifact — non-production.`; claim-source relation nằm trong research matrix.
3. Endpoint, header custom, command, topology, ticket, metric, person, company và incident cụ thể không được coi là fact ngoài scenario.
4. Model response chỉ biến evidence thành response; điều chưa có evidence phải mang nhãn hypothesis/proposal/question.
5. Không thêm provenance cho v1 vì schema/renderer không hỗ trợ; disclosure mô phỏng nằm ngay trong reading title/body và source trace nằm trong research.

## Kết luận

Giữ content-first và không đổi schema/UI. `learn-api-from-docs-b2` là pilot phù hợp để có executable provenance RFC vì artifact dùng semantics 202/429/503. Daily Standup giữ provenance hiện tại sau khi tái xác minh. Các artifact còn lại nhận disclosure synthetic chuẩn; nguồn SRE/CEFR hỗ trợ review claim và task design nhưng không chứng thực dữ kiện scenario.

## Giới hạn

- Đây là source verification và content design review, không phải legal opinion.
- SRE case study phản ánh một hệ thống/quy mô cụ thể; không suy rộng thành universal best practice.
- RFC cho phép nhiều server behavior; lesson không được biến `MAY` thành bắt buộc.