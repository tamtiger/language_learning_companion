# Research: shortest path tới meaningful practice

Ngày truy cập: 2026-08-21.

## Câu hỏi quyết định

Với sáu nhu cầu công việc ổn định trên Today, nên dùng control nào để người học B1 tìm đúng việc nhanh, so sánh được lựa chọn và vẫn dùng tốt bằng keyboard/screen reader?

## Evidence từ runtime

### Observation

- First-run desktop Today chỉ có recommendation “Ask for clarification without blocking work”; để luyện standup phải mở Catalog, quét 18 lesson, chọn Daily Standup rồi bắt đầu timer-only.
- Hành trình baseline có 3 primary actions: `Catalog → Daily Standup → Bắt đầu timer-only`; có 2 decision points: chọn nơi tìm và chọn lesson giữa danh sách.
- Ở 390x844 không có overflow, nhưng Daily Standup ở dưới first viewport của Catalog và Today không có cách đổi theo job hiện tại.
- `Sentence chunks` và `Luyện phát âm` có trên card spoken trong Catalog nhưng không xuất hiện ở Today.
- Returning state ưu tiên đúng lesson đang dở và có CTA “Tiếp tục learning loop” bằng một action; behavior này không phải bottleneck.

### Fact từ repo

- `PRODUCT.md` định nghĩa sản phẩm capability-first và không cho completion bằng quiz; baseline, retry, transfer và delayed review phải được giữ.
- `CONTENT.md` quy định JSON là executable curriculum; UI không hard-code lesson ID/topic/capability.
- `buildTodayQueue` đã cung cấp thứ tự deterministic `review → resume → baseline → new`.
- Catalog có 12 capability missions, hai mission cho mỗi capability; spoken mission khai báo mode và learning loop trong canonical content.

## Nguồn bên ngoài

1. GOV.UK Design System, “Radios”: https://design-system.service.gov.uk/components/radios/
   - Claim hỗ trợ: khi chỉ chọn một trong một danh sách, các option nên hiện với label rõ và được nhóm semantically; người dùng có thể nhìn toàn bộ lựa chọn.
   - Giới hạn: guidance cho public services/form, không đo trực tiếp người học ngoại ngữ Việt Nam.
2. GOV.UK Design System, “Select”: https://design-system.service.gov.uk/components/select/
   - Claim hỗ trợ: `select` nên là phương án cuối trong public-facing service; trước hết nên giảm số option và dùng control hiển thị lựa chọn, vì một số người dùng thấy select khó dùng.
   - Giới hạn: không phải experiment trong app này; sáu lựa chọn là action chứ không phải dữ liệu form cần submit.
3. W3C WAI, WCAG 2.2 Understanding SC 2.5.8: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
   - Claim hỗ trợ: pointer target tối thiểu 24×24 CSS px hoặc có spacing đủ; target lớn hơn giúp touch/one-hand use. Design chọn tối thiểu thực tế 44 px cho action chính.
   - Giới hạn: conformance/accessibility guidance, không chứng minh conversion hay learning efficacy.
4. W3C WAI, WCAG 2.2 Understanding SC 2.4.6 và 3.2.2:
   - https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html
   - https://www.w3.org/WAI/WCAG22/Understanding/on-input.html
   - Claim hỗ trợ: heading/label phải mô tả topic hoặc purpose; đổi setting của control không nên tự đổi context nếu người dùng chưa được báo trước.
   - Giới hạn: không quyết định copy cụ thể cho persona B1.

## Synthesis

### Inference

Sáu job intent đủ ít để hiển thị đồng thời. `select` làm mất information scent, cần thêm thao tác mở và có rủi ro navigation-on-change; radio + submit vẫn cần hai thao tác. Vì mỗi option là một command độc lập, semantic button list là cách ngắn nhất: thấy toàn bộ lựa chọn, kích hoạt bằng một action, không đổi context trước activation.

### Xếp hạng friction

Công thức: `impact × frequency × confidence ÷ effort/risk`, thang 1–4.

| Finding | Loại | I | F | C | E/R | Điểm |
|---|---|---:|---:|---:|---:|---:|
| Today không cho chọn theo việc sắp làm | DISCOVERY / COGNITIVE LOAD | 4 | 4 | 4 | 2 | 32 |
| Feature spoken chỉ thấy sau khi vào Catalog | DISCOVERY | 3 | 3 | 4 | 2 | 18 |
| Copy lộ thuật ngữ `capability/learning loop` | COMPREHENSION | 2 | 4 | 4 | 2 | 16 |
| Queue/card dùng nhiều visual weight | ACTION | 2 | 3 | 3 | 2 | 9 |

### Decision

Refactor Today thành recommendation ưu tiên + danh sách sáu job action content-driven. Candidate trong từng capability giữ thứ tự queue hiện hành; spoken candidate lộ rõ hai feature. Không sửa Catalog hoặc lesson flow trong increment này.

### Before/after target

| Metric | Before | Target after | Delta |
|---|---:|---:|---:|
| Primary actions từ Today tới bắt đầu output standup | 3 | 2 | -33,3% |
| Decision points | 2 | 1 | -50% |
| Navigation trước khi thấy Daily Standup | 1 | 0 | -100% |
| Navigation trước khi thấy feature spoken | 1 | 0 | -100% |
| Time | Không đo stopwatch | Không claim | N/A |

Meaningful output vẫn chỉ bắt đầu sau CTA timer/recording trong baseline. Kết quả browser synthetic chỉ chứng minh usability của flow, không chứng minh learning efficacy hay frequency thật trong population.

## Deferred

- Đổi toàn bộ thuật ngữ trong lesson flow cần audit riêng vì blast radius lớn.
- Catalog filtering và visual hierarchy không chặn shortest path sau khi job picker tồn tại.
- User research thật, timing distribution và task success rate chưa có; cần study riêng trước claim efficacy.