import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { CanonicalLessonSection, CanonicalSourceSection } from '../../content/schema'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { SectionRenderer } from './SectionRenderer'

const section: Extract<CanonicalLessonSection, { type: 'auto-check' }> = {
  id: 'check',
  type: 'auto-check',
  title: 'Kiểm tra phát âm',
  exercises: [{
    id: 'sound-1',
    type: 'choice',
    question: 'Đáp án nào đúng?',
    options: ['Sai', 'Đúng'],
    correctAnswer: ['Đúng'],
    explanation: 'Chọn âm đúng.'
  }]
}

describe('SectionRenderer pronunciation evidence', () => {
  beforeEach(() => useAppStore.getState().resetProgress())
  afterEach(() => vi.unstubAllGlobals())

  it('persists an exercise id only after a correct check', async () => {
    const user = userEvent.setup()
    render(<SectionRenderer lessonId="pronunciation" section={section} />)

    await user.click(screen.getByLabelText('Sai'))
    await user.click(screen.getByRole('button', { name: /kiểm tra/i }))
    expect(useAppStore.getState().lessonProgress.pronunciation).toBeUndefined()

    await user.click(screen.getByLabelText('Đúng'))
    await user.click(screen.getByRole('button', { name: /kiểm tra/i }))
    expect(useAppStore.getState().lessonProgress.pronunciation?.completedExerciseIds).toEqual(['sound-1'])
  })

  it('renders canonical provenance as an accessible learner-facing disclosure', async () => {
    const user = userEvent.setup()
    const trustedSource: CanonicalSourceSection = {
      id: 'standup-source',
      type: 'source',
      title: 'A concise team update',
      format: 'meeting-notes',
      content: 'Yesterday: completed validation. Today: deploy to staging.',
      provenance: {
        origin: 'synthetic',
        sourceIds: ['scrum-guide-2020'],
        adaptationNote: 'Tên, số liệu và tình huống do dự án biên soạn theo quy ước nhóm.'
      },
      resolvedSources: [{
        sourceId: 'scrum-guide-2020',
        kind: 'official-doc',
        title: 'The 2020 Scrum Guide',
        publisher: 'Ken Schwaber and Jeff Sutherland',
        canonicalUrl: 'https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-US.pdf',
        versionOrPublishedAt: 'November 2020',
        accessedAt: '2026-08-27',
        exactLocation: 'Daily Scrum, p. 9',
        licenseIdOrRightsUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        reuseMode: 'reference-only',
        requiredAttribution: 'The Scrum Guide, November 2020, CC BY-SA 4.0.'
      }]
    }

    render(<SectionRenderer lessonId="daily-standup-b1" section={trustedSource} headingLevel={4} />)

    expect(screen.getByText('Ghi chú cuộc họp')).toBeTruthy()
    expect(screen.queryByText('meeting-notes')).toBeNull()
    expect(screen.getByRole('heading', { name: 'A concise team update', level: 4 })).toBeTruthy()
    expect(screen.getByText('Tình huống mô phỏng')).toBeTruthy()
    expect(screen.getByText(trustedSource.provenance?.adaptationNote ?? '')).toBeTruthy()
    const summary = screen.getByText('Nguồn và quyền sử dụng')
    expect(summary.tagName).toBe('SUMMARY')
    await user.click(summary)
    expect((summary.closest('details') as HTMLDetailsElement).open).toBe(true)
    expect(screen.getByText('The 2020 Scrum Guide')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'The 2020 Scrum Guide', level: 5 })).toBeTruthy()
    expect(screen.getByText(/Ken Schwaber and Jeff Sutherland/i)).toBeTruthy()
    expect(screen.getByText('November 2020')).toBeTruthy()
    expect(screen.getByText(/Daily Scrum, p\. 9/i)).toBeTruthy()
    expect(screen.getByText(/27\/08\/2026/i)).toBeTruthy()
    expect(screen.getByText(/Chỉ dùng làm tài liệu tham khảo/i)).toBeTruthy()
    const sourceLink = screen.getByRole('link', { name: /mở nguồn tham khảo.*cần Internet/i })
    expect(sourceLink.getAttribute('href')).toBe(trustedSource.resolvedSources?.[0]?.canonicalUrl)
    expect(sourceLink.getAttribute('target')).toBe('_blank')
    expect(sourceLink.getAttribute('rel')).toContain('noreferrer')
  })

  it('keeps an unannotated legacy source simple without fabricating trust metadata', () => {
    const legacySource: CanonicalSourceSection = {
      id: 'legacy-source', type: 'source', title: 'Legacy reading',
      format: 'prose', content: 'A local lesson reading.'
    }

    render(<SectionRenderer lessonId="legacy" section={legacySource} />)

    expect(screen.getByText('Văn bản')).toBeTruthy()
    expect(screen.queryByText('Nguồn và quyền sử dụng')).toBeNull()
    expect(screen.queryByText('Tình huống mô phỏng')).toBeNull()
  })

  it('uses radios for one choice and checkboxes for multiple choices', () => {
    const choiceSection: Extract<CanonicalLessonSection, { type: 'auto-check' }> = {
      ...section,
      exercises: [
        section.exercises[0],
        {
          id: 'sound-many',
          type: 'choice',
          question: 'Đáp án nào cùng đúng?',
          options: ['Một', 'Hai', 'Ba'],
          correctAnswer: ['Một', 'Ba']
        }
      ]
    }

    render(<SectionRenderer lessonId="pronunciation" section={choiceSection} />)

    expect(screen.getByLabelText('Đúng').getAttribute('type')).toBe('radio')
    expect(screen.getByLabelText('Một').getAttribute('type')).toBe('checkbox')
  })

  it('checks a fill answer through a text input', async () => {
    const user = userEvent.setup()
    const fillSection: Extract<CanonicalLessonSection, { type: 'auto-check' }> = {
      ...section,
      exercises: [{
        id: 'fill-1',
        type: 'fill',
        question: 'A structured set of data is a ___.',
        options: ['database'],
        correctAnswer: ['database']
      }]
    }
    render(<SectionRenderer lessonId="pronunciation" section={fillSection} />)

    const input = screen.getByLabelText(/câu trả lời/i)
    expect(input.getAttribute('type')).toBe('text')
    await user.type(input, 'database')
    await user.click(screen.getByRole('button', { name: /kiểm tra/i }))

    expect(useAppStore.getState().lessonProgress.pronunciation?.completedExerciseIds).toEqual(['fill-1'])
  })

  it('matches every key to a value with labelled selects', async () => {
    const user = userEvent.setup()
    const matchingSection: CanonicalLessonSection = {
      ...section,
      exercises: [{
        id: 'matching-1',
        type: 'matching',
        question: 'Nối từ với nhóm.',
        matchingPairs: [
          { key: 'application', value: 'Content Word' },
          { key: 'should', value: 'Function Word' }
        ],
        correctAnswer: ['application - Content Word', 'should - Function Word']
      }]
    }
    render(<SectionRenderer lessonId="pronunciation" section={matchingSection} />)

    await user.selectOptions(screen.getByRole('combobox', { name: 'application' }), 'Content Word')
    await user.selectOptions(screen.getByRole('combobox', { name: 'should' }), 'Function Word')
    await user.click(screen.getByRole('button', { name: /kiểm tra/i }))

    expect(useAppStore.getState().lessonProgress.pronunciation?.completedExerciseIds).toEqual(['matching-1'])
  })

  it('builds and compares an exact ordering', async () => {
    const user = userEvent.setup()
    const orderingSection: CanonicalLessonSection = {
      ...section,
      exercises: [{
        id: 'ordering-1',
        type: 'ordering',
        question: 'Xây thứ tự đúng.',
        options: ['second', 'first', 'third'],
        correctAnswer: ['first', 'second', 'third']
      }]
    }
    render(<SectionRenderer lessonId="pronunciation" section={orderingSection} />)

    await user.click(screen.getByRole('button', { name: /thêm second/i }))
    await user.click(screen.getByRole('button', { name: /thêm first/i }))
    await user.click(screen.getByRole('button', { name: /thêm third/i }))
    await user.click(screen.getByRole('button', { name: /kiểm tra/i }))
    expect(useAppStore.getState().lessonProgress.pronunciation).toBeUndefined()

    await user.click(screen.getByRole('button', { name: /làm lại thứ tự/i }))
    await user.click(screen.getByRole('button', { name: /thêm first/i }))
    await user.click(screen.getByRole('button', { name: /thêm second/i }))
    await user.click(screen.getByRole('button', { name: /thêm third/i }))
    await user.click(screen.getByRole('button', { name: /kiểm tra/i }))
    expect(useAppStore.getState().lessonProgress.pronunciation?.completedExerciseIds).toEqual(['ordering-1'])
  })

  it('cancels owned speech synthesis when the language section unmounts', async () => {
    const user = userEvent.setup()
    const speak = vi.fn()
    const cancel = vi.fn()
    vi.stubGlobal('SpeechSynthesisUtterance', class {
      text: string
      lang = ''
      onend: null | (() => void) = null
      onerror: null | (() => void) = null
      constructor(text: string) {
        this.text = text
      }
    })
    vi.stubGlobal('speechSynthesis', { speak, cancel })
    const languageSection: CanonicalLessonSection = {
      id: 'language',
      type: 'language-support',
      title: 'Từ vựng',
      vocabulary: [{
        word: 'database',
        ipa: '/ˈdeɪtəbeɪs/',
        definition: 'Structured data.',
        technicalMeaning: 'Kho dữ liệu có cấu trúc.',
        collocations: [],
        example: 'Query the database.',
        commonMistake: 'Keep the final sound.'
      }],
      expressions: []
    }
    const view = render(<SectionRenderer lessonId="pronunciation" section={languageSection} />)

    await user.click(screen.getByRole('button', { name: /phát âm database/i }))
    expect(speak).toHaveBeenCalledOnce()
    view.unmount()
    expect(cancel).toHaveBeenCalledOnce()
  })

  it('renders every authored vocabulary and expression detail', () => {
    const languageSection: CanonicalLessonSection = {
      id: 'language-details',
      type: 'language-support',
      title: 'Language details',
      vocabulary: [{
        word: 'rollback',
        ipa: '/ˈroʊl.bæk/',
        definition: 'A return to an earlier state.',
        technicalMeaning: 'Restore the last known-good release.',
        collocations: ['rollback plan', 'trigger a rollback'],
        example: 'Trigger a rollback if health remains degraded.',
        commonMistake: 'Verify restored health before reopening writes.'
      }],
      expressions: [{
        phrase: 'Could you confirm the target?',
        meaning: 'Yêu cầu xác nhận một tiêu chí đo được.',
        tone: 'neutral',
        example: 'Could you confirm the target latency?',
        alternatives: ['What result should pass?', 'Which threshold should we use?']
      }]
    }

    render(<SectionRenderer lessonId="language-details" section={languageSection} />)

    expect(screen.getByText('A return to an earlier state.')).toBeTruthy()
    expect(screen.getByText('rollback plan')).toBeTruthy()
    expect(screen.getByText('trigger a rollback')).toBeTruthy()
    expect(screen.getByText('Verify restored health before reopening writes.')).toBeTruthy()
    expect(screen.getByText(/neutral/i)).toBeTruthy()
    expect(screen.getByText('What result should pass?')).toBeTruthy()
    expect(screen.getByText('Which threshold should we use?')).toBeTruthy()
  })
})
