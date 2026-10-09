import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CanonicalLessonSection, CanonicalReadingLadderV1, LearningLoopV1 } from '../../content/schema'
import { PerceptionPractice } from '../practice/PerceptionPractice'
import { ReadingLadderPractice } from '../practice/ReadingLadderPractice'
import { orderOptions, seededShuffle } from './option_order'
import { SectionRenderer } from './SectionRenderer'

const SALTS = [0.11, 0.23, 0.37, 0.41, 0.53, 0.67, 0.71, 0.83, 0.97, 0.05, 0.29, 0.59]

function withSalt(value: number): void {
  vi.spyOn(Math, 'random').mockReturnValue(value)
}

afterEach(() => vi.restoreAllMocks())

describe('seededShuffle', () => {
  const items = ['a', 'b', 'c', 'd', 'e']

  it('returns the same order for the same seed and never mutates the input', () => {
    const copy = [...items]
    expect(seededShuffle(items, 'seed-1')).toEqual(seededShuffle(items, 'seed-1'))
    expect(items).toEqual(copy)
  })

  it('produces different orders for different seeds and keeps every element once', () => {
    const orders = new Set(Array.from({ length: 20 }, (_, index) => seededShuffle(items, `seed-${index}`).join('')))
    expect(orders.size).toBeGreaterThan(5)
    for (const order of orders) expect(order.split('').sort()).toEqual(items)
  })

  it('handles empty and single element lists', () => {
    expect(seededShuffle([], 'x')).toEqual([])
    expect(seededShuffle(['only'], 'x')).toEqual(['only'])
  })
})

describe('orderOptions', () => {
  it('never returns the order to avoid, even for two elements', () => {
    for (const options of [['first', 'second'], ['first', 'second', 'third'], ['a', 'b', 'c', 'd']]) {
      for (let index = 0; index < 30; index += 1) {
        expect(orderOptions(options, `seed-${index}`, options)).not.toEqual(options)
      }
    }
  })

  it('leaves a single option unchanged', () => {
    expect(orderOptions(['only'], 'seed', ['only'])).toEqual(['only'])
  })
})

function autoCheck(exercise: Extract<CanonicalLessonSection, { type: 'auto-check' }>['exercises'][number]): CanonicalLessonSection {
  return { id: 'check', type: 'auto-check', title: 'Kiểm tra', exercises: [exercise] }
}

function renderSection(section: CanonicalLessonSection) {
  return render(createElement(SectionRenderer, { lessonId: 'lesson', section }))
}

describe('exercise option order', () => {
  it('does not show an ordering exercise in its correct order', () => {
    const correct = ['first', 'second', 'third', 'fourth']
    const shown = new Set<string>()
    for (const salt of SALTS) {
      withSalt(salt)
      const { unmount } = renderSection(autoCheck({
        id: 'order-1', type: 'ordering', question: 'Sắp xếp.', options: [...correct], correctAnswer: correct
      }))
      const order = screen.getAllByRole('button', { name: /^thêm /i }).map((button) => button.textContent)
      expect(order).not.toEqual(correct)
      shown.add(order.join(','))
      unmount()
      vi.restoreAllMocks()
    }
    expect(shown.size).toBeGreaterThan(1)
  })

  it('does not list matching values in pair order', () => {
    const pairs = ['alpha', 'bravo', 'charlie', 'delta'].map((key, index) => ({ key, value: `value-${index}` }))
    const shown = new Set<string>()
    for (const salt of SALTS) {
      withSalt(salt)
      const { unmount } = renderSection(autoCheck({
        id: 'match-1', type: 'matching', question: 'Nối.', matchingPairs: pairs,
        correctAnswer: pairs.map((pair) => `${pair.key} - ${pair.value}`)
      }))
      const select = screen.getByRole('combobox', { name: 'alpha' })
      const values = Array.from(select.querySelectorAll('option')).map((option) => option.textContent).filter((text) => text !== '-- Chọn --')
      expect(values).not.toEqual(pairs.map((pair) => pair.value))
      shown.add(values.join(','))
      unmount()
      vi.restoreAllMocks()
    }
    expect(shown.size).toBeGreaterThan(1)
  })

  it('moves the correct choice option across positions', () => {
    const positions = new Set<number>()
    for (const salt of SALTS) {
      withSalt(salt)
      const { unmount } = renderSection(autoCheck({
        id: 'choice-1', type: 'choice', question: 'Chọn.', options: ['right', 'wrong one', 'wrong two', 'wrong three'], correctAnswer: ['right']
      }))
      positions.add(screen.getAllByRole('radio').findIndex((radio) => (radio as HTMLInputElement).labels?.[0]?.textContent === 'right'))
      unmount()
      vi.restoreAllMocks()
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})

function perception(): LearningLoopV1['perception'] {
  const audio = { kind: 'speech-synthesis' as const, text: 'tests', locale: 'en-US', voiceHints: ['English'] }
  const item = (id: string, feedback?: string) => ({
    id, audio, question: 'What did you hear?', options: ['tests', 'texts', 'text'], correctAnswer: 'tests', ...(feedback ? { feedback } : {})
  })
  return {
    pretest: Array.from({ length: 4 }, (_, index) => item(`pre-${index}`)),
    training: Array.from({ length: 6 }, (_, index) => item(`train-${index}`, 'Listen for final /s/.')),
    posttest: Array.from({ length: 4 }, (_, index) => item(`post-${index}`))
  }
}

describe('perception and reading ladder option order', () => {
  it('moves the correct perception option across positions', () => {
    const positions = new Set<number>()
    for (const salt of SALTS) {
      withSalt(salt)
      const { unmount } = render(createElement(PerceptionPractice, { perception: perception(), onComplete: vi.fn() }))
      const group = screen.getByRole('group')
      const labels = Array.from(group.querySelectorAll('button')).map((button) => button.textContent)
      positions.add(labels.indexOf('tests'))
      unmount()
      vi.restoreAllMocks()
    }
    expect(positions.size).toBeGreaterThan(1)
  })

  it('moves the correct reading ladder option across positions', async () => {
    const ladder: CanonicalReadingLadderV1 = {
      version: 'v1',
      trainingSource: { id: 'source', type: 'source', title: 'Docs', format: 'technical-doc', content: 'Retries need maxAttempts above one.' },
      extractionItems: ['one', 'two', 'three'].map((id) => ({
        id, question: `${id}?`, options: ['right', 'wrong a', 'wrong b'], correctAnswer: 'right', feedback: 'Choose right.'
      })),
      applicationPrompt: 'Explain it.',
      applicationChecklist: ['Fact and hypothesis are separate.']
    }
    const positions = new Set<number>()
    for (const salt of SALTS) {
      withSalt(salt)
      const { unmount } = render(createElement(ReadingLadderPractice, { lessonId: 'docs', ladder, onComplete: vi.fn() }))
      screen.getByRole('button', { name: /bắt đầu trích xuất/i }).click()
      const radios = await screen.findAllByRole('radio')
      const firstGroup = radios.filter((radio) => (radio as HTMLInputElement).name === 'one')
      positions.add(firstGroup.findIndex((radio) => (radio as HTMLInputElement).labels?.[0]?.textContent?.trim() === 'right'))
      unmount()
      vi.restoreAllMocks()
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
