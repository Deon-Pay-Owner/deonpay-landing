import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { createAdminClient } from '@/lib/supabase-admin'
import { signUpSchema } from '@/lib/schemas/signup'
import { generateMerchantKeys } from '@/lib/api-keys'

export async function POST(request: NextRequest) {
  console.log('[Signup] API Route called')

  try {
    console.log('[Signup] Parsing request body')
    const body = await request.json()
    console.log('[Signup] Received data:', JSON.stringify(body, null, 2))

    // Validate input
    const validatedData = signUpSchema.parse(body)
    console.log('[Signup] Validation passed')

    // Create Supabase client
    const supabase = await createClient()
    // Create admin client for cleanup operations
    const adminClient = createAdminClient()

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

    // Check if user already has complete setup (from a previous partial signup)
    const { data: existingProfile } = await supabase
      .from('users_profile')
      .select('*, merchants!users_profile_default_merchant_id_fkey(id, name)')
      .eq('user_id', userId)
      .single()

    if (existingProfile && existingProfile.merchants) {
      console.log('[Signup] User already has complete profile, returning existing merchant')

      // User already has everything set up, just return their data
      if (authData.session) {
        return NextResponse.json({
          ok: true,
          redirectTo: `${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.deonpay.mx'}/${existingProfile.default_merchant_id}`,
          user: {
            id: userId,
            email: validatedData.email,
          },
          merchant: {
            id: existingProfile.default_merchant_id,
            name: existingProfile.merchants.name,
          },
        }, { status: 200 })
      } else {
        return NextResponse.json({
          ok: true,
          pendingVerification: true,
          message: 'Please check your email to verify your account',
        }, { status: 200 })
      }
    }

    // 2. Create or get merchant record
    console.log('[Signup] Creating merchant for user:', userId)

    // First, check if merchant already exists
    let { data: merchant, error: merchantSelectError } = await supabase
      .from('merchants')
      .select()
      .eq('owner_user_id', userId)
      .single()

    if (merchantSelectError && merchantSelectError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected for new users
      console.error('[Signup] Error checking existing merchant:', merchantSelectError)
    }

    if (!merchant) {
      // Merchant doesn't exist, create it
      const { data: newMerchant, error: merchantError } = await supabase
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

        // If user was created but merchant failed, try to clean up (best effort)
        adminClient.auth.admin.deleteUser(userId).then(
          () => console.log('[Signup] Cleaned up user after merchant error'),
          (err) => console.error('[Signup] Failed to cleanup user after merchant error:', err)
        )

        return NextResponse.json(
          {
            error: 'Failed to create merchant. Please contact support.',
            debug: `${merchantError.message} (${merchantError.code})`
          },
          { status: 500 }
        )
      }

      merchant = newMerchant
      console.log('[Signup] Merchant created:', merchant.id)

      // Generate API keys for the new merchant
      console.log('[Signup] Generating API keys for merchant:', merchant.id)
      const apiKeys = generateMerchantKeys('test')

      const { error: apiKeysError } = await supabase
        .from('api_keys')
        .insert({
          merchant_id: merchant.id,
          name: 'Default Test Key',
          key_type: 'test',
          public_key: apiKeys.publicKey,
          secret_key_hash: apiKeys.secretKeyHash,
          secret_key_prefix: apiKeys.secretKeyPrefix,
          is_active: true,
          created_by: userId,
        })

      if (apiKeysError) {
        console.error('[Signup] API keys creation error:', {
          message: apiKeysError.message,
          details: apiKeysError.details,
          hint: apiKeysError.hint,
          code: apiKeysError.code,
        })

        // Try to cleanup merchant (best effort)
        supabase.from('merchants').delete().eq('id', merchant.id).then(
          () => console.log('[Signup] Cleaned up merchant after API keys error'),
          (err) => console.error('[Signup] Failed to cleanup merchant after API keys error:', err)
        )
        adminClient.auth.admin.deleteUser(userId).then(
          () => console.log('[Signup] Cleaned up user after API keys error'),
          (err) => console.error('[Signup] Failed to cleanup user after API keys error:', err)
        )

        return NextResponse.json(
          {
            error: 'Failed to create API keys. Please contact support.',
            debug: `${apiKeysError.message} (${apiKeysError.code})`
          },
          { status: 500 }
        )
      }

      console.log('[Signup] API keys created successfully')
    } else {
      console.log('[Signup] Using existing merchant:', merchant.id)
    }

    // 3. Create or update user profile
    console.log('[Signup] Creating profile for user:', userId)
    console.log('[Signup] Profile data:', {
      user_id: userId,
      full_name: validatedData.full_name,
      phone: validatedData.phone,
      profile_type: validatedData.profile_type,
      default_merchant_id: merchant.id,
    })

    // Use upsert to handle existing profiles
    const { error: profileError } = await supabase
      .from('users_profile')
      .upsert({
        user_id: userId,
        full_name: validatedData.full_name,
        phone: validatedData.phone,
        profile_type: validatedData.profile_type,
        default_merchant_id: merchant.id,
      }, {
        onConflict: 'user_id'
      })

    if (profileError) {
      console.error('[Signup] Profile creation error:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code,
      })

      // Try to cleanup merchant and user (best effort, don't await)
      supabase.from('merchants').delete().eq('id', merchant.id).then(
        () => console.log('[Signup] Cleaned up merchant after profile error'),
        (err) => console.error('[Signup] Failed to cleanup merchant after profile error:', err)
      )
      adminClient.auth.admin.deleteUser(userId).then(
        () => console.log('[Signup] Cleaned up user after profile error'),
        (err) => console.error('[Signup] Failed to cleanup user after profile error:', err)
      )

      return NextResponse.json(
        {
          error: 'Failed to create profile. Please contact support.',
          debug: `${profileError.message} (${profileError.code})`
        },
        { status: 500 }
      )
    }

    console.log('[Signup] Profile created successfully')

    // 4. Create merchant member relationship (with duplicate handling)
    const { data: existingMember } = await supabase
      .from('merchant_members')
      .select()
      .eq('merchant_id', merchant.id)
      .eq('user_id', userId)
      .single()

    if (!existingMember) {
      const { error: memberError } = await supabase
        .from('merchant_members')
        .insert({
          merchant_id: merchant.id,
          user_id: userId,
          role: 'owner',
        })

      if (memberError) {
        console.error('[Signup] Member creation error:', memberError)
        // Don't fail the entire signup if member relationship already exists
        if (memberError.code !== '23505') { // 23505 = unique violation
          return NextResponse.json(
            { error: 'Failed to create merchant membership. Please contact support.' },
            { status: 500 }
          )
        } else {
          console.log('[Signup] Member relationship already exists, continuing')
        }
      } else {
        console.log('[Signup] Merchant member relationship created')
      }
    } else {
      console.log('[Signup] Merchant member relationship already exists')
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
    console.error('[Signup] Error stack:', error?.stack)
    console.error('[Signup] Error name:', error?.name)
    console.error('[Signup] Error message:', error?.message)

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
      {
        error: error.message || 'Internal server error',
        errorType: error?.name,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
