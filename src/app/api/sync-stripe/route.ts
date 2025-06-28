// src/app/api/sync-stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-11-20.acacia' 
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  console.log('🔄 Starting Stripe-Supabase sync job...')
  
  try {
    // Auth Header prüfen für Sicherheit
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const syncResults = {
      customers_synced: 0,
      subscriptions_synced: 0,
      users_created: 0,
      errors: [] as string[]
    }

    // 1. Alle Stripe Kunden abrufen
    console.log('📊 Fetching Stripe customers...')
    
    let hasMore = true
    let startingAfter: string | undefined
    
    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['data.subscriptions']
      })

      for (const customer of customers.data) {
        if (!customer.email) {
          console.log('⚠️ Skipping customer without email:', customer.id)
          continue
        }

        try {
          await syncCustomerToSupabase(customer)
          syncResults.customers_synced++
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

async function syncCustomerToSupabase(customer: Stripe.Customer) {
  if (!customer.email) return

  console.log('👤 Syncing customer:', customer.email)

  // Prüfen ob User bereits existiert
  const { data: existingUser, error: userFindError } = await supabaseAdmin.auth.admin.getUserByEmail(customer.email)
  
  let userId: string

  if (userFindError || !existingUser.user) {
    // User erstellen
    console.log('👤 Creating new user:', customer.email)
    const { data: newUser, error: userCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: customer.email,
      email_confirm: true,
      user_metadata: { 
        created_via: 'stripe_sync',
        stripe_customer_id: customer.id,
        synced_at: new Date().toISOString()
      }
    })
    
    if (userCreateError || !newUser.user) {
      throw new Error(`Failed to create user: ${userCreateError?.message}`)
    }
    userId = newUser.user.id
  } else {
    userId = existingUser.user.id
  }

  // Profile erstellen/aktualisieren
  const profileData = {
    id: userId,
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
}

// GET Endpoint für manuellen Trigger (Debug)
export async function GET() {
  return NextResponse.json({
    message: 'Stripe Sync Job Endpoint',
    usage: 'POST with Authorization header',
    last_run: new Date().toISOString()
  })
}