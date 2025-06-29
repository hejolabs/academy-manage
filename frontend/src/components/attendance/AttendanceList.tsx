'use client'

import { useState, useMemo } from 'react'
import { ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import AttendanceItem, { AttendanceStatus, AttendanceItemSkeleton } from './AttendanceItem'

interface Student {
  id: number
  name: string
  grade?: string
  phone?: string
  subjects?: string[]
  schedule?: {
    [key: string]: string
  }
}

interface AttendanceRecord {
  id?: number
  student_id: number
  date: string
  status: AttendanceStatus
  time_in?: string
  time_out?: string
  note?: string
}

interface AttendanceListProps {
  students: Student[]
  attendanceRecords: AttendanceRecord[]
  selectedDate: Date
  activeTimeSlot: 'morning' | 'afternoon' | 'evening' | 'all'
  onStatusChange: (studentId: number, status: AttendanceStatus, note?: string) => void
  onTimeRecord: (studentId: number, type: 'in' | 'out', time: string) => void
  isLoading?: boolean
  isSelectable?: boolean
  selectedStudents?: number[]
  onSelectionChange?: (studentId: number, selected: boolean) => void
  className?: string
}

// 시간대 정의
const TIME_SLOTS = {
  morning: { label: '오전', start: '06:00', end: '12:00', icon: '🌅' },
  afternoon: { label: '오후', start: '12:00', end: '18:00', icon: '☀️' },
  evening: { label: '저녁', start: '18:00', end: '23:59', icon: '🌙' },
}

export default function AttendanceList({
  students,
  attendanceRecords,
  selectedDate,
  activeTimeSlot,
  onStatusChange,
  onTimeRecord,
  isLoading = false,
  isSelectable = false,
  selectedStudents = [],
  onSelectionChange,
  className = ''
}: AttendanceListProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // 시간대별로 학생 그룹핑
  const groupedStudents = useMemo(() => {
    const today = new Date(selectedDate)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayKey = dayNames[today.getDay()]

    // 검색 필터링
    const filteredStudents = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // 시간대별로 그룹핑
    const groups: { [key: string]: { student: Student; attendance?: AttendanceRecord }[] } = {
      morning: [],
      afternoon: [],
      evening: [],
      no_schedule: []
    }

    filteredStudents.forEach(student => {
      const attendance = attendanceRecords.find(record => record.student_id === student.id)
      const studentData = { student, attendance }
      
      // 오늘의 시간표 확인
      const scheduleTime = student.schedule?.[todayKey]
      
      if (!scheduleTime) {
        groups.no_schedule.push(studentData)
        return
      }

      // 시간대 분류
      const time = scheduleTime.replace(':', '')
      const timeNum = parseInt(time)

      if (timeNum >= 600 && timeNum < 1200) {
        groups.morning.push(studentData)
      } else if (timeNum >= 1200 && timeNum < 1800) {
        groups.afternoon.push(studentData)
      } else {
        groups.evening.push(studentData)
      }
    })

    // 각 그룹 내에서 이름순 정렬
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.student.name.localeCompare(b.student.name, 'ko'))
    })

    return groups
  }, [students, attendanceRecords, selectedDate, searchTerm])

  // 현재 표시할 그룹 결정
  const displayGroups = useMemo(() => {
    if (activeTimeSlot === 'all') {
      return Object.entries(groupedStudents).filter(([key, students]) => students.length > 0)
    } else {
      const group = groupedStudents[activeTimeSlot]
      return group.length > 0 ? [[activeTimeSlot, group]] : []
    }
  }, [groupedStudents, activeTimeSlot])

  // 통계 계산
  const getGroupStats = (groupData: { student: Student; attendance?: AttendanceRecord }[]) => {
    const stats = {
      total: groupData.length,
      present: 0,
      absent: 0,
      late: 0,
      early_leave: 0,
      not_checked: 0
    }

    groupData.forEach(({ attendance }) => {
      const status = attendance?.status || 'not_checked'
      stats[status]++
    })

    return stats
  }

  const getGroupLabel = (key: string) => {
    if (key === 'no_schedule') return { label: '시간표 없음', icon: '📝' }
    return TIME_SLOTS[key as keyof typeof TIME_SLOTS] || { label: key, icon: '⏰' }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[1, 2, 3].map((group) => (
          <div key={group} className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <AttendanceItemSkeleton key={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (displayGroups.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-2">
          {searchTerm ? '검색 결과가 없습니다.' : '해당 시간대에 수업이 없습니다.'}
        </p>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            전체 보기
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 검색 입력 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <input
          type="text"
          placeholder="학생 이름 또는 학년으로 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 시간대별 그룹 */}
      {displayGroups.map(([groupKey, groupData]) => {
        const stats = getGroupStats(groupData)
        const groupInfo = getGroupLabel(groupKey)
        
        return (
          <div key={groupKey} className="space-y-3">
            {/* 그룹 헤더 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{groupInfo.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {groupInfo.label}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>총 {stats.total}명</span>
                  </div>
                </div>

                {/* 그룹 통계 */}
                <div className="flex items-center space-x-4 text-sm">
                  {stats.present > 0 && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <span>✅</span>
                      <span>{stats.present}</span>
                    </div>
                  )}
                  {stats.late > 0 && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <span>🟡</span>
                      <span>{stats.late}</span>
                    </div>
                  )}
                  {stats.absent > 0 && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <span>❌</span>
                      <span>{stats.absent}</span>
                    </div>
                  )}
                  {stats.early_leave > 0 && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <span>🟠</span>
                      <span>{stats.early_leave}</span>
                    </div>
                  )}
                  {stats.not_checked > 0 && (
                    <div className="flex items-center space-x-1 text-gray-400">
                      <span>⚪</span>
                      <span>{stats.not_checked}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 시간대 정보 (시간표 있는 그룹만) */}
              {groupKey !== 'no_schedule' && TIME_SLOTS[groupKey as keyof typeof TIME_SLOTS] && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    {TIME_SLOTS[groupKey as keyof typeof TIME_SLOTS].start} - {TIME_SLOTS[groupKey as keyof typeof TIME_SLOTS].end}
                  </span>
                </div>
              )}
            </div>

            {/* 학생 목록 */}
            <div className="space-y-3">
              {groupData.map(({ student, attendance }) => (
                <AttendanceItem
                  key={student.id}
                  student={student}
                  attendance={attendance}
                  onStatusChange={onStatusChange}
                  onTimeRecord={onTimeRecord}
                  isSelectable={isSelectable}
                  isSelected={selectedStudents.includes(student.id)}
                  onSelectionChange={onSelectionChange}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}