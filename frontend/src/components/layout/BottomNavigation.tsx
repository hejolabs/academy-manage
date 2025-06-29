'use client'

import { usePathname, useRouter } from 'next/navigation'
import { 
  HomeIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  CalendarDaysIcon, 
  CreditCardIcon 
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid,
  CreditCardIcon as CreditCardIconSolid
} from '@heroicons/react/24/solid'

const navigationItems = [
  {
    name: '홈',
    href: '/',
    icon: HomeIcon,
    activeIcon: HomeIconSolid,
  },
  {
    name: '학생',
    href: '/students',
    icon: UsersIcon,
    activeIcon: UsersIconSolid,
  },
  {
    name: '출석',
    href: '/attendance',
    icon: CheckCircleIcon,
    activeIcon: CheckCircleIconSolid,
  },
  {
    name: '캘린더',
    href: '/calendar',
    icon: CalendarDaysIcon,
    activeIcon: CalendarDaysIconSolid,
  },
  {
    name: '결제',
    href: '/payments',
    icon: CreditCardIcon,
    activeIcon: CreditCardIconSolid,
  },
]

export default function BottomNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <nav className="bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
      <div className="flex justify-around">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.activeIcon : item.icon

          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-0 transition-colors duration-200 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={item.name}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-pulse' : ''}`} />
              <span className={`text-xs font-medium truncate ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {item.name}
              </span>
              
              {/* 활성 상태 표시 점 */}
              {isActive && (
                <div className="mt-1 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}