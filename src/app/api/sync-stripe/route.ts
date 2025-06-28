// src/app/api/sync-stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-11-20.acacia' 
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
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

    // 2. Aktive Subscriptions synchronisieren
    console.log('📊 Syncing active subscriptions...')
    
    hasMore = true
    startingAfter = undefined
    
    while (hasMore) {
      const subscriptions = await stripe.subscriptions.list({
        limit: 100,
        starting_after: startingAfter,
        status: 'all',
        expand: ['data.customer']
      })

      for (const subscription of subscriptions.data) {
        try {
          await syncSubscriptionToSupabase(subscription)
          syncResults.subscriptions_synced++
        } catch (error) {
          const errorMsg = `Subscription ${subscription.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error('❌', errorMsg)
          syncResults.errors.push(errorMsg)
        }
      }

      hasMore = subscriptions.has_more
      if (hasMore && subscriptions.data.length > 0) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id
      }
    }

    // 3. Verwaiste Profile bereinigen (optional)
    await cleanupOrphanedProfiles()

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

async function syncSubscriptionToSupabase(subscription: Stripe.Subscription) {
  const customer = subscription.customer as Stripe.Customer
  
  if (!customer.email) {
    console.log('⚠️ Skipping subscription without customer email:', subscription.id)
    return
  }

  console.log('📊 Syncing subscription:', subscription.id)

  // User finden
  const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(customer.email)
  
  if (!existingUser.user) {
    // Erst Customer syncen
    await syncCustomerToSupabase(customer)
    const { data: newUser } = await supabaseAdmin.auth.admin.getUserByEmail(customer.email)
    if (!newUser.user) throw new Error('Failed to create user for subscription')
  }

  const userId = existingUser.user?.id || (await supabaseAdmin.auth.admin.getUserByEmail(customer.email)).data.user?.id

  if (!userId) throw new Error('No user ID found')

  const hasBetaAccess = subscription.metadata?.beta_access === 'true'

  // Subscription daten aktualisieren
  const subscriptionData = {
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    has_beta_access: hasBetaAccess,
    subscription_metadata: { stripe_metadata: subscription.metadata },
    updated_at: new Date().toISOString()
  }

  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update(subscriptionData)
    .eq('id', userId)

  if (updateError) {
    throw new Error(`Subscription update failed: ${updateError.message}`)
  }
}

async function cleanupOrphanedProfiles() {
  console.log('🧹 Cleaning up orphaned profiles...')
  
  // Profile ohne gültige Stripe Customer ID finden und markieren
  const { data: orphanedProfiles, error } = await supabaseAdmin
    .from('profiles')
    .select('id, stripe_customer_id, email')
    .not('stripe_customer_id', 'is', null)

  if (error) {
    console.error('⚠️ Failed to fetch profiles for cleanup:', error)
    return
  }

  for (const profile of orphanedProfiles || []) {
    try {
      // Prüfen ob Customer in Stripe noch existiert
      const customer = await stripe.customers.retrieve(profile.stripe_customer_id!)
      
      if (customer.deleted) {
        console.log('🗑️ Marking deleted customer profile:', profile.email)
        await supabaseAdmin
          .from('profiles')
          .update({ 
            subscription_status: 'canceled',
            has_beta_access: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)
      }
    } catch (error) {
      // Customer existiert nicht mehr in Stripe
      if (error instanceof Stripe.errors.StripeError && error.code === 'resource_missing') {
        console.log('🗑️ Cleaning up non-existent customer profile:', profile.email)
        await supabaseAdmin
          .from('profiles')
          .update({ 
            stripe_customer_id: null,
            stripe_subscription_id: null,
            subscription_status: 'canceled',
            has_beta_access: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)
      }
    }
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