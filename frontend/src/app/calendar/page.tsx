'use client'

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  const events = [
    { date: '2024-06-28', type: 'holiday', title: '여름휴가' },
    { date: '2024-06-30', type: 'exam', title: '중간고사' },
    { date: '2024-07-01', type: 'event', title: '학부모 상담' },
  ]
  
  const getEventForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return events.find(event => event.date === dateStr)
  }
  
  const getEventColor = (type: string) => {
    switch (type) {
      case 'holiday': return 'bg-red-100 text-red-800'
      case 'exam': return 'bg-blue-100 text-blue-800'
      case 'event': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">캘린더</h1>
          <div className="flex items-center space-x-2">
            <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[120px] text-center">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const event = getEventForDate(day)
            return (
              <div key={day.toString()} className="min-h-[60px] p-1">
                <div className={`text-center text-sm mb-1 ${
                  !isSameMonth(day, currentDate) 
                    ? 'text-gray-300' 
                    : isToday(day)
                    ? 'bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                    : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
                {event && (
                  <div className={`text-xs p-1 rounded text-center ${getEventColor(event.type)}`}>
                    {event.title}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">이번 달 일정</h3>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${
                event.type === 'holiday' ? 'bg-red-500' :
                event.type === 'exam' ? 'bg-blue-500' : 'bg-green-500'
              }`}></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-600">{event.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}