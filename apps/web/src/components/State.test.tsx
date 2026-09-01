import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './State'

describe('EmptyState', () => {
  it('renders actionable empty state copy', () => {
    render(<EmptyState title="Заявок не найдено" text="Измените фильтры" />)
    expect(screen.getByText('Заявок не найдено')).toBeInTheDocument()
    expect(screen.getByText('Измените фильтры')).toBeInTheDocument()
  })
})
