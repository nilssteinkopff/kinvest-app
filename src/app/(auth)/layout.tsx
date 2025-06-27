import type { Metadata } from 'next'
import { Open_Sans, Cormorant_Garamond } from 'next/font/google'
import '../globals.css'

const openSans = Open_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
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
      <body className={`${openSans.variable} ${cormorantGaramond.variable} ${openSans.className}`}>
        {children}
      </body>
    </html>
  )
}