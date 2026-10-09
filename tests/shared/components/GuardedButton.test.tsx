import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GuardedButton } from '@/shared/components/GuardedButton'

describe('GuardedButton', () => {
  it('stays focusable, ignores clicks and explains why while blocked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<GuardedButton onClick={onClick} disabledReason="Viết bản nháp trước.">Lưu</GuardedButton>)

    const button = screen.getByRole('button', { name: 'Lưu' })
    expect(button.getAttribute('aria-disabled')).toBe('true')
    expect(button.hasAttribute('disabled')).toBe(false)
    button.focus()
    expect(document.activeElement).toBe(button)

    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
    expect(button.getAttribute('aria-describedby')).toBeTruthy()
    const reason = document.getElementById(button.getAttribute('aria-describedby') as string)
    expect(reason?.textContent).toBe('Viết bản nháp trước.')
  })

  it('behaves like a normal button once the reason is gone', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<GuardedButton onClick={onClick}>Lưu</GuardedButton>)

    const button = screen.getByRole('button', { name: 'Lưu' })
    expect(button.hasAttribute('aria-disabled')).toBe(false)
    expect(button.hasAttribute('aria-describedby')).toBe(false)
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not submit or activate from the keyboard while blocked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<GuardedButton onClick={onClick} disabledReason="Chưa đủ.">Tiếp</GuardedButton>)

    screen.getByRole('button', { name: 'Tiếp' }).focus()
    await user.keyboard('{Enter}')
    await user.keyboard(' ')
    expect(onClick).not.toHaveBeenCalled()
  })
})
