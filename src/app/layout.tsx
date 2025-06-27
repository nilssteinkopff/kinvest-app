import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'

const openSans = Open_Sans({ 
  subsets: ['latin'],
  display: 'swap', // Bessere Performance
})

export const metadata: Metadata = {
  title: {
    template: '%s | KInvest',
    default: 'KInvest - Intelligent Investment Platform'
  },
  description: 'Professional investment management platform with Supabase Auth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={openSans.className}>
        {children}
      </body>
    </html>
  )
}