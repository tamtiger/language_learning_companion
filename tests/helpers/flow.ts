import { screen } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'

/** Locks a written draft when the phase asks for it, then marks every rubric criterion as met. */
export async function rateAllMet(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  const lock = screen.queryByRole('button', { name: /chốt bản nháp/i })
  if (lock) await user.click(lock)
  for (const button of screen.getAllByRole('button', { name: 'Đạt' })) await user.click(button)
}
