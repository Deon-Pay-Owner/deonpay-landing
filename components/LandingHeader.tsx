'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from './Button'
import { CreditCard, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { createBrowserClient } from '@/lib/supabase-browser'

export default function LandingHeader() {
  const { theme, toggleTheme } = useTheme()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [merchantId, setMerchantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    async function checkSession() {
      try {
        // Use getSession to check for active session with shared cookies
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setIsLoggedIn(true)

          // Get merchant ID
          const { data: profile } = await supabase
            .from('users_profile')
            .select('default_merchant_id')
            .eq('user_id', session.user.id)
            .single()

          if (profile?.default_merchant_id) {
            setMerchantId(profile.default_merchant_id)
          }
        } else {
          setIsLoggedIn(false)
          setMerchantId(null)
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setIsLoggedIn(false)
        setMerchantId(null)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsLoggedIn(true)
        // Fetch merchant ID when session changes
        supabase
          .from('users_profile')
          .select('default_merchant_id')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.default_merchant_id) {
              setMerchantId(profile.default_merchant_id)
            }
          })
      } else {
        setIsLoggedIn(false)
        setMerchantId(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]/95 md:bg-[var(--color-background)]/80 backdrop-blur-md sticky top-0 z-50 will-change-transform">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 max-w-7xl">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--color-primary)] rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-2xl font-bold text-[var(--color-textPrimary)] font-[family-name:var(--font-poppins)]">
              DeonPay
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[var(--color-surface)]/80 border border-[var(--color-border)] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md group backdrop-blur-sm"
              aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
              {theme === 'light' ? (
                <Moon size={16} className="sm:w-[18px] sm:h-[18px] text-[var(--color-textPrimary)] group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <Sun size={16} className="sm:w-[18px] sm:h-[18px] text-[var(--color-primary)] group-hover:rotate-90 transition-transform duration-300" />
              )}
            </button>

            {!loading && (
              <>
                {isLoggedIn && merchantId ? (
                  <Link href={`https://dashboard.deonpay.mx/${merchantId}`}>
                    <Button variant="primary">Ir a Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/signin">
                      <Button variant="ghost">Iniciar Sesión</Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="primary">Comenzar</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
