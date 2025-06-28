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
    },
    global: {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  }
)

export async function POST(req: NextRequest) {
  console.log('🔄 Starting FULL Stripe-Supabase sync job...')
  
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const syncResults = {
      customers_synced: 0,
      subscriptions_synced: 0,
      users_created: 0,
      profiles_created: 0,
      profiles_updated: 0,
      customers_without_email: 0,
      errors: [] as string[]
    }

    console.log('📊 Fetching Stripe customers with subscriptions...')
    
    let hasMore = true
    let startingAfter: string | undefined
    
    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter,
        expand: ['data.subscriptions'] // ✅ Subscriptions mit laden!
      })

      for (const customer of customers.data) {
        if (!customer.email) {
          console.log('⚠️ Skipping customer without email:', customer.id)
          syncResults.customers_without_email++
          continue
        }

        try {
          const result = await syncCustomerWithSubscriptions(customer)
          syncResults.customers_synced++
          if (result.userCreated) syncResults.users_created++
          if (result.profileCreated) syncResults.profiles_created++
          if (result.profileUpdated) syncResults.profiles_updated++
          if (result.subscriptionsCount > 0) syncResults.subscriptions_synced += result.subscriptionsCount
          
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

    // Zusätzlich: Alle aktiven Subscriptions einzeln holen
    console.log('📊 Fetching additional subscriptions...')
    await syncActiveSubscriptions(syncResults)

    console.log('✅ FULL Sync job completed:', syncResults)
    
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

async function syncCustomerWithSubscriptions(customer: Stripe.Customer) {
  if (!customer.email) return { userCreated: false, profileCreated: false, profileUpdated: false, subscriptionsCount: 0 }

  console.log('👤 Syncing customer with subscriptions:', customer.email)

  let userId: string
  let userCreated = false

  try {
    // User erstellen/finden via HTTP API
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
      // User erstellen
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
            stripe_customer_id: customer.id,
            full_name: customer.name || ''
          }
        })
      })

      const newUser = await createResponse.json()
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create user: ${newUser.message || 'Unknown error'}`)
      }

      userId = newUser.id
      userCreated = true
      console.log('✅ Created new user:', customer.email)
    }

    // Aktive Subscription für diesen Customer finden
    let subscription: Stripe.Subscription | null = null
    let hasBetaAccess = false

    // Subscriptions aus Customer-Objekt holen
    if (customer.subscriptions && customer.subscriptions.data.length > 0) {
      // Aktive Subscription bevorzugen
      subscription = customer.subscriptions.data.find(sub => 
        ['active', 'trialing', 'past_due'].includes(sub.status)
      ) || customer.subscriptions.data[0] // Falls keine aktive, dann erste nehmen
    }

    // Falls keine Subscription am Customer, separat suchen
    if (!subscription) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 1,
        status: 'all'
      })
      subscription = subscriptions.data[0] || null
    }

    // Beta Access aus Subscription Metadata
    if (subscription) {
      hasBetaAccess = subscription.metadata?.beta_access === 'true'
    }

    // Vollständige Profile-Daten
    const profileData = {
      id: userId,
      email: customer.email,
      full_name: customer.name || '',
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription?.id || null,
      subscription_status: subscription?.status || null,
      current_period_start: subscription ? new Date(subscription.current_period_start * 1000) : null,
      current_period_end: subscription ? new Date(subscription.current_period_end * 1000) : null,
      has_beta_access: hasBetaAccess,
      subscription_metadata: subscription ? {
        stripe_metadata: subscription.metadata,
        customer_metadata: customer.metadata,
        subscription_items: subscription.items.data.map(item => ({
          price_id: item.price.id,
          price_nickname: item.price.nickname,
          product_id: item.price.product
        }))
      } : {},
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

    console.log('✅ Profile synced with subscription data:', customer.email, subscription ? `Sub: ${subscription.status}` : 'No subscription')

    return { 
      userCreated, 
      profileCreated: userCreated, 
      profileUpdated: !userCreated,
      subscriptionsCount: subscription ? 1 : 0
    }

  } catch (error) {
    console.error('❌ Auth sync error:', error)
    throw error
  }
}

async function syncActiveSubscriptions(syncResults: any) {
  // Zusätzliche Subscriptions einzeln durchgehen
  let hasMore = true
  let startingAfter: string | undefined
  
  while (hasMore) {
    const subscriptions = await stripe.subscriptions.list({
      limit: 100,
      starting_after: startingAfter,
      status: 'all',
      expand: ['data.customer']
    })

    for (const subscription of subscriptions.data) {
      const customer = subscription.customer as Stripe.Customer
      
      if (customer && !customer.deleted && customer.email) {
        try {
          // Profile mit Subscription-Daten aktualisieren
          const hasBetaAccess = subscription.metadata?.beta_access === 'true'
          
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000),
              current_period_end: new Date(subscription.current_period_end * 1000),
              has_beta_access: hasBetaAccess,
              subscription_metadata: {
                stripe_metadata: subscription.metadata,
                subscription_items: subscription.items.data.map(item => ({
                  price_id: item.price.id,
                  price_nickname: item.price.nickname,
                  product_id: item.price.product
                }))
              },
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customer.id)

          if (!error) {
            console.log('✅ Updated subscription for:', customer.email, subscription.status)
          }
        } catch (error) {
          console.error('⚠️ Subscription update error:', error)
        }
      }
    }

    hasMore = subscriptions.has_more
    if (hasMore && subscriptions.data.length > 0) {
      startingAfter = subscriptions.data[subscriptions.data.length - 1].id
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'FULL Stripe Sync Job (Auth + Profile + Subscriptions)',
    usage: 'POST with Authorization header',
    last_run: new Date().toISOString()
  })
}
