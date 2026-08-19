import { beforeEach, describe, expect, it } from 'vitest'
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
})
