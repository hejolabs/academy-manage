import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import Header from '@/components/layout/Header'
import BottomNavigation from '@/components/layout/BottomNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '공부방 관리 시스템',
  description: '학생 출석 및 수납 관리 시스템',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '공부방 관리',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <div className="flex flex-col h-full max-w-md mx-auto bg-white shadow-lg">
          <Header />
          <main className="flex-1 overflow-y-auto pb-safe">
            <div className="min-h-full">
              {children}
            </div>
          </main>
          <BottomNavigation />
        </div>
      </body>
    </html>
  )
}