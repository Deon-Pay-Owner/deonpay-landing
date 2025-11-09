import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

// In-memory rate limiting (production should use Redis)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const attempt = loginAttempts.get(email)

  if (!attempt || now > attempt.resetAt) {
    loginAttempts.set(email, { count: 1, resetAt: now + 15 * 60 * 1000 }) // 15 minutes
    return true
  }

  if (attempt.count >= 5) {
    return false
  }

  attempt.count++
  return true
}

export async function POST(request: NextRequest) {
  let response = NextResponse.next()

  try {
    const body = await request.json()

    // Validate input
    const data = loginSchema.parse(body)

    // Rate limit check
    if (!checkRateLimit(data.email)) {
      return NextResponse.json(
        { error: 'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.' },
        { status: 429 }
      )
    }

    // Create Supabase client with custom cookie handling
    const supabase = await createClient()

    // Sign in with password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError || !authData.user) {
      // Check if error is due to unverified email
      if (authError?.message?.includes('Email not confirmed')) {
        return NextResponse.json(
          {
            error: 'Tu correo electrónico aún no ha sido verificado. Por favor revisa tu bandeja de entrada y verifica tu correo antes de iniciar sesión.',
            errorType: 'email_not_verified'
          },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Additional check for email confirmation
    if (!authData.user.email_confirmed_at) {
      return NextResponse.json(
        {
          error: 'Tu correo electrónico aún no ha sido verificado. Por favor revisa tu bandeja de entrada y verifica tu correo antes de iniciar sesión.',
          errorType: 'email_not_verified'
        },
        { status: 403 }
      )
    }

    // Extract auth session and set cookies manually
    if (authData.session) {
      const { access_token, refresh_token } = authData.session
      const cookieDomain = process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx'

      // Set httpOnly cookies for server
      response = NextResponse.json({
        ok: true,
        redirectTo: `https://dashboard.deonpay.mx/${authData.user.id}`,
      })

      response.cookies.set('sb-exhjlvaocapbtgvqxnhr-auth-token', JSON.stringify(authData.session), {
        domain: cookieDomain,
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      // Set client-accessible cookie for browser
      response.cookies.set('sb-exhjlvaocapbtgvqxnhr-auth-token-client', JSON.stringify(authData.session), {
        domain: cookieDomain,
        path: '/',
        secure: true,
        httpOnly: false, // Client can read
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    const userId = authData.user.id

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('default_merchant_id, full_name, phone, profile_type')
      .eq('user_id', userId)
      .single()

    let merchantId: string

    if (profileError || !profile || !profile.default_merchant_id) {
      // Legacy user: Create default merchant with proper defaults
      const { data: newMerchant, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          owner_user_id: userId,
          name: 'Mi primer comercio',
          country: 'MX',
          currency: 'MXN',
          channel: 'CARD_NOT_PRESENT',
          status: 'draft',
          onboarding_stage: 'initial',
        })
        .select('id')
        .single()

      if (merchantError || !newMerchant) {
        return NextResponse.json(
          { error: 'Error al crear el perfil del comerciante' },
          { status: 500 }
        )
      }

      merchantId = newMerchant.id

      // Create user profile with minimal data for legacy users
      const { error: upsertError } = await supabase
        .from('users_profile')
        .upsert({
          user_id: userId,
          full_name: data.email.split('@')[0], // Use email prefix as placeholder
          phone: '', // Empty for legacy users
          profile_type: 'merchant_owner',
          default_merchant_id: merchantId,
        })

      if (upsertError) {
        return NextResponse.json(
          { error: 'Error al actualizar el perfil de usuario' },
          { status: 500 }
        )
      }

      // Create merchant member relationship
      await supabase
        .from('merchant_members')
        .insert({
          merchant_id: merchantId,
          user_id: userId,
          role: 'owner',
        })
    } else {
      merchantId = profile.default_merchant_id
    }

    // Reset rate limit on successful login
    loginAttempts.delete(data.email)

    // Log session
    try {
      const userAgent = request.headers.get('user-agent') || ''
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                 request.headers.get('x-real-ip') ||
                 'unknown'

      // Parse user agent for device info
      const deviceType = /mobile/i.test(userAgent) ? 'mobile' :
                        /tablet/i.test(userAgent) ? 'tablet' : 'desktop'

      const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[0] || 'unknown'
      const os = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/)?.[0] || 'unknown'

      await supabase.from('session_logs').insert({
        user_id: userId,
        login_at: new Date().toISOString(),
        ip_address: ip,
        user_agent: userAgent,
        device_type: deviceType,
        browser,
        os,
        is_active: true,
      })
    } catch (sessionError) {
      // Don't fail login if session logging fails
      console.error('Session logging error:', sessionError)
    }

    // Update response with correct merchant ID if needed
    if (response) {
      response = NextResponse.json({
        ok: true,
        redirectTo: `https://dashboard.deonpay.mx/${merchantId}`,
      })

      // Re-set cookies on new response
      if (authData.session) {
        const cookieDomain = process.env.SUPABASE_COOKIE_DOMAIN || '.deonpay.mx'

        response.cookies.set('sb-exhjlvaocapbtgvqxnhr-auth-token', JSON.stringify(authData.session), {
          domain: cookieDomain,
          path: '/',
          secure: true,
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        response.cookies.set('sb-exhjlvaocapbtgvqxnhr-auth-token-client', JSON.stringify(authData.session), {
          domain: cookieDomain,
          path: '/',
          secure: true,
          httpOnly: false,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }
    }

    // Return success with redirect URL
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
