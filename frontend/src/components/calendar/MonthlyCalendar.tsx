'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import CalendarDay from './CalendarDay'
import { CalendarDayData } from '@/lib/types'

interface MonthlyCalendarProps {
  currentDate: Date
  calendarData: CalendarDayData[]
  onMonthChange: (direction: 'prev' | 'next') => void
  onDateClick: (date: string) => void
  onTodayClick: () => void
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export default function MonthlyCalendar({
  currentDate,
  calendarData,
  onMonthChange,
  onDateClick,
  onTodayClick
}: MonthlyCalendarProps) {
  const formatMonthYear = (date: Date) => {
    return `${date.getFullYear()}년 ${MONTHS[date.getMonth()]}`
  }

  const isCurrentMonth = () => {
    const today = new Date()
    return currentDate.getFullYear() === today.getFullYear() && 
           currentDate.getMonth() === today.getMonth()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onMonthChange('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="이전 달"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900 min-w-[120px] text-center">
            {formatMonthYear(currentDate)}
          </h2>
          
          <button
            onClick={() => onMonthChange('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="다음 달"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 오늘로 이동 버튼 */}
        {!isCurrentMonth() && (
          <button
            onClick={onTodayClick}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            오늘
          </button>
        )}
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAYS_OF_WEEK.map((day, index) => (
          <div 
            key={day} 
            className={`p-3 text-center text-sm font-medium ${
              index === 0 ? 'text-red-600' : // 일요일
              index === 6 ? 'text-blue-600' : // 토요일
              'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7">
        {calendarData.map((dayData, index) => (
          <CalendarDay
            key={`${dayData.date}-${index}`}
            dayData={dayData}
            onClick={() => onDateClick(dayData.date)}
          />
        ))}
      </div>
    </div>
  )
}