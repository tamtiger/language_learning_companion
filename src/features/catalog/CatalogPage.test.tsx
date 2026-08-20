import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../../shared/hooks/use_app_store'
import { CatalogPage } from './CatalogPage'

describe('CatalogPage P0 pilot discovery', () => {
  beforeEach(() => useAppStore.getState().resetProgress())

  it('marks exactly the two selected Understand Retrieve Repair missions', () => {
    render(<CatalogPage onStartLesson={() => undefined} />)

    const badges = screen.getAllByText(/P0 pilot/i)
    expect(badges).toHaveLength(2)
    expect(screen.getByRole('button', { name: /(?=.*P0 pilot)(?=.*Disagree and recap)/i })).toBeTruthy()
    expect(screen.getByRole('button', { name: /(?=.*P0 pilot)(?=.*technical trade-off)/i })).toBeTruthy()
  })
})
