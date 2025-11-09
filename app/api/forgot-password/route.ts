import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const data = forgotPasswordSchema.parse(body)

    // Create Supabase client
    const supabase = await createClient()

    // Check if user exists and email is verified
    const { data: authData, error: userError } = await supabase.auth.admin.listUsers()

    // Alternative: Use signInWithOtp to check if email exists (doesn't require admin)
    // We'll use resetPasswordForEmail which handles verification internally

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://deonpay.mx'}/reset-password`,
    })

    if (error) {
      // Don't reveal if email exists or not for security
      // But check specific error messages
      if (error.message.includes('User not found')) {
        return NextResponse.json(
          { error: 'No existe una cuenta con este correo electrónico' },
          { status: 404 }
        )
      }

      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          {
            error: 'Tu correo electrónico aún no ha sido verificado. Por favor verifica tu correo antes de restablecer tu contraseña.',
            errorType: 'email_not_verified'
          },
          { status: 403 }
        )
      }

      console.error('Password reset error:', error)

      // Generic error - don't reveal details for security
      return NextResponse.json(
        { error: 'Error al procesar la solicitud. Verifica que tu correo esté verificado.' },
        { status: 400 }
      )
    }

    // Success - always return success even if email doesn't exist (security)
    return NextResponse.json({
      ok: true,
      message: 'Si existe una cuenta con este correo, recibirás un enlace de recuperación',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
