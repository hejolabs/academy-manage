'use client'

import { CalendarDayData } from '@/lib/types'

interface CalendarDayProps {
  dayData: CalendarDayData
  onClick: () => void
}

export default function CalendarDay({ dayData, onClick }: CalendarDayProps) {
  const { date, events, hasClass, hasSessionComplete, hasPaymentExpire, isToday, isCurrentMonth } = dayData
  
  const dayNumber = new Date(date).getDate()
  const dayOfWeek = new Date(date).getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // 이벤트 우선순위에 따른 색상 결정
  const getBackgroundColor = () => {
    if (hasSessionComplete) return 'bg-green-50 border-green-200'
    if (hasPaymentExpire) return 'bg-red-50 border-red-200'
    if (hasClass) return 'bg-blue-50 border-blue-200'
    return 'bg-white border-gray-200'
  }

  const getDateColor = () => {
    if (!isCurrentMonth) return 'text-gray-300'
    if (isToday) return 'text-white'
    if (isWeekend) {
      if (dayOfWeek === 0) return 'text-red-600' // 일요일
      return 'text-blue-600' // 토요일
    }
    return 'text-gray-900'
  }

  const getEventDots = () => {
    const dots = []
    const maxDots = 3
    
    // 우선순위별로 이벤트 정렬
    const sortedEvents = [...events].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority || 'low'] - priorityOrder[b.priority || 'low']
    })

    sortedEvents.slice(0, maxDots).forEach((event, index) => {
      let color = 'bg-gray-400'
      
      switch (event.type) {
        case 'session_complete':
          color = 'bg-green-500'
          break
        case 'payment_expire':
          color = 'bg-red-500'
          break
        case 'class_day':
          color = 'bg-blue-500'
          break
        case 'holiday':
          color = 'bg-orange-500'
          break
      }

      dots.push(
        <div
          key={`${event.id}-${index}`}
          className={`w-1.5 h-1.5 rounded-full ${color}`}
          title={event.title}
        />
      )
    })

    // 더 많은 이벤트가 있으면 +표시
    if (events.length > maxDots) {
      dots.push(
        <div
          key="more"
          className="text-xs text-gray-500 font-medium"
          title={`${events.length - maxDots}개 더`}
        >
          +{events.length - maxDots}
        </div>
      )
    }

    return dots
  }

  return (
    <button
      onClick={onClick}
      className={`
        min-h-[80px] p-2 border-b border-r transition-all duration-200 text-left
        hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
        ${getBackgroundColor()}
        ${events.length > 0 ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      {/* 날짜 숫자 */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`
            text-sm font-medium flex items-center justify-center
            ${isToday 
              ? 'bg-blue-600 text-white rounded-full w-6 h-6' 
              : getDateColor()
            }
          `}
        >
          {dayNumber}
        </span>
        
        {/* 긴급 알림 표시 */}
        {(hasSessionComplete || hasPaymentExpire) && (
          <div className="flex space-x-1">
            {hasSessionComplete && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="8회차 완료 예정" />
            )}
            {hasPaymentExpire && (
              <div className="w-2 h-2 bg-red-500 rounded-full" title="결제 만료 예정" />
            )}
          </div>
        )}
      </div>

      {/* 이벤트 표시 */}
      {events.length > 0 && (
        <div className="space-y-1">
          {/* 주요 이벤트 1개 텍스트로 표시 (모바일) */}
          {events.length === 1 && (
            <div className="text-xs text-gray-700 truncate">
              {events[0].title}
            </div>
          )}
          
          {/* 여러 이벤트일 때 점으로 표시 */}
          {events.length > 1 && (
            <div className="flex items-center space-x-1 flex-wrap">
              {getEventDots()}
            </div>
          )}
          
          {/* 긴급 이벤트 텍스트 (우선 표시) */}
          {(hasSessionComplete || hasPaymentExpire) && events.length > 1 && (
            <div className="text-xs font-medium">
              {hasSessionComplete && (
                <div className="text-green-700 truncate">8회차 완료</div>
              )}
              {hasPaymentExpire && (
                <div className="text-red-700 truncate">결제 만료</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 수업일 표시 (이벤트가 없을 때만) */}
      {events.length === 0 && hasClass && (
        <div className="text-xs text-blue-600">수업</div>
      )}
    </button>
  )
}