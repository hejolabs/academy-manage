'use client'

import { UserGroupIcon, CalendarIcon, CreditCardIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { AutoFloatingActionButton } from '@/components/ui/FloatingActionButton'

export default function HomePage() {
  const quickStats = [
    { name: '오늘 출석', value: '23', change: '+2', icon: CheckCircleIcon, color: 'text-green-600' },
    { name: '이번 달 수납', value: '₩2,450,000', change: '+12%', icon: CreditCardIcon, color: 'text-blue-600' },
    { name: '총 학생수', value: '45', change: '+1', icon: UserGroupIcon, color: 'text-purple-600' },
    { name: '출석률', value: '87%', change: '+3%', icon: ChartBarIcon, color: 'text-orange-600' },
  ]

  const quickActions = [
    { name: '학생 관리', href: '/students', icon: UserGroupIcon, color: 'bg-blue-500' },
    { name: '출석 체크', href: '/attendance', icon: CheckCircleIcon, color: 'bg-green-500' },
    { name: '결제 관리', href: '/payments', icon: CreditCardIcon, color: 'bg-orange-500' },
    { name: '캘린더', href: '/calendar', icon: CalendarIcon, color: 'bg-purple-500' },
  ]

  const recentActivities = [
    { type: '출석', message: '김민수 학생이 출석했습니다', time: '5분 전' },
    { type: '결제', message: '이영희 학생 8회차 결제 완료', time: '1시간 전' },
    { type: '출석', message: '박철수 학생이 지각했습니다', time: '2시간 전' },
  ]

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3">
        {quickStats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium">{stat.change}</p>
              </div>
              <div className={`p-2 rounded-lg bg-gray-50`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 빠른 작업 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">빠른 작업</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.name} href={action.href}>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 active:scale-95">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${action.color} shadow-sm`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{action.name}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 최근 활동 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">최근 활동</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {recentActivities.map((activity, index) => (
            <div 
              key={index}
              className={`p-4 flex items-center space-x-3 ${
                index !== recentActivities.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                activity.type === '출석' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 페이지별 FAB */}
      <AutoFloatingActionButton />
    </div>
  )
}