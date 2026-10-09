import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import App from '@/app/App'

function relativeLuminance(hex: string): number {
  const channels = hex.slice(1).match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16) / 255)
  if (!channels || channels.length !== 3) throw new Error(`Invalid RGB color: ${hex}`)
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  )
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
}

describe('capability-first app shell', () => {
  it('starts on Today and exposes semantic keyboard navigation', async () => {
    const user = userEvent.setup()
    const scrollTo = vi.fn()
    const focus = vi.spyOn(HTMLElement.prototype, 'focus')
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: scrollTo })
    render(<App />)

    expect(screen.getByRole('navigation', { name: /điều hướng chính/i }).className).toContain('no-scrollbar')
    expect(screen.getByRole('heading', { name: /luyện việc thật hôm nay/i })).toBeTruthy()

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('link', { name: /bỏ qua điều hướng/i }))

    const catalogButton = screen.getByRole('button', { name: /catalog/i })
    catalogButton.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: /thư viện bài học/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /write an evidence-safe incident update/i })).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('main'))
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })

    await user.click(screen.getByRole('button', { name: /tiến bộ/i }))
    expect(screen.getByText(/glossary: cách đọc learning loop/i)).toBeTruthy()
    focus.mockRestore()
  })

  it('keeps axe color contrast enabled and has no detectable accessibility violations', async () => {
    const { container } = render(<App />)
    const result = await axe.run(container)
    expect(result.violations).toEqual([])
    expect(
      [...result.passes, ...result.incomplete].some((item) => item.id === 'color-contrast')
    ).toBe(true)
  })

  it('keeps production text palette pairs at WCAG AA contrast', () => {
    const palettePairs = [
      ['zinc-100 / zinc-950', '#f4f4f5', '#09090b'],
      ['zinc-400 / zinc-950', '#a1a1aa', '#09090b'],
      ['zinc-400 / zinc-900', '#a1a1aa', '#18181b'],
      ['zinc-400 / zinc-800', '#a1a1aa', '#27272a'],
      ['white / purple-700', '#ffffff', '#7e22ce'],
      ['zinc-100 / purple-700', '#f4f4f5', '#7e22ce'],
      ['white / red-700', '#ffffff', '#b91c1c'],
      ['zinc-950 / cyan-500', '#09090b', '#06b6d4'],
      ['zinc-950 / green-500', '#09090b', '#22c55e'],
      ['zinc-950 / amber-400', '#09090b', '#fbbf24']
    ] as const

    for (const [label, foreground, background] of palettePairs) {
      expect(contrastRatio(foreground, background), label).toBeGreaterThanOrEqual(4.5)
    }

    const source = readdirSync('src', { recursive: true, encoding: 'utf8' })
      .filter((path) => path.endsWith('.tsx') && !path.endsWith('.test.tsx'))
      .map((path) => readFileSync(join('src', path), 'utf8'))
      .join('\n')
    expect(source).not.toMatch(/\btext-zinc-500\b/)
    expect(source).not.toMatch(/\bbg-purple-500(?=[\s'"`])/)
    expect(source).not.toMatch(/\bbg-red-600(?=[\s'"`])/)
  })

  it('declares Vietnamese as the document language', () => {
    const html = readFileSync('index.html', 'utf8')
    expect(html).toContain('<html lang="vi">')
  })
})
