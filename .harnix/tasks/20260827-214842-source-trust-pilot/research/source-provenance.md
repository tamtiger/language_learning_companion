# Research — nguồn và quyền sử dụng cho Daily Standup

- Task: `20260827-214842-source-trust-pilot`
- Ngày truy cập: 2026-08-27
- Unknown duy nhất: contract tham chiếu và quyền reuse nào đủ an toàn để một artifact mô phỏng Daily Standup vừa có căn cứ chuẩn vừa không ngụ ý chứng nhận/endorsement?

## Bằng chứng repository

- `SourceSectionSchema` hiện chỉ lưu title/format/content; lesson chưa có source registry hoặc provenance.
- Mọi source trong capability flow đi qua `SectionRenderer`, nhưng UI hiện lộ raw schema/mode/phase và không disclosure nguồn.
- `daily-standup-b1` có năm artifact theo phase; tên, số liệu và tình huống đều là dữ liệu mô phỏng.
- App load JSON bundled đồng bộ và offline-first; runtime fetch nguồn sẽ vi phạm boundary hiện có.

## Nguồn chính thức và facts

### Scrum Guide

- Nguồn canonical: https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf
- Trang tải/version chính thức: https://scrumguides.org/download.html
- Tác giả/publisher: Ken Schwaber và Jeff Sutherland.
- Version: November 2020; trang tải chính thức xác nhận đây là bản current.
- Vị trí: mục “Daily Scrum”, trang in 9; notice bản quyền/license, trang in 13.
- Fact: Developers có thể chọn bất kỳ cấu trúc và kỹ thuật nào miễn Daily Scrum tập trung vào tiến độ tới Sprint Goal và tạo actionable plan cho ngày làm việc kế tiếp.
- Fact: “yesterday / today / blocker” không phải cấu trúc bắt buộc trong Scrum Guide.
- Fact: tài liệu mang license Creative Commons Attribution Share-Alike 4.0.
- Cách dùng trong pilot: `reference-only`; không chép đoạn dài. Attribution hiển thị tên tài liệu, tác giả, version và license/link.

### CEFR Companion Volume

- Nguồn canonical: https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4
- Publisher: Council of Europe.
- Version: 2020.
- Vị trí: “Overall oral production” và “Sustained monologue: giving information”, trang in 62–63.
- Fact: descriptor B1 liên quan khả năng trình bày thông tin quen thuộc thành chuỗi tuyến tính và báo cáo thông tin thực tế đơn giản, có thể chuẩn bị trước.
- Chính sách quyền: https://www.coe.int/en/web/portal/copyright-licensing-permissions
- Fact: citation/reference không cần xin phép; reproduction/republishing chịu điều kiện quyền. Pilot chỉ paraphrase rationale và link nguồn.
- Giới hạn liên kết CEFR: https://www.coe.int/en/web/common-european-framework-reference-languages/relating-examinations-to-the-cefr
- Fact: Council of Europe không xác minh hoặc phê chuẩn tuyên bố liên kết một bài đánh giá với CEFR.
- Cách dùng trong pilot: `reference-only`; B1 là rationale nội bộ của dự án, không phải chứng nhận hay endorsement.

## Facts và inference

Facts là version, mục/trang, mục đích Daily Scrum, quyền CC BY-SA của Scrum Guide, descriptor B1 và giới hạn CEFR ở trên.

Inference thiết kế:

- Registry nên opt-in và lesson-local để lesson legacy không đổi, dữ liệu vẫn bundled/offline.
- Source artifact của pilot có `origin: synthetic`; cả tên người, metrics và incidents phải được nói rõ là mô phỏng.
- `adaptationNote` phải nói three-part update là team convention/scaffold, không phải Scrum requirement.
- Mỗi reference phải resolve fail-closed ở content layer; UI chỉ nhận metadata đã resolve.
- Link canonical chỉ mở khi người học chủ động, không fetch/iframe/remote asset.

## Kết luận và tác động

Quyết định contract:

- `sourceRegistry[]`: `sourceId`, `kind`, `title`, `publisher`, `canonicalUrl`, `versionOrPublishedAt`, `accessedAt`, `exactLocation`, `licenseIdOrRightsUrl`, `reuseMode`, optional `requiredAttribution`.
- `SourceSection.provenance`: `origin`, unique `sourceIds[]`, optional `adaptationNote`.
- Lesson v3 validation bắt unique registry ID, HTTPS canonical URL, ngày truy cập hợp lệ, unique/existing reference và yêu cầu note cho `synthetic|adapted`.
- Canonical normalization resolve references trước UI; legacy lesson không metadata vẫn hợp lệ.
- Cả năm artifact Daily Standup tham chiếu Scrum Guide 2020 và CEFR Companion Volume 2020 với note mô phỏng rõ ràng.
- Copy learner-facing gọi ba phần là “quy ước nhóm” và không tuyên bố nguồn chứng minh learning efficacy.

## Stop conditions

Đã đạt cả ba stop condition: xác nhận cấu trúc Scrum, quyền/reference contract và giới hạn CEFR. Không cần mở rộng research trước khi implement.