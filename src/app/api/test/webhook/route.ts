import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 🔧 KORRIGIERTER Service Role Client für Admin-Operationen
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
  try {
    const { action, email } = await req.json()

    console.log('🧪 Testing webhook functionality:', { action, email })

    if (action === 'create_test_user_with_subscription') {
      // Erstelle Test-User mit Subscription (simuliert kompletten Webhook-Flow)
      
      // 🔧 KORRIGIERT: Richtige Admin API Verwendung
      let userId: string
      let userExists = false

      try {
        const { data: existingUser, error: userFindError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
        
        if (existingUser?.user && !userFindError) {
          userId = existingUser.user.id
          userExists = true
          console.log('👤 Test user already exists:', userId)
        } else {
          throw new Error('User not found')
        }
      } catch (findError) {
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
      }

      // 2. Update Profile mit Subscription-Daten
      const testSubscriptionData = {
        stripe_customer_id: `cus_test_${Date.now()}`,
        stripe_subscription_id: `sub_test_${Date.now()}`,
        subscription_status: 'active' as const,
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
        return NextResponse.json({ 
          error: profileError.message,
          details: profileError,
          user_id: userId,
          user_existed: userExists
        }, { status: 500 })
      }

      console.log('✅ Test user with subscription created/updated')
      return NextResponse.json({ 
        success: true, 
        message: 'Test user with subscription created',
        user_id: userId,
        user_existed: userExists,
        profile: profileData?.[0]
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
      let authUser = null
      try {
        const { data: authUserData } = await supabaseAdmin.auth.admin.getUserByEmail(email)
        authUser = authUserData
      } catch (authError) {
        console.log('Could not fetch auth user:', authError)
      }

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
                subscription_metadata: {}
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

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('❌ Test API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// 🔍 DEBUG GET Handler mit korrekten Imports
export async function GET() {
  try {
    console.log('🔍 Starting safe debugging...')
    
    // Test 1: Sehr einfache Abfrage (sollte immer funktionieren)
    const { data: simpleTest, error: simpleError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1)
    
    console.log('Simple test:', { simpleTest, simpleError })
    
    // Test 2: Count ohne Filter (sollte funktionieren)
    const { count: totalProfiles, error: totalError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    console.log('Total count:', { totalProfiles, totalError })
    
    // Test 3: Count mit Filter (das scheitert aktuell)
    const { count: subscriptionProfiles, error: subscriptionError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('subscription_status', 'is', null)
    
    console.log('Subscription count:', { subscriptionProfiles, subscriptionError })
    
    // Test 4: Webhook Events Tabelle
    const { count: webhookCount, error: webhookError } = await supabaseAdmin
      .from('webhook_events')
      .select('*', { count: 'exact', head: true })
    
    console.log('Webhook count:', { webhookCount, webhookError })
    
    // Test 5: Auth Admin Zugriff
    let authTest = null
    let authError = null
    
    try {
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1
      })
      authTest = authData
      authError = authErr
    } catch (err) {
      authError = err
    }
    
    console.log('Auth test:', { users: authTest?.users?.length, authError })
    
    // Test 6: Service Role Info
    const serviceRoleKeyLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
    const serviceRolePreview = process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...'
    
    return NextResponse.json({
      debug: true,
      status: 'debugging',
      tests: {
        simple_query: {
          success: !simpleError,
          error: simpleError?.message,
          result_count: simpleTest?.length || 0
        },
        total_profiles: {
          success: !totalError,
          count: totalProfiles || 0,
          error: totalError?.message
        },
        subscription_profiles: {
          success: !subscriptionError,
          count: subscriptionProfiles || 0,
          error: subscriptionError?.message,
          error_code: subscriptionError?.code
        },
        webhook_events: {
          success: !webhookError,
          count: webhookCount || 0,
          error: webhookError?.message,
          error_code: webhookError?.code
        },
        auth_admin_access: {
          success: !authError,
          user_count: authTest?.users?.length || 0,
          error: authError instanceof Error ? authError.message : authError
        }
      },
      environment: {
        supabase_url_set: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        service_key_set: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        service_key_length: serviceRoleKeyLength,
        service_key_preview: serviceRolePreview
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      debug: true,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}