'use client'

import Link from 'next/link'
import { Button } from './Button'
import { CreditCard, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export default function LandingHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[var(--color-textPrimary)] font-[family-name:var(--font-poppins)]">
              DeonPay
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-[var(--color-surface)]/80 border border-[var(--color-border)] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md group backdrop-blur-sm"
              aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
              {theme === 'light' ? (
                <Moon size={18} className="text-[var(--color-textPrimary)] group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <Sun size={18} className="text-[var(--color-primary)] group-hover:rotate-90 transition-transform duration-300" />
              )}
            </button>

            <Link href="/signin" className="hidden sm:block">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">Comenzar</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
