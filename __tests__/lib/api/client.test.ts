/**
 * Tests for API client
 */

import { ApiError, RateLimitError } from '@/lib/api/client'
import {
  createMockFetchResponse,
  createRateLimitHeaders,
  mockSupabaseClient,
} from '../../utils/test-utils'

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

// Mock auth-logger
jest.mock('@/lib/auth-logger', () => ({
  authLogger: {
    logUnauthorizedAccess: jest.fn(),
    logForbiddenAccess: jest.fn(),
  },
}))

// Store original fetch
const originalFetch = global.fetch

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset fetch mock
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  describe('ApiError', () => {
    it('should create an ApiError with status and detail', () => {
      const error = new ApiError(404, 'Not found')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(ApiError)
      expect(error.status).toBe(404)
      expect(error.detail).toBe('Not found')
      expect(error.message).toBe('Not found')
      expect(error.name).toBe('ApiError')
    })

    it('should include rate limit status when provided', () => {
      const rateLimitStatus = {
        canMakeRequest: false,
        remaining: 0,
        usagePercentage: 100,
        secondsUntilReset: 60,
        isRateLimited: true,
        retryAfterSeconds: 60,
      }

      const error = new ApiError(429, 'Rate limited', rateLimitStatus)

      expect(error.rateLimitStatus).toEqual(rateLimitStatus)
    })
  })

  describe('RateLimitError', () => {
    it('should create a RateLimitError with retry information', () => {
      const rateLimitStatus = {
        canMakeRequest: false,
        remaining: 0,
        usagePercentage: 100,
        secondsUntilReset: 60,
        isRateLimited: true,
        retryAfterSeconds: 30,
      }

      const error = new RateLimitError(30, rateLimitStatus)

      expect(error).toBeInstanceOf(ApiError)
      expect(error).toBeInstanceOf(RateLimitError)
      expect(error.status).toBe(429)
      expect(error.retryAfterSeconds).toBe(30)
      expect(error.rateLimitStatus).toEqual(rateLimitStatus)
      expect(error.name).toBe('RateLimitError')
    })

    it('should use default message when none provided', () => {
      const rateLimitStatus = {
        canMakeRequest: false,
        remaining: 0,
        usagePercentage: 100,
        secondsUntilReset: 60,
        isRateLimited: true,
        retryAfterSeconds: null,
      }

      const error = new RateLimitError(null, rateLimitStatus)

      expect(error.detail).toBe('Too many requests. Please try again later.')
    })

    it('should accept custom message', () => {
      const rateLimitStatus = {
        canMakeRequest: false,
        remaining: 0,
        usagePercentage: 100,
        secondsUntilReset: 60,
        isRateLimited: true,
        retryAfterSeconds: 30,
      }

      const error = new RateLimitError(30, rateLimitStatus, 'Custom rate limit message')

      expect(error.detail).toBe('Custom rate limit message')
    })
  })

  describe('getAuthHeaders', () => {
    it('should throw ApiError when not authenticated', async () => {
      // Mock no session
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      // Import after mocking
      const { apiClient } = await import('@/lib/api/client')

      await expect(apiClient('/test')).rejects.toThrow(ApiError)
      await expect(apiClient('/test')).rejects.toMatchObject({
        status: 401,
        detail: 'Not authenticated',
      })
    })

    it('should include Authorization header when authenticated', async () => {
      // Reset mock to return valid session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token-123',
            user: { id: 'user-1' },
          },
        },
        error: null,
      })

      const mockResponse = createMockFetchResponse({ data: 'success' })
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      // Import after mocking
      const { apiClient } = await import('@/lib/api/client')

      await apiClient('/test')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
            'Content-Type': 'application/json',
          }),
        })
      )
    })
  })

  describe('Error handling', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
            user: { id: 'user-1' },
          },
        },
        error: null,
      })
    })

    it('should throw ApiError on non-OK response', async () => {
      const mockResponse = createMockFetchResponse(
        { detail: 'Resource not found' },
        404
      )
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const { apiClient } = await import('@/lib/api/client')

      await expect(apiClient('/test')).rejects.toMatchObject({
        status: 404,
        detail: 'Resource not found',
      })
    })

    it('should handle timeout errors', async () => {
      const abortError = new Error('Aborted')
      abortError.name = 'AbortError'
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(abortError)

      const { apiClient } = await import('@/lib/api/client')

      await expect(apiClient('/test', {}, 100)).rejects.toMatchObject({
        status: 408,
        detail: 'Request timeout',
      })
    })

    it('should handle 204 No Content responses', async () => {
      const mockResponse = createMockFetchResponse(null, 204)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce(mockResponse)

      const { apiClient } = await import('@/lib/api/client')

      const result = await apiClient('/test')

      expect(result).toBeUndefined()
    })
  })

  describe('Rate limiting behavior', () => {
    beforeEach(() => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
            user: { id: 'user-1' },
          },
        },
        error: null,
      })
    })

    it('should throw RateLimitError on 429 response when retries exhausted', async () => {
      const headers = createRateLimitHeaders(100, 0, Date.now() / 1000 + 60, 30)
      const mockResponse = createMockFetchResponse(
        { detail: 'Rate limit exceeded' },
        429,
        headers
      )
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const { apiClient } = await import('@/lib/api/client')

      await expect(
        apiClient('/test', { maxRetries: 0, retryOnRateLimit: false })
      ).rejects.toBeInstanceOf(RateLimitError)
    })
  })
})
