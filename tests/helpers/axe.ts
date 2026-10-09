import axe from 'axe-core'
import { expect } from 'vitest'

/** Runs axe on a rendered container and fails with a readable list of rule ids and targets. */
export async function expectNoViolations(container: HTMLElement, label: string): Promise<void> {
  // Contrast is covered by the palette and App tests; jsdom cannot measure it reliably.
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  const summary = result.violations.map((violation) =>
    `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(' | ')}`
  )
  expect(summary, label).toEqual([])
}
