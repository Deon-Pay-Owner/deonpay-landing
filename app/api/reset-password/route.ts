import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // Create a response object early that we'll use for setting cookies
  let response = new NextResponse()

  try {
    const body = await request.json()

    // Validate input
    const data = resetPasswordSchema.parse(body)

    // Create Supabase client for API route - this will properly set cookies on the response
    const supabase = createApiClient(request, response)

    // Set session with the access token from the recovery link
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.accessToken,
      refresh_token: data.refreshToken || '',
    })

    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: 'Token de recuperación inválido o expirado' },
        { status: 401 }
      )
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.password,
    })

    if (updateError) {
      console.error('Update password error:', updateError)
      return NextResponse.json(
        { error: 'Error al actualizar la contraseña' },
        { status: 400 }
      )
    }

    // Sign out the user after password reset for security
    await supabase.auth.signOut()

    return NextResponse.json({
      ok: true,
      message: 'Contraseña restablecida exitosamente',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
