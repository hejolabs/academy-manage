'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  ClockIcon,
  SunIcon,
  MoonIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline'
import DatePicker from '@/components/attendance/DatePicker'
import AttendanceStats from '@/components/attendance/AttendanceStats'
import AttendanceList from '@/components/attendance/AttendanceList'
import BulkActions, { FloatingBulkActions } from '@/components/attendance/BulkActions'
import { AttendanceStatus } from '@/components/attendance/AttendanceItem'
import { api } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

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
    icon: ViewColumnsIcon,
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
    console.log('loadData 함수 호출됨, 선택된 날짜:', selectedDate)
    try {
      setLoading(true)
      setError(null)

      const dateString = selectedDate.toISOString().split('T')[0]
      console.log('로드할 날짜:', dateString)

      console.log('API 호출 시작...')
      
      const studentsRes = await api.getStudents({ is_active: true })
      console.log('학생 API 응답:', studentsRes)
      
      const attendanceRes = await api.getAttendance({ 
        limit: 500 
      })
      console.log('출석 API 응답:', attendanceRes)
      console.log('출석 API 상세:', attendanceRes.data)

      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data.students || [])
      } else {
        throw new Error(studentsRes.error || '학생 목록을 불러올 수 없습니다.')
      }

      if (attendanceRes.success && attendanceRes.data) {
        // Transform API response to match our local interface
        const records = Array.isArray(attendanceRes.data) ? attendanceRes.data : []
        console.log('원본 출석 기록들:', records)
        console.log('필터링할 날짜:', dateString)
        
        const transformedRecords = records
          .map((record: any) => {
            const transformed = {
              id: record.id,
              student_id: record.student_id || record.studentId,
              date: record.date,
              status: record.status || 'not_checked',
              time_in: record.time_in,
              time_out: record.time_out,
              note: record.note
            }
            console.log('변환된 기록:', transformed)
            return transformed
          })
          .filter(record => {
            const matches = record.date === dateString
            console.log(`날짜 필터: ${record.date} === ${dateString} = ${matches}`)
            return matches
          })
        
        setAttendanceRecords(transformedRecords)
        console.log('최종 출석 기록들:', transformedRecords)
      } else {
        console.log('출석 API 실패 또는 데이터 없음:', attendanceRes)
        console.log('에러 내용:', attendanceRes.error)
        // 출석 API가 실패하면 빈 배열로 시작 (나중에 사용자가 출석체크하면 추가됨)
        setAttendanceRecords([])
        
        // TODO: GET API가 실패하는 경우 백엔드 구현 확인 필요
        console.warn('출석 기록 로드 실패 - 백엔드 GET /api/v1/attendance 엔드포인트 확인 필요')
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
    // Skip API call for 'not_checked' status
    if (status === 'not_checked') return
    
    try {
      setIsProcessing(true)
      
      const dateString = selectedDate.toISOString().split('T')[0]
      const currentTime = new Date().toTimeString().slice(0, 5)

      const attendanceData = {
        student_id: studentId,
        date: dateString,
        status: status as 'present' | 'absent' | 'late' | 'early_leave',
        time_in: (status === 'present' || status === 'late') ? currentTime : undefined,
        note: note || undefined
      }

      // 기존 출석 기록 확인 (같은 날짜의 기록)
      const existingRecord = attendanceRecords.find(record => 
        record.student_id === studentId && record.date === dateString
      )
      let response

      console.log('출석 체크:', { 
        studentId, 
        dateString, 
        existingRecord,
        allRecords: attendanceRecords,
        recordsForStudent: attendanceRecords.filter(r => r.student_id === studentId)
      })

      if (existingRecord && existingRecord.id) {
        // 기존 기록이 있으면 PUT으로 업데이트
        console.log('기존 기록 업데이트:', existingRecord.id)
        response = await api.updateAttendance(existingRecord.id, attendanceData)
      } else {
        // 기존 기록이 없으면 POST로 새로 생성
        console.log('새 기록 생성')
        response = await api.markAttendance(attendanceData)
      }

      if (response.success && response.data) {
        // 로컬 상태 업데이트
        setAttendanceRecords(prev => {
          if (existingRecord) {
            return prev.map(record => 
              record.student_id === studentId 
                ? { ...record, ...attendanceData, id: response.data?.id || record.id }
                : record
            )
          } else {
            return [...prev, { ...attendanceData, id: response.data?.id || Date.now() }]
          }
        })
      } else {
        throw new Error(response.error || '출석 체크에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error updating attendance:', err)
      
      // 409 에러 (이미 기록 존재)인 경우 기존 기록을 다시 로드
      if (err instanceof Error && err.message.includes('409')) {
        console.log('409 에러 감지 - 출석 기록 다시 로드')
        try {
          const currentDateString = selectedDate.toISOString().split('T')[0]
          const attendanceRes = await api.getAttendance({ 
            limit: 500 
          })
          
          if (attendanceRes.success && attendanceRes.data) {
            const records = Array.isArray(attendanceRes.data) ? attendanceRes.data : []
            const transformedRecords = records
              .map((record: any) => ({
                id: record.id,
                student_id: record.student_id || record.studentId,
                date: record.date,
                status: record.status || 'not_checked',
                time_in: record.time_in,
                time_out: record.time_out,
                note: record.note
              }))
              .filter(record => record.date === currentDateString)
            
            setAttendanceRecords(transformedRecords)
            console.log('409 에러 후 재로드된 기록들:', transformedRecords)
          }
        } catch (reloadErr) {
          console.error('재로드 실패:', reloadErr)
        }
      }
      
      alert('출석 체크에 실패했습니다. 기존 기록이 있을 수 있습니다.')
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
    if (selectedStudents.length === 0 || status === 'not_checked') return

    try {
      setIsProcessing(true)
      
      const dateString = selectedDate.toISOString().split('T')[0]
      const currentTime = new Date().toTimeString().slice(0, 5)

      const bulkData = selectedStudents.map(studentId => ({
        student_id: studentId,
        date: dateString,
        status: status as 'present' | 'absent' | 'late' | 'early_leave',
        time_in: (status === 'present' || status === 'late') ? currentTime : undefined
      }))

      // API에 일괄 처리 요청
      let currentRecords = [...attendanceRecords] // 로컬 복사본 생성
      
      for (const data of bulkData) {
        // 기존 출석 기록 확인 (같은 날짜의 기록)
        const existingRecord = currentRecords.find(record => 
          record.student_id === data.student_id && record.date === data.date
        )
        let response

        console.log('일괄 처리:', { 
          studentId: data.student_id, 
          date: data.date,
          existingRecord,
          allRecords: currentRecords.length
        })

        if (existingRecord && existingRecord.id) {
          // 기존 기록이 있으면 PUT으로 업데이트
          console.log('일괄 업데이트:', existingRecord.id)
          response = await api.updateAttendance(existingRecord.id, data)
        } else {
          // 기존 기록이 없으면 POST로 새로 생성
          console.log('일괄 새 기록 생성')
          response = await api.markAttendance(data)
        }

        if (response.success && response.data) {
          // 로컬 복사본 업데이트
          if (existingRecord) {
            currentRecords = currentRecords.map(record => 
              record.student_id === data.student_id 
                ? { ...record, ...data, id: response.data?.id || record.id }
                : record
            )
          } else {
            currentRecords = [...currentRecords, { ...data, id: response.data?.id || Date.now() }]
          }
        }
      }
      
      // 마지막에 한 번에 상태 업데이트
      setAttendanceRecords(currentRecords)

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