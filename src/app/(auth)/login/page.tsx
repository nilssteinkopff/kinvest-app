'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AuthLayout } from '@/components/auth-layout'
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showCheckoutLink, setShowCheckoutLink] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  
  const supabase = createClient()

  const checkSubscription = async (email: string) => {
    // Direct Supabase query to check subscription status
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_status, current_period_end, has_beta_access, email')
      .eq('email', email)
      .single()

    console.log('Subscription check result:', { profile, error })

    if (error && error.code !== 'PGRST116') {
      throw new Error('Fehler beim Überprüfen des Abonnements')
    }

    // No profile found = no subscription
    if (!profile) {
      return { 
        hasActiveSubscription: false, 
        message: 'Kein Abonnement für diese E-Mail gefunden. Bitte kaufen Sie zuerst ein Abonnement.' 
      }
    }

    // Check if subscription is active and not expired
    const isActive = profile.subscription_status === 'active' || 
                    profile.subscription_status === 'trialing'

    let isValid = isActive
    if (profile.current_period_end) {
      const expiryDate = new Date(profile.current_period_end)
      const now = new Date()
      isValid = isActive && expiryDate > now
    }

    if (!isValid) {
      return { 
        hasActiveSubscription: false, 
        message: profile.subscription_status === 'canceled' 
          ? 'Ihr Abonnement wurde gekündigt.' 
          : 'Ihr Abonnement ist abgelaufen.',
        status: profile.subscription_status,
        expiryDate: profile.current_period_end
      }
    }

    return { 
      hasActiveSubscription: true, 
      hasBetaAccess: profile.has_beta_access,
      status: profile.subscription_status,
      expiryDate: profile.current_period_end,
      message: 'Abonnement aktiv - Magic Link wird gesendet.'
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')
    setShowCheckoutLink(false)
    setSubscriptionInfo(null)

    try {
      console.log('🔍 Checking subscription for email:', email)
      
      // Check subscription directly with Supabase
      const subscriptionResult = await checkSubscription(email)
      setSubscriptionInfo(subscriptionResult)

      if (!subscriptionResult.hasActiveSubscription) {
        console.log('❌ No active subscription found')
        setError(subscriptionResult.message)
        setShowCheckoutLink(true)
        setIsLoading(false)
        return
      }

      // If subscription is active, use Supabase Auth to send magic link
      console.log('✅ Active subscription found, using Supabase Auth')
      
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
        },
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        let successMessage = `Magic Link wurde an ${email} gesendet. Überprüfen Sie Ihr E-Mail-Postfach.`
        
        if (subscriptionResult.hasBetaAccess) {
          successMessage += ' 🎉 Sie haben Zugang zu Beta-Features!'
        }
        
        setMessage(successMessage)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Bei KInvest.ai anmelden
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Geben Sie Ihre E-Mail-Adresse ein, um einen Magic Link zu erhalten
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div>
            <label htmlFor="email" className="sr-only">
              E-Mail-Adresse
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative block w-full rounded-md border-0 py-2 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="E-Mail-Adresse"
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !email}
              className={clsx(
                'group relative flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                isLoading || !email
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              )}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Überprüfung läuft...
                </div>
              ) : (
                'Magic Link senden'
              )}
            </button>
          </div>
        </form>

        {/* Success Message */}
        {message && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
                {subscriptionInfo?.status && (
                  <p className="mt-1 text-xs text-green-700">
                    Status: {subscriptionInfo.status}
                    {subscriptionInfo.expiryDate && (
                      ` • Verlängert sich am ${new Date(subscriptionInfo.expiryDate).toLocaleDateString('de-DE')}`
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Anmeldung nicht möglich
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                {subscriptionInfo?.status && (
                  <p className="mt-1 text-xs text-red-600">
                    Aktueller Status: {subscriptionInfo.status}
                    {subscriptionInfo.expiryDate && (
                      ` • Abgelaufen am ${new Date(subscriptionInfo.expiryDate).toLocaleDateString('de-DE')}`
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checkout Link */}
        {showCheckoutLink && (
          <div className="mt-6 rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Abonnement erforderlich
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Um auf KInvest.ai zugreifen zu können, müssen Sie zuerst ein Abonnement abschließen. 
                  Nach dem Kauf können Sie sich sofort mit Ihrer E-Mail-Adresse anmelden.
                </p>
                <div className="mt-4">
                  
                    href={process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                  <a>
                    Jetzt abonnieren
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Noch kein Kunde? {' '}
            
              href={process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            <a>
              Hier abonnieren
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}