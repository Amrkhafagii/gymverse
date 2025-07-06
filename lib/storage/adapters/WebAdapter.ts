/**
 * Web storage adapter using IndexedDB
 * Provides SQLite-like interface for web platform
 */

import { 
  IStorageAdapter, 
  StorageConfig, 
  EntityMetadata, 
  SyncOperation, 
  ConflictResolution,
  MediaCacheEntry,
  OfflineSession,
  SyncStatusInfo,
  QueryOptions,
  SyncPriority
} from '../types';

export class WebStorageAdapter implements IStorageAdapter {
  private db: IDBDatabase | null = null;
  private config: StorageConfig | null = null;

  async initialize(config: StorageConfig): Promise<void> {
    this.config = config;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(config.databaseName, config.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  private createObjectStores(db: IDBDatabase): void {
    // Entities store
    if (!db.objectStoreNames.contains('entities')) {
      const entitiesStore = db.createObjectStore('entities', { keyPath: 'id' });
      entitiesStore.createIndex('entityType', 'entityType', { unique: false });
    }
    
    // Entity metadata store
    if (!db.objectStoreNames.contains('entity_metadata')) {
      const metadataStore = db.createObjectStore('entity_metadata', { keyPath: 'id' });
      metadataStore.createIndex('entityLookup', ['entityType', 'entityId'], { unique: true });
    }
    
    // Sync queue store
    if (!db.objectStoreNames.contains('sync_queue')) {
      const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
      syncStore.createIndex('priority', 'priority', { unique: false });
      syncStore.createIndex('nextRetryAt', 'nextRetryAt', { unique: false });
    }
    
    // Conflict resolution store
    if (!db.objectStoreNames.contains('conflict_resolution')) {
      const conflictStore = db.createObjectStore('conflict_resolution', { keyPath: 'id' });
      conflictStore.createIndex('status', 'status', { unique: false });
    }
    
    // Media cache store
    if (!db.objectStoreNames.contains('media_cache')) {
      const mediaStore = db.createObjectStore('media_cache', { keyPath: 'id' });
      mediaStore.createIndex('mediaUrl', 'mediaUrl', { unique: true });
      mediaStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
    }
    
    // Offline sessions store
    if (!db.objectStoreNames.contains('offline_sessions')) {
      const sessionsStore = db.createObjectStore('offline_sessions', { keyPath: 'id' });
      sessionsStore.createIndex('localSessionId', 'localSessionId', { unique: true });
      sessionsStore.createIndex('isSynced', 'isSynced', { unique: false });
    }
    
    // Sync status store
    if (!db.objectStoreNames.contains('sync_status')) {
      const statusStore = db.createObjectStore('sync_status', { keyPath: 'id' });
      statusStore.createIndex('sessionId', 'sessionId', { unique: true });
    }
  }

  // Entity Operations
  async create<T>(entityType: string, data: T): Promise<string> {
    const id = this.generateId();
    const entity = {
      id,
      entityType,
      data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities'], 'readwrite');
      const store = transaction.objectStore('entities');
      const request = store.add(entity);
      
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async read<T>(entityType: string, id: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities'], 'readonly');
      const store = transaction.objectStore('entities');
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.entityType === entityType) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(entityType: string, id: string, data: Partial<T>): Promise<void> {
    const existing = await this.read(entityType, id);
    if (!existing) {
      throw new Error(`Entity ${entityType}:${id} not found`);
    }
    
    const updatedData = { ...existing, ...data };
    const entity = {
      id,
      entityType,
      data: updatedData,
      updatedAt: new Date()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities'], 'readwrite');
      const store = transaction.objectStore('entities');
      const request = store.put(entity);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async delete(entityType: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities', 'entity_metadata'], 'readwrite');
      
      // Delete entity
      const entitiesStore = transaction.objectStore('entities');
      const deleteEntityRequest = entitiesStore.delete(id);
      
      // Delete metadata
      const metadataStore = transaction.objectStore('entity_metadata');
      const metadataIndex = metadataStore.index('entityLookup');
      const getMetadataRequest = metadataIndex.get([entityType, id]);
      
      getMetadataRequest.onsuccess = () => {
        if (getMetadataRequest.result) {
          metadataStore.delete(getMetadataRequest.result.id);
        }
      };
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async list<T>(entityType: string, options: QueryOptions = {}): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entities'], 'readonly');
      const store = transaction.objectStore('entities');
      const index = store.index('entityType');
      const request = index.getAll(entityType);
      
      request.onsuccess = () => {
        let results = request.result.map(item => item.data);
        
        // Apply sorting
        if (options.orderBy) {
          results.sort((a, b) => {
            const aVal = a[options.orderBy!];
            const bVal = b[options.orderBy!];
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return options.orderDirection === 'desc' ? -comparison : comparison;
          });
        }
        
        // Apply pagination
        if (options.offset) {
          results = results.slice(options.offset);
        }
        if (options.limit) {
          results = results.slice(0, options.limit);
        }
        
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Metadata Operations
  async getMetadata(entityType: string, id: string): Promise<EntityMetadata | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entity_metadata'], 'readonly');
      const store = transaction.objectStore('entity_metadata');
      const index = store.index('entityLookup');
      const request = index.get([entityType, id]);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({
            id: result.id,
            entityType: result.entityType,
            version: result.version,
            lastModified: new Date(result.lastModified),
            checksum: result.checksum,
            isDeleted: result.isDeleted,
            syncStatus: result.syncStatus
          });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateMetadata(entityType: string, id: string, metadata: Partial<EntityMetadata>): Promise<void> {
    const existing = await this.getMetadata(entityType, id);
    
    const metadataRecord = {
      id: existing?.id || this.generateId(),
      entityType,
      entityId: id,
      version: metadata.version || existing?.version || 1,
      lastModified: (metadata.lastModified || new Date()).getTime(),
      checksum: metadata.checksum || existing?.checksum || '',
      isDeleted: metadata.isDeleted !== undefined ? metadata.isDeleted : existing?.isDeleted || false,
      syncStatus: metadata.syncStatus || existing?.syncStatus || 'pending'
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['entity_metadata'], 'readwrite');
      const store = transaction.objectStore('entity_metadata');
      const request = store.put(metadataRecord);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Queue Operations
  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'createdAt'>): Promise<string> {
    const id = this.generateId();
    const syncOperation = {
      id,
      ...operation,
      createdAt: new Date()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.add(syncOperation);
      
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(priority?: SyncPriority): Promise<SyncOperation[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      
      let request: IDBRequest;
      if (priority) {
        const index = store.index('priority');
        request = index.getAll(priority);
      } else {
        request = store.getAll();
      }
      
      request.onsuccess = () => {
        const results = request.result
          .filter(op => op.nextRetryAt <= new Date())
          .sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updated = { ...existing, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error(`Sync operation ${id} not found`));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeSyncOperation(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Conflict Resolution Operations
  async addConflict(conflict: Omit<ConflictResolution, 'id'>): Promise<string> {
    const id = this.generateId();
    const conflictRecord = { id, ...conflict };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conflict_resolution'], 'readwrite');
      const store = transaction.objectStore('conflict_resolution');
      const request = store.add(conflictRecord);
      
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getConflicts(): Promise<ConflictResolution[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conflict_resolution'], 'readonly');
      const store = transaction.objectStore('conflict_resolution');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async resolveConflict(id: string, resolution: Partial<ConflictResolution>): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['conflict_resolution'], 'readwrite');
      const store = transaction.objectStore('conflict_resolution');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updated = { ...existing, ...resolution };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error(`Conflict ${id} not found`));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Media Cache Operations
  async addToMediaCache(entry: Omit<MediaCacheEntry, 'id'>): Promise<string> {
    const id = this.generateId();
    const cacheEntry = { id, ...entry };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['media_cache'], 'readwrite');
      const store = transaction.objectStore('media_cache');
      const request = store.add(cacheEntry);
      
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getMediaCache(url: string): Promise<MediaCacheEntry | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['media_cache'], 'readonly');
      const store = transaction.objectStore('media_cache');
      const index = store.index('mediaUrl');
      const request = index.get(url);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateMediaCache(id: string, updates: Partial<MediaCacheEntry>): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['media_cache'], 'readwrite');
      const store = transaction.objectStore('media_cache');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updated = { ...existing, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error(`Media cache entry ${id} not found`));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async cleanupMediaCache(maxSizeMB: number): Promise<void> {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['media_cache'], 'readwrite');
      const store = transaction.objectStore('media_cache');
      const index = store.index('lastAccessed');
      const request = index.getAll();
      
      request.onsuccess = () => {
        const entries = request.result.sort((a, b) => a.lastAccessed - b.lastAccessed);
        let totalSize = entries.reduce((sum, entry) => sum + entry.fileSize, 0);
        
        const deletePromises: Promise<void>[] = [];
        
        for (const entry of entries) {
          if (totalSize <= maxSizeBytes) break;
          
          deletePromises.push(new Promise((resolveDelete, rejectDelete) => {
            const deleteRequest = store.delete(entry.id);
            deleteRequest.onsuccess = () => {
              totalSize -= entry.fileSize;
              resolveDelete();
            };
            deleteRequest.onerror = () => rejectDelete(deleteRequest.error);
          }));
        }
        
        Promise.all(deletePromises).then(() => resolve()).catch(reject);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Offline Session Operations
  async createOfflineSession(session: Omit<OfflineSession, 'id'>): Promise<string> {
    const id = this.generateId();
    const sessionRecord = { id, ...session };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_sessions'], 'readwrite');
      const store = transaction.objectStore('offline_sessions');
      const request = store.add(sessionRecord);
      
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineSession(localSessionId: string): Promise<OfflineSession | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_sessions'], 'readonly');
      const store = transaction.objectStore('offline_sessions');
      const index = store.index('localSessionId');
      const request = index.get(localSessionId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateOfflineSession(id: string, updates: Partial<OfflineSession>): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_sessions'], 'readwrite');
      const store = transaction.objectStore('offline_sessions');
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (existing) {
          const updated = { ...existing, ...updates };
          const putRequest = store.put(updated);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error(`Offline session ${id} not found`));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getUnsyncedSessions(): Promise<OfflineSession[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offline_sessions'], 'readonly');
      const store = transaction.objectStore('offline_sessions');
      const index = store.index('isSynced');
      const request = index.getAll(false);
      
      request.onsuccess = () => {
        const results = request.result.sort((a, b) => a.startedAt - b.startedAt);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Status Operations
  async updateSyncStatus(sessionId: string, status: Partial<SyncStatusInfo>): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_status'], 'readwrite');
      const store = transaction.objectStore('sync_status');
      const index = store.index('sessionId');
      const getRequest = index.get(sessionId);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        const statusRecord = existing ? 
          { ...existing, ...status, lastActivity: new Date() } :
          { 
            id: this.generateId(), 
            sessionId, 
            totalOperations: 0,
            completedOperations: 0,
            failedOperations: 0,
            progressPercentage: 0,
            status: 'idle',
            lastActivity: new Date(),
            ...status 
          };
        
        const putRequest = store.put(statusRecord);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getSyncStatus(sessionId: string): Promise<SyncStatusInfo | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_status'], 'readonly');
      const store = transaction.objectStore('sync_status');
      const index = store.index('sessionId');
      const request = index.get(sessionId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
