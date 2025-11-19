import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Check if environment variables are set
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasCookieDomain = !!process.env.SUPABASE_COOKIE_DOMAIN

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasSupabaseUrl,
    hasSupabaseKey,
    hasCookieDomain,
    cookieDomain: process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx (default)',
    timestamp: new Date().toISOString(),
  })
}
