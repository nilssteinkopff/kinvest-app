'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { AuthLayout } from '@/components/auth-layout'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showCheckoutLink, setShowCheckoutLink] = useState(false)
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  
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
        let successMessage = `Magic Link wurde an ${email} gesendet.`
        
        if (subscriptionResult.hasBetaAccess) {
          successMessage += ' 🎉 Sie haben Zugang zu Beta-Features!'
        }
        
        setMessage(successMessage)
        setIsEmailSent(true)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <AuthLayout>
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
              Prüfe deine E-Mails
            </h1>
            
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Wir haben einen Magic Link an <span className="font-medium text-zinc-900 dark:text-white">{email}</span> gesendet
            </p>
            
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Klicke auf den Link in der E-Mail, um dich in dein Konto anzumelden.
            </p>

            {/* Subscription Info */}
            {subscriptionInfo?.status && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                <p>Status: {subscriptionInfo.status}</p>
                {subscriptionInfo.expiryDate && (
                  <p>Verlängert sich am {new Date(subscriptionInfo.expiryDate).toLocaleDateString('de-DE')}</p>
                )}
              </div>
            )}
          </div>

          {/* Resend Link */}
          <div className="text-center">
            <button
              onClick={() => {
                setIsEmailSent(false)
                setEmail('')
                setAcceptedTerms(false)
                setMessage('')
                setError('')
                setShowCheckoutLink(false)
                setSubscriptionInfo(null)
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Andere E-Mail-Adresse versuchen
            </button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            KInvest
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Gib deine E-Mail-Adresse ein, um einen Magic Link zu erhalten
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-700 dark:text-red-200">
                  Anmeldung nicht möglich
                </h3>
                <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                  {error}
                </p>
                {subscriptionInfo?.status && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-300">
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
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Abonnement erforderlich
                </h3>
                <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  Um auf KInvest.ai zugreifen zu können, müssen Sie zuerst ein Abonnement abschließen. 
                  Nach dem Kauf können Sie sich sofort mit Ihrer E-Mail-Adresse anmelden.
                </p>
                <div className="mt-4">
                  <a
                    href={process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                  >
                    Jetzt abonnieren
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
              className="block w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-colors"
              placeholder="E-Mail-Adresse eingeben"
              disabled={isLoading}
            />
          </div>

          {/* Terms Checkbox */}
          <div className="flex gap-3">
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-zinc-300 bg-white checked:border-blue-600 checked:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:border-zinc-300 disabled:bg-zinc-100 disabled:checked:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-900 dark:checked:border-blue-500 dark:checked:bg-blue-500"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-zinc-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6">
              <label htmlFor="terms" className="text-zinc-500 dark:text-zinc-400">
                Mit der Anmeldung stimmst du unseren{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Nutzungsbedingungen
                </a>{' '}
                und{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Datenschutzbestimmungen
                </a>{' '}
                zu.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !acceptedTerms}
            className="w-full flex justify-center items-center rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 px-4 py-2.5 text-sm font-medium text-white disabled:text-zinc-500 dark:disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Überprüfung läuft...
              </>
            ) : (
              'Magic Link senden'
            )}
          </button>
        </form>

        {/* Alternative Actions */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Noch kein Kunde?{' '}
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Hier abonnieren
            </a>
          </div>
        </div>

        {/* Support Link */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Probleme?{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Support kontaktieren
            </a>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}