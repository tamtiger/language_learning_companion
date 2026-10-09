import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { expectNoViolations } from './axe'

describe('axe helper', () => {
  it('fails on a real accessibility violation so the matrix cannot pass vacuously', async () => {
    const { container } = render(<img src="x.png" />)
    await expect(expectNoViolations(container, 'broken image')).rejects.toThrow(/image-alt/)
  })

  it('passes accessible markup', async () => {
    const { container } = render(<img src="x.png" alt="logo" />)
    await expectNoViolations(container, 'good image')
  })
})
