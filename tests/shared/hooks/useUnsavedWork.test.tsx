import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { confirmLeave, useUnsavedWork } from '@/shared/hooks/useUnsavedWork'

function Probe({ active, label }: { active: boolean; label?: string }) {
  useUnsavedWork(active, label)
  return null
}

function fireBeforeUnload(): BeforeUnloadEvent {
  const event = new Event('beforeunload', { cancelable: true }) as BeforeUnloadEvent
  window.dispatchEvent(event)
  return event
}

describe('unsaved work guard', () => {
  afterEach(() => vi.restoreAllMocks())

  it('blocks closing the tab only while something is unsaved', () => {
    const { rerender, unmount } = render(<Probe active />)
    expect(fireBeforeUnload().defaultPrevented).toBe(true)

    rerender(<Probe active={false} />)
    expect(fireBeforeUnload().defaultPrevented).toBe(false)

    rerender(<Probe active />)
    unmount()
    expect(fireBeforeUnload().defaultPrevented).toBe(false)
  })

  it('lets internal navigation through silently when nothing is unsaved', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<Probe active={false} />)

    expect(confirmLeave()).toBe(true)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('asks once in Vietnamese and follows the answer when something is unsaved', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)
    render(<Probe active label="bản nháp đang viết" />)

    expect(confirmLeave()).toBe(false)
    expect(confirmLeave()).toBe(true)
    expect(confirm).toHaveBeenCalledTimes(2)
    expect(confirm.mock.calls[0][0]).toMatch(/bản nháp đang viết/)
    expect(confirm.mock.calls[0][0]).toMatch(/rời/i)
  })

  it('counts several unsaved sources independently', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const first = render(<Probe active />)
    const second = render(<Probe active />)
    first.unmount()

    expect(confirmLeave()).toBe(true)
    expect(confirm).toHaveBeenCalledTimes(1)
    second.unmount()
    expect(confirmLeave()).toBe(true)
    expect(confirm).toHaveBeenCalledTimes(1)
  })
})
