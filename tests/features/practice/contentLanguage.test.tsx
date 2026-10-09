import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getBundledCatalog } from '@/content/catalog'
import type { LearningLoopV1 } from '@/content/schema'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { CapabilityTask } from '@/features/practice/CapabilityTask'
import { GuidedShadowing } from '@/features/practice/GuidedShadowing'
import { ModelAudioPlayer } from '@/features/practice/ModelAudioPlayer'
import { PerceptionPractice } from '@/features/practice/PerceptionPractice'
import { useAppStore } from '@/shared/hooks/useAppStore'

const audio = { kind: 'speech-synthesis' as const, text: 'The tests passed.', locale: 'en-US', voiceHints: ['English'] }

function perception(): LearningLoopV1['perception'] {
  const item = (id: string) => ({
    id, audio, question: 'What did you hear?', options: ['test', 'tests'], correctAnswer: 'tests', feedback: 'Listen for the final /s/.'
  })
  return {
    pretest: Array.from({ length: 4 }, (_, index) => item(`pre-${index}`)),
    training: Array.from({ length: 6 }, (_, index) => item(`train-${index}`)),
    posttest: Array.from({ length: 4 }, (_, index) => item(`post-${index}`))
  }
}

describe('English content is tagged as English', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('tags the audio transcript', () => {
    render(<ModelAudioPlayer source={audio} transcriptVisible />)
    expect(screen.getByLabelText('Bản chép audio').getAttribute('lang')).toBe('en')
  })

  it('tags the perception question, options and training feedback', async () => {
    const user = userEvent.setup()
    render(<PerceptionPractice perception={perception()} onComplete={vi.fn()} />)

    expect(screen.getByText('What did you hear?').getAttribute('lang')).toBe('en')
    expect(screen.getByRole('button', { name: 'tests' }).getAttribute('lang')).toBe('en')
    await user.click(screen.getByRole('button', { name: 'tests' }))
    expect(screen.getByRole('status', { name: /kết quả câu nghe/i }).textContent).toMatch(/đúng/i)
  })

  it('tags shadowing chunk text', async () => {
    const user = userEvent.setup()
    const chunks: LearningLoopV1['chunks'] = Array.from({ length: 4 }, (_, index) => ({
      id: `chunk-${index}`, function: 'clarify', text: 'Let me clarify ___.', meaning: 'clarify', slots: ['detail'], modelAudio: audio
    }))
    render(<GuidedShadowing chunks={chunks} steps={['listen', 'chunk-shadow']} onComplete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /hoàn thành bước/i }))

    expect(screen.getByText('Let me clarify ___.').closest('p')?.getAttribute('lang')).toBe('en')
  })

  it('tags the learner output and model response during self-feedback', async () => {
    const user = userEvent.setup()
    const lesson = getBundledCatalog().lessons.find((item) => item.lessonId === 'workplace-issue-update-b1')
    const task = lesson?.performanceTask
    if (!lesson || !task) throw new Error('Mission fixture missing')
    useAppStore.setState({
      lessonProgress: { [lesson.lessonId]: { ...createEmptyLessonProgress(), status: 'in-progress', activePhase: 'performance' } }
    })
    render(<CapabilityTask lesson={lesson} task={task} />)

    await user.type(screen.getByRole('textbox'), 'My own update in English.')
    await user.click(screen.getByRole('button', { name: /đối chiếu rubric/i }))

    expect(screen.getByText('My own update in English.').getAttribute('lang')).toBe('en')
    expect(screen.getByText(task.modelResponse).getAttribute('lang')).toBe('en')
  })
})
