import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function runMigration() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('🔄 Running migration 012_create_api_keys_table.sql...')

  // Read the migration file
  const migrationPath = path.join(__dirname, '../../../infra/migrations/012_create_api_keys_table.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

  // Execute the migration
  const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })

  if (error) {
    // Try executing it directly as a query
    console.log('⚠️  RPC method not available, trying direct execution...')

    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        const { error: stmtError } = await supabase.rpc('exec', { query: statement })
        if (stmtError) {
          console.error('❌ Error executing statement:', stmtError)
          console.error('Statement:', statement.substring(0, 100) + '...')
        }
      }
    }
  }

  console.log('✅ Migration completed!')
  console.log('🔍 Verifying table creation...')

  const { data, error: verifyError } = await supabase
    .from('api_keys')
    .select('*')
    .limit(1)

  if (verifyError) {
    console.error('❌ Table verification failed:', verifyError)
    console.log('\n⚠️  Please execute the migration manually in Supabase SQL Editor:')
    console.log('   1. Go to https://supabase.com/dashboard/project/exhjlvaocapbtgvqxnhr/sql')
    console.log('   2. Copy the content of: infra/migrations/012_create_api_keys_table.sql')
    console.log('   3. Paste and run it in the SQL Editor')
    process.exit(1)
  } else {
    console.log('✅ Table api_keys exists and is accessible!')
  }
}

runMigration()
