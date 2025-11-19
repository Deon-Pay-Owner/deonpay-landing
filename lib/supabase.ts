import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export type Database = {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          status: string
          onboarding_stage: string
          country: string
          currency: string
          channel: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          status?: string
          onboarding_stage?: string
          country?: string
          currency?: string
          channel?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          name?: string
          status?: string
          onboarding_stage?: string
          country?: string
          currency?: string
          channel?: string
          created_at?: string
          updated_at?: string
        }
      }
      users_profile: {
        Row: {
          user_id: string
          full_name: string
          phone: string
          profile_type: string
          default_merchant_id: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          full_name: string
          phone: string
          profile_type: string
          default_merchant_id?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string
          phone?: string
          profile_type?: string
          default_merchant_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                domain: process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx',
                secure: true,
                httpOnly: true,
                sameSite: 'lax',
              })
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase client for API routes that properly sets cookies on the NextResponse
 * This is required because cookies() from next/headers doesn't work in API routes
 */
export function createApiClient(request: NextRequest, response: NextResponse) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const cookieOptions = {
              ...options,
              domain: process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx',
              secure: true,
              httpOnly: true,
              sameSite: 'lax' as const,
            }

            // Set cookie on the request (for reading in this request)
            request.cookies.set(name, value)

            // Set cookie on the response (for sending to client)
            response.cookies.set(name, value, cookieOptions)
          })
        },
      },
    }
  )
}

export type SupabaseClient = ReturnType<typeof createClient>
