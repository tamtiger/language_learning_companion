import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { CapabilityTask } from '@/features/practice/CapabilityTask'
import { useAppStore } from '@/shared/hooks/useAppStore'

const found = getBundledCatalog().lessons.find((item) => item.lessonId === 'workplace-ask-for-help-a2')
if (!found?.performanceTask) throw new Error('Fixture lesson missing')
const lesson = found
const task = found.performanceTask

const sectionTitle = (type: string) => {
  const section = lesson.sections.find((item) => item.type === type)
  if (!section || !('title' in section)) throw new Error('Missing section ' + type)
  return section.title
}

function inputPhase(extra: Partial<ReturnType<typeof createEmptyLessonProgress>> = {}) {
  useAppStore.setState({
    lessonProgress: {
      [lesson.lessonId]: { ...createEmptyLessonProgress(), status: 'in-progress', activePhase: 'input', attemptCount: 1, ...extra }
    }
  })
}

describe('input one section at a time', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('shows only the first section at first, with a position indicator', () => {
    inputPhase()
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByText(new RegExp('Phần 1/' + lesson.sections.length))).toBeTruthy()
    expect(screen.getByRole('heading', { name: sectionTitle('source') })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: sectionTitle('language-support') })).toBeNull()
  })

  it('moves forward and back and saves the section so the learner can return', async () => {
    const user = userEvent.setup()
    inputPhase()
    const { unmount } = render(<CapabilityTask lesson={lesson} task={task} />)

    await user.click(screen.getByRole('button', { name: /phần tiếp theo/i }))
    expect(screen.getByRole('heading', { name: sectionTitle('language-support') })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: sectionTitle('source') })).toBeNull()
    const secondId = lesson.sections[1].id
    expect(useAppStore.getState().lessonProgress[lesson.lessonId].currentSectionId).toBe(secondId)

    unmount()
    render(<CapabilityTask lesson={lesson} task={task} />)
    expect(screen.getByText(new RegExp('Phần 2/' + lesson.sections.length))).toBeTruthy()

    await user.click(screen.getByRole('button', { name: /phần trước/i }))
    expect(screen.getByRole('heading', { name: sectionTitle('source') })).toBeTruthy()
  })

  it('disables the previous button on the first section and the next button on the last', async () => {
    const user = userEvent.setup()
    inputPhase()
    render(<CapabilityTask lesson={lesson} task={task} />)

    expect(screen.getByRole('button', { name: /phần trước/i }).getAttribute('aria-disabled')).toBe('true')
    for (let index = 1; index < lesson.sections.length; index += 1) {
      await user.click(screen.getByRole('button', { name: /phần tiếp theo/i }))
    }
    expect(screen.getByRole('button', { name: /phần tiếp theo/i }).getAttribute('aria-disabled')).toBe('true')
  })
})

describe('output contract after the first view', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('is open on the first attempt', () => {
    useAppStore.setState({ lessonProgress: {} })
    render(<CapabilityTask lesson={lesson} task={task} />)

    const contract = screen.getByRole('group', { name: /hợp đồng đầu ra/i })
    expect(contract.hasAttribute('open')).toBe(true)
  })

  it('is collapsed once the learner has made an attempt, but can still be opened', async () => {
    const user = userEvent.setup()
    inputPhase()
    render(<CapabilityTask lesson={lesson} task={task} />)

    const contract = screen.getByRole('group', { name: /hợp đồng đầu ra/i })
    expect(contract.hasAttribute('open')).toBe(false)
    await user.click(screen.getByText(/hợp đồng đầu ra/i, { selector: 'summary' }))
    expect(contract.hasAttribute('open')).toBe(true)
  })
})
