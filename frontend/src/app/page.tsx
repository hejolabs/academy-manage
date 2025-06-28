'use client'

import { UserGroupIcon, CalendarIcon, CreditCardIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HomePage() {
  const quickStats = [
    { name: '오늘 출석', value: '23', change: '+2', icon: UserGroupIcon },
    { name: '이번 달 수납', value: '₩2,450,000', change: '+12%', icon: CreditCardIcon },
    { name: '총 학생수', value: '45', change: '+1', icon: UserGroupIcon },
    { name: '출석률', value: '87%', change: '+3%', icon: ChartBarIcon },
  ]

  const quickActions = [
    { name: '학생 관리', href: '/students', icon: UserGroupIcon, color: 'bg-blue-500' },
    { name: '출석 체크', href: '/attendance', icon: CalendarIcon, color: 'bg-green-500' },
    { name: '수납 관리', href: '/payments', icon: CreditCardIcon, color: 'bg-yellow-500' },
    { name: '캘린더', href: '/calendar', icon: CalendarIcon, color: 'bg-purple-500' },
  ]

  return (
    <div className="p-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-600">공부방 관리 현황을 확인하세요</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quickStats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">{stat.name}</p>
              <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <div className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-lg ${action.color} mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-gray-900">{action.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}