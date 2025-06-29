const CACHE_NAME = 'study-room-v1';
const API_CACHE_NAME = 'study-room-api-v1';

// 정적 자산 캐시할 파일들
const STATIC_ASSETS = [
  '/',
  '/attendance',
  '/students', 
  '/payments',
  '/manifest.json',
  // Next.js 정적 파일들은 런타임에 추가됨
];

// API 엔드포인트 패턴
const API_PATTERNS = [
  /\/api\/v1\/students/,
  /\/api\/v1\/attendance/,
  /\/api\/v1\/payments/
];

// 설치 이벤트 - 정적 자산 캐시
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// 활성화 이벤트 - 오래된 캐시 정리
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch 이벤트 - 네트워크 요청 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 정적 자산 요청 처리 (Navigate 요청 포함)
  if (request.mode === 'navigate' || isStaticAsset(url)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// API 요청인지 확인
function isApiRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// 정적 자산인지 확인
function isStaticAsset(url) {
  return url.pathname.startsWith('/_next/') || 
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.ico');
}

// API 요청 처리 - 네트워크 우선, 캐시 대체
async function handleApiRequest(request) {
  try {
    // 네트워크 요청 시도
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      // 성공한 GET 요청은 캐시에 저장
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache for', request.url);
    
    // 네트워크 실패 시 캐시에서 조회
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 캐시도 없으면 오프라인 응답 반환
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'offline', 
        message: '오프라인 상태입니다. 네트워크 연결을 확인해주세요.' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 정적 자산 요청 처리 - 캐시 우선, 네트워크 대체
async function handleStaticRequest(request) {
  try {
    // 캐시에서 먼저 찾기
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 캐시에 없으면 네트워크에서 가져오기
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // 성공한 응답은 캐시에 저장
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to fetch', request.url, error);
    
    // 네비게이션 요청이고 캐시도 없으면 루트 페이지 반환
    if (request.mode === 'navigate') {
      const rootCache = await caches.match('/');
      if (rootCache) {
        return rootCache;
      }
    }
    
    throw error;
  }
}

// 백그라운드 동기화 (지원되는 경우)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// 오프라인 데이터 동기화
async function syncOfflineData() {
  try {
    console.log('Service Worker: Starting offline data sync');
    
    // 오프라인 출석 데이터 동기화를 메인 스레드에 알림
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_OFFLINE_DATA',
        timestamp: Date.now()
      });
    });
    
    console.log('Service Worker: Offline data sync completed');
  } catch (error) {
    console.error('Service Worker: Offline data sync failed', error);
  }
}

// 푸시 알림 (향후 확장용)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Service Worker: Push received', data);
    
    const options = {
      body: data.body || '새로운 알림이 있습니다.',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'default',
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || '공부방 관리', options)
    );
  }
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then((clients) => {
        // 이미 열린 창이 있으면 포커스
        for (const client of clients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // 새 창 열기
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('Service Worker: Script loaded');