import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    if (action === 'create_test_user_with_subscription') {
      let userId: string
      let userExists = false

      try {
        const { data: existingUser, error: userFindError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
        
        if (existingUser?.user && !userFindError) {
          userId = existingUser.user.id
          userExists = true
        } else {
          const { data: newUser, error: userCreateError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            email_confirm: true,
            user_metadata: {
              created_via: 'test_api',
              has_beta_access: true
            }
          })

          if (userCreateError || !newUser.user) {
            return NextResponse.json({ error: userCreateError?.message }, { status: 500 })
          }

          userId = newUser.user.id
          userExists = false
        }
      } catch (error) {
        return NextResponse.json({ error: 'Failed to handle user creation' }, { status: 500 })
      }

      const testSubscriptionData = {
        stripe_customer_id: `cus_test_${Date.now()}`,
        stripe_subscription_id: `sub_test_${Date.now()}`,
        subscription_status: 'active' as const,
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        has_beta_access: true,
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
        .upsert({
          id: userId,
          email: email,
          ...testSubscriptionData
        })
        .select()

      if (profileError) {
        return NextResponse.json({ 
          error: profileError.message,
          user_id: userId,
          user_existed: userExists
        }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        message: userExists ? 'Existing user updated with subscription' : 'New user with subscription created',
        user_id: userId,
        user_existed: userExists,
        profile: profileData?.[0]
      })
    }

    if (action === 'check_subscription') {
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('id, email, subscription_status, current_period_end, has_beta_access, stripe_customer_id')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

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

    if (action === 'cleanup_test_data') {
      const { data: testProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email')
        .like('stripe_customer_id', 'cus_test_%')

      if (testProfiles && testProfiles.length > 0) {
        for (const profile of testProfiles) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(profile.id)
          } catch (err) {
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

      await supabaseAdmin
        .from('webhook_events')
        .delete()
        .like('stripe_event_id', 'evt_test_%')

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${testProfiles?.length || 0} test users and webhook events`
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { count: totalProfiles, error: totalError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    const { count: subscriptionProfiles, error: subscriptionError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('subscription_status', 'is', null)
    
    const { count: webhookCount, error: webhookError } = await supabaseAdmin
      .from('webhook_events')
      .select('*', { count: 'exact', head: true })
    
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
    
    return NextResponse.json({
      status: 'ok',
      message: 'Auto user creation webhook system ready',
      profiles_with_subscriptions_count: subscriptionError ? 'error' : subscriptionProfiles || 0,
      webhook_events_count: webhookError ? 'error' : webhookCount || 0,
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