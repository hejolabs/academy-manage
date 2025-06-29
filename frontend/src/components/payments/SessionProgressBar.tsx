'use client'

import { CheckIcon } from '@heroicons/react/24/outline'

interface SessionProgressBarProps {
  totalSessions: number
  completedSessions: number
  size?: 'sm' | 'md' | 'lg'
  showNumbers?: boolean
  showPercentage?: boolean
  animated?: boolean
}

export default function SessionProgressBar({ 
  totalSessions = 8, 
  completedSessions = 0, 
  size = 'md',
  showNumbers = true,
  showPercentage = true,
  animated = true
}: SessionProgressBarProps) {
  const percentage = Math.round((completedSessions / totalSessions) * 100)
  const isCompleted = completedSessions >= totalSessions

  // 크기별 스타일
  const sizeClasses = {
    sm: {
      segment: 'w-6 h-2',
      gap: 'space-x-1',
      text: 'text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      segment: 'w-8 h-3',
      gap: 'space-x-1.5',
      text: 'text-sm',
      icon: 'w-4 h-4'
    },
    lg: {
      segment: 'w-12 h-4',
      gap: 'space-x-2',
      text: 'text-base',
      icon: 'w-5 h-5'
    }
  }

  const styles = sizeClasses[size]

  // 세그먼트 배열 생성
  const segments = Array.from({ length: totalSessions }, (_, index) => {
    const sessionNumber = index + 1
    const isCompleted = sessionNumber <= completedSessions
    const isCurrent = sessionNumber === completedSessions + 1 && completedSessions < totalSessions

    return {
      number: sessionNumber,
      isCompleted,
      isCurrent
    }
  })

  return (
    <div className="space-y-3">
      {/* 진행도 정보 */}
      {(showNumbers || showPercentage) && (
        <div className="flex items-center justify-between">
          {showNumbers && (
            <div className={`font-medium ${styles.text} ${
              isCompleted ? 'text-green-600' : 'text-gray-900'
            }`}>
              {completedSessions}/{totalSessions}회 완료
            </div>
          )}
          
          {showPercentage && (
            <div className={`font-semibold ${styles.text} ${
              isCompleted ? 'text-green-600' : 'text-blue-600'
            }`}>
              {percentage}%
            </div>
          )}
        </div>
      )}

      {/* 세그먼트 진행바 */}
      <div className={`flex items-center ${styles.gap}`}>
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`
              relative ${styles.segment} rounded-full border-2 transition-all duration-300
              ${animated ? 'transform hover:scale-110' : ''}
              ${segment.isCompleted 
                ? 'bg-green-500 border-green-500' 
                : segment.isCurrent
                ? 'bg-blue-100 border-blue-400 animate-pulse'
                : 'bg-gray-100 border-gray-200'
              }
            `}
            title={`${segment.number}회차${segment.isCompleted ? ' (완료)' : segment.isCurrent ? ' (진행중)' : ''}`}
          >
            {/* 완료 표시 */}
            {segment.isCompleted && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckIcon className={`${styles.icon} text-white`} />
              </div>
            )}
            
            {/* 현재 진행중 표시 */}
            {segment.isCurrent && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              </div>
            )}
            
            {/* 세션 번호 (작은 크기일 때만) */}
            {size === 'lg' && !segment.isCompleted && !segment.isCurrent && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-500">
                  {segment.number}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 완료 메시지 */}
      {isCompleted && (
        <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
          <CheckIcon className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            🎉 8회차 모든 수업을 완료했습니다!
          </span>
        </div>
      )}
      
      {/* 진행 상태 메시지 */}
      {!isCompleted && completedSessions > 0 && (
        <div className="text-xs text-gray-600">
          {totalSessions - completedSessions}회 남았습니다
          {completedSessions >= 6 && (
            <span className="ml-1 text-orange-600 font-medium">
              (완료 임박!)
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// 로딩 스켈레톤
export function SessionProgressBarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-6 h-2',
    md: 'w-8 h-3', 
    lg: 'w-12 h-4'
  }

  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
      <div className={`flex space-x-1.5`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className={`${sizeClasses[size]} bg-gray-200 rounded-full`}
          />
        ))}
      </div>
    </div>
  )
}