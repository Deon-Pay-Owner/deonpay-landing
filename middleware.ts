import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)

            // Set secure httpOnly cookie for server
            supabaseResponse.cookies.set(name, value, {
              ...options,
              domain: process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx',
              secure: true,
              httpOnly: true,
              sameSite: 'lax',
            })

            // Also set a client-accessible cookie (without httpOnly) for browser client
            supabaseResponse.cookies.set(`${name}-client`, value, {
              ...options,
              domain: process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx',
              secure: true,
              httpOnly: false, // Client can read this
              sameSite: 'lax',
            })
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
