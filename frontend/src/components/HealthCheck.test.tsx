import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import HealthCheck from './HealthCheck'

describe('HealthCheck', () => {
  test('renders loading state initially', () => {
    render(<HealthCheck />)
    expect(screen.getByText('Checking system health...')).toBeInTheDocument()
  })
})