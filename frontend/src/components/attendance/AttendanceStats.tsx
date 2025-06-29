'use client'

import { useMemo } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { AttendanceStatus } from './AttendanceItem'

interface AttendanceRecord {
  id?: number
  student_id: number
  date: string
  status: AttendanceStatus
  time_in?: string
  time_out?: string
  note?: string
}

interface Student {
  id: number
  name: string
  grade?: string
  subjects?: string[]
  schedule?: {
    [key: string]: string
  }
}

interface AttendanceStatsProps {
  students: Student[]
  attendanceRecords: AttendanceRecord[]
  selectedDate: Date
  activeTimeSlot: 'morning' | 'afternoon' | 'evening' | 'all'
  className?: string
}

interface StatsData {
  total: number
  present: number
  absent: number
  late: number
  early_leave: number
  not_checked: number
  attendance_rate: number
}

const statusConfig = {
  present: {
    label: '출석',
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    emoji: '✅'
  },
  absent: {
    label: '결석',
    icon: XCircleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emoji: '❌'
  },
  late: {
    label: '지각',
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    emoji: '🟡'
  },
  early_leave: {
    label: '조퇴',
    icon: ExclamationTriangleIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    emoji: '🟠'
  },
  not_checked: {
    label: '미체크',
    icon: UserGroupIcon,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    emoji: '⚪'
  }
}

export default function AttendanceStats({
  students,
  attendanceRecords,
  selectedDate,
  activeTimeSlot,
  className = ''
}: AttendanceStatsProps) {
  
  // 시간대별 필터링된 학생 계산
  const filteredStudents = useMemo(() => {
    if (activeTimeSlot === 'all') return students

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayKey = dayNames[selectedDate.getDay()]

    return students.filter(student => {
      const scheduleTime = student.schedule?.[todayKey]
      if (!scheduleTime) return false

      const time = scheduleTime.replace(':', '')
      const timeNum = parseInt(time)

      switch (activeTimeSlot) {
        case 'morning':
          return timeNum >= 600 && timeNum < 1200
        case 'afternoon':
          return timeNum >= 1200 && timeNum < 1800
        case 'evening':
          return timeNum >= 1800 && timeNum <= 2359
        default:
          return false
      }
    })
  }, [students, selectedDate, activeTimeSlot])

  // 통계 계산
  const stats: StatsData = useMemo(() => {
    const filteredStudentIds = new Set(filteredStudents.map(s => s.id))
    const relevantRecords = attendanceRecords.filter(record => 
      filteredStudentIds.has(record.student_id)
    )

    const stats = {
      total: filteredStudents.length,
      present: 0,
      absent: 0,
      late: 0,
      early_leave: 0,
      not_checked: 0,
      attendance_rate: 0
    }

    // 기본적으로 모든 학생은 미체크 상태
    stats.not_checked = stats.total

    // 출석 기록이 있는 학생들의 상태 업데이트
    relevantRecords.forEach(record => {
      if (record.status !== 'not_checked') {
        stats.not_checked--
        stats[record.status]++
      }
    })

    // 출석률 계산 (출석 + 지각 + 조퇴를 출석으로 간주)
    const attended = stats.present + stats.late + stats.early_leave
    stats.attendance_rate = stats.total > 0 ? Math.round((attended / stats.total) * 100) : 0

    return stats
  }, [filteredStudents, attendanceRecords])

  // 시간대별 라벨
  const getTimeSlotLabel = () => {
    switch (activeTimeSlot) {
      case 'morning': return '오전 수업'
      case 'afternoon': return '오후 수업'
      case 'evening': return '저녁 수업'
      default: return '전체'
    }
  }

  // 출석률 트렌드 표시 (예시)
  const getAttendanceTrend = () => {
    if (stats.attendance_rate >= 90) return { icon: ArrowTrendingUpIcon, color: 'text-green-600', label: '우수' }
    if (stats.attendance_rate >= 70) return { icon: ArrowTrendingUpIcon, color: 'text-blue-600', label: '양호' }
    return { icon: ArrowTrendingDownIcon, color: 'text-red-600', label: '개선 필요' }
  }

  const trend = getAttendanceTrend()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 메인 통계 카드 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {getTimeSlotLabel()} 출석 현황
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            {selectedDate.toLocaleDateString('ko-KR')}
          </div>
        </div>

        {/* 출석률 및 트렌드 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.attendance_rate}%
            </div>
            <div className="text-sm text-gray-600">전체 출석률</div>
          </div>
          <div className="flex items-center space-x-2">
            <trend.icon className={`w-5 h-5 ${trend.color}`} />
            <span className={`text-sm font-medium ${trend.color}`}>
              {trend.label}
            </span>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">출석 진행률</span>
            <span className="font-medium text-gray-900">
              {stats.total - stats.not_checked}/{stats.total}명 체크 완료
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${stats.total > 0 ? ((stats.total - stats.not_checked) / stats.total) * 100 : 0}%` 
              }}
            />
          </div>
        </div>

        {/* 상세 통계 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = stats[status as keyof StatsData] as number
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
            
            return (
              <div
                key={status}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${config.bgColor} ${config.borderColor}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <config.icon className={`w-5 h-5 ${config.color}`} />
                  <span className="text-lg">{config.emoji}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {count}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  {config.label}
                </div>
                <div className={`text-xs font-medium ${config.color}`}>
                  {percentage}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 요약 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 총 학생 수 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">총 학생 수</div>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        {/* 실제 출석 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats.present + stats.late + stats.early_leave}
              </div>
              <div className="text-sm text-gray-600">실제 출석</div>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* 미체크 */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-600">{stats.not_checked}</div>
              <div className="text-sm text-gray-600">미체크</div>
            </div>
            <ClockIcon className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* 알림 메시지 */}
      {stats.not_checked > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              아직 {stats.not_checked}명의 학생이 출석 체크되지 않았습니다.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// 로딩 스켈레톤
export function AttendanceStatsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-16 mb-6"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
    </div>
  )
}