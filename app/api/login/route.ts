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

    // Create Supabase client
    const supabase = await createClient()

    // Sign in with password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const userId = authData.user.id

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('default_merchant_id')
      .eq('user_id', userId)
      .single()

    let merchantId: string

    if (profileError || !profile || !profile.default_merchant_id) {
      // Create default merchant for user
      const { data: newMerchant, error: merchantError } = await supabase
        .from('merchants')
        .insert({
          owner_user_id: userId,
          name: `Merchant ${data.email}`,
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

      // Create or update user profile
      const { error: upsertError } = await supabase
        .from('users_profile')
        .upsert({
          user_id: userId,
          default_merchant_id: merchantId,
        })

      if (upsertError) {
        return NextResponse.json(
          { error: 'Error al actualizar el perfil de usuario' },
          { status: 500 }
        )
      }
    } else {
      merchantId = profile.default_merchant_id
    }

    // Reset rate limit on successful login
    loginAttempts.delete(data.email)

    // Return success with redirect URL
    return NextResponse.json({
      ok: true,
      redirectTo: `https://dashboard.deonpay.mx/${merchantId}`,
    })
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
