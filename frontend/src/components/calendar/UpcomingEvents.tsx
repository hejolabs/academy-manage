'use client'

import { BellIcon, ClockIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { CalendarEvent } from '@/lib/types'

interface UpcomingEventsProps {
  events: CalendarEvent[]
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  // 이벤트를 타입별로 그룹화
  const sessionCompleteEvents = events.filter(e => e.type === 'session_complete')
  const paymentExpireEvents = events.filter(e => e.type === 'payment_expire')

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '내일'
    if (diffDays < 0) return `${Math.abs(diffDays)}일 지남`
    
    return `${diffDays}일 후`
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'session_complete':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'payment_expire':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />
    }
  }

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'session_complete':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'payment_expire':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyLevel = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) return 'overdue'
    if (diffDays <= 1) return 'urgent'
    if (diffDays <= 3) return 'soon'
    return 'normal'
  }

  if (events.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* 헤더 */}
      <div className="flex items-center space-x-2 mb-4">
        <BellIcon className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">
          다가오는 중요 일정
        </h3>
        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
          {events.length}건
        </span>
      </div>

      {/* 8회차 완료 예정 */}
      {sessionCompleteEvents.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
            <h4 className="font-medium text-green-900">8회차 완료 예정</h4>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {sessionCompleteEvents.length}명
            </span>
          </div>
          
          <div className="space-y-2">
            {sessionCompleteEvents.map((event) => {
              const urgency = getUrgencyLevel(event.date)
              
              return (
                <div
                  key={event.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${urgency === 'urgent' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {getEventIcon(event.type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {event.studentName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatFullDate(event.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`
                      text-xs font-medium px-2 py-1 rounded-full border
                      ${urgency === 'urgent' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                      }
                    `}>
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 결제 만료 예정 */}
      {paymentExpireEvents.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
            <h4 className="font-medium text-red-900">결제 만료 예정</h4>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              {paymentExpireEvents.length}명
            </span>
          </div>
          
          <div className="space-y-2">
            {paymentExpireEvents.map((event) => {
              const urgency = getUrgencyLevel(event.date)
              
              return (
                <div
                  key={event.id}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border
                    ${urgency === 'urgent' || urgency === 'overdue'
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {getEventIcon(event.type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {event.studentName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatFullDate(event.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`
                      text-xs font-medium px-2 py-1 rounded-full border
                      ${urgency === 'overdue'
                        ? 'bg-red-200 text-red-900 border-red-300' 
                        : urgency === 'urgent'
                        ? 'bg-red-100 text-red-800 border-red-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                      }
                    `}>
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            전체 일정 보기
          </button>
          <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            알림 설정
          </button>
        </div>
      </div>
    </div>
  )
}