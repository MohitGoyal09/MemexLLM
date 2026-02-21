import { Badge } from "@/components/ui/badge"
import { Code, Shield, Key, LogIn, LogOut } from "lucide-react"

export default function AuthenticationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Badge variant="secondary">Security</Badge>
        <h1 className="text-4xl font-bold tracking-tight">Authentication</h1>
        <p className="text-xl text-muted-foreground">
          Complete guide to authentication in NotebookLLM using Supabase Auth with OAuth and session management.
        </p>
      </div>

      {/* Overview */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">
          NotebookLLM uses Supabase Auth for user authentication. The system supports email/password authentication
          and OAuth providers (Google, GitHub). JWT tokens are used for API authorization.
        </p>
      </section>

      {/* Architecture */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Authentication Flow
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">How It Works</h3>
          <div className="p-4 rounded-lg border bg-muted/50">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>User logs in via Supabase Auth (email/password or OAuth)</li>
              <li>Supabase returns JWT access and refresh tokens</li>
              <li>Frontend stores tokens via Supabase client</li>
              <li>API client includes JWT in Authorization header</li>
              <li>Backend validates JWT and extracts user ID</li>
              <li>Session refreshes automatically before expiration</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Supabase Client */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          Supabase Client Setup
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Browser Client</h3>
          <p className="text-sm text-muted-foreground">
            Used in client components for authentication and data fetching.
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Server Client</h3>
          <p className="text-sm text-muted-foreground">
            Used in server components and API routes for authenticated requests.
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}`}</pre>
          </div>
        </div>
      </section>

      {/* Session Management */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Key className="w-6 h-6" />
          Session Management
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Automatic Session Refresh</h3>
          <p className="text-sm text-muted-foreground">
            Sessions are automatically refreshed every 50 minutes to prevent expiration.
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// lib/auth/session-refresh.ts
import { createClient } from "@/lib/supabase/client"

let refreshInterval: ReturnType<typeof setInterval> | null = null

export function startSessionRefresh(): void {
  if (refreshInterval) return

  const REFRESH_INTERVAL_MS = 50 * 60 * 1000 // 50 minutes

  refreshInterval = setInterval(async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.refreshSession()
      if (error) {
        console.warn("Session refresh failed:", error.message)
      }
    } catch {
      // Silently fail — user will be redirected on next action
    }
  }, REFRESH_INTERVAL_MS)
}

export function stopSessionRefresh(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Using Session in Components</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function useSession() {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}`}</pre>
          </div>
        </div>
      </section>

      {/* Auth Logging */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Auth Event Logging</h2>
        <p className="text-muted-foreground">
          Comprehensive logging system for authentication events to monitor security and debug issues.
        </p>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Event Types</h3>
          <div className="p-4 rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Event</th>
                  <th className="text-left py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>LOGIN_SUCCESS</code></td>
                  <td className="py-2">User logged in successfully</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>LOGIN_FAILURE</code></td>
                  <td className="py-2">Login attempt failed</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>LOGOUT</code></td>
                  <td className="py-2">User logged out</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>OAUTH_COMPLETED</code></td>
                  <td className="py-2">OAuth flow completed</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>SESSION_REFRESH</code></td>
                  <td className="py-2">Session refreshed</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4"><code>TOKEN_EXPIRED</code></td>
                  <td className="py-2">JWT token expired</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4"><code>UNAUTHORIZED_ACCESS</code></td>
                  <td className="py-2">401 response received</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Using the Logger</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`import { authLogger } from "@/lib/auth-logger"

// Log successful login
authLogger.logLoginSuccess(userId, email)

// Log failed login
authLogger.logLoginFailure(email, errorMessage)

// Log OAuth flow
authLogger.logOAuthStarted("google", redirectUrl)
authLogger.logOAuthCompleted(userId, "google")

// Log unauthorized access (auto-handled by API client)
authLogger.logUnauthorizedAccess("/api/v1/documents", 401)`}</pre>
          </div>
        </div>
      </section>

      {/* API Authorization */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <LogIn className="w-6 h-6" />
          API Authorization
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">JWT in Requests</h3>
          <p className="text-sm text-muted-foreground">
            The API client automatically includes the JWT token in all requests.
          </p>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// lib/api/client.ts
async function getAuthHeaders(): Promise<HeadersInit> {
  const supabase = createSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw new ApiError(401, "Not authenticated")
  }

  return {
    Authorization: \`Bearer \${session.access_token}\`,
    "Content-Type": "application/json",
  }
}`}</pre>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Error Handling</h3>
          <p className="text-sm text-muted-foreground">
            The API client handles 401/403 errors by redirecting to login.
          </p>
          <div className="p-4 rounded-lg border">
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li><code>401</code> - Unauthorized, redirect to login</li>
              <li><code>403</code> - Forbidden, redirect to login (except task endpoints)</li>
              <li><code>429</code> - Rate limited, auto-retry with backoff</li>
            </ul>
          </div>
        </div>
      </section>

      {/* OAuth Providers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">OAuth Providers</h2>
        <p className="text-muted-foreground">
          Configure OAuth providers in the Supabase dashboard and backend environment.
        </p>

        <div className="p-4 rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Provider</th>
                <th className="text-left py-2">Backend Variable</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4">Google</td>
                <td className="py-2"><code>GOOGLE_CLIENT_ID</code>, <code>GOOGLE_CLIENT_SECRET</code></td>
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4">GitHub</td>
                <td className="py-2">Configured in Supabase</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Email/Password</td>
                <td className="py-2">Built-in with Supabase Auth</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Protected Routes */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <LogOut className="w-6 h-6" />
          Protected Routes
        </h2>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Middleware Protection</h3>
          <div className="p-4 rounded-lg bg-muted font-mono text-sm">
            <pre className="overflow-x-auto">{`// middleware.ts
import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check auth
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && !request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return supabaseResponse
}`}</pre>
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Security Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Token Security</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Tokens stored securely in httpOnly cookies</li>
              <li>Auto-refresh before expiration</li>
              <li>Clear on logout</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">API Security</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>JWT validation on all endpoints</li>
              <li>Rate limiting enabled</li>
              <li>CORS restricted to frontend</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">OAuth Security</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>State parameter for CSRF protection</li>
              <li>Secure redirect URIs</li>
              <li>Token rotation enabled</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Monitoring</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Auth events logged</li>
              <li>Failed attempts tracked</li>
              <li>Session anomalies detected</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Related */}
      <div className="flex gap-4 pt-4">
        <a href="/docs/deployment" className="text-primary hover:underline">
          Next: Deployment →
        </a>
      </div>
    </div>
  )
}
