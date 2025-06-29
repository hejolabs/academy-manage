'use client'

import { useState, useEffect, useCallback } from 'react'
import { CalendarDaysIcon, BellIcon, ClockIcon } from '@heroicons/react/24/outline'
import MonthlyCalendar from '@/components/calendar/MonthlyCalendar'
import CalendarLegend from '@/components/calendar/CalendarLegend'
import UpcomingEvents from '@/components/calendar/UpcomingEvents'
import DayDetailModal from '@/components/calendar/DayDetailModal'
import { CalendarEvent, CalendarDayData, SessionProgress } from '@/lib/types'
import { api } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface CalendarFilters {
  showSessionComplete: boolean
  showPaymentExpire: boolean
  showClassDays: boolean
  showHolidays: boolean
}

export default function CalendarPage() {
  // State
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarDayData[]>([])
  const [sessionProgress, setSessionProgress] = useState<SessionProgress[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [filters, setFilters] = useState<CalendarFilters>({
    showSessionComplete: true,
    showPaymentExpire: true,
    showClassDays: true,
    showHolidays: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 날짜 유틸리티
  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getMonthRange = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    return {
      start: formatDateString(startDate),
      end: formatDateString(endDate)
    }
  }

  // 8회차 완료일 계산 로직
  const calculateSessionCompletionDate = (
    startDate: string,
    completedSessions: number,
    totalSessions: number,
    attendancePattern: number[] = [1, 3, 5] // 월, 수, 금 (기본값)
  ): string => {
    const remainingSessions = totalSessions - completedSessions
    if (remainingSessions <= 0) return startDate

    const start = new Date(startDate)
    let sessionsAdded = 0
    let currentDate = new Date(start)

    while (sessionsAdded < remainingSessions) {
      currentDate.setDate(currentDate.getDate() + 1)
      const dayOfWeek = currentDate.getDay()
      
      if (attendancePattern.includes(dayOfWeek)) {
        sessionsAdded++
      }
    }

    return formatDateString(currentDate)
  }

  // 데이터 로드
  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { start, end } = getMonthRange(currentDate)
      console.log('캘린더 데이터 로드:', { start, end })

      // API 호출들을 병렬로 실행
      const [studentsRes, paymentsRes, attendanceRes] = await Promise.all([
        api.getStudents({ is_active: true }),
        api.getPayments({ expires_within_days: 30 }),
        api.getAttendance({ start_date: start, end_date: end, limit: 500 })
      ])

      console.log('API 응답들:', { studentsRes, paymentsRes, attendanceRes })

      if (!studentsRes.success) {
        throw new Error(studentsRes.error || '학생 목록을 불러올 수 없습니다.')
      }

      const students = studentsRes.data?.students || []
      const payments = paymentsRes.success ? (paymentsRes.data || []) : []
      const attendanceRecords = attendanceRes.success ? (attendanceRes.data || []) : []

      // 8회차 진행상황 계산
      const sessionProgressData: SessionProgress[] = students.map((student: any) => {
        const studentPayments = payments.filter((p: any) => p.student_id === student.id && p.is_active)
        const studentAttendance = attendanceRecords.filter((a: any) => 
          a.student_id === student.id && a.status === 'present'
        )

        const totalSessions = 8 // 기본 8회차
        const completedSessions = studentAttendance.length
        const paymentEndDate = studentPayments.length > 0 ? studentPayments[0].end_date : ''
        
        const estimatedCompletionDate = calculateSessionCompletionDate(
          formatDateString(new Date()),
          completedSessions,
          totalSessions
        )

        return {
          studentId: student.id,
          studentName: student.name,
          totalSessions,
          completedSessions,
          estimatedCompletionDate,
          paymentEndDate
        }
      })

      setSessionProgress(sessionProgressData)

      // 캘린더 이벤트 생성
      const events: CalendarEvent[] = []
      let eventId = 1

      // 8회차 완료 예정일 이벤트
      sessionProgressData.forEach(progress => {
        if (progress.completedSessions < progress.totalSessions) {
          events.push({
            id: eventId++,
            title: `${progress.studentName} 8회차 완료 예정`,
            date: progress.estimatedCompletionDate,
            type: 'session_complete',
            studentId: progress.studentId,
            studentName: progress.studentName,
            priority: 'high'
          })
        }
      })

      // 결제 만료일 이벤트
      payments.forEach((payment: any) => {
        if (payment.is_active && payment.end_date) {
          const student = students.find((s: any) => s.id === payment.student_id)
          events.push({
            id: eventId++,
            title: `${student?.name || 'Unknown'} 결제 만료`,
            date: payment.end_date,
            type: 'payment_expire',
            studentId: payment.student_id,
            studentName: student?.name,
            priority: 'high'
          })
        }
      })

      // 수업일 이벤트 (월, 수, 금 기본)
      const classDate = new Date(start)
      const endDateObj = new Date(end)
      while (classDate <= endDateObj) {
        const dayOfWeek = classDate.getDay()
        if ([1, 3, 5].includes(dayOfWeek)) { // 월, 수, 금
          events.push({
            id: eventId++,
            title: '정규 수업',
            date: formatDateString(classDate),
            type: 'class_day',
            priority: 'low'
          })
        }
        classDate.setDate(classDate.getDate() + 1)
      }

      // 캘린더 데이터 생성
      const calendarDays: CalendarDayData[] = []
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      const calendarStart = new Date(monthStart)
      calendarStart.setDate(calendarStart.getDate() - monthStart.getDay()) // 주의 시작일로 조정

      for (let i = 0; i < 42; i++) { // 6주 × 7일
        const date = new Date(calendarStart)
        date.setDate(date.getDate() + i)
        const dateString = formatDateString(date)
        
        const dayEvents = events.filter(event => event.date === dateString)
        
        calendarDays.push({
          date: dateString,
          events: dayEvents,
          hasClass: dayEvents.some(e => e.type === 'class_day'),
          hasSessionComplete: dayEvents.some(e => e.type === 'session_complete'),
          hasPaymentExpire: dayEvents.some(e => e.type === 'payment_expire'),
          isToday: dateString === formatDateString(new Date()),
          isCurrentMonth: date.getMonth() === currentDate.getMonth()
        })
      }

      setCalendarData(calendarDays)

      // 다가오는 이벤트 (7일 이내)
      const today = new Date()
      const weekFromNow = new Date()
      weekFromNow.setDate(today.getDate() + 7)
      
      const upcomingEventsData = events.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= today && eventDate <= weekFromNow && 
               (event.type === 'session_complete' || event.type === 'payment_expire')
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setUpcomingEvents(upcomingEventsData)

    } catch (err) {
      console.error('캘린더 데이터 로드 실패:', err)
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  useEffect(() => {
    loadCalendarData()
  }, [loadCalendarData])

  // 월 변경 핸들러
  const handleMonthChange = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  // 오늘로 이동
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (date: string) => {
    setSelectedDate(date)
  }

  // 필터 변경 핸들러
  const handleFilterChange = (filterKey: keyof CalendarFilters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }))
  }

  // 필터된 캘린더 데이터
  const filteredCalendarData = calendarData.map(day => ({
    ...day,
    events: day.events.filter(event => {
      switch (event.type) {
        case 'session_complete':
          return filters.showSessionComplete
        case 'payment_expire':
          return filters.showPaymentExpire
        case 'class_day':
          return filters.showClassDays
        case 'holiday':
          return filters.showHolidays
        default:
          return true
      }
    })
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">캘린더</h1>
          <p className="text-gray-600 mt-1">8회차 트래킹 및 일정 관리</p>
        </div>
        <div className="flex items-center space-x-2">
          <CalendarDaysIcon className="w-8 h-8 text-blue-600" />
          {upcomingEvents.length > 0 && (
            <div className="relative">
              <BellIcon className="w-6 h-6 text-orange-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                {upcomingEvents.length}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button
              onClick={loadCalendarData}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 필터 및 범례 */}
      <CalendarLegend 
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* 다가오는 중요 일정 */}
      {upcomingEvents.length > 0 && (
        <UpcomingEvents events={upcomingEvents} />
      )}

      {/* 월간 캘린더 */}
      <MonthlyCalendar
        currentDate={currentDate}
        calendarData={filteredCalendarData}
        onMonthChange={handleMonthChange}
        onDateClick={handleDateClick}
        onTodayClick={goToToday}
      />

      {/* 날짜 상세 모달 */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          dayData={calendarData.find(day => day.date === selectedDate)}
          sessionProgress={sessionProgress}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}