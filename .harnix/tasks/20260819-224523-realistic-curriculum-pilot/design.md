# Design — Phase-specific practice contexts

## Data contract
PerformanceTaskV3 gains optional practiceContexts. When present it contains exactly baseline, transfer and review. Each context contains title, brief and 1–4 standard source artifacts. Artifact IDs are unique within that context. Existing source formats and SectionRenderer remain the rendering contract.

## Runtime
CapabilityTask selects task.practiceContexts[phase] only for baseline, transfer or review, and renders it before that phase prompt. Input continues to render lesson.sections. Performance and retry continue using the learned strategy and session-only learner output. Self-feedback model timing is unchanged.

## Privacy and durability
Contexts are bundled content. No context selection or free text is added to ProgressEnvelopeV3. Learner output, transcript and audio remain session-only. Resume derives phase from current durable state and deterministically shows that phase's context.

## Pilot artifacts
Baseline uses a monitoring alert, incident-channel excerpts and handover/ownership note for checkout 503s. Transfer uses a different upload failure with different owners and evidence. Review uses an email-queue incident. Facts and hypotheses are intentionally separated so the learner must avoid overstating causality.

## Alternatives rejected
- More model/scaffold only: preserves the impossible cold attempt and encourages pattern copying.
- Branching interlocutor first: valuable for meetings but adds runtime state and scripted-turn complexity before the shared artifact problem is fixed.
- Put source sections before baseline globally: leaks instructional/answer content and changes all missions without a pilot gate.