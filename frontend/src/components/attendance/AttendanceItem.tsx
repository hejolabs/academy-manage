'use client'

import { useState } from 'react'
import { 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { 
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ClockIcon as ClockIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid'

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_leave' | 'not_checked'

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

interface AttendanceItemProps {
  student: Student
  attendance?: AttendanceRecord
  onStatusChange: (studentId: number, status: AttendanceStatus, note?: string) => void
  onTimeRecord: (studentId: number, type: 'in' | 'out', time: string) => void
  isSelectable?: boolean
  isSelected?: boolean
  onSelectionChange?: (studentId: number, selected: boolean) => void
  className?: string
}

const statusConfig = {
  present: {
    label: '출석',
    icon: CheckCircleIcon,
    iconSolid: CheckCircleIconSolid,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    emoji: '✅'
  },
  absent: {
    label: '결석',
    icon: XCircleIcon,
    iconSolid: XCircleIconSolid,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    emoji: '❌'
  },
  late: {
    label: '지각',
    icon: ClockIcon,
    iconSolid: ClockIconSolid,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    emoji: '🟡'
  },
  early_leave: {
    label: '조퇴',
    icon: ExclamationTriangleIcon,
    iconSolid: ExclamationTriangleIconSolid,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    emoji: '🟠'
  },
  not_checked: {
    label: '미체크',
    icon: UserIcon,
    iconSolid: UserIcon,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    emoji: '⚪'
  }
}

export default function AttendanceItem({
  student,
  attendance,
  onStatusChange,
  onTimeRecord,
  isSelectable = false,
  isSelected = false,
  onSelectionChange,
  className = ''
}: AttendanceItemProps) {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [note, setNote] = useState(attendance?.note || '')
  const [timeIn, setTimeIn] = useState(attendance?.time_in || '')

  const currentStatus = attendance?.status || 'not_checked'
  const config = statusConfig[currentStatus]

  const handleStatusClick = (status: AttendanceStatus) => {
    if (status === currentStatus) return
    
    // 출석 체크 시 현재 시간 자동 기록
    if (status === 'present' || status === 'late') {
      const now = new Date()
      const timeString = now.toTimeString().slice(0, 5) // HH:MM 형식
      setTimeIn(timeString)
      onTimeRecord(student.id, 'in', timeString)
    }
    
    onStatusChange(student.id, status, note)
  }

  const handleNoteSubmit = () => {
    onStatusChange(student.id, currentStatus, note)
    setShowNoteInput(false)
  }

  const handleTimeInChange = (time: string) => {
    setTimeIn(time)
    onTimeRecord(student.id, 'in', time)
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return null
    return timeString.slice(0, 5) // HH:MM 형식으로 표시
  }

  const getScheduleTime = () => {
    const today = new Date()
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const todayKey = dayNames[today.getDay()]
    return student.schedule?.[todayKey]
  }

  return (
    <div className={`
      bg-white rounded-xl p-4 shadow-sm border-2 transition-all duration-200
      ${config.borderColor} ${config.bgColor}
      ${isSelected ? 'ring-2 ring-blue-500' : ''}
      ${className}
    `}>
      {/* 학생 정보 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* 선택 체크박스 */}
          {isSelectable && onSelectionChange && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelectionChange(student.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
          )}
          
          {/* 학생 정보 */}
          <div className="flex items-center space-x-2">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-white font-medium
              ${currentStatus === 'not_checked' ? 'bg-gray-400' : config.color.replace('text-', 'bg-')}
            `}>
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{student.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                {student.grade && <span>{student.grade}</span>}
                {getScheduleTime() && (
                  <span className="text-blue-600">
                    📅 {getScheduleTime()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 현재 상태 표시 */}
        <div className={`
          flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium
          ${config.color} ${config.bgColor}
        `}>
          <config.iconSolid className="w-4 h-4" />
          <span>{config.emoji} {config.label}</span>
        </div>
      </div>

      {/* 출석 상태 버튼들 */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {Object.entries(statusConfig).filter(([key]) => key !== 'not_checked').map(([status, config]) => (
          <button
            key={status}
            onClick={() => handleStatusClick(status as AttendanceStatus)}
            className={`
              flex flex-col items-center p-3 rounded-lg transition-all duration-200 border-2
              ${currentStatus === status
                ? `${config.color} ${config.bgColor} ${config.borderColor}`
                : 'text-gray-400 bg-gray-50 border-gray-200 hover:text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            <config.iconSolid className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{config.label}</span>
          </button>
        ))}
      </div>

      {/* 시간 기록 및 메모 */}
      {currentStatus !== 'not_checked' && currentStatus !== 'absent' && (
        <div className="space-y-2">
          {/* 입실 시간 */}
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">입실:</span>
            <input
              type="time"
              value={timeIn}
              onChange={(e) => handleTimeInChange(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* 메모 */}
      {currentStatus !== 'not_checked' && (
        <div className="mt-3">
          {!showNoteInput ? (
            <button
              onClick={() => setShowNoteInput(true)}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
              <span>{note ? `메모: ${note}` : '메모 추가'}</span>
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="메모를 입력하세요..."
                rows={2}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleNoteSubmit}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowNoteInput(false)
                    setNote(attendance?.note || '')
                  }}
                  className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 과목 태그 */}
      {student.subjects && student.subjects.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {student.subjects.slice(0, 2).map((subject, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {subject}
            </span>
          ))}
          {student.subjects.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{student.subjects.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// 로딩 스켈레톤
export function AttendanceItemSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
      
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  )
}