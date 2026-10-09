import { afterEach, describe, expect, it, vi } from 'vitest'
import { registerServiceWorker } from '@/app/registerServiceWorker'

describe('registerServiceWorker', () => {
  afterEach(() => vi.restoreAllMocks())

  it('does nothing outside production', async () => {
    const register = vi.fn()
    await registerServiceWorker({ serviceWorker: { register } }, false)
    expect(register).not.toHaveBeenCalled()
  })

  it('does nothing when the browser has no service worker support', async () => {
    await expect(registerServiceWorker({}, true)).resolves.toBeUndefined()
  })

  it('registers the worker at the site root in production', async () => {
    const register = vi.fn().mockResolvedValue({})
    await registerServiceWorker({ serviceWorker: { register } }, true)
    expect(register).toHaveBeenCalledWith('/sw.js')
  })

  it('never breaks the app when registration fails and logs once', async () => {
    const register = vi.fn().mockRejectedValue(new Error('blocked'))
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    await expect(registerServiceWorker({ serviceWorker: { register } }, true)).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(1)
  })
})
