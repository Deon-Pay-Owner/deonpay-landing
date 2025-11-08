import { createClient } from '@supabase/supabase-js'
import { generateMerchantKeys } from '../lib/api-keys'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function generateKeysForExistingUsers() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🔍 Searching for merchants without API keys...')

  // Get all merchants
  const { data: merchants, error: merchantsError } = await supabase
    .from('merchants')
    .select('id, name, owner_user_id')

  if (merchantsError) {
    console.error('❌ Error fetching merchants:', merchantsError)
    process.exit(1)
  }

  if (!merchants || merchants.length === 0) {
    console.log('⚠️  No merchants found')
    process.exit(0)
  }

  console.log(`📋 Found ${merchants.length} merchant(s)`)

  for (const merchant of merchants) {
    console.log(`\n🔧 Processing merchant: ${merchant.name} (${merchant.id})`)

    // Check if API keys already exist
    const { data: existingKeys } = await supabase
      .from('api_keys')
      .select('id, key_type')
      .eq('merchant_id', merchant.id)
      .eq('is_active', true)

    if (existingKeys && existingKeys.length > 0) {
      console.log(`   ℹ️  Already has ${existingKeys.length} API key(s):`, existingKeys.map(k => k.key_type))
      continue
    }

    // Generate test API keys
    console.log('   🔑 Generating test API keys...')
    const apiKeys = generateMerchantKeys('test')

    const { error: insertError } = await supabase
      .from('api_keys')
      .insert({
        merchant_id: merchant.id,
        name: 'Default Test Key',
        key_type: 'test',
        public_key: apiKeys.publicKey,
        secret_key_hash: apiKeys.secretKeyHash,
        secret_key_prefix: apiKeys.secretKeyPrefix,
        is_active: true,
        created_by: merchant.owner_user_id,
      })

    if (insertError) {
      console.error('   ❌ Error creating API keys:', insertError)
      continue
    }

    console.log('   ✅ API keys generated successfully!')
    console.log(`   📝 Public Key: ${apiKeys.publicKey}`)
    console.log(`   🔒 Secret Key: ${apiKeys.secretKey}`)
    console.log(`   ⚠️  IMPORTANT: Save the secret key now! It won't be shown again.`)
  }

  console.log('\n✨ Done!')
}

generateKeysForExistingUsers()
