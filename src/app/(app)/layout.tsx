'use client'

import { Open_Sans, Cormorant_Garamond } from 'next/font/google'
import '../globals.css'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  HomeIcon,
  XMarkIcon,
  Cog8ToothIcon,
  ArrowRightStartOnRectangleIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline'

const openSans = Open_Sans({ 
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, current: true },
  { name: 'Portfolio', href: '/portfolio', icon: BriefcaseIcon, current: false },
  { name: 'Neuigkeiten', href: '/news', icon: NewspaperIcon, current: false },
  { name: 'Wissen', href: '/knowledge', icon: AcademicCapIcon, current: false },
]

const portfolios = [
  { id: 1, name: 'Tech Stocks', href: '/portfolio/tech', initial: 'T', current: false },
  { id: 2, name: 'Crypto Fund', href: '/portfolio/crypto', initial: 'C', current: false },
  { id: 3, name: 'Blue Chips', href: '/portfolio/bluechips', initial: 'B', current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

function LogoText() {
  return (
    <span className="font-logo text-xl font-semibold text-white">
      KInvest.ai
    </span>
  )
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    if (isLoggingOut) return
    
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error.message)
      } else {
        router.push('/login')
        router.refresh()
      }
    } catch (err) {
      console.error('Unexpected error during logout:', err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={`${openSans.variable} ${cormorant.variable} font-sans`}>
      <div className="h-full min-w-[320px] overflow-x-auto bg-white">
        <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-closed:opacity-0"
          />

          <div className="fixed inset-0 flex">
            <DialogPanel
              transition
              className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-closed:-translate-x-full min-w-[280px]"
            >
              <TransitionChild>
                <div className="absolute top-0 left-full flex w-16 justify-center pt-5 duration-300 ease-in-out data-closed:opacity-0">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                  </button>
                </div>
              </TransitionChild>

              {/* Mobile Sidebar */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10 min-w-[280px]">
                <div className="flex h-16 shrink-0 items-center">
                  <LogoText />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                item.current
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                              )}
                            >
                              <item.icon aria-hidden="true" className="size-6 shrink-0" />
                              <span className="truncate">{item.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <div className="text-xs/6 font-semibold text-gray-400">Your portfolios</div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {portfolios.map((portfolio) => (
                          <li key={portfolio.name}>
                            <a
                              href={portfolio.href}
                              className={classNames(
                                portfolio.current
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                              )}
                            >
                              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                                {portfolio.initial}
                              </span>
                              <span className="truncate">{portfolio.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                    {/* Mobile Logout in Sidebar */}
                    <li className="-mx-6 mt-auto">
                      <div className="space-y-1">
                        <a
                          href="/profil"
                          className="flex items-center gap-x-3 px-6 py-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
                        >
                          <Cog8ToothIcon aria-hidden="true" className="size-6 shrink-0" />
                          <span className="truncate">Profil</span>
                        </a>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex w-full items-center gap-x-3 px-6 py-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowRightStartOnRectangleIcon aria-hidden="true" className="size-6 shrink-0" />
                          <span className="truncate">
                            {isLoggingOut ? 'Abmelden...' : 'Abmelden'}
                          </span>
                        </button>
                      </div>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </div>
        </Dialog>

        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
            <div className="flex h-16 shrink-0 items-center">
              <LogoText />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.current
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                          )}
                        >
                          <item.icon aria-hidden="true" className="size-6 shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li>
                  <div className="text-xs/6 font-semibold text-gray-400">Your portfolios</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {portfolios.map((portfolio) => (
                      <li key={portfolio.name}>
                        <a
                          href={portfolio.href}
                          className={classNames(
                            portfolio.current
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                          )}
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
                            {portfolio.initial}
                          </span>
                          <span className="truncate">{portfolio.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto">
                  <div className="space-y-1">
                    <a
                      href="/profil"
                      className="flex items-center gap-x-3 px-6 py-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white"
                    >
                      <Cog8ToothIcon aria-hidden="true" className="size-6 shrink-0" />
                      <span className="truncate">Profil</span>
                    </a>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-x-3 px-6 py-2 text-sm/6 font-semibold text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRightStartOnRectangleIcon aria-hidden="true" className="size-6 shrink-0" />
                      <span className="truncate">
                        {isLoggingOut ? 'Abmelden...' : 'Abmelden'}
                      </span>
                    </button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden min-w-[320px]">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
          <div className="flex-1 text-sm/6 font-semibold text-white truncate">Dashboard</div>
          
          {/* Mobile Profile Dropdown */}
          <div className="flex items-center gap-x-3">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-white disabled:opacity-50"
              title={isLoggingOut ? 'Abmelden...' : 'Abmelden'}
            >
              <span className="sr-only">Sign out</span>
              <ArrowRightStartOnRectangleIcon className="size-6" />
            </button>
            <a href="/profil" className="flex-shrink-0">
              <span className="sr-only">Your profile</span>
              <div className="size-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-medium">
                U
              </div>
            </a>
          </div>
        </div>

        {/* Main content */}
        <main className="py-10 lg:pl-72 min-w-[320px]">
          <div className="px-4 sm:px-6 lg:px-8 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}