import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('🔐 Auth confirm request:', { token_hash: !!token_hash, type, next })

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      console.log('✅ Auth verification successful, redirecting to:', next)
      return NextResponse.redirect(new URL(next, request.url))
    } else {
      console.error('❌ Auth verification failed:', error)
      return NextResponse.redirect(new URL('/login?error=auth_error', request.url))
    }
  } else {
    console.error('❌ Missing token_hash or type')
    return NextResponse.redirect(new URL('/login?error=missing_params', request.url))
  }
}
