import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-11-20.acacia' 
})

// Supabase Admin Client mit korrekter Konfiguration
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  }
)

export async function POST(req: NextRequest) {
  console.log('🔄 Starting Stripe-Supabase sync job...')
  
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const syncResults = {
      customers_synced: 0,
      users_created: 0,
      profiles_created: 0,
      errors: [] as string[]
    }

    console.log('📊 Fetching Stripe customers...')
    
    let hasMore = true
    let startingAfter: string | undefined
    
    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter
      })

      for (const customer of customers.data) {
        if (!customer.email) {
          console.log('⚠️ Skipping customer without email:', customer.id)
          continue
        }

        try {
          await syncCustomerWithAuth(customer)
          syncResults.customers_synced++
          syncResults.users_created++
          syncResults.profiles_created++
          
        } catch (error) {
          const errorMsg = `Customer ${customer.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error('❌', errorMsg)
          syncResults.errors.push(errorMsg)
        }
      }

      hasMore = customers.has_more
      if (hasMore && customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id
      }
    }

    console.log('✅ Sync job completed:', syncResults)
    
    return NextResponse.json({
      success: true,
      ...syncResults,
      synced_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Sync job failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function syncCustomerWithAuth(customer: Stripe.Customer) {
  if (!customer.email) return

  console.log('👤 Syncing customer with auth:', customer.email)

  let userId: string

  try {
    // Alternativer Ansatz: Direkt über HTTP API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
      }
    })

    const users = await response.json()
    const existingUser = users.users?.find((u: any) => u.email === customer.email)

    if (existingUser) {
      userId = existingUser.id
      console.log('👤 Found existing user:', customer.email)
    } else {
      // User erstellen via HTTP API
      const createResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!
        },
        body: JSON.stringify({
          email: customer.email,
          email_confirm: true,
          user_metadata: {
            created_via: 'stripe_sync',
            stripe_customer_id: customer.id
          }
        })
      })

      const newUser = await createResponse.json()
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create user: ${newUser.message || 'Unknown error'}`)
      }

      userId = newUser.id
      console.log('✅ Created new user:', customer.email)
    }

    // Profile erstellen/aktualisieren
    const profileData = {
      id: userId, // Auth User ID verwenden!
      email: customer.email,
      stripe_customer_id: customer.id,
      updated_at: new Date().toISOString()
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })

    if (profileError) {
      throw new Error(`Profile upsert failed: ${profileError.message}`)
    }

    console.log('✅ Profile synced successfully:', customer.email)

  } catch (error) {
    console.error('❌ Auth sync error:', error)
    throw error
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe Sync Job (Auth + Profile Creation)',
    usage: 'POST with Authorization header',
    last_run: new Date().toISOString()
  })
}
