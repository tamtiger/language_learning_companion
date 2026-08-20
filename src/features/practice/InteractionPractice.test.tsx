import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InteractionPractice } from './InteractionPractice'

describe('InteractionPractice', () => {
  it('renders an interruption turn as a scripted interaction', () => {
    render(<InteractionPractice turns={[{
      id: 'interrupt-1', kind: 'interruption', prompt: 'What is the priority?', expectedFunction: 'answer briefly'
    }]} onComplete={vi.fn()} />)

    expect(screen.getByText(/interaction · interruption/i)).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'What is the priority?' })).toBeTruthy()
  })

  it('requires a fresh response to a scripted repair turn', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<InteractionPractice turns={[{
      id: 'repair-1', kind: 'repair', prompt: 'Could you rephrase that?', expectedFunction: 'repair the explanation'
    }]} onComplete={onComplete} />)
    expect((screen.getByRole('button', { name: /hoàn thành interaction/i }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: /timer-only/i }))
    await waitFor(() => expect((screen.getByRole('button', { name: /tôi đã nói xong/i }) as HTMLButtonElement).disabled).toBe(false), { timeout: 1_500 })
    await user.click(screen.getByRole('button', { name: /tôi đã nói xong/i }))
    await user.click(screen.getByRole('button', { name: /hoàn thành interaction/i }))
    expect(onComplete).toHaveBeenCalledWith(['repair-1'])
  })
})
