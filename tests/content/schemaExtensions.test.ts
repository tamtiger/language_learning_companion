import { describe, expect, it } from 'vitest'
import { LessonV3Schema, ReviewPolicySchema, RubricItemSchema } from '@/content/schema'
import { validWrittenMission } from '../helpers/lessonFixtures'

function lesson(patch: (draft: Record<string, any>) => void) {
  const draft = structuredClone(validWrittenMission) as Record<string, any>
  patch(draft)
  return LessonV3Schema.safeParse(draft)
}

function issues(result: ReturnType<typeof lesson>): string {
  return result.success ? '' : result.error.errors.map((error) => `${error.path.join('.')}: ${error.message}`).join('\n')
}

const languageRubric = [
  { id: 'task', label: 'Task', description: 'Does what was asked.', dimension: 'task', anchors: { met: 'Names the issue and the next step.', notMet: 'Only describes the issue.' } },
  { id: 'accuracy', label: 'Accuracy', description: 'Uses correct basic grammar.', dimension: 'accuracy', anchors: { met: 'Short sentences, mostly correct.', notMet: 'Many errors hide the meaning.' } },
  { id: 'range', label: 'Range', description: 'Uses varied simple words.', dimension: 'range', anchors: { met: 'Uses two or more useful chunks.', notMet: 'Repeats one word.' } }
]

describe('CEFR A2 lessons', () => {
  it('accepts A2 with language criteria and anchors on every criterion', () => {
    const result = lesson((draft) => { draft.cefrLevel = 'A2'; draft.performanceTask.rubric = languageRubric })
    expect(issues(result)).toBe('')
  })

  it('rejects A2 without any language criterion', () => {
    const result = lesson((draft) => {
      draft.cefrLevel = 'A2'
      draft.performanceTask.rubric = languageRubric.map((item) => ({ ...item, dimension: 'task' }))
    })
    expect(result.success).toBe(false)
    expect(issues(result)).toMatch(/A2.*(accuracy|range|register)/i)
  })

  it('rejects A2 when a criterion has no anchors', () => {
    const result = lesson((draft) => {
      draft.cefrLevel = 'A2'
      draft.performanceTask.rubric = languageRubric.map((item, index) => index === 1 ? { ...item, anchors: undefined } : item)
    })
    expect(result.success).toBe(false)
    expect(issues(result)).toMatch(/anchors/i)
  })

  it('does not require language criteria for the existing B1 mission shape', () => {
    expect(lesson(() => undefined).success).toBe(true)
    expect(lesson((draft) => { draft.cefrLevel = 'B2' }).success).toBe(true)
  })

  it('still rejects levels outside A2 to C1', () => {
    expect(lesson((draft) => { draft.cefrLevel = 'A1' }).success).toBe(false)
  })
})

describe('rubric dimensions and anchors', () => {
  const base = { id: 'clarity', label: 'Clarity', description: 'Is it clear?' }

  it('accepts every dimension and a complete anchor pair', () => {
    for (const dimension of ['task', 'accuracy', 'range', 'register']) {
      expect(RubricItemSchema.safeParse({ ...base, dimension }).success, dimension).toBe(true)
    }
    expect(RubricItemSchema.safeParse({ ...base, anchors: { met: 'Clear.', notMet: 'Unclear.' } }).success).toBe(true)
  })

  it('rejects an unknown dimension and incomplete or empty anchors', () => {
    expect(RubricItemSchema.safeParse({ ...base, dimension: 'fluency' }).success).toBe(false)
    expect(RubricItemSchema.safeParse({ ...base, anchors: { met: 'Clear.' } }).success).toBe(false)
    expect(RubricItemSchema.safeParse({ ...base, anchors: { met: ' ', notMet: 'Unclear.' } }).success).toBe(false)
  })

  it('allows up to six criteria but not seven', () => {
    const rubric = (count: number) => Array.from({ length: count }, (_, index) => ({ id: `c${index}`, label: `C${index}`, description: 'D' }))
    expect(lesson((draft) => { draft.performanceTask.rubric = rubric(6) }).success).toBe(true)
    expect(lesson((draft) => { draft.performanceTask.rubric = rubric(7) }).success).toBe(false)
  })
})

describe('review policy', () => {
  it('supports long spaced intervals up to 45 days and a hard cap of 180', () => {
    expect(ReviewPolicySchema.safeParse({ intervalDays: [1, 3, 7, 14, 21, 45] }).success).toBe(true)
    expect(ReviewPolicySchema.safeParse({ intervalDays: [1, 180] }).success).toBe(true)
    expect(ReviewPolicySchema.safeParse({ intervalDays: [1, 181] }).success).toBe(false)
  })

  it('keeps intervals strictly increasing', () => {
    expect(ReviewPolicySchema.safeParse({ intervalDays: [3, 3] }).success).toBe(false)
  })

  it('takes an optional interleave flag that must be a boolean', () => {
    expect(ReviewPolicySchema.parse({ intervalDays: [1, 3], interleave: true }).interleave).toBe(true)
    expect(ReviewPolicySchema.parse({ intervalDays: [1, 3] }).interleave).toBeUndefined()
    expect(ReviewPolicySchema.safeParse({ intervalDays: [1, 3], interleave: 'yes' }).success).toBe(false)
  })
})

const choice = (id: string, question = 'What happened?') => ({
  id, type: 'choice', question, options: ['The deploy failed', 'The deploy passed'], correctAnswer: ['The deploy failed'], explanation: 'It says failed.'
})

const speakers = [
  { id: 'ana', label: 'Ana (host)', locale: 'en-GB', voiceHints: ['English UK'] },
  { id: 'ben', label: 'Ben (on call)', locale: 'en-US', voiceHints: ['English US'] }
]

const turns = [
  { speakerId: 'ana', text: 'Morning everyone, let us start with the deploy.' },
  { speakerId: 'ben', text: 'The deploy failed at the migration step.' },
  { speakerId: 'ana', text: 'Do we know why it failed?' },
  { speakerId: 'ben', text: 'A lock on the orders table, I think.' }
]

function listening(patch: Record<string, unknown> = {}) {
  return {
    id: 'standup-call', type: 'listening-source', title: 'Standup call', durationSeconds: 90,
    speakers, turns, gist: [choice('gist-1')], detail: [choice('detail-1', 'Where did it fail?'), choice('detail-2', 'What blocked it?')],
    listeningNotes: { prompt: 'Note who owns what.', fields: ['Owner', 'Next step'] },
    ...patch
  }
}

const words = (count: number, prefix = 'w') => Array.from({ length: count }, (_, index) => `${prefix}${index}`).join(' ')

function longReading(patch: Record<string, unknown> = {}) {
  return {
    id: 'rfc-reading', type: 'long-reading', title: 'Retry policy RFC', format: 'rfc',
    parts: [
      { id: 'summary', heading: 'Summary', content: words(120, 's') },
      { id: 'design', heading: 'Design', content: words(120, 'd') },
      { id: 'risks', heading: 'Risks', content: words(120, 'r') }
    ],
    skim: [choice('skim-1', 'What is the document about?')],
    scan: [
      { locatePartId: 'design', exercise: choice('scan-1', 'Where is the retry limit?') },
      { locatePartId: 'risks', exercise: choice('scan-2', 'Where are the risks?') }
    ],
    ...patch
  }
}

const vocabularySection = {
  id: 'vocab', type: 'language-support', title: 'Vocabulary',
  vocabulary: ['rollback', 'rollout', 'throttle'].map((word) => ({
    word, ipa: '/x/', definition: 'd', technicalMeaning: 't', collocations: [`${word} plan`], example: 'e', commonMistake: 'm'
  })),
  expressions: []
}

function withSection(section: Record<string, unknown>, extraSections: Record<string, unknown>[] = []) {
  return lesson((draft) => { draft.sections = [...draft.sections, ...extraSections, section] })
}

describe('vocabulary-review section', () => {
  const review = (patch: Record<string, unknown> = {}) => ({
    id: 'vocab-review', type: 'vocabulary-review', title: 'Review the words', wordRefs: ['rollback', 'rollout', 'throttle'],
    exercises: [choice('vr-1'), choice('vr-2'), choice('vr-3')], ...patch
  })

  it('accepts a review of words taught in the same lesson', () => {
    expect(issues(withSection(review(), [vocabularySection]))).toBe('')
  })

  it('rejects words the lesson never teaches, too few words and too few exercises', () => {
    expect(issues(withSection(review({ wordRefs: ['rollback', 'rollout', 'missing'] }), [vocabularySection]))).toMatch(/not taught|unknown word/i)
    expect(withSection(review({ wordRefs: ['rollback', 'rollout'] }), [vocabularySection]).success).toBe(false)
    expect(withSection(review({ exercises: [choice('vr-1')] }), [vocabularySection]).success).toBe(false)
  })

  it('matches taught words regardless of letter case', () => {
    expect(issues(withSection(review({ wordRefs: ['Rollback', 'ROLLOUT', 'Throttle'] }), [vocabularySection]))).toBe('')
  })
})

describe('listening-source section', () => {
  it('accepts a multi-speaker conversation with gist and detail questions', () => {
    expect(issues(withSection(listening()))).toBe('')
  })

  it('rejects a single speaker, an unknown speaker and a conversation that is too short', () => {
    expect(withSection(listening({ speakers: [speakers[0]] })).success).toBe(false)
    expect(issues(withSection(listening({ turns: [...turns.slice(0, 3), { speakerId: 'zed', text: 'Hi.' }] })))).toMatch(/speaker/i)
    expect(withSection(listening({ turns: turns.slice(0, 3) })).success).toBe(false)
  })

  it('rejects a conversation where only one of the speakers ever talks', () => {
    expect(withSection(listening({ turns: turns.map((turn) => ({ ...turn, speakerId: 'ana' })) })).success).toBe(false)
  })

  it('bounds the duration and the voice request', () => {
    expect(withSection(listening({ durationSeconds: 29 })).success).toBe(false)
    expect(withSection(listening({ durationSeconds: 601 })).success).toBe(false)
    expect(withSection(listening({ speakers: [{ ...speakers[0], locale: 'english' }, speakers[1]] })).success).toBe(false)
  })

  it('requires gist and detail questions and unique exercise ids across the lesson', () => {
    expect(withSection(listening({ gist: [] })).success).toBe(false)
    expect(withSection(listening({ detail: [choice('detail-1')] })).success).toBe(false)
    expect(issues(withSection(listening({ detail: [choice('gist-1'), choice('detail-2')] })))).toMatch(/unique/i)
  })

  it('limits the listening notes to a few fields', () => {
    expect(withSection(listening({ listeningNotes: { prompt: 'Notes', fields: [] } })).success).toBe(false)
    expect(withSection(listening({ listeningNotes: { prompt: 'Notes', fields: ['a', 'b', 'c', 'd', 'e', 'f'] } })).success).toBe(false)
  })
})

describe('long-reading section', () => {
  it('accepts a structured reading with skim and locating questions', () => {
    expect(issues(withSection(longReading()))).toBe('')
  })

  it('requires locating questions to point at a real part', () => {
    const result = withSection(longReading({ scan: [
      { locatePartId: 'nowhere', exercise: choice('scan-1') },
      { locatePartId: 'risks', exercise: choice('scan-2') }
    ] }))
    expect(result.success).toBe(false)
    expect(issues(result)).toMatch(/locatePartId|part/i)
  })

  it('needs at least three parts and two scan questions', () => {
    expect(withSection(longReading({ parts: longReading().parts.slice(0, 2) })).success).toBe(false)
    expect(withSection(longReading({ scan: [longReading().scan[0]] })).success).toBe(false)
  })

  it('keeps part ids unique and the total length between 300 and 2000 words', () => {
    const parts = longReading().parts
    expect(withSection(longReading({ parts: [parts[0], parts[0], parts[2]] })).success).toBe(false)
    expect(issues(withSection(longReading({ parts: parts.map((part) => ({ ...part, content: words(50) })) })))).toMatch(/words/i)
    expect(withSection(longReading({ parts: parts.map((part) => ({ ...part, content: words(900) })) })).success).toBe(false)
  })

  it('accepts only the documented formats', () => {
    for (const format of ['rfc', 'api-reference', 'changelog', 'log', 'issue', 'tutorial', 'prose']) {
      expect(withSection(longReading({ format })).success, format).toBe(true)
    }
    expect(withSection(longReading({ format: 'novel' })).success).toBe(false)
  })
})

describe('provenance on the new sections', () => {
  const registry = [{
    sourceId: 'rfc-doc', kind: 'official-doc', title: 'Retry RFC', publisher: 'Example', canonicalUrl: 'https://example.org/rfc',
    versionOrPublishedAt: '2026', accessedAt: '2026-08-27', exactLocation: 'Section 2',
    licenseIdOrRightsUrl: 'https://example.org/license', reuseMode: 'reference-only'
  }]

  it('accepts a registered source and rejects an unknown one', () => {
    const provenance = (sourceIds: string[]) => ({ origin: 'synthetic', sourceIds, adaptationNote: 'Fictional adaptation of the RFC structure.' })
    const ok = lesson((draft) => {
      draft.sourceRegistry = registry
      draft.sections = [...draft.sections, longReading({ provenance: provenance(['rfc-doc']) })]
    })
    expect(issues(ok)).toBe('')

    const bad = lesson((draft) => {
      draft.sourceRegistry = registry
      draft.sections = [...draft.sections, listening({ provenance: provenance(['not-registered']) })]
    })
    expect(bad.success).toBe(false)
    expect(issues(bad)).toMatch(/sourceRegistry/)
  })

  it('lets a lesson rely on a listening or reading section as its source', () => {
    const only = lesson((draft) => { draft.sections = draft.sections.filter((section: { type: string }) => section.type !== 'source').concat([longReading()]) })
    expect(issues(only)).toBe('')
  })
})

describe('content revision and story bank requirement', () => {
  it('defaults the content revision to 1 and accepts a positive integer', () => {
    const parsed = (patch: (draft: Record<string, any>) => void) => {
      const draft = structuredClone(validWrittenMission) as Record<string, any>
      patch(draft)
      return LessonV3Schema.safeParse(draft)
    }
    const withoutRevision = parsed((draft) => { delete draft.contentRevision })
    expect(withoutRevision.success && withoutRevision.data.contentRevision).toBe(1)
    expect(parsed((draft) => { draft.contentRevision = 3 }).success).toBe(true)
    expect(parsed((draft) => { draft.contentRevision = 0 }).success).toBe(false)
    expect(parsed((draft) => { draft.contentRevision = 1.5 }).success).toBe(false)
  })

  it('lets an interview lesson declare the competencies it draws stories for', () => {
    expect(lesson((draft) => { draft.storyBank = { competencies: ['ownership', 'conflict'], minStories: 2 } }).success).toBe(true)
  })

  it('rejects unknown, repeated or missing competencies and an out-of-range story count', () => {
    for (const storyBank of [
      { competencies: ['charisma'], minStories: 1 },
      { competencies: ['ownership', 'ownership'], minStories: 1 },
      { competencies: [], minStories: 1 },
      { competencies: ['ownership'], minStories: 0 },
      { competencies: ['ownership'], minStories: 6 },
      { competencies: ['ownership'], minStories: 1, body: 'story text' }
    ]) {
      expect(lesson((draft) => { draft.storyBank = storyBank }).success, JSON.stringify(storyBank)).toBe(false)
    }
  })
})

describe('short spoken outputs for A2', () => {
  const spoken = (contract: Record<string, number>) => lesson((draft) => {
    draft.performanceTask = {
      ...draft.performanceTask,
      mode: 'spoken',
      outputContract: { requiredElements: ['context'], ...contract }
    }
    delete draft.performanceTask.minWords
  })

  it('accepts a 20 second target inside a 40 second limit', () => {
    expect(issues(spoken({ targetSeconds: 20, timeLimitSeconds: 40 }))).toBe('')
  })

  it('still rejects a target below 15 seconds, a limit below 20 and a target above its limit', () => {
    expect(spoken({ targetSeconds: 14, timeLimitSeconds: 40 }).success).toBe(false)
    expect(spoken({ targetSeconds: 15, timeLimitSeconds: 19 }).success).toBe(false)
    expect(spoken({ targetSeconds: 41, timeLimitSeconds: 40 }).success).toBe(false)
  })

  it('keeps the written minimum time limit at 30 seconds', () => {
    expect(lesson((draft) => { draft.performanceTask.outputContract.timeLimitSeconds = 29 }).success).toBe(false)
    expect(lesson((draft) => { draft.performanceTask.outputContract.timeLimitSeconds = 30 }).success).toBe(true)
  })
})
