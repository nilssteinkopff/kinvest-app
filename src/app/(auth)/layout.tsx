import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | KInvest Login',
    default: 'Login - KInvest'
  },
  description: 'Sign in to KInvest platform',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-900 dark:to-zinc-800">
      {children}
    </div>
  )
}