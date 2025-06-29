'use client'

import { useState } from 'react'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline'

interface DatePickerProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  className?: string
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토']
const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

export default function DatePicker({ selectedDate, onDateChange, className = '' }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date(selectedDate))

  const today = new Date()
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString()
  }

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString()
  }

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dayOfWeek = DAYS_OF_WEEK[date.getDay()]
    return `${month}월 ${day}일 (${dayOfWeek})`
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    onDateChange(newDate)
  }

  const navigateCalendarMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setCalendarDate(newDate)
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    
    // 월요일부터 시작하도록 조정
    const firstDayOfWeek = firstDay.getDay()
    startDate.setDate(startDate.getDate() - firstDayOfWeek)

    const days = []
    const currentDate = new Date(startDate)
    
    // 6주 * 7일 = 42일 표시
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  const handleDateSelect = (date: Date) => {
    onDateChange(date)
    setShowCalendar(false)
  }

  const handleTodayClick = () => {
    onDateChange(new Date())
    setShowCalendar(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* 날짜 선택 헤더 */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </div>
            {isToday(selectedDate) && (
              <div className="text-xs text-blue-600 font-medium">오늘</div>
            )}
          </div>
        </button>

        <button
          onClick={() => navigateDate('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 달력 팝업 */}
      {showCalendar && (
        <>
          {/* 배경 오버레이 */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => setShowCalendar(false)}
          />
          
          {/* 달력 모달 */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-4">
            {/* 달력 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateCalendarMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              
              <h3 className="font-semibold text-gray-900">
                {calendarDate.getFullYear()}년 {MONTHS[calendarDate.getMonth()]}
              </h3>
              
              <button
                onClick={() => navigateCalendarMonth('next')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(calendarDate).map((date, index) => {
                const isCurrentMonth = date.getMonth() === calendarDate.getMonth()
                const isSelected = isSameDate(date, selectedDate)
                const isTodayDate = isToday(date)
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`
                      p-2 text-sm rounded-lg transition-colors relative
                      ${isCurrentMonth 
                        ? 'text-gray-900 hover:bg-blue-50' 
                        : 'text-gray-300'
                      }
                      ${isSelected 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : ''
                      }
                      ${isTodayDate && !isSelected 
                        ? 'bg-blue-100 text-blue-600 font-medium' 
                        : ''
                      }
                    `}
                  >
                    {date.getDate()}
                    {isTodayDate && !isSelected && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 오늘 버튼 */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={handleTodayClick}
                className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                오늘로 이동
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// 로딩 스켈레톤
export function DatePickerSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="w-32 h-6 bg-gray-200 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  )
}