'use client'

import { useEffect, useState } from 'react'
import { initializePWA } from '@/lib/pwa'
import { syncManager } from '@/lib/offline-sync'
import OfflineStatus from '@/components/offline/OfflineStatus'
import InstallPrompt from '@/components/pwa/InstallPrompt'

export default function PWAInitializer() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // PWA 초기화
    console.log('Initializing PWA and offline functionality...')
    
    // PWA 설정 초기화
    initializePWA()
    
    // 오프라인 동기화 매니저 초기화
    syncManager.initialize().then((success) => {
      if (success) {
        console.log('Offline sync manager initialized successfully')
      } else {
        console.warn('Offline sync manager initialization failed')
      }
    })

    // 정리 함수
    return () => {
      syncManager.destroy()
    }
  }, [])

  // 클라이언트 사이드에서만 렌더링
  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* 오프라인 상태 표시 */}
      <OfflineStatus />
      
      {/* PWA 설치 프롬프트 */}
      <InstallPrompt />
    </>
  )
}