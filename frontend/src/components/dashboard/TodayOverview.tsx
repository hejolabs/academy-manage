'use client'

import { useState, useEffect } from 'react'
import { 
  UserGroupIcon, 
  CheckCircleIcon, 
  ClockIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline'
import { MiniStatCard } from './StatCard'
import { InlineLoader } from '@/components/ui/LoadingSpinner'

interface TodayStats {
  expectedStudents: number
  presentStudents: number
  lateStudents: number
  absentStudents: number
  attendanceRate: number
}

interface TodaySchedule {
  id: number
  time: string
  subject: string
  studentCount: number
  status: 'upcoming' | 'ongoing' | 'completed'
}

// 목업 데이터 (실제로는 API에서 가져올 것)
const mockTodayStats: TodayStats = {
  expectedStudents: 28,
  presentStudents: 23,
  lateStudents: 2,
  absentStudents: 3,
  attendanceRate: 89.3
}

const mockTodaySchedule: TodaySchedule[] = [
  { id: 1, time: '15:00', subject: '중학 수학', studentCount: 12, status: 'upcoming' },
  { id: 2, time: '16:30', subject: '고등 영어', studentCount: 8, status: 'upcoming' },
  { id: 3, time: '18:00', subject: '중학 영어', studentCount: 10, status: 'upcoming' },
  { id: 4, time: '19:30', subject: '고등 수학', studentCount: 6, status: 'upcoming' },
]

export default function TodayOverview() {
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null)
  const [todaySchedule, setTodaySchedule] = useState<TodaySchedule[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 실제로는 API 호출
    const fetchTodayData = async () => {
      try {
        // TODO: API 호출로 교체
        // const response = await fetch('/api/attendance/today')
        // const data = await response.json()
        
        // 목업 데이터 사용
        setTimeout(() => {
          setTodayStats(mockTodayStats)
          setTodaySchedule(mockTodaySchedule)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Failed to fetch today data:', error)
        setLoading(false)
      }
    }

    fetchTodayData()
  }, [])

  const getScheduleStatusColor = (status: TodaySchedule['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'ongoing':
        return 'bg-blue-100 text-blue-800'
      case 'upcoming':
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScheduleStatusText = (status: TodaySchedule['status']) => {
    switch (status) {
      case 'completed':
        return '완료'
      case 'ongoing':
        return '진행중'
      case 'upcoming':
        return '예정'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <InlineLoader text="오늘의 현황을 불러오는 중..." />
        </div>
      </div>
    )
  }

  if (!todayStats) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-center text-gray-500">데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 출석률 진행바 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">오늘의 출석률</h3>
          <span className="text-2xl font-bold text-blue-600">
            {todayStats.attendanceRate}%
          </span>
        </div>
        
        {/* 진행바 */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${todayStats.attendanceRate}%` }}
            />
          </div>
        </div>

        {/* 상세 통계 */}
        <div className="grid grid-cols-2 gap-3">
          <MiniStatCard
            title="출석"
            value={todayStats.presentStudents}
            icon={<CheckCircleIcon className="w-4 h-4" />}
            color="green"
          />
          <MiniStatCard
            title="지각"
            value={todayStats.lateStudents}
            icon={<ClockIcon className="w-4 h-4" />}
            color="orange"
          />
        </div>

        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600">
            총 <span className="font-semibold">{todayStats.expectedStudents}</span>명 중{' '}
            <span className="font-semibold text-green-600">{todayStats.presentStudents}</span>명 출석
            {todayStats.absentStudents > 0 && (
              <>, <span className="font-semibold text-red-600">{todayStats.absentStudents}</span>명 결석</>
            )}
          </p>
        </div>
      </div>

      {/* 오늘의 수업 일정 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">오늘의 수업</h3>
        </div>

        {todaySchedule.length === 0 ? (
          <p className="text-center text-gray-500 py-4">오늘 예정된 수업이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {todaySchedule.map((schedule) => (
              <div 
                key={schedule.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-900">
                      {schedule.time}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{schedule.subject}</p>
                    <p className="text-sm text-gray-600">
                      {schedule.studentCount}명
                    </p>
                  </div>
                </div>
                
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${getScheduleStatusColor(schedule.status)}
                `}>
                  {getScheduleStatusText(schedule.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}