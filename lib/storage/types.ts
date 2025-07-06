/**
 * Core storage types for offline-first architecture
 * Platform-agnostic interfaces for consistent data handling
 */

export interface StorageConfig {
  databaseName: string;
  version: number;
  encryptionKey?: string;
  maxCacheSize?: number; // in MB
  syncEndpoint?: string;
}

export interface EntityMetadata {
  id: string;
  entityType: string;
  version: number;
  lastModified: Date;
  checksum: string;
  isDeleted?: boolean;
  syncStatus: SyncStatus;
}

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'error' | 'local_only';

export type SyncPriority = 1 | 2 | 3; // 1=high, 2=medium, 3=low

export type OperationType = 'create' | 'update' | 'delete';

export interface SyncOperation {
  id: string;
  entityType: string;
  entityId: string;
  operation: OperationType;
  priority: SyncPriority;
  data: any;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: Date;
  createdAt: Date;
  error?: string;
}

export interface ConflictResolution {
  id: string;
  entityType: string;
  entityId: string;
  conflictType: 'version_mismatch' | 'concurrent_edit' | 'delete_conflict';
  localVersion: number;
  remoteVersion: number;
  localData: any;
  remoteData: any;
  strategy?: 'last_write_wins' | 'merge' | 'user_prompt' | 'manual';
  resolvedData?: any;
  status: 'pending' | 'resolved' | 'escalated';
}

export interface MediaCacheEntry {
  id: string;
  mediaUrl: string;
  localPath: string;
  mediaType: 'image' | 'video' | 'audio';
  fileSize: number;
  priority: SyncPriority;
  accessCount: number;
  lastAccessed: Date;
  expiresAt?: Date;
  checksum: string;
  isSynced: boolean;
}

export interface OfflineSession {
  id: string;
  sessionType: 'workout' | 'measurement' | 'progress_photo';
  localSessionId: string;
  data: any;
  startedAt: Date;
  endedAt?: Date;
  isSynced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: Date;
  syncError?: string;
}

export interface SyncStatusInfo {
  sessionId: string;
  totalOperations: number;
  completedOperations: number;
  failedOperations: number;
  currentOperation?: string;
  progressPercentage: number;
  status: 'idle' | 'syncing' | 'completed' | 'failed' | 'paused';
  startedAt?: Date;
  completedAt?: Date;
  lastActivity: Date;
  errorDetails?: any;
}

// Storage abstraction interfaces
export interface IStorageAdapter {
  initialize(config: StorageConfig): Promise<void>;
  close(): Promise<void>;
  
  // Entity operations
  create<T>(entityType: string, data: T): Promise<string>;
  read<T>(entityType: string, id: string): Promise<T | null>;
  update<T>(entityType: string, id: string, data: Partial<T>): Promise<void>;
  delete(entityType: string, id: string): Promise<void>;
  list<T>(entityType: string, options?: QueryOptions): Promise<T[]>;
  
  // Metadata operations
  getMetadata(entityType: string, id: string): Promise<EntityMetadata | null>;
  updateMetadata(entityType: string, id: string, metadata: Partial<EntityMetadata>): Promise<void>;
  
  // Sync operations
  addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'createdAt'>): Promise<string>;
  getSyncQueue(priority?: SyncPriority): Promise<SyncOperation[]>;
  updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void>;
  removeSyncOperation(id: string): Promise<void>;
  
  // Conflict resolution
  addConflict(conflict: Omit<ConflictResolution, 'id'>): Promise<string>;
  getConflicts(): Promise<ConflictResolution[]>;
  resolveConflict(id: string, resolution: Partial<ConflictResolution>): Promise<void>;
  
  // Media cache
  addToMediaCache(entry: Omit<MediaCacheEntry, 'id'>): Promise<string>;
  getMediaCache(url: string): Promise<MediaCacheEntry | null>;
  updateMediaCache(id: string, updates: Partial<MediaCacheEntry>): Promise<void>;
  cleanupMediaCache(maxSize: number): Promise<void>;
  
  // Offline sessions
  createOfflineSession(session: Omit<OfflineSession, 'id'>): Promise<string>;
  getOfflineSession(localSessionId: string): Promise<OfflineSession | null>;
  updateOfflineSession(id: string, updates: Partial<OfflineSession>): Promise<void>;
  getUnsyncedSessions(): Promise<OfflineSession[]>;
  
  // Sync status
  updateSyncStatus(sessionId: string, status: Partial<SyncStatusInfo>): Promise<void>;
  getSyncStatus(sessionId: string): Promise<SyncStatusInfo | null>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  where?: Record<string, any>;
  include?: string[];
}

// Platform-specific adapter interfaces
export interface SQLiteAdapter extends IStorageAdapter {
  executeRaw(sql: string, params?: any[]): Promise<any>;
  transaction<T>(callback: () => Promise<T>): Promise<T>;
}

export interface RealmAdapter extends IStorageAdapter {
  getRealmInstance(): any; // Realm instance
  addListener(entityType: string, callback: (changes: any) => void): void;
  removeListener(entityType: string, callback: (changes: any) => void): void;
}

// Sync event types
export interface SyncEvent {
  type: 'sync_started' | 'sync_progress' | 'sync_completed' | 'sync_failed' | 'conflict_detected';
  sessionId: string;
  data?: any;
  timestamp: Date;
}

export type SyncEventListener = (event: SyncEvent) => void;
