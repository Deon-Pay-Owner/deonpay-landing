import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { signUpSchema } from '@/lib/schemas/signup'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Signup] Received data:', JSON.stringify(body, null, 2))

    // Validate input
    const validatedData = signUpSchema.parse(body)
    console.log('[Signup] Validation passed')

    // Create Supabase client
    const supabase = await createClient()

    // 1. Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_LANDING_URL || 'https://deonpay.mx'}/signin`,
      },
    })

    if (authError) {
      console.error('[Signup] Auth error:', authError)

      // Check for duplicate email - provide friendly message
      if (authError.message?.includes('already registered') ||
          authError.message?.includes('User already registered') ||
          authError.message?.toLowerCase().includes('already exists')) {
        return NextResponse.json(
          { error: 'Este correo ya está registrado. Por favor inicia sesión o usa otro correo.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    const userId = authData.user.id
    console.log('[Signup] User created, ID:', userId)

    // 2. Create merchant record
    console.log('[Signup] Creating merchant for user:', userId)
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .insert({
        owner_user_id: userId,
        name: validatedData.merchant_name,
        country: 'MX',
        currency: 'MXN',
        channel: 'CARD_NOT_PRESENT',
        status: 'draft',
        onboarding_stage: 'initial',
      })
      .select()
      .single()

    if (merchantError) {
      console.error('[Signup] Merchant creation error:', {
        message: merchantError.message,
        details: merchantError.details,
        hint: merchantError.hint,
        code: merchantError.code,
      })
      return NextResponse.json(
        {
          error: 'Failed to create merchant. Please contact support.',
          debug: `${merchantError.message} (${merchantError.code})`
        },
        { status: 500 }
      )
    }

    console.log('[Signup] Merchant created:', merchant.id)

    // 3. Create user profile
    const { error: profileError } = await supabase
      .from('users_profile')
      .insert({
        user_id: userId,
        full_name: validatedData.full_name,
        phone: validatedData.phone,
        profile_type: validatedData.profile_type,
        default_merchant_id: merchant.id,
      })

    if (profileError) {
      console.error('[Signup] Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create profile. Please contact support.' },
        { status: 500 }
      )
    }

    // 4. Create merchant member relationship
    const { error: memberError } = await supabase
      .from('merchant_members')
      .insert({
        merchant_id: merchant.id,
        user_id: userId,
        role: 'owner',
      })

    if (memberError) {
      console.error('[Signup] Member creation error:', memberError)
      return NextResponse.json(
        { error: 'Failed to create merchant membership. Please contact support.' },
        { status: 500 }
      )
    }

    // 5. Check if email confirmation is required
    if (authData.session) {
      // User is already logged in (email confirmation disabled)
      return NextResponse.json({
        ok: true,
        redirectTo: `${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.deonpay.mx'}/${merchant.id}`,
        user: {
          id: userId,
          email: validatedData.email,
        },
        merchant: {
          id: merchant.id,
          name: merchant.name,
        },
      }, { status: 201 })
    } else {
      // Email confirmation required
      return NextResponse.json({
        ok: true,
        pendingVerification: true,
        message: 'Please check your email to verify your account',
      }, { status: 201 })
    }
  } catch (error: any) {
    console.error('[Signup] Unexpected error:', error)

    if (error.errors) {
      // Zod validation error
      console.error('[Signup] Validation errors:', JSON.stringify(error.errors, null, 2))
      return NextResponse.json(
        {
          error: error.errors[0].message,
          field: error.errors[0].path?.join('.'),
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
