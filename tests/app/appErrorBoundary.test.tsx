import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'

const todayState = vi.hoisted(() => ({ broken: true }))

vi.mock('@/features/today/TodayPage', () => ({
  TodayPage: () => {
    if (todayState.broken) throw new Error('Today failed to render')
    return <h1>Today đã phục hồi</h1>
  }
}))

describe('App error boundary', () => {
  beforeEach(() => { todayState.broken = true })

  it('shows a way out instead of a blank page and recovers on request', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(<App />)

    expect(screen.getByRole('alert').textContent).toMatch(/gặp lỗi/i)
    expect(screen.getByRole('navigation', { name: /điều hướng chính/i })).toBeTruthy()

    todayState.broken = false
    await user.click(screen.getByRole('button', { name: /về trang today/i }))
    expect(screen.getByRole('heading', { name: /today đã phục hồi/i })).toBeTruthy()
  })
})
