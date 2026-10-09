import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from '@/app/ErrorBoundary'

function Boom(): never {
  throw new Error('render failed')
}

describe('ErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks())

  it('renders children when nothing fails', () => {
    render(<ErrorBoundary onReset={() => undefined}><p>ổn</p></ErrorBoundary>)
    expect(screen.getByText('ổn')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('shows an alert with ways out instead of a blank page', async () => {
    const user = userEvent.setup()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const onReset = vi.fn()
    render(<ErrorBoundary onReset={onReset}><Boom /></ErrorBoundary>)

    const alert = screen.getByRole('alert')
    expect(alert.textContent).toMatch(/đã lưu/i)
    expect(screen.getByRole('button', { name: /tải lại/i })).toBeTruthy()
    await user.click(screen.getByRole('button', { name: /về trang today/i }))
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalled()
  })

  it('shows the children again after reset', async () => {
    const user = userEvent.setup()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    let broken = true
    function Maybe() {
      if (broken) throw new Error('first render fails')
      return <p>đã phục hồi</p>
    }
    render(<ErrorBoundary onReset={() => { broken = false }}><Maybe /></ErrorBoundary>)

    await user.click(screen.getByRole('button', { name: /về trang today/i }))
    expect(screen.getByText('đã phục hồi')).toBeTruthy()
  })
})
