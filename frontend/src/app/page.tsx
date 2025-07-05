'use client'

import { UserGroupIcon, CreditCardIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { AutoFloatingActionButton } from '@/components/ui/FloatingActionButton'
import StatCard from '@/components/dashboard/StatCard'
import TodayOverview from '@/components/dashboard/TodayOverview'
import QuickActions from '@/components/dashboard/QuickActions'

export default function HomePage() {
  // 전체 통계 데이터 (실제로는 API에서 가져올 것)
  const overallStats = [
    { 
      title: '총 학생수', 
      value: '45', 
      icon: <UserGroupIcon className="w-6 h-6" />,
      trend: { value: '+2', type: 'increase' as const },
      subtitle: '활성 학생',
      color: 'blue' as const
    },
    { 
      title: '이번 달 수납', 
      value: '₩2,450,000', 
      icon: <CreditCardIcon className="w-6 h-6" />,
      trend: { value: '+12%', type: 'increase' as const },
      subtitle: '전월 대비',
      color: 'green' as const
    },
    { 
      title: '평균 출석률', 
      value: '87%', 
      icon: <ChartBarIcon className="w-6 h-6" />,
      trend: { value: '+3%', type: 'increase' as const },
      subtitle: '최근 30일',
      color: 'purple' as const
    },
    { 
      title: '오늘 수업', 
      value: '4', 
      icon: <CheckCircleIcon className="w-6 h-6" />,
      trend: { value: '진행중', type: 'neutral' as const },
      subtitle: '예정된 수업',
      color: 'orange' as const
    }
  ]

  return (
    <div className="p-4 space-y-6 pb-6">
      {/* 전체 통계 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">전체 현황</h2>
        <div className="grid grid-cols-2 gap-3">
          {overallStats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              subtitle={stat.subtitle}
              color={stat.color}
            />
          ))}
        </div>
      </div>

      {/* 오늘의 현황 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">오늘의 현황</h2>
        <TodayOverview />
      </div>

      {/* 빠른 작업 */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">빠른 작업</h2>
        <QuickActions />
      </div>


      {/* 페이지별 FAB */}
      <AutoFloatingActionButton />
    </div>
  )
}