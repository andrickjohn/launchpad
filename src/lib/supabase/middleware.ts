import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Creates a Supabase client for use in middleware
 * This client automatically refreshes the user's session
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // DEVELOPMENT ONLY: Bypass auth if DISABLE_AUTH is true
  if (process.env.DISABLE_AUTH === 'true') {
    // Allow access to all routes without authentication
    // Redirect /login to /prospects
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/prospects', request.url))
    }
    return response
  }

  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables not set!')
    return response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
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

    // Refresh session if expired
    await supabase.auth.getUser()
  } catch (error) {
    // Silently fail - user just won't be authenticated
    console.error('Supabase auth error in middleware:', error)
  }

  return response
}
