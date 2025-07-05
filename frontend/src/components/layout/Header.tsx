'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Cog6ToothIcon, BellIcon } from '@heroicons/react/24/outline'

const pageConfig: Record<string, { title: string; showDate?: boolean; showSettings?: boolean }> = {
  '/': { title: '대시보드', showDate: true, showSettings: true },
  '/students': { title: '학생 관리', showSettings: true },
  '/attendance': { title: '출석 체크', showDate: true },
  '/calendar': { title: '캘린더', showDate: true },
  '/payments': { title: '결제 관리', showSettings: true },
}

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')

  const config = pageConfig[pathname] || { title: '공부방 관리', showDate: false, showSettings: false }

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      
      // 현재 시간 (예: 14:30)
      setCurrentTime(
        now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )
      
      // 현재 날짜 (예: 2024년 12월 29일 토요일)
      setCurrentDate(
        now.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        })
      )
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSettingsClick = () => {
    // TODO: 설정 페이지로 이동 또는 설정 모달 열기
    console.log('Settings clicked')
  }

  const handleNotificationClick = () => {
    router.push('/notifications')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 제목 및 날짜 */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {config.title}
          </h1>
          {config.showDate && (
            <div className="flex items-center space-x-2 mt-1">
              <p className="text-sm text-gray-600">{currentDate}</p>
              <span className="text-sm text-blue-600 font-medium">{currentTime}</span>
            </div>
          )}
        </div>

        {/* 오른쪽: 액션 버튼들 */}
        <div className="flex items-center space-x-2 ml-4">
          {/* 알림 버튼 */}
          <button
            onClick={handleNotificationClick}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
            aria-label="알림"
          >
            <BellIcon className="w-5 h-5 text-gray-600" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>

          {/* 설정 버튼 */}
          {config.showSettings && (
            <button
              onClick={handleSettingsClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="설정"
            >
              <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* 현재 시간이 메인에서만 크게 표시 */}
      {pathname === '/' && (
        <div className="mt-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{currentTime}</div>
          <div className="text-sm text-gray-500">현재 시간</div>
        </div>
      )}
    </header>
  )
}