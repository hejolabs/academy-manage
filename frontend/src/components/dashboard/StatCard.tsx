import { ReactNode } from 'react'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/outline'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  subtitle?: string
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  onClick?: () => void
  className?: string
}

const colorClasses = {
  blue: {
    icon: 'text-blue-600 bg-blue-50',
    trend: {
      increase: 'text-green-600 bg-green-50',
      decrease: 'text-red-600 bg-red-50',
      neutral: 'text-gray-600 bg-gray-50',
    }
  },
  green: {
    icon: 'text-green-600 bg-green-50',
    trend: {
      increase: 'text-green-600 bg-green-50',
      decrease: 'text-red-600 bg-red-50',
      neutral: 'text-gray-600 bg-gray-50',
    }
  },
  orange: {
    icon: 'text-orange-600 bg-orange-50',
    trend: {
      increase: 'text-green-600 bg-green-50',
      decrease: 'text-red-600 bg-red-50',
      neutral: 'text-gray-600 bg-gray-50',
    }
  },
  purple: {
    icon: 'text-purple-600 bg-purple-50',
    trend: {
      increase: 'text-green-600 bg-green-50',
      decrease: 'text-red-600 bg-red-50',
      neutral: 'text-gray-600 bg-gray-50',
    }
  },
  red: {
    icon: 'text-red-600 bg-red-50',
    trend: {
      increase: 'text-green-600 bg-green-50',
      decrease: 'text-red-600 bg-red-50',
      neutral: 'text-gray-600 bg-gray-50',
    }
  },
}

const getTrendIcon = (type: 'increase' | 'decrease' | 'neutral') => {
  switch (type) {
    case 'increase':
      return <ArrowUpIcon className="w-3 h-3" />
    case 'decrease':
      return <ArrowDownIcon className="w-3 h-3" />
    case 'neutral':
      return <MinusIcon className="w-3 h-3" />
  }
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  color = 'blue',
  onClick,
  className = ''
}: StatCardProps) {
  const CardWrapper = onClick ? 'button' : 'div'
  
  return (
    <CardWrapper
      onClick={onClick}
      className={`
        bg-white rounded-xl p-4 shadow-sm border border-gray-100
        ${onClick ? 'hover:shadow-md transition-all duration-200 active:scale-95 w-full text-left' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        {/* 왼쪽: 아이콘과 텍스트 */}
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${colorClasses[color].icon}`}>
              {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-600 truncate">
              {title}
            </h3>
          </div>
          
          <div className="space-y-1">
            <p className="text-2xl font-bold text-gray-900">
              {value}
            </p>
            
            {subtitle && (
              <p className="text-xs text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 오른쪽: 트렌드 */}
        {trend && (
          <div className={`
            flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
            ${colorClasses[color].trend[trend.type]}
          `}>
            {getTrendIcon(trend.type)}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </CardWrapper>
  )
}

// 미니 스탯 카드 (더 작은 크기)
export function MiniStatCard({
  title,
  value,
  icon,
  color = 'blue',
  onClick
}: Pick<StatCardProps, 'title' | 'value' | 'icon' | 'color' | 'onClick'>) {
  const CardWrapper = onClick ? 'button' : 'div'

  return (
    <CardWrapper
      onClick={onClick}
      className={`
        bg-white rounded-lg p-3 shadow-sm border border-gray-100
        ${onClick ? 'hover:shadow-md transition-all duration-200 active:scale-95 w-full text-left' : ''}
      `}
    >
      <div className="flex items-center space-x-2">
        <div className={`p-1.5 rounded ${colorClasses[color].icon}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-600 truncate">{title}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </CardWrapper>
  )
}

// 로딩 스켈레톤
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>

        <div className="h-6 bg-gray-200 rounded-full w-12"></div>
      </div>
    </div>
  )
}