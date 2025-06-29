'use client'

import { 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { PaymentStats as PaymentStatsType } from '@/lib/types'

interface PaymentStatsProps {
  stats: PaymentStatsType
  loading?: boolean
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: string
  subtext?: string
}

function StatCard({ title, value, change, changeType, icon: Icon, color, subtext }: StatCardProps) {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600'
      case 'negative':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <ArrowTrendingUpIcon className="w-3 h-3" />
    }
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${getChangeColor()}`}>
            {getChangeIcon()}
            <span>{change}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtext && (
          <p className="text-xs text-gray-500">{subtext}</p>
        )}
      </div>
    </div>
  )
}

export default function PaymentStats({ stats, loading = false }: PaymentStatsProps) {
  if (loading) {
    return <PaymentStatsSkeleton />
  }

  // stats 값들에 대한 안전한 기본값 설정
  const safeStats = {
    monthly_revenue: stats?.monthly_revenue ?? 0,
    active_payments: stats?.active_payments ?? 0,
    average_attendance_rate: stats?.average_attendance_rate ?? 0,
    goal_achievement_rate: stats?.goal_achievement_rate ?? 0,
    total_students: stats?.total_students ?? 0,
    completed_sessions_this_month: stats?.completed_sessions_this_month ?? 0
  }

  // 목표 달성률에 따른 색상
  const getGoalColor = (rate: number) => {
    if (rate >= 100) return 'text-green-600'
    if (rate >= 80) return 'text-blue-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const goalColor = getGoalColor(safeStats.goal_achievement_rate)

  return (
    <div className="space-y-6">
      {/* 주요 통계 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="월간 매출"
          value={`${safeStats.monthly_revenue.toLocaleString()}원`}
          change="+12.5%"
          changeType="positive"
          icon={CurrencyDollarIcon}
          color="bg-green-500"
          subtext="지난달 대비"
        />
        
        <StatCard
          title="활성 결제"
          value={safeStats.active_payments}
          change="+3"
          changeType="positive"
          icon={UserGroupIcon}
          color="bg-blue-500"
          subtext="현재 진행중인 결제"
        />
        
        <StatCard
          title="평균 출석률"
          value={`${safeStats.average_attendance_rate}%`}
          change="+2.1%"
          changeType="positive"
          icon={ChartBarIcon}
          color="bg-purple-500"
          subtext="전체 학생 평균"
        />
        
        <StatCard
          title="목표 달성률"
          value={`${safeStats.goal_achievement_rate}%`}
          change={safeStats.goal_achievement_rate >= 100 ? '목표 달성!' : `${100 - safeStats.goal_achievement_rate}% 남음`}
          changeType={safeStats.goal_achievement_rate >= 100 ? 'positive' : 'neutral'}
          icon={ArrowTrendingUpIcon}
          color="bg-orange-500"
          subtext="월간 매출 목표"
        />
      </div>

      {/* 상세 통계 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 통계</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 학생 관련 통계 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 flex items-center space-x-2">
              <UserGroupIcon className="w-4 h-4" />
              <span>학생 현황</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">총 학생 수</span>
                <span className="font-medium">{safeStats.total_students}명</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">활성 결제 학생</span>
                <span className="font-medium text-green-600">{safeStats.active_payments}명</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">결제율</span>
                <span className="font-medium">
                  {safeStats.total_students > 0 ? Math.round((safeStats.active_payments / safeStats.total_students) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* 수업 관련 통계 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 flex items-center space-x-2">
              <CheckCircleIcon className="w-4 h-4" />
              <span>수업 현황</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">이번 달 완료 수업</span>
                <span className="font-medium">{safeStats.completed_sessions_this_month}회</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">평균 출석률</span>
                <span className={`font-medium ${
                  safeStats.average_attendance_rate >= 90 ? 'text-green-600' : 
                  safeStats.average_attendance_rate >= 80 ? 'text-blue-600' : 
                  'text-yellow-600'
                }`}>
                  {safeStats.average_attendance_rate}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">학생당 평균 수업</span>
                <span className="font-medium">
                  {safeStats.active_payments > 0 
                    ? Math.round(safeStats.completed_sessions_this_month / safeStats.active_payments * 10) / 10
                    : 0
                  }회
                </span>
              </div>
            </div>
          </div>

          {/* 매출 관련 통계 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 flex items-center space-x-2">
              <CurrencyDollarIcon className="w-4 h-4" />
              <span>매출 현황</span>
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">월간 매출</span>
                <span className="font-medium text-green-600">
                  {safeStats.monthly_revenue.toLocaleString()}원
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">학생당 평균 매출</span>
                <span className="font-medium">
                  {safeStats.active_payments > 0 
                    ? Math.round(safeStats.monthly_revenue / safeStats.active_payments).toLocaleString()
                    : 0
                  }원
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">목표 달성률</span>
                <span className={`font-medium ${goalColor}`}>
                  {safeStats.goal_achievement_rate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 목표 달성률 진행바 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">월간 목표 달성률</span>
            <span className={`text-sm font-bold ${goalColor}`}>
              {safeStats.goal_achievement_rate}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                safeStats.goal_achievement_rate >= 100 ? 'bg-green-500' :
                safeStats.goal_achievement_rate >= 80 ? 'bg-blue-500' :
                safeStats.goal_achievement_rate >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ 
                width: `${Math.min(safeStats.goal_achievement_rate, 100)}%` 
              }}
            />
          </div>
          
          {safeStats.goal_achievement_rate >= 100 && (
            <div className="mt-2 text-sm text-green-600 font-medium flex items-center space-x-1">
              <CheckCircleIcon className="w-4 h-4" />
              <span>🎉 이번 달 목표를 달성했습니다!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 로딩 스켈레톤
export function PaymentStatsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* 주요 통계 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 통계 스켈레톤 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="w-24 h-5 bg-gray-200 rounded"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    <div className="w-12 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}