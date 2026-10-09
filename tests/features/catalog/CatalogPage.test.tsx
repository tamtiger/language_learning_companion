import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildCatalog } from '@/content/catalog'
import { useAppStore } from '@/shared/hooks/useAppStore'
import { validWrittenMission } from '../../helpers/lessonFixtures'
import { CatalogPage } from '@/features/catalog/CatalogPage'

describe('CatalogPage learning feature discovery', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('labels every spoken learning loop with learner-facing features', () => {
    render(<CatalogPage onStartLesson={() => undefined} />)

    const learningLoopCount = useAppStore.getState().lessons.filter((lesson) =>
      lesson.performanceTask?.mode === 'spoken' && lesson.performanceTask.learningLoop
    ).length
    expect(screen.getAllByText('Sentence chunks')).toHaveLength(learningLoopCount)
    expect(screen.getAllByText('Luyện phát âm')).toHaveLength(learningLoopCount)
    expect(screen.queryByText(/P0 pilot/i)).toBeNull()

    const spokenLesson = screen.getByRole('button', { name: /Disagree and recap/i })
    expect(within(spokenLesson).getByText('Sentence chunks')).toBeTruthy()
    expect(within(spokenLesson).getByText('Luyện phát âm')).toBeTruthy()

    const writtenLesson = screen.getByRole('button', { name: /turn technical documentation into actions/i })
    expect(within(writtenLesson).queryByText('Sentence chunks')).toBeNull()
    expect(within(writtenLesson).queryByText('Luyện phát âm')).toBeNull()
  })

  it('explains an empty filter combination and clears both filters', async () => {
    const user = userEvent.setup()
    render(<CatalogPage onStartLesson={() => undefined} />)

    await user.selectOptions(screen.getByLabelText('Capability'), 'international-interview')
    await user.selectOptions(screen.getByLabelText('CEFR'), 'B1')
    expect(screen.getByRole('status').textContent).toMatch(/không có bài học phù hợp/i)

    await user.click(screen.getByRole('button', { name: /xóa bộ lọc/i }))
    expect((screen.getByLabelText('Capability') as HTMLSelectElement).value).toBe('all')
    expect((screen.getByLabelText('CEFR') as HTMLSelectElement).value).toBe('all')
    expect(screen.queryByRole('status')).toBeNull()
    expect(screen.getByRole('button', { name: /write an evidence-safe incident update/i })).toBeTruthy()
  })

  it('lists A2 as a level and filters to the A2 lessons', async () => {
    const user = userEvent.setup()
    const raw = structuredClone(validWrittenMission) as Record<string, any>
    raw.lessonId = 'a2-entry-update'
    raw.title = 'A2 entry: say what is wrong'
    raw.cefrLevel = 'A2'
    raw.performanceTask.rubric = [
      { id: 'task', label: 'Task', description: 'Does what was asked.', dimension: 'task', anchors: { met: 'Says the problem.', notMet: 'No problem named.' } },
      { id: 'accuracy', label: 'Accuracy', description: 'Basic grammar.', dimension: 'accuracy', anchors: { met: 'Mostly correct.', notMet: 'Errors hide meaning.' } },
      { id: 'range', label: 'Range', description: 'Varied words.', dimension: 'range', anchors: { met: 'Uses chunks.', notMet: 'Repeats words.' } }
    ]
    const a2 = buildCatalog([['a2.json', raw]]).lessons[0]
    useAppStore.setState({ lessons: [...useAppStore.getState().lessons, a2] })
    render(<CatalogPage onStartLesson={() => undefined} />)

    expect(within(screen.getByLabelText(/^cefr/i)).getByRole('option', { name: 'A2' })).toBeTruthy()
    await user.selectOptions(screen.getByLabelText(/^cefr/i), 'A2')

    expect(screen.getByRole('button', { name: /A2 entry: say what is wrong/i })).toBeTruthy()
    expect(screen.queryByRole('button', { name: /turn technical documentation into actions/i })).toBeNull()
  })})
