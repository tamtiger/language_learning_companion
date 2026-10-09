import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { TodayPage } from '@/features/today/TodayPage'
import { useAppStore } from '@/shared/hooks/useAppStore'

describe('Today ignores knowledge-only lessons', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('never makes an in-progress pronunciation lesson the mission of the day', () => {
    const lessons = useAppStore.getState().lessons
    const pronunciation = lessons.find((lesson) => !lesson.performanceTask)
    if (!pronunciation) throw new Error('Pronunciation fixture missing')
    useAppStore.setState({
      lessonProgress: {
        [pronunciation.lessonId]: { ...createEmptyLessonProgress(), status: 'in-progress', currentSectionId: 'x' }
      }
    })

    render(<TodayPage onStartLesson={() => undefined} />)

    expect(screen.queryByText(pronunciation.title)).toBeNull()
    expect(screen.getByRole('heading', { name: /nhiệm vụ hôm nay/i })).toBeTruthy()
  })
})
