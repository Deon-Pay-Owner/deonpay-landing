import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

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

// Client-side Supabase client for use in Client Components
export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Read cookie from document.cookie
          const cookies = document.cookie.split(';')
          for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=')
            if (key === name) {
              return decodeURIComponent(value)
            }
          }
          return null
        },
        set(name: string, value: string, options: any) {
          // Set cookie with domain sharing
          let cookieString = `${name}=${encodeURIComponent(value)}`

          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`
          }
          if (options?.path) {
            cookieString += `; path=${options.path}`
          } else {
            cookieString += '; path=/'
          }

          // Share cookies across subdomains
          cookieString += '; domain=.deonpay.mx'

          if (options?.sameSite) {
            cookieString += `; samesite=${options.sameSite}`
          }
          if (options?.secure !== false) {
            cookieString += '; secure'
          }

          document.cookie = cookieString
        },
        remove(name: string, options: any) {
          // Remove cookie by setting expired date
          let cookieString = `${name}=; max-age=0; path=/`
          cookieString += '; domain=.deonpay.mx'
          document.cookie = cookieString
        },
      },
    }
  )
}
