'use client'

import { useState } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { AttendanceStatus } from './AttendanceItem'

interface BulkActionsProps {
  selectedStudents: number[]
  totalStudents: number
  onSelectAll: (selected: boolean) => void
  onBulkStatusChange: (status: AttendanceStatus) => void
  onClearSelection: () => void
  isProcessing?: boolean
  className?: string
}

const bulkStatusOptions = [
  {
    status: 'present' as AttendanceStatus,
    label: '일괄 출석',
    icon: CheckCircleIcon,
    color: 'bg-green-600 hover:bg-green-700',
    emoji: '✅'
  },
  {
    status: 'absent' as AttendanceStatus,
    label: '일괄 결석',
    icon: XCircleIcon,
    color: 'bg-red-600 hover:bg-red-700',
    emoji: '❌'
  },
  {
    status: 'late' as AttendanceStatus,
    label: '일괄 지각',
    icon: ClockIcon,
    color: 'bg-yellow-600 hover:bg-yellow-700',
    emoji: '🟡'
  },
  {
    status: 'early_leave' as AttendanceStatus,
    label: '일괄 조퇴',
    icon: ExclamationTriangleIcon,
    color: 'bg-orange-600 hover:bg-orange-700',
    emoji: '🟠'
  }
]

export default function BulkActions({
  selectedStudents,
  totalStudents,
  onSelectAll,
  onBulkStatusChange,
  onClearSelection,
  isProcessing = false,
  className = ''
}: BulkActionsProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const isAllSelected = selectedStudents.length === totalStudents && totalStudents > 0
  const isPartiallySelected = selectedStudents.length > 0 && selectedStudents.length < totalStudents

  const handleSelectAllClick = () => {
    onSelectAll(!isAllSelected)
  }

  const handleBulkAction = (status: AttendanceStatus) => {
    if (selectedStudents.length === 0) return
    
    onBulkStatusChange(status)
    setShowDropdown(false)
  }

  if (totalStudents === 0) {
    return null
  }

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between">
        {/* 선택 상태 및 전체 선택 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isPartiallySelected
              }}
              onChange={handleSelectAllClick}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              disabled={isProcessing}
            />
            <div className="flex items-center space-x-2">
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {selectedStudents.length > 0 
                  ? `${selectedStudents.length}명 선택됨` 
                  : `전체 ${totalStudents}명`
                }
              </span>
            </div>
          </div>

          {/* 선택 해제 버튼 */}
          {selectedStudents.length > 0 && (
            <button
              onClick={onClearSelection}
              disabled={isProcessing}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              선택 해제
            </button>
          )}
        </div>

        {/* 일괄 작업 버튼 */}
        {selectedStudents.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isProcessing}
              className={`
                flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors
                hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                ${isProcessing ? 'cursor-not-allowed' : ''}
              `}
            >
              <span className="text-sm font-medium">
                {isProcessing ? '처리 중...' : '일괄 처리'}
              </span>
              <ChevronDownIcon className={`
                w-4 h-4 transition-transform
                ${showDropdown ? 'rotate-180' : ''}
              `} />
            </button>

            {/* 드롭다운 메뉴 */}
            {showDropdown && !isProcessing && (
              <>
                {/* 배경 오버레이 */}
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                
                {/* 드롭다운 컨텐츠 */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-2 space-y-1">
                    {bulkStatusOptions.map((option) => (
                      <button
                        key={option.status}
                        onClick={() => handleBulkAction(option.status)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-2 rounded-md text-white text-sm font-medium transition-colors
                          ${option.color}
                        `}
                      >
                        <option.icon className="w-4 h-4" />
                        <span>{option.emoji}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* 확인 메시지 */}
                  <div className="px-3 py-2 border-t border-gray-100">
                    <p className="text-xs text-gray-600">
                      선택된 {selectedStudents.length}명의 학생에게 적용됩니다.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 진행 중 표시 */}
      {isProcessing && (
        <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>출석 정보를 업데이트하고 있습니다...</span>
        </div>
      )}

      {/* 빠른 작업 버튼들 (모바일 친화적) */}
      {selectedStudents.length > 0 && !showDropdown && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
          {bulkStatusOptions.slice(0, 2).map((option) => (
            <button
              key={option.status}
              onClick={() => handleBulkAction(option.status)}
              disabled={isProcessing}
              className={`
                flex items-center justify-center space-x-2 py-2 rounded-lg text-white text-sm font-medium transition-colors
                ${option.color} disabled:opacity-50
              `}
            >
              <option.icon className="w-4 h-4" />
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// 간단한 일괄 액션 바 (플로팅)
export function FloatingBulkActions({
  selectedCount,
  onBulkStatusChange,
  onClearSelection,
  isProcessing = false
}: {
  selectedCount: number
  onBulkStatusChange: (status: AttendanceStatus) => void
  onClearSelection: () => void
  isProcessing?: boolean
}) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-900">
            {selectedCount}명 선택됨
          </span>
          <button
            onClick={onClearSelection}
            disabled={isProcessing}
            className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            취소
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onBulkStatusChange('present')}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-1 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircleIcon className="w-4 h-4" />
            <span>✅ 출석</span>
          </button>
          <button
            onClick={() => onBulkStatusChange('absent')}
            disabled={isProcessing}
            className="flex items-center justify-center space-x-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            <XCircleIcon className="w-4 h-4" />
            <span>❌ 결석</span>
          </button>
        </div>
      </div>
    </div>
  )
}