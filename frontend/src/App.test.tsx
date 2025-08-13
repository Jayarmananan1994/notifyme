import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import App from './App'

describe('App', () => {
  test('renders NotifyMe heading', () => {
    render(<App />)
    expect(screen.getByText('NotifyMe')).toBeInTheDocument()
  })

  test('renders system status section', () => {
    render(<App />)
    expect(screen.getByText('System Status')).toBeInTheDocument()
  })

  test('renders welcome section', () => {
    render(<App />)
    expect(screen.getByText('Welcome to NotifyMe')).toBeInTheDocument()
  })
})