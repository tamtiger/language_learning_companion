# Evidence synthesis

## Protocol

**Research question:** tập intervention tối thiểu nào nên là P0 để sửa bottleneck lớn nhất của app, vẫn local-only, đo trung thực và phù hợp Software Engineer Việt Nam A2–B2?

**Ngày tìm kiếm:** 2026-08-20. **Nguồn tìm:** ERIC, Cambridge Core, Wiley, PubMed/APS, publisher journal pages, ACL Anthology và tài liệu MDN chính thức.

**Search terms chính:** `L2 pronunciation instruction meta-analysis`, `high variability phonetic training meta-analysis perception production`, `formulaic sequences explicit instruction fluency`, `oral task repetition meta-analysis`, `oral corrective feedback meta-analysis`, `L2 spaced practice meta-analysis`, `extensive reading meta-analysis`, `Vietnamese English consonant clusters intelligibility`, `Web Speech API local recognition privacy`, `automatic speech recognition L2 pronunciation review`.

**Inclusion:** systematic review/meta-analysis ưu tiên; primary study khi chưa có synthesis phù hợp; adult L2/EFL và outcome performance/perception/production/fluency/retention/transfer; tài liệu chính thức cho giới hạn browser. **Exclusion:** blog/SEO, marketing sản phẩm, engagement-only, trẻ em nếu có adult evidence, AI claim không có validation, nghiên cứu chỉ đo attitude.

**Synthesis rule:** tách Fact khỏi Inference; ghi Population, Intervention, Comparator, Outcome và Limitation; không chuyển effect trong lab thành efficacy của app. Dừng khi mỗi P0 candidate có ≥2 nguồn độc lập hoặc confidence bị hạ rõ, và tìm thêm khó đổi thứ tự P0. Điều kiện dừng đã đạt.

## Source log

### S1 — Lee, Jang & Plonsky (2015), meta-analysis pronunciation instruction

- Link: https://eric.ed.gov/?id=EJ1067987
- Population: 86 báo cáo L2 pronunciation, nhiều context và proficiency.
- Intervention: explicit pronunciation instruction; moderator gồm duration và feedback.
- Comparator: pre/post và treatment/control tùy nghiên cứu.
- Outcome: **Fact** — effect tổng hợp lớn trên measure được nghiên cứu; controlled measures cho effect lớn hơn spontaneous/global measures.
- Limitation: heterogeneity và publication/measurement choices; không bảo đảm transfer sang workplace conversation.
- Inference: pronunciation instruction có ích, nhưng P0 phải đo câu nói/transfer chứ không chỉ quiz hoặc từ cô lập.

### S2 — Saito & Plonsky (2019), measurement framework/meta-analysis

- Link: https://onlinelibrary.wiley.com/doi/10.1111/lang.12345
- Population: 77 intervention studies về L2 pronunciation.
- Intervention: segmental/suprasegmental instruction với nhiều dosage.
- Comparator: nhiều design và measure.
- Outcome: **Fact** — bằng chứng rõ hơn cho monitored production của feature cụ thể; global spontaneous human-rated outcome ít chắc hơn.
- Limitation: study quality/construct khác nhau.
- Inference: không dùng “đọc đúng IPA” làm proxy cho giao tiếp tự tin; cần intelligibility/comprehensibility và unseen utterance.

### S3 — Derwing, Munro & Wiebe (1998), segmental so với global/prosodic

- Link: https://onlinelibrary.wiley.com/doi/abs/10.1111/0023-8333.00047
- Population: adult ESL trong khóa 12 tuần.
- Intervention: segmental instruction so với global/prosodic instruction.
- Comparator: hai pronunciation group và control.
- Outcome: **Fact** — cả hai nhóm cải thiện một số sentence measures; chỉ global/prosodic group cải thiện narrative comprehensibility/fluency.
- Limitation: study cũ, classroom, learner mix không riêng người Việt/software engineer.
- Inference: P0 nên kết hợp target sound với stress/rhythm trong chunk/câu công việc, không dạy symbol rời rạc.

### S4 — Munro & Derwing (2020), intelligibility framework

- Link: https://lwc1.benjamins.com/catalog/jslp.20038.mun
- Population: synthesis từ L2 speech research.
- Intervention/Comparator: conceptual and empirical review, không phải một app trial.
- Outcome: **Fact** — accentedness, comprehensibility và intelligibility liên quan nhưng khác nhau; speech có accent vẫn có thể intelligible.
- Limitation: không cho dosage hoặc UI recipe.
- Inference: north-star là người nghe hiểu dễ và đúng, không phải native accent hoặc ASR similarity score.

### S5 — Uchihara, Karas & Thomson (2025), HVPT perception meta-analysis

- Link: https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/high-variability-phonetic-training-hvpt-a-metaanalysis-of-l2-perceptual-training-studies/6ABB8C1F32D88D53EA8D05A4565E76F6
- Population: 79 high-variability phonetic training studies.
- Intervention: nhiều talker, nhiều phonetic context, identification/discrimination và immediate feedback.
- Comparator: pre/post và treatment/control.
- Outcome: **Fact** — positive perception gain, có retention và một phần generalization; treatment-control effect ở mức vừa-lớn trong báo cáo.
- Limitation: outcome chủ yếu perception, task/language đa dạng; chưa phải workplace transfer.
- Inference: micro-loop nghe nhiều voice/context → chọn/nhận biết → feedback là candidate P0 mạnh hơn chỉ TTS một từ.

### S6 — Uchihara, Karas & Thomson (2024), HVPT production meta-analysis

- Link: https://www.cambridge.org/core/journals/applied-psycholinguistics/article/does-perceptual-high-variability-phonetic-training-improve-l2-speech-production-a-metaanalysis-of-perceptionproduction-connection/E38D8F5CE65DC708137B0E95F97C6BC7
- Population: 31 HVPT production studies.
- Intervention: perception-focused HVPT.
- Comparator: pre/post và treatment/control.
- Outcome: **Fact** — production gain nhỏ-vừa; trained item tốt hơn untrained; retention/generalization production chưa mạnh.
- Limitation: perception training không tự động chuyển đầy đủ sang spontaneous production.
- Inference: perception-first phải nối với record/listen-back, production chunk, transfer và delayed retrieval; nghe chunks một mình không “tự khắc phát âm đúng”.

### S7 — Tavakoli & Uchihara (2021), explicit formulaic sequences

- Link: https://www.sciencedirect.com/science/article/abs/pii/S0024384121000449
- Population: advanced EAP freshmen.
- Intervention: 5 tuần, 80 formulaic sequences.
- Comparator: 82 single academic words.
- Outcome: **Fact** — formulaic group cải thiện pruned speech rate/global fluency và duy trì ở delayed test; repairs/pauses không đổi.
- Limitation: một setting advanced EAP, transactional tasks; không trực tiếp generalize tới A2–B2 workplace interaction.
- Inference: sentence chunks là **experiment có evidence vừa**, hiệu quả nhất khi là cue để truy xuất/biến đổi, không phải phrase list để đọc thuộc.

### S8 — Oral task repetition meta-analysis (2025)

- Link: https://hilpub.uni-hildesheim.de/entities/publication/c7f89e57-747e-4ca3-9cd9-a64c33cb4cf4
- Population: oral L2 task repetition studies.
- Intervention: lặp lại task, với biến thể về spacing/task/context.
- Comparator: non-repetition hoặc pre/post tùy study.
- Outcome: **Fact** — gain đáng kể cho syntactic complexity/accuracy và gain nhỏ hơn cho fluency/lexical; moderator gồm task type, context, repetition và spacing.
- Limitation: meta-analysis rất mới; abstract-level access trong audit, không riêng self-guided web app.
- Inference: retry nên giữ communicative function nhưng thay dữ kiện/bối cảnh; copy lại nguyên response dễ tạo rehearsal illusion.

### S9 — Lyster & Saito (2010), oral corrective feedback meta-analysis

- Link: https://kazuyasaito.net/SSLA2010.pdf
- Population: 15 classroom studies, tổng N=827.
- Intervention: oral corrective feedback, gồm prompts và recasts.
- Comparator: control/no feedback và loại feedback.
- Outcome: **Fact** — feedback có effect bền; prompts mạnh hơn recasts và effect xuất hiện ở free constructed responses.
- Limitation: teacher-mediated classroom, không chứng minh self-rubric hoặc feedback tự động của app tương đương.
- Inference: P0 nên dùng focused prompt/repair turn có rule rõ; không nên giả vờ AI biết learner phát âm sai ở đâu.

### S10 — Bryfonski & McKay (2019), TBLT meta-analysis

- Link: https://journals.sagepub.com/doi/10.1177/1362168817744389
- Population: task-based language teaching trong classroom thực.
- Intervention: authentic, meaning-focused tasks và interaction.
- Comparator: nhiều conventional conditions.
- Outcome: **Fact** — synthesis ủng hộ TBLT với moderator theo context/design.
- Limitation: classroom implementation và outcome đa dạng; không cho script UI duy nhất.
- Inference: interaction cue/follow-up/repair trong nhiệm vụ nghề nghiệp phù hợp mục tiêu hơn thêm quiz kiến thức.

### S11 — Kim & Webb (2022), L2 spacing meta-analysis

- Link: https://onlinelibrary.wiley.com/doi/10.1111/lang.12479
- Population: 48 experiments, 98 effect sizes, N=3,411.
- Intervention: spaced practice với interval ngắn/dài, equal/expanding.
- Comparator: massed practice và các schedule.
- Outcome: **Fact** — spacing có effect vừa-lớn; shorter và longer tương đương ở immediate posttest nhưng longer tốt hơn ở delayed; equal và expanding không khác có ý nghĩa.
- Limitation: effect phụ thuộc learning target, sessions, practice type, activity, feedback timing và retention interval; không xác nhận chính xác lịch 1–3–7 cho speaking.
- Inference: giữ delayed review nhưng đo retrieval/transfer; schedule cụ thể là giả thuyết cần calibration, không phải “optimal algorithm”.

### S12 — Roediger & Karpicke (2006), retrieval practice

- Link: https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/
- Population: college students học prose passages.
- Intervention: repeated retrieval/test.
- Comparator: repeated study.
- Outcome: **Fact** — rereading tốt hơn ở 5 phút, retrieval tốt hơn rõ ở 2 ngày/1 tuần; confidence dễ nghiêng sai về rereading.
- Limitation: general memory, không L2 speech hoặc workplace task.
- Inference: model-first tạo cảm giác dễ nhưng có thể che retrieval gap; cold cue và delayed prompt nên tồn tại.

### S13 — Nakanishi (2015) và Jeon & Day (2016), extensive reading

- Links: https://onlinelibrary.wiley.com/doi/abs/10.1002/tesq.157 ; https://files.eric.ed.gov/fulltext/EJ1117026.pdf
- Population: lần lượt 34 studies/3,942 learners và 49 studies/5,919 learners.
- Intervention: extensive reading.
- Comparator: control hoặc pre/post.
- Outcome: **Fact** — small-to-medium positive effects lên reading/language outcomes; curriculum integration là moderator quan trọng trong Jeon & Day.
- Limitation: EFL/university overrepresented, không riêng technical documentation hoặc action accuracy.
- Inference: reading ladder có cơ sở cho P2, nhưng app hiện thiếu pronunciation/interaction bridge nghiêm trọng hơn nên extensive reading không đứng P0.

### S14 — Vietnamese learner cluster studies

- Links: https://ctujs.ctu.edu.vn/index.php/ctujs/article/view/448 ; https://doi.org/10.22437/ijolte.v3i1.6178
- Population: 39 Vietnamese EFL university learners ở study 2022; 7 Vietnamese graduate learners ở study 2019.
- Intervention/Comparator: diagnostic production tests, không phải intervention trial.
- Outcome: **Fact** — cluster simplification/deletion, đặc biệt complex/final consonant clusters, xuất hiện trong sample.
- Limitation: sample nhỏ, English-major/graduate populations, task đọc từ; không đủ để hard-code mọi người Việt có cùng lỗi.
- Inference: dùng quick diagnostic để chọn cue final consonant/cluster khi cần; không ép toàn bộ IPA inventory cho mọi learner.

### S15 — ASR evidence và browser boundary

- Links: https://www.sciencedirect.com/science/article/pii/S0346251X24000320 ; https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition ; https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally
- Population: review 50 CALL-ASR studies; tài liệu browser chính thức.
- Intervention: ASR-assisted assessment/pronunciation; browser speech recognition.
- Comparator: study-dependent; local vs service-based implementation.
- Outcome: **Fact** — literature có tín hiệu hữu ích nhưng studies rất khác nhau nên một study riêng khó extrapolate; `SpeechRecognition` có limited availability, một số browser gửi audio tới server; `processLocally` còn experimental và cần language pack/support.
- Limitation: ASR transcript accuracy không đồng nhất với comprehensibility; local availability thay đổi theo browser/device.
- Inference: không dùng ASR scoring/cloud ở P0. Record/playback + transparent learner/listener rubric giữ local-only và không tạo false precision.

## Tổng hợp fact → inference → decision

| Evidence fact | Product inference | Decision |
|---|---|---|
| Pronunciation instruction có lợi nhưng controlled outcome lớn hơn spontaneous/global | quiz/word accuracy không đủ | đo sentence/transfer; IPA chỉ just-in-time |
| HVPT cải thiện perception; production transfer nhỏ hơn | chunks nghe thôi không tự tạo phát âm đúng | perception → production loop là Must-have |
| Formulaic sequence có một số fluency gain trong setting hẹp | chunks có tiềm năng, chưa phải universal cure | cue-driven chunks là experiment trong P0 |
| Prompt feedback và task interaction có evidence classroom | self-rubric đơn độc quá yếu | scripted follow-up/repair + focused retry |
| Spacing/retrieval giúp delayed outcome nhưng schedule phụ thuộc task | lịch 1–3–7 không phải chân lý | giữ review, đo delayed unseen retrieval |
| ASR browser có availability/privacy/validity constraints | auto-score dễ tạo false precision và phá local-only | reject/defer ASR scoring/cloud |
| Extensive reading có effect nhỏ-vừa | reading progression có giá trị nhưng không vá speaking bridge | P2 sau P0 interaction/pronunciation |

## Conflicts và uncertainty

1. Meta-analysis pronunciation cho effect lớn, nhưng Saito và HVPT-production cho thấy spontaneous/global production yếu hơn controlled result. Quyết định bảo thủ: dạy có mục tiêu, đo transfer.
2. Sentence chunks có fluency evidence nhưng population-fit thấp hơn HVPT/spacing synthesis. Xếp experiment, không gọi Must-have độc lập.
3. Prompts hơn recasts trong classroom không có nghĩa một app tự-guided có cùng effect. P0 chỉ dùng transparent prompts, không tuyên bố feedback tự động thông minh.
4. Extensive reading có corpus evidence lớn, nhưng app hiện đã có action-oriented reading seed; opportunity cost khiến nó xuống P2.
5. Vietnamese-specific studies chỉ giúp chọn candidate diagnostic; không dùng L1 stereotype thay individual measurement.

## Confidence

- **Cao vừa:** audio-first high-variability perception + explicit production + transfer; nhiều synthesis độc lập, nhưng app/persona chưa trial.
- **Vừa:** task cue → focused retry → variation → interaction repair; evidence từ TBLT/feedback/repetition, transfer sang self-guided app cần pilot.
- **Vừa-thấp:** sentence chunks như mechanism tăng automaticity cho A2–B2 software engineers; direct population evidence thiếu.
- **Cao:** không nên dùng full IPA prerequisite, native-accent target hoặc ASR score làm P0; mismatch với outcome và boundary rõ.

Không có kết quả nào chứng minh app hiện tại hoặc P0 đề xuất sẽ hiệu quả. Chúng chỉ đủ để chọn pilot có falsifiable outcome.