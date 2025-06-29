'use client'

// IndexedDB를 사용한 오프라인 데이터 저장소

const DB_NAME = 'StudyRoomOfflineDB';
const DB_VERSION = 1;

// 데이터베이스 스키마
const STORES = {
  STUDENTS: 'students',
  ATTENDANCE: 'attendance', 
  OFFLINE_ATTENDANCE: 'offline_attendance',
  PAYMENTS: 'payments',
  SYNC_QUEUE: 'sync_queue'
} as const;

export interface OfflineAttendance {
  id?: number;
  student_id: number;
  student_name: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  time_in?: string;
  note?: string;
  timestamp: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id?: number;
  type: 'attendance' | 'student' | 'payment';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retries: number;
  lastError?: string;
}

class OfflineDatabase {
  private db: IDBDatabase | null = null;

  // 데이터베이스 초기화
  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not supported');
      return false;
    }

    try {
      this.db = await this.openDatabase();
      console.log('Offline database initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize offline database:', error);
      return false;
    }
  }

  // 데이터베이스 열기
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('Upgrading offline database...');

        // 학생 저장소
        if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
          const studentsStore = db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
          studentsStore.createIndex('name', 'name', { unique: false });
          studentsStore.createIndex('status', 'status', { unique: false });
        }

        // 출석 저장소
        if (!db.objectStoreNames.contains(STORES.ATTENDANCE)) {
          const attendanceStore = db.createObjectStore(STORES.ATTENDANCE, { keyPath: 'id' });
          attendanceStore.createIndex('student_id', 'student_id', { unique: false });
          attendanceStore.createIndex('date', 'date', { unique: false });
        }

        // 오프라인 출석 저장소
        if (!db.objectStoreNames.contains(STORES.OFFLINE_ATTENDANCE)) {
          const offlineStore = db.createObjectStore(STORES.OFFLINE_ATTENDANCE, { keyPath: 'id', autoIncrement: true });
          offlineStore.createIndex('student_id', 'student_id', { unique: false });
          offlineStore.createIndex('date', 'date', { unique: false });
          offlineStore.createIndex('synced', 'synced', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 결제 저장소
        if (!db.objectStoreNames.contains(STORES.PAYMENTS)) {
          const paymentsStore = db.createObjectStore(STORES.PAYMENTS, { keyPath: 'id' });
          paymentsStore.createIndex('student_id', 'student_id', { unique: false });
          paymentsStore.createIndex('status', 'status', { unique: false });
        }

        // 동기화 큐 저장소
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('Database schema created');
      };
    });
  }

  // 트랜잭션 실행 헬퍼
  private async executeTransaction<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    operation: (stores: any) => Promise<T>
  ): Promise<T> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const transaction = this.db.transaction(storeNames, mode);
    const stores = Array.isArray(storeNames) 
      ? storeNames.reduce((acc, name) => ({ ...acc, [name]: transaction.objectStore(name) }), {})
      : transaction.objectStore(storeNames);

    try {
      const result = await operation(stores);
      await this.waitForTransaction(transaction);
      return result;
    } catch (error) {
      transaction.abort();
      throw error;
    }
  }

  // 트랜잭션 완료 대기
  private waitForTransaction(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error('Transaction aborted'));
    });
  }

  // === 학생 데이터 관리 ===

  async saveStudents(students: any[]): Promise<boolean> {
    try {
      await this.executeTransaction(STORES.STUDENTS, 'readwrite', async (store) => {
        // 기존 데이터 삭제
        await this.clearStore(store);
        
        // 새 데이터 저장
        for (const student of students) {
          await this.putRecord(store, student);
        }
      });
      
      console.log(`Saved ${students.length} students to offline storage`);
      return true;
    } catch (error) {
      console.error('Failed to save students:', error);
      return false;
    }
  }

  async getStudents(): Promise<any[]> {
    try {
      return await this.executeTransaction(STORES.STUDENTS, 'readonly', async (store) => {
        return await this.getAllRecords(store);
      });
    } catch (error) {
      console.error('Failed to get students:', error);
      return [];
    }
  }

  async getStudentById(id: number): Promise<any | null> {
    try {
      return await this.executeTransaction(STORES.STUDENTS, 'readonly', async (store) => {
        return await this.getRecord(store, id);
      });
    } catch (error) {
      console.error('Failed to get student:', error);
      return null;
    }
  }

  // === 오프라인 출석 관리 ===

  async saveOfflineAttendance(attendance: Omit<OfflineAttendance, 'id'>): Promise<number | null> {
    try {
      const id = await this.executeTransaction(STORES.OFFLINE_ATTENDANCE, 'readwrite', async (store) => {
        const request = store.add({
          ...attendance,
          timestamp: Date.now(),
          synced: false
        });
        return await this.waitForRequest<number>(request);
      });
      
      console.log('Saved offline attendance:', id);
      return id;
    } catch (error) {
      console.error('Failed to save offline attendance:', error);
      return null;
    }
  }

  async getOfflineAttendance(): Promise<OfflineAttendance[]> {
    try {
      return await this.executeTransaction(STORES.OFFLINE_ATTENDANCE, 'readonly', async (store) => {
        return await this.getAllRecords(store);
      });
    } catch (error) {
      console.error('Failed to get offline attendance:', error);
      return [];
    }
  }

  async getUnsyncedAttendance(): Promise<OfflineAttendance[]> {
    try {
      return await this.executeTransaction(STORES.OFFLINE_ATTENDANCE, 'readonly', async (store) => {
        const index = store.index('synced');
        const request = index.getAll(false);
        return await this.waitForRequest<OfflineAttendance[]>(request);
      });
    } catch (error) {
      console.error('Failed to get unsynced attendance:', error);
      return [];
    }
  }

  async markAttendanceSynced(id: number): Promise<boolean> {
    try {
      await this.executeTransaction(STORES.OFFLINE_ATTENDANCE, 'readwrite', async (store) => {
        const record = await this.getRecord(store, id);
        if (record) {
          record.synced = true;
          await this.putRecord(store, record);
        }
      });
      
      console.log('Marked attendance as synced:', id);
      return true;
    } catch (error) {
      console.error('Failed to mark attendance as synced:', error);
      return false;
    }
  }

  async deleteOfflineAttendance(id: number): Promise<boolean> {
    try {
      await this.executeTransaction(STORES.OFFLINE_ATTENDANCE, 'readwrite', async (store) => {
        await this.deleteRecord(store, id);
      });
      
      console.log('Deleted offline attendance:', id);
      return true;
    } catch (error) {
      console.error('Failed to delete offline attendance:', error);
      return false;
    }
  }

  // === 동기화 큐 관리 ===

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<number | null> {
    try {
      const id = await this.executeTransaction(STORES.SYNC_QUEUE, 'readwrite', async (store) => {
        const request = store.add({
          ...item,
          timestamp: Date.now(),
          retries: 0
        });
        return await this.waitForRequest<number>(request);
      });
      
      console.log('Added to sync queue:', id);
      return id;
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      return null;
    }
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      return await this.executeTransaction(STORES.SYNC_QUEUE, 'readonly', async (store) => {
        return await this.getAllRecords(store);
      });
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  async updateSyncQueueItem(id: number, updates: Partial<SyncQueueItem>): Promise<boolean> {
    try {
      await this.executeTransaction(STORES.SYNC_QUEUE, 'readwrite', async (store) => {
        const record = await this.getRecord(store, id);
        if (record) {
          Object.assign(record, updates);
          await this.putRecord(store, record);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Failed to update sync queue item:', error);
      return false;
    }
  }

  async removeSyncQueueItem(id: number): Promise<boolean> {
    try {
      await this.executeTransaction(STORES.SYNC_QUEUE, 'readwrite', async (store) => {
        await this.deleteRecord(store, id);
      });
      
      console.log('Removed from sync queue:', id);
      return true;
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
      return false;
    }
  }

  // === 유틸리티 메서드 ===

  private async clearStore(store: IDBObjectStore): Promise<void> {
    const request = store.clear();
    await this.waitForRequest(request);
  }

  private async getAllRecords(store: IDBObjectStore): Promise<any[]> {
    const request = store.getAll();
    return await this.waitForRequest<any[]>(request);
  }

  private async getRecord(store: IDBObjectStore, key: any): Promise<any> {
    const request = store.get(key);
    return await this.waitForRequest(request);
  }

  private async putRecord(store: IDBObjectStore, record: any): Promise<any> {
    const request = store.put(record);
    return await this.waitForRequest(request);
  }

  private async deleteRecord(store: IDBObjectStore, key: any): Promise<void> {
    const request = store.delete(key);
    await this.waitForRequest(request);
  }

  private waitForRequest<T = any>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 데이터베이스 정리
  async cleanup(): Promise<boolean> {
    try {
      // 30일 이상 된 동기화 완료 데이터 삭제
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      await this.executeTransaction(STORES.OFFLINE_ATTENDANCE, 'readwrite', async (store) => {
        const index = store.index('timestamp');
        const request = index.openCursor(IDBKeyRange.upperBound(thirtyDaysAgo));
        
        return new Promise<void>((resolve, reject) => {
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              const record = cursor.value;
              if (record.synced) {
                cursor.delete();
              }
              cursor.continue();
            } else {
              resolve();
            }
          };
          request.onerror = () => reject(request.error);
        });
      });
      
      console.log('Database cleanup completed');
      return true;
    } catch (error) {
      console.error('Database cleanup failed:', error);
      return false;
    }
  }

  // 데이터베이스 상태 확인
  async getStatus(): Promise<{
    studentsCount: number;
    offlineAttendanceCount: number;
    unsyncedCount: number;
    syncQueueCount: number;
  }> {
    try {
      const [students, offlineAttendance, unsynced, syncQueue] = await Promise.all([
        this.getStudents(),
        this.getOfflineAttendance(),
        this.getUnsyncedAttendance(),
        this.getSyncQueue()
      ]);

      return {
        studentsCount: students.length,
        offlineAttendanceCount: offlineAttendance.length,
        unsyncedCount: unsynced.length,
        syncQueueCount: syncQueue.length
      };
    } catch (error) {
      console.error('Failed to get database status:', error);
      return {
        studentsCount: 0,
        offlineAttendanceCount: 0,
        unsyncedCount: 0,
        syncQueueCount: 0
      };
    }
  }
}

// 싱글톤 인스턴스
export const offlineDB = new OfflineDatabase();