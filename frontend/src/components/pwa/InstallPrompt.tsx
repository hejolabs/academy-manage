'use client'

import { useState, useEffect } from 'react'
import { 
  DevicePhoneMobileIcon, 
  ArrowDownTrayIcon, 
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { installPWA, isInstallable, isPWAInstalled } from '@/lib/pwa'

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // PWA 설치 가능 이벤트 리스너
    const handleInstallable = () => {
      console.log('PWA installable event received')
      // 이미 설치되어 있거나 사용자가 이전에 거부했으면 표시하지 않음
      if (!isPWAInstalled() && !dismissed) {
        setShowPrompt(true)
      }
    }

    // PWA 설치 완료 이벤트 리스너
    const handleInstalled = () => {
      console.log('PWA installed event received')
      setShowPrompt(false)
      setIsInstalling(false)
    }

    window.addEventListener('pwa-installable', handleInstallable)
    window.addEventListener('pwa-installed', handleInstalled)

    // 컴포넌트 마운트 시 설치 가능 여부 확인
    if (isInstallable() && !isPWAInstalled() && !dismissed) {
      setShowPrompt(true)
    }

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable)
      window.removeEventListener('pwa-installed', handleInstalled)
    }
  }, [dismissed])

  // 설치 실행
  const handleInstall = async () => {
    setIsInstalling(true)
    
    try {
      const success = await installPWA()
      
      if (success) {
        console.log('PWA installation successful')
        setShowPrompt(false)
      } else {
        console.log('PWA installation cancelled or failed')
        setIsInstalling(false)
      }
    } catch (error) {
      console.error('PWA installation error:', error)
      setIsInstalling(false)
    }
  }

  // 프롬프트 닫기
  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    
    // 세션 동안 다시 표시하지 않음
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // 세션 스토리지에서 이전 거부 상태 확인
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('pwa-install-dismissed') === 'true'
    setDismissed(wasDismissed)
  }, [])

  // 클라이언트 사이드에서만 렌더링
  if (!isMounted || !showPrompt || isPWAInstalled()) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 transform transition-all duration-300 animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DevicePhoneMobileIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                앱으로 설치하기
              </h3>
              <p className="text-xs text-gray-600">
                더 빠르고 편리하게 이용하세요
              </p>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 설치 혜택 */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <SparklesIcon className="w-4 h-4 text-green-500" />
            <span>오프라인에서도 출석 체크 가능</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <SparklesIcon className="w-4 h-4 text-green-500" />
            <span>홈 화면에서 바로 실행</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <SparklesIcon className="w-4 h-4 text-green-500" />
            <span>더 빠른 로딩 속도</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            나중에
          </button>
          
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className={`
              flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
              flex items-center justify-center space-x-2
              ${isInstalling 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>설치 중...</span>
              </>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>설치하기</span>
              </>
            )}
          </button>
        </div>

        {/* 설치 방법 안내 (iOS 사용자용) */}
        {typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              iOS: Safari → 공유 버튼 → "홈 화면에 추가"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// 설치 버튼 (헤더나 메뉴에서 사용)
export function InstallButton() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    const checkInstallability = () => {
      setCanInstall(isInstallable() && !isPWAInstalled())
    }

    // 초기 확인
    checkInstallability()

    // 이벤트 리스너
    window.addEventListener('pwa-installable', checkInstallability)
    window.addEventListener('pwa-installed', checkInstallability)

    return () => {
      window.removeEventListener('pwa-installable', checkInstallability)
      window.removeEventListener('pwa-installed', checkInstallability)
    }
  }, [])

  const handleInstall = async () => {
    setIsInstalling(true)
    
    try {
      await installPWA()
    } catch (error) {
      console.error('Install failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  // 클라이언트 사이드에서만 렌더링
  if (!isMounted || !canInstall) {
    return null
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={`
        flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors
        ${isInstalling 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
      `}
    >
      {isInstalling ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>설치 중...</span>
        </>
      ) : (
        <>
          <ArrowDownTrayIcon className="w-4 h-4" />
          <span>앱 설치</span>
        </>
      )}
    </button>
  )
}