'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

function AuthConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebug = (message: string) => {
    console.log('🔍 AUTH CONFIRM:', message)
    setDebugInfo(prev => [...prev, message])
  }

  useEffect(() => {
    const handleAuthConfirm = async () => {
      const supabase = createClient()
      
      // Get all possible parameters
      const urlParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      
      addDebug(`Full URL: ${window.location.href}`)
      addDebug(`Search: ${window.location.search}`)
      addDebug(`Hash: ${window.location.hash}`)
      
      // Extract session tokens from hash (OAuth redirects)
      const access_token = hashParams.get('access_token')
      const refresh_token = hashParams.get('refresh_token')
      const token_type = hashParams.get('token_type')
      
      // Extract magic link tokens (URL parameters)
      const magic_token = urlParams.get('token')
      const magic_type = urlParams.get('type')
      
      // Extract OAuth authorization code (PKCE flow)
      const auth_code = urlParams.get('code')
      
      // Extract other possible parameters
      const token_hash = urlParams.get('token_hash')
      const error_description = urlParams.get('error_description')
      const error = urlParams.get('error')
      
      addDebug(`Hash tokens: access=${!!access_token}, refresh=${!!refresh_token}, type=${token_type}`)
      addDebug(`Magic link: token=${!!magic_token}, type=${magic_type}`)
      addDebug(`OAuth code: ${!!auth_code}`)
      addDebug(`URL params: token_hash=${!!token_hash}`)
      
      if (error || error_description) {
        addDebug(`❌ Error in URL: ${error} - ${error_description}`)
        router.push(`/login?error=${encodeURIComponent(error_description || error || 'Authentication failed')}`)
        return
      }

      // Handle OAuth tokens (hash parameters)
      if (access_token && refresh_token) {
        addDebug('✅ Found OAuth session tokens, setting session...')
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })

          if (error) {
            addDebug(`❌ Session error: ${error.message}`)
            router.push(`/login?error=${encodeURIComponent(error.message)}`)
          } else {
            addDebug(`✅ Session set successfully for: ${data.user?.email}`)
            // Clear hash and redirect
            window.history.replaceState({}, document.title, window.location.pathname)
            window.location.href = '/dashboard'
          }
        } catch (err) {
          addDebug(`❌ Unexpected error: ${err}`)
          router.push('/login?error=Session setup failed')
        }
      } 
      // Handle OAuth Authorization Code (PKCE flow)
      else if (auth_code) {
        addDebug('✅ Found OAuth authorization code, exchanging for session...')
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(auth_code)

          if (error) {
            addDebug(`❌ Code exchange error: ${error.message}`)
            router.push(`/login?error=${encodeURIComponent(error.message)}`)
          } else {
            addDebug(`✅ Code exchange successful for: ${data.user?.email}`)
            window.location.href = '/dashboard'
          }
        } catch (err) {
          addDebug(`❌ Unexpected error: ${err}`)
          router.push('/login?error=Code exchange failed')
        }
      }
      // Handle Magic Link tokens (URL parameters)
      else if (magic_token && magic_type === 'magiclink') {
        addDebug('✅ Found magic link token, verifying...')
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'magiclink',
            token: magic_token,
          })

          if (error) {
            addDebug(`❌ Magic link error: ${error.message}`)
            router.push(`/login?error=${encodeURIComponent(error.message)}`)
          } else {
            addDebug(`✅ Magic link verification successful for: ${data.user?.email}`)
            window.location.href = '/dashboard'
          }
        } catch (err) {
          addDebug(`❌ Unexpected error: ${err}`)
          router.push('/login?error=Magic link verification failed')
        }
      }
      // Handle other token types
      else if (token_hash && magic_type) {
        addDebug(`✅ Found token_hash and type, verifying OTP...`)
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            type: magic_type as any,
            token_hash,
          })

          if (error) {
            addDebug(`❌ Verify OTP error: ${error.message}`)
            router.push(`/login?error=${encodeURIComponent(error.message)}`)
          } else {
            addDebug(`✅ OTP verification successful for: ${data.user?.email}`)
            router.push('/dashboard')
          }
        } catch (err) {
          addDebug(`❌ Unexpected error: ${err}`)
          router.push('/login?error=OTP verification failed')
        }
      } else {
        addDebug('❌ No valid authentication data found')
        addDebug('Available URL params: ' + Array.from(urlParams.entries()).map(([k,v]) => `${k}=${v}`).join(', '))
        addDebug('Available hash params: ' + Array.from(hashParams.entries()).map(([k,v]) => `${k}=${v}`).join(', '))
        router.push('/login?error=No authentication data found')
      }
      
      setIsLoading(false)
    }

    // Small delay to ensure all params are available
    const timer = setTimeout(handleAuthConfirm, 200)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Completing your sign in...
        </p>
        
        {/* Debug Info (jetzt auch in Production) */}
        {debugInfo.length > 0 && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
            <h3 className="font-semibold text-sm mb-2">Debug Info:</h3>
            <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
              {debugInfo.map((info, idx) => (
                <div key={idx} className="font-mono">{info}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthConfirm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Loading authentication...
          </p>
        </div>
      </div>
    }>
      <AuthConfirmContent />
    </Suspense>
  )
}