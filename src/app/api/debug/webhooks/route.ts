// src/app/api/debug/webhooks/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Letzte Webhook Events abrufen
    const { data: events, error } = await supabaseAdmin
      .from('webhook_events')
      .select('*')
      .order('processed_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Environment Check
    const envCheck = {
      stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
      stripe_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      webhook_secret_length: process.env.STRIPE_WEBHOOK_SECRET?.length || 0
    }

    // Profiles Count
    const { count: profilesCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      recent_webhook_events: events,
      total_profiles: profilesCount,
      webhook_url: `https://dev.kinvest.ai/api/stripe/webhooks`,
      last_events_summary: events?.map(e => ({
        type: e.event_type,
        status: e.status,
        time: e.processed_at,
        error: e.error_message
      }))
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
