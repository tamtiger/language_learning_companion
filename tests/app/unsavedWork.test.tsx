import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'
import { createEmptyLessonProgress } from '@/domain/progress/progress'
import { useAppStore } from '@/shared/hooks/useAppStore'

const LESSON_ID = 'workplace-issue-update-b1'

function fireBeforeUnload(): BeforeUnloadEvent {
  const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent
  window.dispatchEvent(event)
  return event
}

async function openLessonWithDraft(user: ReturnType<typeof userEvent.setup>, draft: string | null) {
  useAppStore.setState({
    activeLessonId: LESSON_ID,
    lessonProgress: { [LESSON_ID]: { ...createEmptyLessonProgress(), status: 'in-progress', activePhase: 'retry' } }
  })
  render(<App />)
  // The lesson view is lazy-loaded; allow for a cold chunk import on a busy machine.
  const box = await screen.findByRole('textbox', {}, { timeout: 5_000 })
  if (draft) await user.type(box, draft)
}

describe('leaving with unsaved work', () => {
  beforeEach(() => useAppStore.getState().resetProgress())
  afterEach(() => vi.restoreAllMocks())

  it('blocks closing the tab while a draft exists and not otherwise', async () => {
    const user = userEvent.setup()
    await openLessonWithDraft(user, null)
    expect(fireBeforeUnload().defaultPrevented).toBe(false)

    await user.type(screen.getByRole('textbox'), 'My draft.')
    expect(fireBeforeUnload().defaultPrevented).toBe(true)
  })

  it('asks before main navigation and keeps the draft when the learner declines', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await openLessonWithDraft(user, 'Keep this draft.')

    await user.click(screen.getByRole('button', { name: /catalog/i }))

    expect(confirm).toHaveBeenCalledTimes(1)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Keep this draft.')
  })

  it('asks before the back button and leaves when the learner agrees', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    await openLessonWithDraft(user, 'Draft to discard.')

    await user.click(screen.getByRole('button', { name: /quay lại/i }))

    expect(confirm).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('textbox')).toBeNull()
  })

  it('does not ask when nothing is unsaved', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await openLessonWithDraft(user, null)

    await user.click(screen.getByRole('button', { name: /catalog/i }))

    expect(confirm).not.toHaveBeenCalled()
    expect(await screen.findByRole('heading', { name: /thư viện bài học/i }, { timeout: 5_000 })).toBeTruthy()
  })
})
