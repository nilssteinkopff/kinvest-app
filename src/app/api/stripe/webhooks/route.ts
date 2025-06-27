import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

// Service Role Client für Admin-Operationen (kann auth.users erstellen)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  console.log('🔔 Stripe Webhook received')
  
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  let event: Stripe.Event

  try {
    if (!signature) {
      console.error('❌ Missing stripe-signature header')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    
    console.log(`✅ Webhook signature verified: ${event.type}`)
    console.log(`📋 Event ID: ${event.id}`)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}` },
      { status: 400 }
    )
  }

  // Check if event was already processed (idempotency)
  const { data: existingEvent } = await supabaseAdmin
    .from('webhook_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existingEvent) {
    console.log(`✅ Event ${event.id} already processed, skipping`)
    return NextResponse.json({ received: true, status: 'already_processed' })
  }

  // Log webhook event
  await logWebhookEvent(event, 'received')

  // Handle the event
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, event.id)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as Stripe.Subscription, event.id)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, event.id)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, event.id)
        break
        
      default:
        console.log(`🤷 Unhandled event type: ${event.type}`)
        await logWebhookEvent(event, 'unhandled')
    }

    // Mark event as successfully processed
    await logWebhookEvent(event, 'processed')
    
    return NextResponse.json({ received: true, status: 'processed' })
  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    await logWebhookEvent(event, 'error', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, eventId: string) {
  console.log('🔄 Processing subscription:', subscription.id, 'Status:', subscription.status)
  
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  
  if (!customer || customer.deleted || !customer.email) {
    const error = `No customer email found for subscription: ${subscription.id}`
    console.error('❌', error)
    throw new Error(error)
  }

  console.log('📧 Customer Email:', customer.email)

  // Extract beta access from subscription metadata
  const hasBetaAccess = subscription.metadata?.beta_access === 'true'
  console.log('🧪 Beta Access:', hasBetaAccess)

  // Extract all metadata for storage
  const metadata = {
    stripe_metadata: subscription.metadata,
    customer_metadata: customer.metadata,
    subscription_items: subscription.items.data.map(item => ({
      price_id: item.price.id,
      price_nickname: item.price.nickname,
      product_id: item.price.product
    }))
  }

  // Check if user already exists
  const { data: existingUser, error: userFindError } = await supabaseAdmin.auth.admin.getUserByEmail(customer.email)

  let userId: string

  if (userFindError || !existingUser.user) {
    // User doesn't exist - create new user
    console.log('👤 Creating new user for:', customer.email)
    
    const { data: newUser, error: userCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: customer.email,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        created_via: 'stripe_webhook',
        stripe_customer_id: subscription.customer,
        has_beta_access: hasBetaAccess
      }
    })

    if (userCreateError || !newUser.user) {
      console.error('❌ Error creating user:', userCreateError)
      throw new Error(`Failed to create user: ${userCreateError?.message}`)
    }

    userId = newUser.user.id
    console.log('✅ New user created:', userId)
  } else {
    // User already exists
    userId = existingUser.user.id
    console.log('👤 User already exists:', userId)
  }

  // Subscription data to update in profile
  const subscriptionData = {
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    subscription_status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000),
    has_beta_access: hasBetaAccess,
    subscription_metadata: metadata,
    updated_at: new Date().toISOString()
  }

  console.log('💾 Updating profile with subscription data:', {
    userId,
    email: customer.email,
    status: subscription.status,
    beta_access: hasBetaAccess,
    period_end: subscriptionData.current_period_end
  })

  // Update profile with subscription data
  const { error: profileUpdateError } = await supabaseAdmin
    .from('profiles')
    .update(subscriptionData)
    .eq('id', userId)

  if (profileUpdateError) {
    console.error('❌ Error updating profile:', profileUpdateError)
    throw profileUpdateError
  }

  console.log('✅ Profile updated successfully for:', customer.email)
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription, eventId: string) {
  console.log('❌ Cancelling subscription:', subscription.id)
  
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  
  if (!customer || customer.deleted || !customer.email) {
    const error = `No customer email found for cancelled subscription: ${subscription.id}`
    console.error('❌', error)
    throw new Error(error)
  }

  // Update subscription status to cancelled in profile
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({
      subscription_status: 'canceled',
      has_beta_access: false,
      updated_at: new Date().toISOString()
    })
    .eq('email', customer.email)

  if (updateError) {
    console.error('❌ Error cancelling subscription in profile:', updateError)
    throw updateError
  }

  console.log('✅ Subscription cancelled successfully for:', customer.email)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice, eventId: string) {
  console.log('💰 Payment succeeded for customer:', invoice.customer)
  
  // If this is a subscription invoice, refresh the subscription data
  if (invoice.subscription) {
    console.log('🔄 Refreshing subscription after successful payment')
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    await handleSubscriptionUpdate(subscription, eventId)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice, eventId: string) {
  console.log('💸 Payment failed for customer:', invoice.customer)
  
  // Get customer details for logging
  const customer = await stripe.customers.retrieve(invoice.customer as string)
  const customerEmail = customer && !customer.deleted ? customer.email : 'unknown'
  
  console.log('📧 Payment failed for email:', customerEmail)
  
  // Note: Stripe will automatically update subscription status to 'past_due'
  // We'll catch that via subscription.updated webhook
}

async function logWebhookEvent(
  event: Stripe.Event, 
  status: 'received' | 'processed' | 'error' | 'unhandled',
  errorMessage?: string
) {
  try {
    // Extract relevant info based on event type
    let customerEmail: string | null = null
    let subscriptionId: string | null = null
    let userId: string | null = null

    if (event.type.startsWith('customer.subscription.')) {
      const subscription = event.data.object as Stripe.Subscription
      subscriptionId = subscription.id
      
      try {
        const customer = await stripe.customers.retrieve(subscription.customer as string)
        if (customer && !customer.deleted) {
          customerEmail = customer.email
          
          // Find user ID from auth.users
          const { data: user } = await supabaseAdmin.auth.admin.getUserByEmail(customerEmail!)
          if (user?.user) {
            userId = user.user.id
          }
        }
      } catch (err) {
        console.log('Could not fetch customer for logging:', err)
      }
    } else if (event.type.startsWith('invoice.')) {
      const invoice = event.data.object as Stripe.Invoice
      subscriptionId = invoice.subscription as string
      
      try {
        const customer = await stripe.customers.retrieve(invoice.customer as string)
        if (customer && !customer.deleted) {
          customerEmail = customer.email
          
          // Find user ID from auth.users
          const { data: user } = await supabaseAdmin.auth.admin.getUserByEmail(customerEmail!)
          if (user?.user) {
            userId = user.user.id
          }
        }
      } catch (err) {
        console.log('Could not fetch customer for logging:', err)
      }
    }

    await supabaseAdmin
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        user_id: userId,
        customer_email: customerEmail,
        subscription_id: subscriptionId,
        status: status,
        error_message: errorMessage,
        raw_data: event,
        processed_at: new Date().toISOString()
      })

    console.log(`📝 Logged webhook event: ${event.id} (${status})`)
  } catch (err) {
    console.error('Failed to log webhook event:', err)
    // Don't throw - logging failure shouldn't break webhook processing
  }
}