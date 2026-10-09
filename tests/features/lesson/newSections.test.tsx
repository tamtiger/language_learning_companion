import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildCatalog } from '@/content/catalog'
import { LessonSectionSchema, type CanonicalLessonSection } from '@/content/schema'
import { SectionRenderer } from '@/features/lesson/SectionRenderer'
import { useAppStore } from '@/shared/hooks/useAppStore'
import { validWrittenMission } from '../../helpers/lessonFixtures'

const audio = vi.hoisted(() => ({ playModelAudio: vi.fn((_source: unknown, _rate?: number, _onStatus?: unknown) => () => undefined) }))

vi.mock('@/features/practice/modelAudio', async () => {
  const actual = await vi.importActual<typeof import('@/features/practice/modelAudio')>('@/features/practice/modelAudio')
  return { ...actual, playModelAudio: audio.playModelAudio, availableVoiceCount: () => 1 }
})

const choice = (id: string, question: string, right: string, wrong: string) => ({
  id, type: 'choice', question, options: [right, wrong], correctAnswer: [right], explanation: `It is ${right}.`
})

const words = (count: number, prefix: string) => Array.from({ length: count }, (_, index) => `${prefix}${index}`).join(' ')

const rawSections = {
  vocabularyReview: {
    id: 'vocab-review', type: 'vocabulary-review', title: 'Review the words', wordRefs: ['rollback', 'rollout', 'throttle'],
    exercises: [choice('vr-1', 'Which is a return to a prior version?', 'rollback', 'rollout'), choice('vr-2', 'Which slows requests?', 'throttle', 'rollout'), choice('vr-3', 'Which ships gradually?', 'rollout', 'rollback')]
  },
  listening: {
    id: 'standup-call', type: 'listening-source', title: 'Standup call', durationSeconds: 90,
    speakers: [
      { id: 'ana', label: 'Ana (host)', locale: 'en-GB', voiceHints: ['English UK'] },
      { id: 'ben', label: 'Ben (on call)', locale: 'en-US', voiceHints: ['English US'] }
    ],
    turns: [
      { speakerId: 'ana', text: 'Morning everyone, let us start with the deploy.' },
      { speakerId: 'ben', text: 'The deploy failed at the migration step.' },
      { speakerId: 'ana', text: 'Do we know why it failed?' },
      { speakerId: 'ben', text: 'A lock on the orders table, I think.' }
    ],
    gist: [choice('gist-1', 'What is the call about?', 'A failed deploy', 'A hiring plan')],
    detail: [choice('detail-1', 'Where did it fail?', 'At the migration step', 'At the build step'), choice('detail-2', 'What blocked it?', 'A table lock', 'A network outage')],
    listeningNotes: { prompt: 'Note who owns what.', fields: ['Owner', 'Next step'] }
  },
  longReading: {
    id: 'rfc-reading', type: 'long-reading', title: 'Retry policy RFC', format: 'rfc',
    parts: [
      { id: 'summary', heading: 'Summary', content: words(110, 's') },
      { id: 'design', heading: 'Design', content: words(110, 'd') },
      { id: 'risks', heading: 'Risks', content: words(110, 'r') }
    ],
    skim: [choice('skim-1', 'What is the document about?', 'A retry policy', 'A pricing page')],
    scan: [
      { locatePartId: 'design', exercise: choice('scan-1', 'Where is the retry limit?', 'Design', 'Risks') },
      { locatePartId: 'risks', exercise: choice('scan-2', 'Where are the risks?', 'Risks', 'Summary') }
    ]
  }
}

function canonical(key: keyof typeof rawSections): CanonicalLessonSection {
  const raw = structuredClone(validWrittenMission) as Record<string, any>
  raw.sections = [...raw.sections, {
    id: 'vocab', type: 'language-support', title: 'Vocabulary',
    vocabulary: ['rollback', 'rollout', 'throttle'].map((word) => ({ word, ipa: '/x/', definition: 'd', technicalMeaning: 't', collocations: [`${word} plan`], example: 'e', commonMistake: 'm' })),
    expressions: []
  }, rawSections[key]]
  const lesson = buildCatalog([['x.json', raw]]).lessons[0]
  const section = lesson.sections.find((item) => item.id === rawSections[key].id)
  if (!section) throw new Error('fixture section missing')
  return section
}

describe('renderers for the new section types', () => {
  beforeEach(() => {
    useAppStore.getState().resetProgress()
    audio.playModelAudio.mockClear()
  })

  it('has a renderer branch for every section type the schema accepts', () => {
    const types = LessonSectionSchema.options.map((option) => option.shape.type.value)
    expect(types).toEqual(expect.arrayContaining(['vocabulary-review', 'listening-source', 'long-reading']))

    const samples: Record<string, CanonicalLessonSection> = {
      brief: { id: 'b', type: 'brief', title: 'Brief title', body: 'Brief body' },
      'language-support': { id: 'l', type: 'language-support', title: 'Language title', vocabulary: [], expressions: [] },
      source: { id: 's', type: 'source', title: 'Source title', format: 'prose', content: 'Source text' },
      'auto-check': { id: 'a', type: 'auto-check', title: 'Check title', exercises: [rawSections.vocabularyReview.exercises[0]] as never },
      'vocabulary-review': canonical('vocabularyReview'),
      'listening-source': canonical('listening'),
      'long-reading': canonical('longReading')
    }
    for (const type of types) {
      const section = samples[type]
      expect(section, `sample for ${type}`).toBeDefined()
      const { container, unmount } = render(<SectionRenderer lessonId="lesson" section={section} />)
      expect(within(container).getByRole('heading', { name: section.title }), type).toBeTruthy()
      unmount()
    }
  })

  it('shows the vocabulary review exercises', () => {
    render(<SectionRenderer lessonId="lesson" section={canonical('vocabularyReview')} />)
    expect(screen.getByText('Which slows requests?')).toBeTruthy()
    expect(screen.getAllByRole('button', { name: /kiểm tra/i })).toHaveLength(3)
  })

  it('lists the parts of a long reading in a table of contents linked to each part', () => {
    render(<SectionRenderer lessonId="lesson" section={canonical('longReading')} />)

    const toc = screen.getByRole('navigation', { name: /mục lục/i })
    for (const heading of ['Summary', 'Design', 'Risks']) {
      const link = within(toc).getByRole('link', { name: heading })
      const target = document.getElementById(link.getAttribute('href')?.slice(1) ?? '')
      expect(target, heading).toBeTruthy()
      expect(within(target as HTMLElement).getByRole('heading', { name: heading })).toBeTruthy()
    }
    expect(screen.getByText('What is the document about?')).toBeTruthy()
    expect(screen.getByText('Where is the retry limit?')).toBeTruthy()
  })

  it('tags the long reading text as English', () => {
    render(<SectionRenderer lessonId="lesson" section={canonical('longReading')} />)
    expect(screen.getByText(/^s0 s1/).closest('[lang]')?.getAttribute('lang')).toBe('en')
  })

  it('hides the listening transcript until the learner asks or finishes the questions', async () => {
    const user = userEvent.setup()
    render(<SectionRenderer lessonId="lesson" section={canonical('listening')} />)

    expect(screen.queryByText(/the deploy failed at the migration step/i)).toBeNull()
    expect(screen.getByText('What is the call about?')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /hiện transcript/i }))
    expect(screen.getByText(/the deploy failed at the migration step/i)).toBeTruthy()
    expect(screen.getAllByText(/ana \(host\):/i).length).toBeGreaterThan(0)
  })

  it('reveals the transcript once every question has been answered correctly', async () => {
    const user = userEvent.setup()
    render(<SectionRenderer lessonId="lesson" section={canonical('listening')} />)

    const answers: Array<[string, string]> = [
      ['What is the call about?', 'A failed deploy'],
      ['Where did it fail?', 'At the migration step'],
      ['What blocked it?', 'A table lock']
    ]
    for (const [question, answer] of answers) {
      const fieldset = screen.getByText(question).closest('fieldset') as HTMLElement
      await user.click(within(fieldset).getByLabelText(answer))
      await user.click(within(fieldset).getByRole('button', { name: /kiểm tra/i }))
    }

    expect(screen.getByText(/a lock on the orders table/i)).toBeTruthy()
  })

  it('plays one turn at a time with the voice of the person speaking', async () => {
    const user = userEvent.setup()
    render(<SectionRenderer lessonId="lesson" section={canonical('listening')} />)

    await user.click(screen.getByRole('button', { name: /lượt 2/i }))
    await user.click(screen.getByRole('button', { name: /phát mẫu/i }))

    expect(audio.playModelAudio).toHaveBeenCalledTimes(1)
    expect(audio.playModelAudio.mock.calls[0][0]).toMatchObject({
      kind: 'speech-synthesis', text: 'The deploy failed at the migration step.', locale: 'en-US', voiceHints: ['English US']
    })
  })

  it('offers listening notes that are never stored', async () => {
    const user = userEvent.setup()
    render(<SectionRenderer lessonId="lesson" section={canonical('listening')} />)

    expect(screen.getByText('Note who owns what.')).toBeTruthy()
    const owner = screen.getByLabelText('Owner')
    await user.type(owner, 'Ana owns the fix')

    expect(JSON.stringify(useAppStore.getState().lessonProgress)).not.toContain('Ana owns the fix')
  })
})
