'use client'

import { useState, useEffect } from 'react'
import { 
  WifiIcon, 
  CloudArrowUpIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { syncManager, SyncStatus } from '@/lib/offline-sync'

export default function OfflineStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: 0,
    pendingCount: 0,
    failedCount: 0,
    errors: []
  })

  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // 동기화 상태 리스너 등록
    const unsubscribe = syncManager.onStatusChange((status) => {
      setSyncStatus(status)
      
      // 상태 변화가 있으면 잠깐 표시
      if (!status.isOnline || status.pendingCount > 0 || status.failedCount > 0) {
        setIsVisible(true)
      }
    })

    // 초기 상태 가져오기
    setSyncStatus(syncManager.getStatus())

    return unsubscribe
  }, [])

  // 자동 숨기기 (온라인이고 동기화할 항목이 없을 때)
  useEffect(() => {
    if (syncStatus.isOnline && syncStatus.pendingCount === 0 && syncStatus.failedCount === 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 3000) // 3초 후 숨기기

      return () => clearTimeout(timer)
    } else {
      setIsVisible(true)
    }
  }, [syncStatus.isOnline, syncStatus.pendingCount, syncStatus.failedCount])

  // 수동 동기화 트리거
  const handleManualSync = async () => {
    if (!syncStatus.isSyncing && syncStatus.isOnline) {
      await syncManager.triggerSync()
    }
  }

  // 상태에 따른 스타일 및 아이콘
  const getStatusInfo = () => {
    if (!syncStatus.isOnline) {
      return {
        icon: WifiIcon,
        color: 'bg-red-500',
        textColor: 'text-red-100',
        borderColor: 'border-red-300',
        bgColor: 'bg-red-50',
        message: '오프라인 모드'
      }
    }

    if (syncStatus.isSyncing) {
      return {
        icon: CloudArrowUpIcon,
        color: 'bg-blue-500',
        textColor: 'text-blue-100',
        borderColor: 'border-blue-300',
        bgColor: 'bg-blue-50',
        message: '동기화 중...'
      }
    }

    if (syncStatus.failedCount > 0) {
      return {
        icon: ExclamationTriangleIcon,
        color: 'bg-orange-500',
        textColor: 'text-orange-100',
        borderColor: 'border-orange-300',
        bgColor: 'bg-orange-50',
        message: `동기화 실패 ${syncStatus.failedCount}건`
      }
    }

    if (syncStatus.pendingCount > 0) {
      return {
        icon: ClockIcon,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-100',
        borderColor: 'border-yellow-300',
        bgColor: 'bg-yellow-50',
        message: `대기 중 ${syncStatus.pendingCount}건`
      }
    }

    return {
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      textColor: 'text-green-100',
      borderColor: 'border-green-300',
      bgColor: 'bg-green-50',
      message: '모든 데이터 동기화됨'
    }
  }

  const statusInfo = getStatusInfo()
  const Icon = statusInfo.icon

  // 클라이언트 사이드에서만 렌더링
  if (!isMounted || (!isVisible && syncStatus.isOnline && syncStatus.pendingCount === 0)) {
    return null
  }

  return (
    <div className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className={`
        mx-auto max-w-md rounded-lg border-2 shadow-lg p-3
        ${statusInfo.borderColor} ${statusInfo.bgColor}
      `}>
        <div className="flex items-center space-x-3">
          {/* 상태 아이콘 */}
          <div className={`p-2 rounded-full ${statusInfo.color}`}>
            <Icon className={`w-4 h-4 ${statusInfo.textColor}`} />
          </div>

          {/* 상태 메시지 */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {statusInfo.message}
            </p>
            
            {/* 추가 정보 */}
            {!syncStatus.isOnline && (
              <p className="text-xs text-gray-600 mt-1">
                인터넷 연결을 확인하세요. 오프라인에서도 출석 체크가 가능합니다.
              </p>
            )}
            
            {syncStatus.lastSyncTime > 0 && syncStatus.isOnline && (
              <p className="text-xs text-gray-600 mt-1">
                마지막 동기화: {new Date(syncStatus.lastSyncTime).toLocaleTimeString('ko-KR')}
              </p>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center space-x-2">
            {/* 수동 동기화 버튼 */}
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
                {syncStatus.isSyncing ? '동기화 중...' : '다시 시도'}
              </button>
            )}

            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 에러 목록 (있는 경우) */}
        {syncStatus.errors.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-1">동기화 오류:</p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {syncStatus.errors.slice(-3).map((error, index) => (
                <p key={index} className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                  {error}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 간단한 온라인 상태 표시기 (헤더용)
export function OnlineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const handleOnlineStatus = () => setIsOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOnlineStatus)
    
    // 초기 상태 설정
    handleOnlineStatus()
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus)
      window.removeEventListener('offline', handleOnlineStatus)
    }
  }, [])

  // 클라이언트 사이드에서만 렌더링
  if (!isMounted) {
    return <div className="w-2 h-2 rounded-full bg-gray-300" />
  }

  return (
    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} 
         title={isOnline ? '온라인' : '오프라인'} />
  )
}