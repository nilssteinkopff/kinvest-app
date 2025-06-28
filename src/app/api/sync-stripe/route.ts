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
  console.log('🔄 Starting COMPLETE Stripe-Supabase sync with TAGS...')
  
  try {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const syncResults = {
      customers_processed: 0,
      customers_synced: 0,
      subscriptions_mapped: 0,
      users_created: 0,
      profiles_with_subscriptions: 0,
      profiles_without_subscriptions: 0,
      customers_without_email: 0,
      beta_access_granted: 0,
      tags_created: 0,
      specific_fixes: [],
      detailed_errors: [] as any[]
    }

    // PHASE 1: Alle Subscriptions sammeln mit verbesserter Zuordnung
    console.log('📊 Phase 1: Collecting ALL subscriptions...')
    const customerSubscriptionMap = new Map()
    const subscriptionCustomerMap = new Map()
    
    let hasMoreSubs = true
    let startingAfterSubs: string | undefined
    
    while (hasMoreSubs) {
      const subscriptions = await stripe.subscriptions.list({
        limit: 100,
        starting_after: startingAfterSubs,
        status: 'all',
        expand: ['data.customer']
      })

      for (const subscription of subscriptions.data) {
        const customer = subscription.customer as Stripe.Customer
        if (customer && !customer.deleted) {
          // Mehrfache Zuordnung für bessere Matching
          if (customer.email) {
            if (!customerSubscriptionMap.has(customer.id)) {
              customerSubscriptionMap.set(customer.id, [])
            }
            customerSubscriptionMap.get(customer.id).push(subscription)
            subscriptionCustomerMap.set(subscription.id, customer)
            syncResults.subscriptions_mapped++
          }
        }
      }

      hasMoreSubs = subscriptions.has_more
      if (hasMoreSubs && subscriptions.data.length > 0) {
        startingAfterSubs = subscriptions.data[subscriptions.data.length - 1].id
      }
    }

    console.log(`📊 Mapped ${syncResults.subscriptions_mapped} subscriptions to customers`)

    // PHASE 2: Alle Kunden mit erweiterte Paginierung
    console.log('📊 Phase 2: Processing ALL customers...')
    let hasMore = true
    let startingAfter: string | undefined
    const processedEmails = new Set()
    
    while (hasMore) {
      const customers = await stripe.customers.list({
        limit: 100,
        starting_after: startingAfter
      })

      for (const customer of customers.data) {
        syncResults.customers_processed++
        
        if (!customer.email) {
          console.log(`⚠️ Customer ${customer.id} has no email - skipping`)
          syncResults.customers_without_email++
          continue
        }

        // Doppelte Emails vermeiden
        if (processedEmails.has(customer.email)) {
          console.log(`⚠️ Duplicate email ${customer.email} - skipping`)
          continue
        }
        processedEmails.add(customer.email)

        try {
          const customerSubscriptions = customerSubscriptionMap.get(customer.id) || []
          const result = await syncCompleteCustomerWithTags(customer, customerSubscriptions)
          
          if (result.success) {
            syncResults.customers_synced++
            if (result.userCreated) syncResults.users_created++
            if (result.hasSubscription) {
              syncResults.profiles_with_subscriptions++
            } else {
              syncResults.profiles_without_subscriptions++
            }
            if (result.hasBetaAccess) syncResults.beta_access_granted++
            if (result.tagsCreated) syncResults.tags_created += result.tagsCreated

            // Spezielle Fälle protokollieren
            if (['cbl@beakon.de', 'christoph.denloeffel@gmail.com', 'corina.klippel@gmx.de', 'info@eclatluise.de', 'winfried.herold@gmx.de'].includes(customer.email)) {
              syncResults.specific_fixes.push({
                email: customer.email,
                subscription_found: result.hasSubscription,
                subscription_id: result.subscriptionId,
                status: result.subscriptionStatus
              })
            }
          }
          
        } catch (error) {
          const errorDetail = {
            email: customer.email,
            customer_id: customer.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
          console.error('❌ Customer sync failed:', errorDetail)
          syncResults.detailed_errors.push(errorDetail)
        }
      }

      hasMore = customers.has_more
      if (hasMore && customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1].id
      }
    }

    console.log('✅ COMPLETE Sync with TAGS completed:', syncResults)
    
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

async function syncCompleteCustomerWithTags(customer: Stripe.Customer, subscriptions: Stripe.Subscription[]) {
  if (!customer.email) {
    throw new Error('No email provided')
  }

  console.log(`👤 Syncing ${customer.email} with ${subscriptions.length} subscriptions`)

  let userId: string
  let userCreated = false

  // User erstellen/finden
  try {
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
    } else {
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
    }

    // Beste Subscription finden
    const activeSubscription = subscriptions.find(sub => 
      ['active', 'trialing'].includes(sub.status)
    )
    const subscription = activeSubscription || subscriptions[0] || null

    // Tags aus Metadata extrahieren
    const tags = extractTagsFromMetadata(customer, subscription)
    const hasBetaAccess = tags.includes('beta_access') || subscription?.metadata?.beta_access === 'true'

    // Erweiterte Subscription Metadata mit Tag-Format
    const subscriptionMetadata = subscription ? {
      tags: tags,
      stripe_metadata: subscription.metadata,
      customer_metadata: customer.metadata,
      subscription_items: subscription.items.data.map(item => ({
        price_id: item.price.id,
        price_nickname: item.price.nickname,
        product_id: item.price.product
      })),
      billing_info: {
        collection_method: subscription.collection_method,
        days_until_due: subscription.days_until_due,
        default_payment_method: subscription.default_payment_method
      }
    } : {
      tags: tags,
      customer_metadata: customer.metadata
    }

    // Vollständiges Profile
    const completeProfileData = {
      id: userId,
      email: customer.email,
      full_name: customer.name || '',
      stripe_customer_id: customer.id,
      stripe_subscription_id: subscription?.id || null,
      subscription_status: subscription?.status || null,
      current_period_start: subscription ? new Date(subscription.current_period_start * 1000).toISOString() : null,
      current_period_end: subscription ? new Date(subscription.current_period_end * 1000).toISOString() : null,
      has_beta_access: hasBetaAccess,
      subscription_metadata: subscriptionMetadata,
      updated_at: new Date().toISOString()
    }

    console.log(`💾 Upserting: ${customer.email}`, {
      subscription: subscription?.id || 'none',
      status: subscription?.status || 'none',
      tags: tags.length,
      beta: hasBetaAccess
    })

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(completeProfileData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })

    if (profileError) {
      throw new Error(`Profile upsert failed: ${profileError.message}`)
    }

    console.log(`✅ Synced: ${customer.email}`)

    return { 
      success: true,
      userCreated, 
      hasSubscription: !!subscription,
      subscriptionId: subscription?.id,
      subscriptionStatus: subscription?.status,
      hasBetaAccess,
      tagsCreated: tags.length
    }

  } catch (error) {
    console.error(`❌ Failed to sync ${customer.email}:`, error)
    throw error
  }
}

function extractTagsFromMetadata(customer: Stripe.Customer, subscription?: Stripe.Subscription): string[] {
  const tags: string[] = []

  // Customer Metadata Tags
  if (customer.metadata) {
    Object.entries(customer.metadata).forEach(([key, value]) => {
      if (value === 'true' || value === '1') {
        tags.push(key)
      } else if (value && value !== 'false' && value !== '0') {
        tags.push(`${key}:${value}`)
      }
    })
  }

  // Subscription Metadata Tags
  if (subscription?.metadata) {
    Object.entries(subscription.metadata).forEach(([key, value]) => {
      if (value === 'true' || value === '1') {
        tags.push(key)
      } else if (value && value !== 'false' && value !== '0') {
        tags.push(`${key}:${value}`)
      }
    })
  }

  // Automatische Tags basierend auf Status
  if (subscription) {
    tags.push(`status:${subscription.status}`)
    
    if (['active', 'trialing'].includes(subscription.status)) {
      tags.push('paying_customer')
    }
    
    if (subscription.cancel_at_period_end) {
      tags.push('will_cancel')
    }
  }

  // Customer-spezifische Tags
  if (customer.delinquent) {
    tags.push('delinquent')
  }

  return [...new Set(tags)] // Duplikate entfernen
}

export async function GET() {
  return NextResponse.json({
    message: 'COMPLETE Stripe Sync with TAG System',
    features: ['auth_users', 'profiles', 'subscriptions', 'metadata_tags', 'beta_access'],
    usage: 'POST with Authorization header',
    last_run: new Date().toISOString()
  })
}
