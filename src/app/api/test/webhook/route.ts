import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service Role Client für Tests (kann auth.users erstellen)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { action, email } = await req.json()

    console.log('🧪 Testing webhook functionality:', { action, email })

    if (action === 'create_test_user_with_subscription') {
      // Erstelle Test-User mit Subscription (simuliert kompletten Webhook-Flow)
      
      // 1. Prüfe ob User bereits existiert
      const { data: existingUser, error: userFindError } = await supabaseAdmin.auth.admin.getUserByEmail(email)

      let userId: string

      if (userFindError || !existingUser.user) {
        // User existiert nicht - erstelle neuen User
        console.log('👤 Creating test user for:', email)
        
        const { data: newUser, error: userCreateError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            created_via: 'test_api',
            has_beta_access: true
          }
        })

        if (userCreateError || !newUser.user) {
          console.error('❌ Test user creation failed:', userCreateError)
          return NextResponse.json({ error: userCreateError?.message }, { status: 500 })
        }

        userId = newUser.user.id
        console.log('✅ Test user created:', userId)
      } else {
        userId = existingUser.user.id
        console.log('👤 Test user already exists:', userId)
      }

      // 2. Update Profile mit Subscription-Daten
      const testSubscriptionData = {
        stripe_customer_id: `cus_test_${Date.now()}`,
        stripe_subscription_id: `sub_test_${Date.now()}`,
        subscription_status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Tage
        has_beta_access: true, // Test mit Beta-Zugang
        subscription_metadata: {
          test: true,
          created_by: 'test_api',
          stripe_metadata: {
            beta_access: 'true'
          }
        },
        updated_at: new Date().toISOString()
      }

      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(testSubscriptionData)
        .eq('id', userId)
        .select()

      if (profileError) {
        console.error('❌ Profile update failed:', profileError)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
      }

      console.log('✅ Test user with subscription created/updated')
      return NextResponse.json({ 
        success: true, 
        message: 'Test user with subscription created',
        user_id: userId,
        profile: profileData[0]
      })
    }

    if (action === 'check_subscription') {
      // Prüfe Subscription Status by Email
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, subscription_status, current_period_end, has_beta_access, stripe_customer_id')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Prüfe auch ob User in auth.users existiert
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)

      return NextResponse.json({
        success: true,
        profile_found: !!profile,
        auth_user_found: !!authUser?.user,
        profile: profile,
        auth_user_id: authUser?.user?.id
      })
    }

    if (action === 'list_webhook_events') {
      // Liste letzte Webhook Events
      const { data, error } = await supabaseAdmin
        .from('webhook_events')
        .select('*')
        .order('processed_at', { ascending: false })
        .limit(10)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        events: data
      })
    }

    if (action === 'cleanup_test_data') {
      // Lösche Test-User und Daten
      console.log('🧹 Cleaning up test data...')

      // 1. Finde alle Test-Profile
      const { data: testProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .like('stripe_customer_id', 'cus_test_%')

      if (testProfiles && testProfiles.length > 0) {
        console.log(`Found ${testProfiles.length} test profiles to clean up`)

        for (const profile of testProfiles) {
          // Lösche User aus auth.users (Profile wird automatisch durch CASCADE gelöscht)
          try {
            await supabaseAdmin.auth.admin.deleteUser(profile.id)
            console.log(`✅ Deleted test user: ${profile.email}`)
          } catch (err) {
            console.log(`⚠️ Could not delete user ${profile.email}:`, err)
            
            // Falls User-Löschung fehlschlägt, setze Profile zurück
            await supabaseAdmin
              .from('profiles')
              .update({
                stripe_customer_id: null,
                stripe_subscription_id: null,
                subscription_status: null,
                current_period_start: null,
                current_period_end: null,
                has_beta_access: false,
                subscription_metadata: '{}'
              })
              .eq('id', profile.id)
          }
        }
      }

      // 2. Lösche Test Webhook Events
      await supabaseAdmin
        .from('webhook_events')
        .delete()
        .like('stripe_event_id', 'evt_test_%')

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${testProfiles?.length || 0} test users and webhook events`
      })
    }

    if (action === 'simulate_stripe_webhook') {
      // Simuliere Stripe Webhook Event für lokales Testing
      const mockStripeEvent = {
        id: `evt_test_${Date.now()}`,
        type: 'customer.subscription.created',
        data: {
          object: {
            id: `sub_test_${Date.now()}`,
            customer: `cus_test_${Date.now()}`,
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
            metadata: {
              beta_access: 'true'
            },
            items: {
              data: [{
                price: {
                  id: 'price_test_123',
                  nickname: 'Test Plan',
                  product: 'prod_test_456'
                }
              }]
            }
          }
        }
      }

      // Simuliere Stripe Customer
      const mockCustomer = {
        id: mockStripeEvent.data.object.customer,
        email: email,
        metadata: {}
      }

      console.log('🎭 Simulating Stripe webhook for:', email)

      // Direkt die Webhook-Logik ausführen (ohne echten Stripe Call)
      // ... hier würde normalerweise handleSubscriptionUpdate aufgerufen

      return NextResponse.json({
        success: true,
        message: 'Webhook simulation completed',
        mock_event: mockStripeEvent,
        mock_customer: mockCustomer
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Health Check - prüfe System Status
    const { data: profilesCount, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('count(*)')
      .not('subscription_status', 'is', null)
      .single()

    const { data: webhookCount, error: webhookError } = await supabaseAdmin
      .from('webhook_events')
      .select('count(*)')
      .single()

    // Prüfe auth.users Zugriff
    const { data: authTest, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    })

    return NextResponse.json({
      status: 'ok',
      message: 'Auto user creation webhook system ready',
      profiles_with_subscriptions_count: profilesError ? 'error' : profilesCount?.count || 0,
      webhook_events_count: webhookError ? 'error' : webhookCount?.count || 0,
      auth_admin_access: authError ? 'error' : 'ok',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}