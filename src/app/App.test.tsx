import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import App from './App'

describe('capability-first app shell', () => {
  it('starts on Today and exposes semantic keyboard navigation', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo })
    render(<App />)

    expect(screen.getByRole('navigation', { name: /điều hướng chính/i }).className).toContain('no-scrollbar')
    expect(screen.getByRole('heading', { name: /luyện việc thật hôm nay/i })).toBeTruthy()

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('link', { name: /bỏ qua điều hướng/i }))

    const catalogButton = screen.getByRole('button', { name: /catalog/i })
    catalogButton.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: /catalog theo capability/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /write an actionable issue update/i })).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('main'))
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })

    await user.click(screen.getByRole('button', { name: /tiến bộ/i }))
    expect(screen.getByText(/glossary: cách đọc learning loop/i)).toBeTruthy()
  })

  it('has no detectable critical accessibility violations in the initial shell', async () => {
    const { container } = render(<App />)
    const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(result.violations).toEqual([])
  })
})
