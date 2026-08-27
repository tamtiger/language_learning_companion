import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { LessonSection } from '../../content/schema'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { SectionRenderer } from './SectionRenderer'

const section: LessonSection = {
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

  it('uses radios for one choice and checkboxes for multiple choices', () => {
    const choiceSection: LessonSection = {
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
    const fillSection: LessonSection = {
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
    const matchingSection: LessonSection = {
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
    const orderingSection: LessonSection = {
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
    const languageSection: LessonSection = {
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
})
