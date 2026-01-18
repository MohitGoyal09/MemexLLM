import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-access-token',
          user: { id: 'mock-user-id', email: 'test@example.com' },
        },
      },
      error: null,
    }),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}

// Mock for @/lib/supabase/client
export const createMockSupabaseClient = () => mockSupabaseClient

// Mock API responses
export const mockApiResponses = {
  notebooks: [
    {
      id: '1',
      title: 'Test Notebook 1',
      category: 'AI Research',
      date: '2024-01-15',
      sources: 5,
      isPublic: false,
    },
    {
      id: '2',
      title: 'Test Notebook 2',
      category: 'Web Development',
      date: '2024-01-14',
      sources: 3,
      isPublic: true,
    },
  ],
  user: {
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
}

// Create mock fetch response
export function createMockFetchResponse<T>(
  data: T,
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers(headers),
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    clone: jest.fn().mockReturnThis(),
  } as unknown as Response
}

// Create mock rate limit headers
export function createRateLimitHeaders(
  limit: number = 100,
  remaining: number = 99,
  reset: number = Math.floor(Date.now() / 1000) + 3600,
  retryAfter?: number
): Record<string, string> {
  const headers: Record<string, string> = {
    'x-ratelimit-limit': String(limit),
    'x-ratelimit-remaining': String(remaining),
    'x-ratelimit-reset': String(reset),
  }
  if (retryAfter !== undefined) {
    headers['retry-after'] = String(retryAfter)
  }
  return headers
}

// Providers wrapper for testing
interface ProvidersProps {
  children: React.ReactNode
}

function AllProviders({ children }: ProvidersProps) {
  return <>{children}</>
}

// Custom render function with providers
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { customRender as render }

// Wait for async operations helper
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Mock window.location
export function mockWindowLocation(url: string = 'http://localhost:3000') {
  const location = new URL(url)
  Object.defineProperty(window, 'location', {
    value: {
      href: location.href,
      origin: location.origin,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
    },
    writable: true,
  })
}
