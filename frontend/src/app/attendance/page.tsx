'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ClockIcon,
  SunIcon,
  MoonIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'
import DatePicker from '@/components/attendance/DatePicker'
import AttendanceStats from '@/components/attendance/AttendanceStats'
import AttendanceList from '@/components/attendance/AttendanceList'
import BulkActions, { FloatingBulkActions } from '@/components/attendance/BulkActions'
import { AttendanceStatus } from '@/components/attendance/AttendanceItem'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

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

type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'all'

const timeSlotConfig = {
  all: {
    label: '전체',
    icon: Squares2X2Icon,
    color: 'bg-gray-600 hover:bg-gray-700',
    emoji: '🕒'
  },
  morning: {
    label: '오전',
    icon: SunIcon,
    color: 'bg-yellow-500 hover:bg-yellow-600',
    emoji: '🌅'
  },
  afternoon: {
    label: '오후',
    icon: SunIcon,
    color: 'bg-orange-500 hover:bg-orange-600',
    emoji: '☀️'
  },
  evening: {
    label: '저녁',
    icon: MoonIcon,
    color: 'bg-purple-600 hover:bg-purple-700',
    emoji: '🌙'
  }
}

export default function AttendancePage() {
  // State
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeTimeSlot, setActiveTimeSlot] = useState<TimeSlot>('all')
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // 데이터 로드
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const dateString = selectedDate.toISOString().split('T')[0]

      const [studentsRes, attendanceRes] = await Promise.all([
        api.getStudents({ is_active: true }),
        api.getAttendance({ 
          date_filter: dateString,
          limit: 1000 
        })
      ])

      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data.students || [])
      } else {
        throw new Error(studentsRes.error || '학생 목록을 불러올 수 없습니다.')
      }

      if (attendanceRes.success && attendanceRes.data) {
        setAttendanceRecords(Array.isArray(attendanceRes.data) ? attendanceRes.data : [])
      } else {
        setAttendanceRecords([])
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 날짜 변경 핸들러
  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
    setSelectedStudents([]) // 날짜 변경 시 선택 초기화
  }

  // 출석 상태 변경 핸들러
  const handleStatusChange = async (studentId: number, status: AttendanceStatus, note?: string) => {
    try {
      setIsProcessing(true)
      
      const dateString = selectedDate.toISOString().split('T')[0]
      const currentTime = new Date().toTimeString().slice(0, 5)

      const attendanceData = {
        student_id: studentId,
        date: dateString,
        status,
        time_in: (status === 'present' || status === 'late') ? currentTime : undefined,
        note: note || undefined
      }

      const response = await api.markAttendance(attendanceData)

      if (response.success && response.data) {
        // 로컬 상태 업데이트
        setAttendanceRecords(prev => {
          const existing = prev.find(record => record.student_id === studentId)
          if (existing) {
            return prev.map(record => 
              record.student_id === studentId 
                ? { ...record, ...attendanceData }
                : record
            )
          } else {
            return [...prev, { ...attendanceData, id: response.data.id }]
          }
        })
      } else {
        throw new Error(response.error || '출석 체크에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error updating attendance:', err)
      alert('출석 체크에 실패했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  // 시간 기록 핸들러
  const handleTimeRecord = async (studentId: number, type: 'in' | 'out', time: string) => {
    // 현재는 입실 시간만 처리
    if (type !== 'in') return

    const existingRecord = attendanceRecords.find(record => record.student_id === studentId)
    if (existingRecord) {
      setAttendanceRecords(prev => 
        prev.map(record => 
          record.student_id === studentId 
            ? { ...record, time_in: time }
            : record
        )
      )
    }
  }

  // 일괄 출석 처리
  const handleBulkStatusChange = async (status: AttendanceStatus) => {
    if (selectedStudents.length === 0) return

    try {
      setIsProcessing(true)
      
      const dateString = selectedDate.toISOString().split('T')[0]
      const currentTime = new Date().toTimeString().slice(0, 5)

      const bulkData = selectedStudents.map(studentId => ({
        student_id: studentId,
        date: dateString,
        status,
        time_in: (status === 'present' || status === 'late') ? currentTime : undefined
      }))

      // API에 일괄 처리 요청
      for (const data of bulkData) {
        const response = await api.markAttendance(data)
        if (response.success && response.data) {
          // 로컬 상태 업데이트
          setAttendanceRecords(prev => {
            const existing = prev.find(record => record.student_id === data.student_id)
            if (existing) {
              return prev.map(record => 
                record.student_id === data.student_id 
                  ? { ...record, ...data }
                  : record
              )
            } else {
              return [...prev, { ...data, id: response.data.id }]
            }
          })
        }
      }

      setSelectedStudents([]) // 선택 초기화
    } catch (err) {
      console.error('Error bulk updating attendance:', err)
      alert('일괄 출석 처리에 실패했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  // 전체 선택/해제
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedStudents(students.map(student => student.id))
    } else {
      setSelectedStudents([])
    }
  }

  // 개별 선택 변경
  const handleSelectionChange = (studentId: number, selected: boolean) => {
    if (selected) {
      setSelectedStudents(prev => [...prev, studentId])
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId))
    }
  }

  // 선택 초기화
  const handleClearSelection = () => {
    setSelectedStudents([])
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">출석 관리</h1>
          <p className="text-gray-600 mt-1">학생들의 출석을 체크하고 관리하세요</p>
        </div>
        <ClockIcon className="w-8 h-8 text-blue-600" />
      </div>

      {/* 날짜 선택기 */}
      <DatePicker
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />

      {/* 시간대 탭 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex space-x-2 overflow-x-auto">
          {Object.entries(timeSlotConfig).map(([slot, config]) => (
            <button
              key={slot}
              onClick={() => setActiveTimeSlot(slot as TimeSlot)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${activeTimeSlot === slot
                  ? `text-white ${config.color}`
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }
              `}
            >
              <config.icon className="w-4 h-4" />
              <span>{config.emoji}</span>
              <span>{config.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 통계 */}
      {!loading && !error && (
        <AttendanceStats
          students={students}
          attendanceRecords={attendanceRecords}
          selectedDate={selectedDate}
          activeTimeSlot={activeTimeSlot}
        />
      )}

      {/* 일괄 작업 */}
      {!loading && !error && students.length > 0 && (
        <BulkActions
          selectedStudents={selectedStudents}
          totalStudents={students.length}
          onSelectAll={handleSelectAll}
          onBulkStatusChange={handleBulkStatusChange}
          onClearSelection={handleClearSelection}
          isProcessing={isProcessing}
        />
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-red-800">{error}</span>
            <button
              onClick={loadData}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              다시 시도
            </button>
          </div>
        </div>
      )}

      {/* 출석 리스트 */}
      <AttendanceList
        students={students}
        attendanceRecords={attendanceRecords}
        selectedDate={selectedDate}
        activeTimeSlot={activeTimeSlot}
        onStatusChange={handleStatusChange}
        onTimeRecord={handleTimeRecord}
        isLoading={loading}
        isSelectable={true}
        selectedStudents={selectedStudents}
        onSelectionChange={handleSelectionChange}
      />

      {/* 플로팅 일괄 작업 버튼 (모바일용) */}
      <FloatingBulkActions
        selectedCount={selectedStudents.length}
        onBulkStatusChange={handleBulkStatusChange}
        onClearSelection={handleClearSelection}
        isProcessing={isProcessing}
      />

      {/* 로딩 오버레이 */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <LoadingSpinner size="md" />
              <span className="text-gray-900 font-medium">처리 중...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}