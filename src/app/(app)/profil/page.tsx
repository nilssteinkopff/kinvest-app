//kinvest-app/src/app/(app)/profil/page.tsx
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { ReferralIdDisplay } from '@/components/ReferralIdDisplay'
import { createClient } from '@/utils/supabase/server'

export default async function ProfilPage() {
  const supabase = await createClient()
  
  // User und Profil Daten abrufen
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_id, email, full_name, subscription_status, has_beta_access')
    .eq('id', user?.id)
    .single()

  return (
    <form>
      <div className="space-y-12">

        {/* Rechnungsadresse und Abonnement */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900">Abonnement und Rechnungen</h2>
            <p className="mt-1 text-sm/6 text-gray-500">Verwalte dein Abonnement, ändere deine Zahlungsmethode oder lade Rechnungen herunter.</p>
          </div>

          <div className="md:col-span-2">
            <dl className="text-sm/6">
              <div className="sm:flex">
                <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">Vollständiger Name</dt>
                <dd className="mt-1 sm:mt-0 sm:flex-auto">
                  <div className="text-gray-900">{profile?.full_name || 'Nicht angegeben'}</div>
                </dd>
              </div>
              <div className="pt-6 pb-6 sm:flex">
                <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">E-Mail-Adresse</dt>
                <dd className="mt-1 sm:mt-0 sm:flex-auto">
                  <div className="text-gray-900">{profile?.email || 'Nicht angegeben'}</div>
                </dd>
              </div>
            </dl>
            
            {/* Abonnement Status */}
            <div className="mt-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    {/* Status mit Punkt */}
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        profile?.subscription_status === 'active' 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}></div>
                      <p className="text-sm/6 font-medium text-gray-900">
                        Status: {profile?.subscription_status === 'active' ? 'Aktives Abonnement' : 'Inaktiv'}
                      </p>
                    </div>
                    
                    {/* Beta Access Badge */}
                    <div className="mt-2">
                      {profile?.has_beta_access ? (
                        <span className="inline-flex items-center gap-x-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          <svg className="h-1.5 w-1.5 fill-green-500" viewBox="0 0 6 6" aria-hidden="true">
                            <circle cx={3} cy={3} r={3} />
                          </svg>
                          🚀 Beta-Zugang aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-x-1.5 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                          <svg className="h-1.5 w-1.5 fill-orange-500" viewBox="0 0 6 6" aria-hidden="true">
                            <circle cx={3} cy={3} r={3} />
                          </svg>
                          Kein Zugang zu Beta-Funktionen
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <a
                    href="https://billing.stripe.com/p/login/00g3cB48IbK6fv25kk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 shrink-0"
                  >
                    Rechnungsportal öffnen
                    <svg className="ml-2 -mr-0.5 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Freunde einladen */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-8 border-b border-gray-200 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Freunde einladen
            </h2>
            <p className="mt-1 text-sm/6 text-gray-500">
              Teile deinen persönlichen Referral-Link mit Freunden und erhalte Belohnungen für jede erfolgreiche Empfehlung.
            </p>
          </div>

          <div className="md:col-span-2">
            {profile?.referral_id ? (
              <ReferralIdDisplay referralId={profile.referral_id} />
            ) : (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm/6 font-medium text-amber-800 mb-1">Referral-ID wird generiert</h3>
                    <p className="text-sm/6 text-amber-700">
                      Falls diese nicht erscheint, kontaktiere bitte den Support.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Benachrichtigungen */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900">Benachrichtigungen</h2>
            <p className="mt-1 text-sm/6 text-gray-500">
              Wir informieren dich immer über wichtige Änderungen, aber du kannst auswählen, worüber du sonst noch informiert werden möchtest.
            </p>
          </div>

          <div className="max-w-2xl space-y-10 md:col-span-2">
            <fieldset>
              <legend className="text-sm/6 font-semibold text-gray-900">Per E-Mail</legend>
              <div className="mt-6 space-y-6">
                <div className="flex gap-3">
                  <div className="flex h-6 shrink-0 items-center">
                    <div className="group grid size-4 grid-cols-1">
                      <input
                        defaultChecked
                        id="comments"
                        name="comments"
                        type="checkbox"
                        aria-describedby="comments-description"
                        className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                      />
                      <svg
                        fill="none"
                        viewBox="0 0 14 14"
                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                      >
                        <path
                          d="M3 8L6 11L11 3.5"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-checked:opacity-100"
                        />
                        <path
                          d="M3 7H11"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-indeterminate:opacity-100"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm/6">
                    <label htmlFor="comments" className="font-medium text-gray-900">
                      Neue Kurse
                    </label>
                    <p id="comments-description" className="text-gray-500">
                      Benachrichtigungen wenn neue Investment-Kurse verfügbar sind.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 shrink-0 items-center">
                    <div className="group grid size-4 grid-cols-1">
                      <input
                        id="candidates"
                        name="candidates"
                        type="checkbox"
                        aria-describedby="candidates-description"
                        className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                      />
                      <svg
                        fill="none"
                        viewBox="0 0 14 14"
                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                      >
                        <path
                          d="M3 8L6 11L11 3.5"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-checked:opacity-100"
                        />
                        <path
                          d="M3 7H11"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-indeterminate:opacity-100"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm/6">
                    <label htmlFor="candidates" className="font-medium text-gray-900">
                      Markt Updates
                    </label>
                    <p id="candidates-description" className="text-gray-500">
                      Wichtige Marktentwicklungen und Investment-Nachrichten.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 shrink-0 items-center">
                    <div className="group grid size-4 grid-cols-1">
                      <input
                        id="offers"
                        name="offers"
                        type="checkbox"
                        aria-describedby="offers-description"
                        className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                      />
                      <svg
                        fill="none"
                        viewBox="0 0 14 14"
                        className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                      >
                        <path
                          d="M3 8L6 11L11 3.5"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-checked:opacity-100"
                        />
                        <path
                          d="M3 7H11"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-0 group-has-indeterminate:opacity-100"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="text-sm/6">
                    <label htmlFor="offers" className="font-medium text-gray-900">
                      Referral Belohnungen
                    </label>
                    <p id="offers-description" className="text-gray-500">
                      Benachrichtigungen über erfolgreiche Empfehlungen und Belohnungen.
                    </p>
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm/6 font-semibold text-gray-900">Push Benachrichtigungen</legend>
              <p className="mt-1 text-sm/6 text-gray-500">Diese werden als SMS an dein Handy gesendet.</p>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-x-3">
                  <input
                    defaultChecked
                    id="push-everything"
                    name="push-notifications"
                    type="radio"
                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                  />
                  <label htmlFor="push-everything" className="block text-sm/6 font-medium text-gray-900">
                    Alles
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-email"
                    name="push-notifications"
                    type="radio"
                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                  />
                  <label htmlFor="push-email" className="block text-sm/6 font-medium text-gray-900">
                    Wie bei E-Mail
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="push-nothing"
                    name="push-notifications"
                    type="radio"
                    className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white not-checked:before:hidden checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden"
                  />
                  <label htmlFor="push-nothing" className="block text-sm/6 font-medium text-gray-900">
                    Keine Push Benachrichtigungen
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" className="text-sm/6 font-semibold text-gray-900">
          Abbrechen
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Speichern
        </button>
      </div>
    </form>
  )
}