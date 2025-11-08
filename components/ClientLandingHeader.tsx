'use client'

import { useEffect, useState } from 'react'
import LandingHeader from './LandingHeader'

export default function ClientLandingHeader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything on the server
  if (!mounted) {
    return (
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]/95 md:bg-[var(--color-background)]/80 backdrop-blur-md sticky top-0 z-50 will-change-transform">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4 max-w-7xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--color-primary)] rounded-lg sm:rounded-xl"></div>
              <span className="text-lg sm:text-2xl font-bold text-[var(--color-textPrimary)]">
                DeonPay
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return <LandingHeader />
}
