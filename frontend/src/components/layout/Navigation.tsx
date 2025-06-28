'use client'

import { HomeIcon, UserGroupIcon, CalendarIcon, CreditCardIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { HomeIcon as HomeIconSolid, UserGroupIcon as UserGroupIconSolid, CalendarIcon as CalendarIconSolid, CreditCardIcon as CreditCardIconSolid, CalendarDaysIcon as CalendarDaysIconSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  
  const navigation = [
    {
      name: '홈',
      href: '/',
      icon: HomeIcon,
      iconActive: HomeIconSolid,
    },
    {
      name: '학생',
      href: '/students',
      icon: UserGroupIcon,
      iconActive: UserGroupIconSolid,
    },
    {
      name: '출석',
      href: '/attendance',
      icon: CalendarIcon,
      iconActive: CalendarIconSolid,
    },
    {
      name: '캘린더',
      href: '/calendar',
      icon: CalendarDaysIcon,
      iconActive: CalendarDaysIconSolid,
    },
    {
      name: '수납',
      href: '/payments',
      icon: CreditCardIcon,
      iconActive: CreditCardIconSolid,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
      <div className="flex justify-around items-center py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.iconActive : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}