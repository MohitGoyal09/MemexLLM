import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Initialize Response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Setup Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies (for Server Components)
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          
          // Update response cookies (for Browser)
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Refresh Session
  // IMPORTANT: getUser() validates the token against Supabase Auth. 
  // getClaims() does not, which causes stale sessions.
  const { data: { user } } = await supabase.auth.getUser()

  // 4. Define Route Rules
  const url = request.nextUrl.clone()
  const path = url.pathname

  // Add your protected routes here
  const protectedPaths = ['/home', '/notebook'] 
  const isProtected = protectedPaths.some(p => path.startsWith(p))
  
  // Add your auth routes here
  const authPaths = ['/auth/login', '/auth/sign-up']
  const isAuthPage = authPaths.some(p => path.startsWith(p))

  // 5. Handle Redirects (With Cookie Preservation)
  
  // Logic: Unauthenticated User -> Login
  if (!user && isProtected) {
    url.pathname = '/auth/login'
    const redirectResponse = NextResponse.redirect(url)
    copyCookies(response, redirectResponse) // <--- FIX FOR PKCE ERROR
    return redirectResponse
  }

  // Logic: Authenticated User -> Home
  if (user && isAuthPage) {
    url.pathname = '/home'
    const redirectResponse = NextResponse.redirect(url)
    copyCookies(response, redirectResponse) // <--- FIX FOR PKCE ERROR
    return redirectResponse
  }

  return response
}

// Helper to ensure auth cookies (like PKCE verifier) are passed during redirects
function copyCookies(source: NextResponse, destination: NextResponse) {
  const setCookieHeader = source.headers.get('set-cookie')
  if (setCookieHeader) {
    destination.headers.set('set-cookie', setCookieHeader)
  }
}
