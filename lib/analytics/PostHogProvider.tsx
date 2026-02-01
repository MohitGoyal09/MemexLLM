'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { ReactNode, useEffect } from 'react'

export function PHProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
            capture_pageview: false, // Manually capture in PageView component
            capture_pageleave: true,
            // Enable debug mode in development to see events in console
            loaded: (posthog) => {
                if (process.env.NODE_ENV === 'development') posthog.debug()
            }
        })
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
