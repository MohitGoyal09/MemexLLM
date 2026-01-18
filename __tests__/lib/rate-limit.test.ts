/**
 * Tests for rate-limit module
 */

import {
  parseRateLimitHeaders,
  updateRateLimitState,
  clearRateLimitedState,
  getRateLimitStatus,
  calculateBackoffDelay,
  sleep,
  subscribeToRateLimitChanges,
  resetRateLimitState,
  getRawRateLimitState,
} from '@/lib/api/rate-limit'
import { createRateLimitHeaders, createMockFetchResponse } from '../utils/test-utils'

describe('Rate Limit Module', () => {
  beforeEach(() => {
    // Reset state before each test
    resetRateLimitState()
  })

  describe('parseRateLimitHeaders', () => {
    it('should parse all rate limit headers correctly', () => {
      const headers = createRateLimitHeaders(100, 50, 1704067200, 30)
      const response = createMockFetchResponse({}, 200, headers)

      const parsed = parseRateLimitHeaders(response)

      expect(parsed.limit).toBe(100)
      expect(parsed.remaining).toBe(50)
      expect(parsed.resetTimestamp).toBe(1704067200)
      expect(parsed.retryAfterSeconds).toBe(30)
    })

    it('should return empty object when no headers present', () => {
      const response = createMockFetchResponse({}, 200, {})

      const parsed = parseRateLimitHeaders(response)

      expect(parsed).toEqual({})
    })

    it('should handle partial headers', () => {
      const response = createMockFetchResponse({}, 200, {
        'x-ratelimit-limit': '100',
        'x-ratelimit-remaining': '75',
      })

      const parsed = parseRateLimitHeaders(response)

      expect(parsed.limit).toBe(100)
      expect(parsed.remaining).toBe(75)
      expect(parsed.resetTimestamp).toBeUndefined()
      expect(parsed.retryAfterSeconds).toBeUndefined()
    })

    it('should handle invalid header values gracefully', () => {
      const response = createMockFetchResponse({}, 200, {
        'x-ratelimit-limit': 'invalid',
        'x-ratelimit-remaining': 'not-a-number',
      })

      const parsed = parseRateLimitHeaders(response)

      expect(parsed.limit).toBeUndefined()
      expect(parsed.remaining).toBeUndefined()
    })
  })

  describe('updateRateLimitState', () => {
    it('should update state from response headers', () => {
      const headers = createRateLimitHeaders(100, 50, 1704067200)
      const response = createMockFetchResponse({}, 200, headers)

      updateRateLimitState(response)

      const state = getRawRateLimitState()
      expect(state.limit).toBe(100)
      expect(state.remaining).toBe(50)
      expect(state.resetTimestamp).toBe(1704067200)
      expect(state.isRateLimited).toBe(false)
    })

    it('should set isRateLimited flag when specified', () => {
      const headers = createRateLimitHeaders(100, 0, 1704067200, 60)
      const response = createMockFetchResponse({}, 429, headers)

      updateRateLimitState(response, true)

      const state = getRawRateLimitState()
      expect(state.isRateLimited).toBe(true)
      expect(state.retryAfterSeconds).toBe(60)
    })

    it('should preserve existing values when headers missing', () => {
      // First set initial state
      const initialHeaders = createRateLimitHeaders(100, 75, 1704067200)
      const initialResponse = createMockFetchResponse({}, 200, initialHeaders)
      updateRateLimitState(initialResponse)

      // Then update with partial headers
      const partialResponse = createMockFetchResponse({}, 200, {
        'x-ratelimit-remaining': '50',
      })
      updateRateLimitState(partialResponse)

      const state = getRawRateLimitState()
      expect(state.limit).toBe(100) // preserved
      expect(state.remaining).toBe(50) // updated
      expect(state.resetTimestamp).toBe(1704067200) // preserved
    })
  })

  describe('clearRateLimitedState', () => {
    it('should clear the rate limited flag', () => {
      const headers = createRateLimitHeaders(100, 0, 1704067200, 60)
      const response = createMockFetchResponse({}, 429, headers)
      updateRateLimitState(response, true)

      expect(getRawRateLimitState().isRateLimited).toBe(true)

      clearRateLimitedState()

      expect(getRawRateLimitState().isRateLimited).toBe(false)
      expect(getRawRateLimitState().retryAfterSeconds).toBeNull()
    })
  })

  describe('getRateLimitStatus', () => {
    it('should return canMakeRequest true when not rate limited', () => {
      const headers = createRateLimitHeaders(100, 50, Date.now() / 1000 + 3600)
      const response = createMockFetchResponse({}, 200, headers)
      updateRateLimitState(response)

      const status = getRateLimitStatus()

      expect(status.canMakeRequest).toBe(true)
      expect(status.isRateLimited).toBe(false)
      expect(status.remaining).toBe(50)
    })

    it('should return canMakeRequest false when rate limited', () => {
      const headers = createRateLimitHeaders(100, 0, Date.now() / 1000 + 60, 60)
      const response = createMockFetchResponse({}, 429, headers)
      updateRateLimitState(response, true)

      const status = getRateLimitStatus()

      expect(status.canMakeRequest).toBe(false)
      expect(status.isRateLimited).toBe(true)
    })

    it('should calculate usage percentage correctly', () => {
      const headers = createRateLimitHeaders(100, 25, Date.now() / 1000 + 3600)
      const response = createMockFetchResponse({}, 200, headers)
      updateRateLimitState(response)

      const status = getRateLimitStatus()

      expect(status.usagePercentage).toBe(75) // 75% used
    })

    it('should calculate seconds until reset', () => {
      const futureReset = Math.floor(Date.now() / 1000) + 300 // 5 minutes
      const headers = createRateLimitHeaders(100, 50, futureReset)
      const response = createMockFetchResponse({}, 200, headers)
      updateRateLimitState(response)

      const status = getRateLimitStatus()

      expect(status.secondsUntilReset).toBeGreaterThan(290)
      expect(status.secondsUntilReset).toBeLessThanOrEqual(300)
    })

    it('should reset when window has passed', () => {
      const pastReset = Math.floor(Date.now() / 1000) - 60 // 1 minute ago
      const headers = createRateLimitHeaders(100, 0, pastReset, 60)
      const response = createMockFetchResponse({}, 429, headers)
      updateRateLimitState(response, true)

      const status = getRateLimitStatus()

      // Window has reset, so we should be able to make requests
      expect(status.canMakeRequest).toBe(true)
      expect(status.remaining).toBe(100) // Reset to limit
      expect(status.isRateLimited).toBe(false)
    })
  })

  describe('calculateBackoffDelay', () => {
    it('should return Retry-After value when provided', () => {
      const delay = calculateBackoffDelay(0, 1000, 30000, 15)

      // Should be retryAfter * 1000 + 100 buffer
      expect(delay).toBe(15100)
    })

    it('should use exponential backoff when no Retry-After', () => {
      const attempt0 = calculateBackoffDelay(0, 1000, 30000, null)
      const attempt1 = calculateBackoffDelay(1, 1000, 30000, null)
      const attempt2 = calculateBackoffDelay(2, 1000, 30000, null)

      // Base delays: 1000, 2000, 4000 + jitter
      expect(attempt0).toBeGreaterThanOrEqual(1000)
      expect(attempt0).toBeLessThanOrEqual(1300) // +30% max jitter

      expect(attempt1).toBeGreaterThanOrEqual(2000)
      expect(attempt1).toBeLessThanOrEqual(2600)

      expect(attempt2).toBeGreaterThanOrEqual(4000)
      expect(attempt2).toBeLessThanOrEqual(5200)
    })

    it('should cap at maxDelayMs', () => {
      const delay = calculateBackoffDelay(10, 1000, 30000, null)

      expect(delay).toBeLessThanOrEqual(30000)
    })

    it('should cap Retry-After at maxDelayMs', () => {
      const delay = calculateBackoffDelay(0, 1000, 30000, 60) // 60 seconds

      expect(delay).toBe(30000) // Capped at max
    })

    it('should handle undefined Retry-After', () => {
      const delay = calculateBackoffDelay(0, 1000, 30000, undefined)

      expect(delay).toBeGreaterThanOrEqual(1000)
    })

    it('should handle zero Retry-After', () => {
      const delay = calculateBackoffDelay(0, 1000, 30000, 0)

      // Should fall through to exponential backoff
      expect(delay).toBeGreaterThanOrEqual(1000)
    })
  })

  describe('sleep', () => {
    it('should resolve after specified time', async () => {
      const start = Date.now()
      await sleep(50)
      const elapsed = Date.now() - start

      expect(elapsed).toBeGreaterThanOrEqual(45) // Allow small variance
      expect(elapsed).toBeLessThan(100)
    })

    it('should resolve immediately for 0ms', async () => {
      const start = Date.now()
      await sleep(0)
      const elapsed = Date.now() - start

      expect(elapsed).toBeLessThan(10)
    })
  })

  describe('subscribeToRateLimitChanges', () => {
    it('should call listener immediately with current status', () => {
      const listener = jest.fn()

      subscribeToRateLimitChanges(listener)

      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          canMakeRequest: expect.any(Boolean),
          remaining: expect.any(Number),
          usagePercentage: expect.any(Number),
        })
      )
    })

    it('should call listener on state changes', () => {
      const listener = jest.fn()
      subscribeToRateLimitChanges(listener)

      // Reset mock to ignore initial call
      listener.mockClear()

      // Trigger state change
      const headers = createRateLimitHeaders(100, 50, Date.now() / 1000 + 3600)
      const response = createMockFetchResponse({}, 200, headers)
      updateRateLimitState(response)

      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('should return unsubscribe function', () => {
      const listener = jest.fn()
      const unsubscribe = subscribeToRateLimitChanges(listener)

      listener.mockClear()

      unsubscribe()

      // Trigger state change
      const headers = createRateLimitHeaders(100, 50, Date.now() / 1000 + 3600)
      const response = createMockFetchResponse({}, 200, headers)
      updateRateLimitState(response)

      // Listener should not be called after unsubscribe
      expect(listener).not.toHaveBeenCalled()
    })

    it('should handle multiple listeners', () => {
      const listener1 = jest.fn()
      const listener2 = jest.fn()

      subscribeToRateLimitChanges(listener1)
      subscribeToRateLimitChanges(listener2)

      listener1.mockClear()
      listener2.mockClear()

      // Trigger state change
      const headers = createRateLimitHeaders(100, 50, Date.now() / 1000 + 3600)
      const response = createMockFetchResponse({}, 200, headers)
      updateRateLimitState(response)

      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })

  describe('resetRateLimitState', () => {
    it('should reset state to defaults', () => {
      // Set some state first
      const headers = createRateLimitHeaders(100, 0, Date.now() / 1000 + 60, 60)
      const response = createMockFetchResponse({}, 429, headers)
      updateRateLimitState(response, true)

      // Reset
      resetRateLimitState()

      const state = getRawRateLimitState()
      expect(state.limit).toBe(100)
      expect(state.remaining).toBe(100)
      expect(state.resetTimestamp).toBe(0)
      expect(state.isRateLimited).toBe(false)
      expect(state.retryAfterSeconds).toBeNull()
    })

    it('should notify listeners on reset', () => {
      const listener = jest.fn()
      subscribeToRateLimitChanges(listener)
      listener.mockClear()

      resetRateLimitState()

      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('getRawRateLimitState', () => {
    it('should return a copy of the state', () => {
      const headers = createRateLimitHeaders(100, 50, 1704067200)
      const response = createMockFetchResponse({}, 200, headers)
      updateRateLimitState(response)

      const state1 = getRawRateLimitState()
      const state2 = getRawRateLimitState()

      expect(state1).toEqual(state2)
      expect(state1).not.toBe(state2) // Should be different objects
    })
  })
})
