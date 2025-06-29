'use client'

import { useState, useEffect } from 'react'
import { 
  WifiIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { syncManager, SyncStatus } from '@/lib/offline-sync'
import { AttendanceStatus } from './AttendanceItem'

interface OfflineAttendanceManagerProps {
  onAttendanceUpdate?: () => void
}

export default function OfflineAttendanceManager({ onAttendanceUpdate }: OfflineAttendanceManagerProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getStatus())

  useEffect(() => {
    // 동기화 상태 변화 감지
    const unsubscribe = syncManager.onStatusChange((status) => {
      setSyncStatus(status)
      
      // 동기화 완료 시 출석 목록 새로고침
      if (status.lastSyncTime > 0 && !status.isSyncing && onAttendanceUpdate) {
        onAttendanceUpdate()
      }
    })

    return unsubscribe
  }, [onAttendanceUpdate])

  // 오프라인 출석 체크
  const handleOfflineAttendance = async (
    student_id: number,
    student_name: string,
    status: AttendanceStatus,
    note?: string
  ): Promise<boolean> => {
    const attendanceData = {
      student_id,
      student_name,
      date: new Date().toISOString().split('T')[0],
      status,
      time_in: new Date().toTimeString().split(' ')[0],
      note
    }

    const success = await syncManager.saveOfflineAttendance(attendanceData)
    
    if (success && onAttendanceUpdate) {
      onAttendanceUpdate()
    }
    
    return success
  }

  // 수동 동기화
  const handleManualSync = async () => {
    if (syncStatus.isOnline && !syncStatus.isSyncing) {
      await syncManager.triggerSync()
    }
  }

  return {
    syncStatus,
    handleOfflineAttendance,
    handleManualSync,
    isOnline: syncStatus.isOnline,
    isSyncing: syncStatus.isSyncing,
    pendingCount: syncStatus.pendingCount,
    failedCount: syncStatus.failedCount
  }
}

// 출석 체크 컴포넌트 (온라인/오프라인 지원)
export function AttendanceChecker({ 
  student, 
  onSuccess, 
  disabled = false 
}: {
  student: { id: number; name: string }
  onSuccess?: () => void
  disabled?: boolean
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { handleOfflineAttendance, isOnline } = OfflineAttendanceManager({})

  const handleAttendanceCheck = async (status: AttendanceStatus) => {
    if (disabled || isLoading) return

    setIsLoading(true)
    
    try {
      if (isOnline) {
        // 온라인: API 호출
        const response = await fetch('/api/v1/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: student.id,
            date: new Date().toISOString().split('T')[0],
            status,
            time_in: new Date().toTimeString().split(' ')[0]
          })
        })

        if (response.ok) {
          onSuccess?.()
        } else {
          throw new Error('API call failed')
        }
      } else {
        // 오프라인: 로컬 저장
        const success = await handleOfflineAttendance(
          student.id,
          student.name,
          status
        )

        if (success) {
          onSuccess?.()
        } else {
          throw new Error('Offline save failed')
        }
      }
    } catch (error) {
      console.error('Attendance check failed:', error)
      
      // 온라인 실패 시 오프라인 방식으로 재시도
      if (isOnline) {
        const success = await handleOfflineAttendance(
          student.id,
          student.name,
          status
        )
        
        if (success) {
          onSuccess?.()
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const attendanceOptions = [
    { status: 'present' as AttendanceStatus, label: '출석', color: 'bg-green-500' },
    { status: 'late' as AttendanceStatus, label: '지각', color: 'bg-yellow-500' },
    { status: 'absent' as AttendanceStatus, label: '결석', color: 'bg-red-500' }
  ]

  return (
    <div className="flex space-x-2">
      {attendanceOptions.map(({ status, label, color }) => (
        <button
          key={status}
          onClick={() => handleAttendanceCheck(status)}
          disabled={disabled || isLoading}
          className={`
            px-3 py-2 text-sm font-medium text-white rounded-lg transition-all
            ${color} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed
            ${isLoading ? 'animate-pulse' : ''}
          `}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            label
          )}
        </button>
      ))}
      
      {/* 오프라인 표시 */}
      {!isOnline && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
          <WifiIcon className="w-3 h-3" />
          <span>오프라인</span>
        </div>
      )}
    </div>
  )
}

// 동기화 상태 표시 컴포넌트
export function SyncStatusIndicator() {
  const { syncStatus, handleManualSync } = OfflineAttendanceManager({})

  if (syncStatus.isOnline && syncStatus.pendingCount === 0 && syncStatus.failedCount === 0) {
    return null
  }

  const getStatusConfig = () => {
    if (!syncStatus.isOnline) {
      return {
        icon: WifiIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        message: '오프라인'
      }
    }

    if (syncStatus.isSyncing) {
      return {
        icon: CloudArrowUpIcon,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        message: '동기화 중...'
      }
    }

    if (syncStatus.failedCount > 0) {
      return {
        icon: ExclamationTriangleIcon,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        message: `동기화 실패 ${syncStatus.failedCount}건`
      }
    }

    if (syncStatus.pendingCount > 0) {
      return {
        icon: CloudArrowUpIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        message: `대기 중 ${syncStatus.pendingCount}건`
      }
    }

    return {
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      message: '동기화 완료'
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <div className={`
      flex items-center justify-between p-3 rounded-lg border
      ${config.bgColor} ${config.borderColor}
    `}>
      <div className="flex items-center space-x-2">
        <Icon className={`w-5 h-5 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.message}
        </span>
      </div>

      {/* 재시도 버튼 */}
      {syncStatus.isOnline && (syncStatus.pendingCount > 0 || syncStatus.failedCount > 0) && (
        <button
          onClick={handleManualSync}
          disabled={syncStatus.isSyncing}
          className={`
            px-3 py-1 text-xs font-medium rounded-md transition-colors
            ${syncStatus.isSyncing 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {syncStatus.isSyncing ? '동기화 중...' : '재시도'}
        </button>
      )}
    </div>
  )
}