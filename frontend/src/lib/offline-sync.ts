'use client'

import { offlineDB, OfflineAttendance, SyncQueueItem } from './offline-db';
import { api } from './api';

// 동기화 상태 관리
export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: number;
  pendingCount: number;
  failedCount: number;
  errors: string[];
}

class OfflineSyncManager {
  private syncStatus: SyncStatus = {
    isOnline: navigator?.onLine ?? true,
    isSyncing: false,
    lastSyncTime: 0,
    pendingCount: 0,
    failedCount: 0,
    errors: []
  };

  private listeners: ((status: SyncStatus) => void)[] = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
  }

  // 이벤트 리스너 설정
  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // 온라인 상태 변경 감지
    window.addEventListener('online', () => {
      console.log('Device came online');
      this.updateOnlineStatus(true);
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      console.log('Device went offline');
      this.updateOnlineStatus(false);
    });

    // Service Worker 메시지 수신
    window.addEventListener('sync-offline-data', () => {
      console.log('Background sync triggered');
      this.triggerSync();
    });

    // 주기적 동기화 (온라인일 때만)
    this.syncInterval = setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
        this.triggerSync();
      }
    }, 5 * 60 * 1000); // 5분마다
  }

  // 온라인 상태 업데이트
  private updateOnlineStatus(isOnline: boolean) {
    this.syncStatus.isOnline = isOnline;
    this.notifyListeners();
  }

  // 동기화 상태 리스너 등록
  onStatusChange(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
    
    // 현재 상태 즉시 전달
    listener(this.syncStatus);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 리스너들에게 상태 변경 알림
  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.syncStatus }));
  }

  // 현재 동기화 상태 반환
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // 오프라인 출석 데이터 저장
  async saveOfflineAttendance(attendanceData: {
    student_id: number;
    student_name: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'early_leave';
    time_in?: string;
    note?: string;
  }): Promise<boolean> {
    try {
      console.log('Saving offline attendance:', attendanceData);

      // IndexedDB에 저장
      const id = await offlineDB.saveOfflineAttendance(attendanceData);
      
      if (id) {
        // 동기화 큐에 추가
        await offlineDB.addToSyncQueue({
          type: 'attendance',
          action: 'create',
          data: { ...attendanceData, offlineId: id }
        });

        await this.updatePendingCount();
        
        // 온라인 상태면 즉시 동기화 시도
        if (this.syncStatus.isOnline) {
          this.triggerSync();
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to save offline attendance:', error);
      return false;
    }
  }

  // 학생 데이터 캐시 저장
  async cacheStudents(students: any[]): Promise<boolean> {
    try {
      const success = await offlineDB.saveStudents(students);
      console.log('Students cached:', success);
      return success;
    } catch (error) {
      console.error('Failed to cache students:', error);
      return false;
    }
  }

  // 캐시된 학생 데이터 조회
  async getCachedStudents(): Promise<any[]> {
    try {
      return await offlineDB.getStudents();
    } catch (error) {
      console.error('Failed to get cached students:', error);
      return [];
    }
  }

  // 학생 데이터 조회 (오프라인 지원)
  async getStudentsWithOfflineSupport(): Promise<any[]> {
    if (this.syncStatus.isOnline) {
      try {
        // 온라인일 때는 API에서 최신 데이터 가져오기
        const response = await api.getStudents({ is_active: true });
        if (response.success && response.data?.students) {
          const students = response.data.students;
          // 캐시에 저장
          await this.cacheStudents(students);
          return students;
        }
      } catch (error) {
        console.log('API call failed, falling back to cache');
      }
    }

    // 오프라인이거나 API 실패 시 캐시에서 조회
    return await this.getCachedStudents();
  }

  // 동기화 실행
  async triggerSync(): Promise<boolean> {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing) {
      return false;
    }

    console.log('Starting offline data sync...');
    this.syncStatus.isSyncing = true;
    this.syncStatus.errors = [];
    this.notifyListeners();

    try {
      // 동기화되지 않은 출석 데이터 가져오기
      const unsyncedAttendance = await offlineDB.getUnsyncedAttendance();
      console.log(`Found ${unsyncedAttendance.length} unsynced attendance records`);

      let successCount = 0;
      let failureCount = 0;

      // 각 출석 데이터 동기화
      for (const attendance of unsyncedAttendance) {
        try {
          await this.syncAttendanceRecord(attendance);
          successCount++;
        } catch (error) {
          console.error('Failed to sync attendance:', attendance.id, error);
          failureCount++;
          this.syncStatus.errors.push(`출석 동기화 실패: ${attendance.student_name} (${error})`);
        }
      }

      // 동기화 큐 처리
      const syncQueue = await offlineDB.getSyncQueue();
      for (const item of syncQueue) {
        try {
          await this.processSyncQueueItem(item);
        } catch (error) {
          console.error('Failed to process sync queue item:', item.id, error);
          await offlineDB.updateSyncQueueItem(item.id!, {
            retries: item.retries + 1,
            lastError: error instanceof Error ? error.message : String(error)
          });
        }
      }

      this.syncStatus.lastSyncTime = Date.now();
      this.syncStatus.failedCount = failureCount;

      await this.updatePendingCount();
      
      console.log(`Sync completed: ${successCount} success, ${failureCount} failed`);
      return failureCount === 0;

    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatus.errors.push(`동기화 실패: ${error}`);
      return false;
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  // 개별 출석 레코드 동기화
  private async syncAttendanceRecord(attendance: OfflineAttendance): Promise<void> {
    const syncData = {
      student_id: attendance.student_id,
      date: attendance.date,
      status: attendance.status,
      time_in: attendance.time_in,
      note: attendance.note
    };

    console.log('Syncing attendance record:', syncData);

    const response = await api.markAttendance(syncData);
    
    if (response.success) {
      // 동기화 성공 시 상태 업데이트
      if (attendance.id) {
        await offlineDB.markAttendanceSynced(attendance.id);
      }
      console.log('Attendance synced successfully:', attendance.id);
    } else {
      throw new Error(response.error || 'Unknown sync error');
    }
  }

  // 동기화 큐 아이템 처리
  private async processSyncQueueItem(item: SyncQueueItem): Promise<void> {
    console.log('Processing sync queue item:', item);

    switch (item.type) {
      case 'attendance':
        await this.syncAttendanceFromQueue(item);
        break;
      case 'student':
        await this.syncStudentFromQueue(item);
        break;
      case 'payment':
        await this.syncPaymentFromQueue(item);
        break;
      default:
        throw new Error(`Unknown sync item type: ${item.type}`);
    }

    // 성공 시 큐에서 제거
    if (item.id) {
      await offlineDB.removeSyncQueueItem(item.id);
    }
  }

  // 출석 데이터 동기화 (큐에서)
  private async syncAttendanceFromQueue(item: SyncQueueItem): Promise<void> {
    const { data } = item;
    
    switch (item.action) {
      case 'create':
        const response = await api.markAttendance({
          student_id: data.student_id,
          date: data.date,
          status: data.status,
          time_in: data.time_in,
          note: data.note
        });
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to create attendance');
        }

        // 오프라인 레코드 동기화 완료 표시
        if (data.offlineId) {
          await offlineDB.markAttendanceSynced(data.offlineId);
        }
        break;

      case 'update':
        // 출석 업데이트 로직 (필요 시 구현)
        throw new Error('Attendance update not implemented');

      case 'delete':
        // 출석 삭제 로직 (필요 시 구현)
        throw new Error('Attendance delete not implemented');

      default:
        throw new Error(`Unknown attendance action: ${item.action}`);
    }
  }

  // 학생 데이터 동기화 (큐에서)
  private async syncStudentFromQueue(item: SyncQueueItem): Promise<void> {
    // 학생 데이터 동기화 로직 (필요 시 구현)
    console.log('Student sync not implemented:', item);
  }

  // 결제 데이터 동기화 (큐에서)
  private async syncPaymentFromQueue(item: SyncQueueItem): Promise<void> {
    // 결제 데이터 동기화 로직 (필요 시 구현)
    console.log('Payment sync not implemented:', item);
  }

  // 대기 중인 항목 수 업데이트
  private async updatePendingCount(): Promise<void> {
    try {
      const [unsynced, queue] = await Promise.all([
        offlineDB.getUnsyncedAttendance(),
        offlineDB.getSyncQueue()
      ]);
      
      this.syncStatus.pendingCount = unsynced.length + queue.length;
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }

  // 충돌 해결 (같은 학생, 같은 날짜 중복 체크)
  async resolveConflicts(): Promise<void> {
    try {
      const offlineAttendance = await offlineDB.getOfflineAttendance();
      const conflicts = new Map<string, OfflineAttendance[]>();

      // 같은 학생의 같은 날짜 기록들 그룹핑
      offlineAttendance.forEach(record => {
        const key = `${record.student_id}-${record.date}`;
        if (!conflicts.has(key)) {
          conflicts.set(key, []);
        }
        conflicts.get(key)!.push(record);
      });

      // 중복 기록 처리
      for (const [key, records] of conflicts) {
        if (records.length > 1) {
          console.log(`Found ${records.length} conflicting records for ${key}`);
          
          // 가장 최근 기록만 유지, 나머지는 삭제
          records.sort((a, b) => b.timestamp - a.timestamp);
          const keepRecord = records[0];
          const deleteRecords = records.slice(1);

          for (const record of deleteRecords) {
            if (record.id) {
              await offlineDB.deleteOfflineAttendance(record.id);
              console.log(`Deleted conflicting record: ${record.id}`);
            }
          }

          console.log(`Kept most recent record for ${key}:`, keepRecord.id);
        }
      }

      await this.updatePendingCount();
    } catch (error) {
      console.error('Failed to resolve conflicts:', error);
    }
  }

  // 데이터베이스 정리
  async cleanup(): Promise<void> {
    try {
      await offlineDB.cleanup();
      await this.updatePendingCount();
      console.log('Offline data cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup offline data:', error);
    }
  }

  // 초기화
  async initialize(): Promise<boolean> {
    try {
      const success = await offlineDB.initialize();
      if (success) {
        await this.updatePendingCount();
        
        // 초기 동기화 시도 (온라인인 경우)
        if (this.syncStatus.isOnline) {
          setTimeout(() => this.triggerSync(), 1000);
        }
      }
      return success;
    } catch (error) {
      console.error('Failed to initialize sync manager:', error);
      return false;
    }
  }

  // 정리
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.listeners = [];
  }
}

// 싱글톤 인스턴스
export const syncManager = new OfflineSyncManager();