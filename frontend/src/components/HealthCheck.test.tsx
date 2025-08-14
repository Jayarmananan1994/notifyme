import { render, screen, waitFor } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import HealthCheck from './HealthCheck'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('HealthCheck', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  test('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<HealthCheck />)
    expect(screen.getByText('Checking system health...')).toBeInTheDocument()
  })

  test('renders error state when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    render(<HealthCheck />)
    
    await waitFor(() => {
      expect(screen.getByText(/Health check failed:/)).toBeInTheDocument()
      expect(screen.getByText(/Network error/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('renders healthy status when API returns ok', async () => {
    const mockHealthData = {
      status: 'ok',
      timestamp: '2023-01-01T00:00:00.000Z',
      uptime: 3600,
      environment: 'production'
    }
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealthData)
    })
    
    render(<HealthCheck />)
    
    await waitFor(() => {
      expect(screen.getByText('System Status: OK')).toBeInTheDocument()
      expect(screen.getByText('Environment: production')).toBeInTheDocument()
      expect(screen.getByText('Uptime: 60 minutes')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('renders error status when API returns error', async () => {
    const mockHealthData = {
      status: 'error',
      timestamp: '2023-01-01T00:00:00.000Z',
      uptime: 3600,
      environment: 'production'
    }
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHealthData)
    })
    
    render(<HealthCheck />)
    
    await waitFor(() => {
      expect(screen.getByText('System Status: ERROR')).toBeInTheDocument()
    }, { timeout: 3000 })
  })
})