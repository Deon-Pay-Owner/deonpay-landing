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
      <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl"></div>
              <span className="text-2xl font-bold text-[var(--color-textPrimary)]">
                DeonPay
              </span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return <LandingHeader />
}
