'use client'

// PWA 설치 및 Service Worker 관리

let deferredPrompt: any = null;
let serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

// Service Worker 등록
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return null;
  }

  try {
    console.log('Registering Service Worker...');
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    serviceWorkerRegistration = registration;

    registration.addEventListener('updatefound', () => {
      console.log('Service Worker update found');
      const newWorker = registration.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Service Worker installed, reload recommended');
            // 새 버전 설치 완료 알림
            window.dispatchEvent(new CustomEvent('sw-update-available'));
          }
        });
      }
    });

    console.log('Service Worker registered successfully');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// PWA 설치 프롬프트 설정
export function setupInstallPrompt() {
  if (typeof window === 'undefined') return;

  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('Install prompt triggered');
    e.preventDefault();
    deferredPrompt = e;
    
    // 설치 프롬프트 사용 가능 이벤트 발생
    window.dispatchEvent(new CustomEvent('pwa-installable'));
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA installed successfully');
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

// PWA 설치 실행
export async function installPWA(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('Install prompt not available');
    return false;
  }

  try {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log('Install prompt result:', outcome);
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('PWA installation failed:', error);
    return false;
  }
}

// 설치 가능 여부 확인
export function isInstallable(): boolean {
  return deferredPrompt !== null;
}

// PWA 설치 여부 확인
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: fullscreen)').matches ||
         (window.navigator as any).standalone === true;
}

// 온라인 상태 감지
export function setupOnlineStatusDetection() {
  if (typeof window === 'undefined') return;

  const updateOnlineStatus = () => {
    const isOnline = navigator.onLine;
    console.log('Online status changed:', isOnline);
    
    window.dispatchEvent(new CustomEvent('online-status-changed', {
      detail: { isOnline }
    }));
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // 초기 상태 설정
  setTimeout(updateOnlineStatus, 100);
}

// Service Worker에서 메시지 수신
export function setupServiceWorkerMessaging() {
  if (typeof window === 'undefined' || !navigator.serviceWorker) return;

  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('Message from Service Worker:', event.data);
    
    const { type, ...data } = event.data;
    
    switch (type) {
      case 'SYNC_OFFLINE_DATA':
        window.dispatchEvent(new CustomEvent('sync-offline-data', { detail: data }));
        break;
      default:
        console.log('Unknown Service Worker message type:', type);
    }
  });
}

// 백그라운드 동기화 요청
export async function requestBackgroundSync(tag: string): Promise<boolean> {
  if (!serviceWorkerRegistration || !('sync' in serviceWorkerRegistration)) {
    console.log('Background sync not supported');
    return false;
  }

  try {
    await serviceWorkerRegistration.sync.register(tag);
    console.log('Background sync registered:', tag);
    return true;
  } catch (error) {
    console.error('Background sync registration failed:', error);
    return false;
  }
}

// Service Worker 업데이트 확인
export async function checkForServiceWorkerUpdate(): Promise<boolean> {
  if (!serviceWorkerRegistration) return false;

  try {
    await serviceWorkerRegistration.update();
    return true;
  } catch (error) {
    console.error('Service Worker update check failed:', error);
    return false;
  }
}

// Service Worker 메시지 전송
export function sendMessageToServiceWorker(message: any): boolean {
  if (!navigator.serviceWorker.controller) {
    console.log('No active Service Worker to send message to');
    return false;
  }

  navigator.serviceWorker.controller.postMessage(message);
  return true;
}

// PWA 초기화
export function initializePWA() {
  if (typeof window === 'undefined') return;

  console.log('Initializing PWA...');
  
  setupInstallPrompt();
  setupOnlineStatusDetection();
  setupServiceWorkerMessaging();
  
  // Service Worker 등록
  registerServiceWorker();
  
  console.log('PWA initialization complete');
}