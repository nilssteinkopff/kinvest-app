import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

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
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const syncResults = {
      customers_synced: 0,
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
          // Profile mit generierter UUID erstellen
          const profileData = {
            id: randomUUID(), // ✅ UUID generieren!
            email: customer.email,
            stripe_customer_id: customer.id,
            updated_at: new Date().toISOString()
          }

          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert(profileData, { 
              onConflict: 'stripe_customer_id',
              ignoreDuplicates: false 
            })

          if (profileError) {
            throw new Error(`Profile upsert failed: ${profileError.message}`)
          }

          syncResults.customers_synced++
          syncResults.profiles_created++
          console.log('✅ Profile created:', customer.email)

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

export async function GET() {
  return NextResponse.json({
    message: 'Stripe Sync Job (UUID Profile Creation)',
    usage: 'POST with Authorization header',
    last_run: new Date().toISOString()
  })
}
