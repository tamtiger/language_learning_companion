# Traceability hai chiều

- Required element/rubric → toàn bộ evidence packet đúng phase theo output/rubric contract; đây là structural support, không giả thành lexical/semantic match.
- Required element/rubric → model sentence bằng manifest 86 row được human-audit, khóa với digest của 12 modelResponse; output element chọn một demonstration tốt nhất, rubric tổng hợp chọn tập tối thiểu. Token/concept score chỉ là diagnostic, không quyết định ground truth.
- Model fact sentence → semantic evidence/source; authored hypothesis/proposal/recommendation có explicit boundary và có thể dùng structural phase-packet support khi không có lexical match.
- Objective → assessment/performance; mọi v1 bắt buộc `knowledge-only`.

Các record được lưu lossless trong shard `trace-required-*`, `trace-model-*` và `trace-objective-*`; validator kiểm exact ID set và reverse trace trên toàn directory.
