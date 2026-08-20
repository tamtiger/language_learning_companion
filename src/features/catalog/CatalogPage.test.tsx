import { render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { CatalogPage } from './CatalogPage'

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
})
