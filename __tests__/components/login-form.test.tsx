/**
 * Tests for LoginForm component
 */

import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/login-form'
import {
  render,
  mockSupabaseClient,
  mockWindowLocation,
} from '../utils/test-utils'

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

// Mock auth-logger
jest.mock('@/lib/auth-logger', () => ({
  authLogger: {
    logLoginAttempt: jest.fn(),
    logLoginSuccess: jest.fn(),
    logLoginFailure: jest.fn(),
    logOAuthStarted: jest.fn(),
    logOAuthFailed: jest.fn(),
  },
}))

// Mock next/navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
  }),
  usePathname: () => '/login',
  useSearchParams: () => new URLSearchParams(),
}))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockWindowLocation('http://localhost:3000/login')
  })

  describe('Rendering', () => {
    it('should render the login form correctly', () => {
      render(<LoginForm />)

      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument()
    })

    it('should render Google sign-in button', () => {
      render(<LoginForm />)

      expect(
        screen.getByRole('button', { name: /sign in with google/i })
      ).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      render(<LoginForm />)

      expect(
        screen.getByRole('link', { name: /forgot your password/i })
      ).toHaveAttribute('href', '/auth/forgot-password')
    })

    it('should render sign up link', () => {
      render(<LoginForm />)

      expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
        'href',
        '/auth/sign-up'
      )
    })

    it('should apply custom className', () => {
      const { container } = render(<LoginForm className="custom-class" />)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Form submission', () => {
    it('should call signInWithPassword on form submit', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /^login$/i })

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('should normalize email to lowercase', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'user-1' } },
        error: null,
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /^login$/i })

      await userEvent.type(emailInput, '  TEST@EXAMPLE.COM  ')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
      })
    })

    it('should redirect to /home on successful login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'user-1', email: 'test@example.com' } },
        error: null,
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /^login$/i })

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/home')
      })
    })

    it('should display error message on login failure', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      })

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /^login$/i })

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      let resolveLogin: (value: unknown) => void
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve
      })

      mockSupabaseClient.auth.signInWithPassword.mockReturnValueOnce(loginPromise)

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /^login$/i })

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()

      // Resolve the promise
      resolveLogin!({ data: { user: { id: '1' } }, error: null })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /^login$/i })).not.toBeDisabled()
      })
    })
  })

  describe('Google OAuth', () => {
    it('should call signInWithOAuth when Google button is clicked', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValueOnce({
        error: null,
      })

      render(<LoginForm />)

      const googleButton = screen.getByRole('button', {
        name: /sign in with google/i,
      })
      await userEvent.click(googleButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })

    it('should display error on OAuth failure', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValueOnce({
        error: { message: 'OAuth failed' },
      })

      render(<LoginForm />)

      const googleButton = screen.getByRole('button', {
        name: /sign in with google/i,
      })
      await userEvent.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText(/oauth failed/i)).toBeInTheDocument()
      })
    })

    it('should show loading state during OAuth redirect', async () => {
      let resolveOAuth: (value: unknown) => void
      const oauthPromise = new Promise(resolve => {
        resolveOAuth = resolve
      })

      mockSupabaseClient.auth.signInWithOAuth.mockReturnValueOnce(oauthPromise)

      render(<LoginForm />)

      const googleButton = screen.getByRole('button', {
        name: /sign in with google/i,
      })
      await userEvent.click(googleButton)

      expect(screen.getByRole('button', { name: /redirecting/i })).toBeDisabled()

      // Resolve to clean up
      resolveOAuth!({ error: null })
    })
  })

  describe('Form validation', () => {
    it('should require email field', () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toBeRequired()
    })

    it('should require password field', () => {
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toBeRequired()
    })

    it('should have email input type', () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/email/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have password input type', () => {
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText(/password/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })
})
