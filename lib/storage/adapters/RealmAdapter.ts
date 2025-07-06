/**
 * Realm storage adapter for React Native
 * Provides Realm-based storage with reactive capabilities
 */

import { 
  IStorageAdapter, 
  RealmAdapter as IRealmAdapter,
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

// Realm import - only available in React Native
let Realm: any;
try {
  Realm = require('realm');
} catch (error) {
  // Realm not available
}

// Realm schemas
const EntitySchema = {
  name: 'Entity',
  primaryKey: 'id',
  properties: {
    id: 'string',
    entityType: 'string',
    data: 'string', // JSON string
    createdAt: 'date',
    updatedAt: 'date'
  }
};

const EntityMetadataSchema = {
  name: 'EntityMetadata',
  primaryKey: 'id',
  properties: {
    id: 'string',
    entityType: 'string',
    entityId: 'string',
    version: { type: 'int', default: 1 },
    lastModified: 'date',
    checksum: 'string',
    isDeleted: { type: 'bool', default: false },
    syncStatus: { type: 'string', default: 'pending' }
  }
};

const SyncQueueSchema = {
  name: 'SyncQueue',
  primaryKey: 'id',
  properties: {
    id: 'string',
    entityType: 'string',
    entityId: 'string',
    operation: 'string',
    priority: { type: 'int', default: 2 },
    data: 'string', // JSON string
    retryCount: { type: 'int', default: 0 },
    maxRetries: { type: 'int', default: 3 },
    nextRetryAt: 'date',
    createdAt: 'date',
    error: 'string?'
  }
};

const ConflictResolutionSchema = {
  name: 'ConflictResolution',
  primaryKey: 'id',
  properties: {
    id: 'string',
    entityType: 'string',
    entityId: 'string',
    conflictType: 'string',
    localVersion: 'int',
    remoteVersion: 'int',
    localData: 'string', // JSON string
    remoteData: 'string', // JSON string
    strategy: 'string?',
    resolvedData: 'string?', // JSON string
    status: { type: 'string', default: 'pending' }
  }
};

const MediaCacheSchema = {
  name: 'MediaCache',
  primaryKey: 'id',
  properties: {
    id: 'string',
    mediaUrl: 'string',
    localPath: 'string',
    mediaType: 'string',
    fileSize: 'int',
    priority: { type: 'int', default: 2 },
    accessCount: { type: 'int', default: 0 },
    lastAccessed: 'date',
    expiresAt: 'date?',
    checksum: 'string',
    isSynced: { type: 'bool', default: false }
  }
};

const OfflineSessionSchema = {
  name: 'OfflineSession',
  primaryKey: 'id',
  properties: {
    id: 'string',
    sessionType: 'string',
    localSessionId: 'string',
    data: 'string', // JSON string
    startedAt: 'date',
    endedAt: 'date?',
    isSynced: { type: 'bool', default: false },
    syncAttempts: { type: 'int', default: 0 },
    lastSyncAttempt: 'date?',
    syncError: 'string?'
  }
};

const SyncStatusSchema = {
  name: 'SyncStatus',
  primaryKey: 'id',
  properties: {
    id: 'string',
    sessionId: 'string',
    totalOperations: { type: 'int', default: 0 },
    completedOperations: { type: 'int', default: 0 },
    failedOperations: { type: 'int', default: 0 },
    currentOperation: 'string?',
    progressPercentage: { type: 'double', default: 0.0 },
    status: { type: 'string', default: 'idle' },
    startedAt: 'date?',
    completedAt: 'date?',
    lastActivity: 'date',
    errorDetails: 'string?' // JSON string
  }
};

export class RealmStorageAdapter implements IRealmAdapter {
  private realm: any = null;
  private config: StorageConfig | null = null;
  private listeners: Map<string, ((changes: any) => void)[]> = new Map();

  async initialize(config: StorageConfig): Promise<void> {
    if (!Realm) {
      throw new Error('Realm not available. Install realm package for React Native.');
    }

    this.config = config;
    
    try {
      this.realm = await Realm.open({
        path: config.databaseName,
        schema: [
          EntitySchema,
          EntityMetadataSchema,
          SyncQueueSchema,
          ConflictResolutionSchema,
          MediaCacheSchema,
          OfflineSessionSchema,
          SyncStatusSchema
        ],
        schemaVersion: config.version || 1,
        migration: this.handleMigration.bind(this)
      });
    } catch (error) {
      console.error('Realm initialization failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.realm) {
      this.realm.close();
      this.realm = null;
    }
    this.listeners.clear();
  }

  private handleMigration(oldRealm: any, newRealm: any): void {
    // Handle schema migrations here
    const oldVersion = oldRealm.schemaVersion;
    const newVersion = newRealm.schemaVersion;
    
    console.log(`Migrating Realm from version ${oldVersion} to ${newVersion}`);
    
    // Add migration logic as needed
  }

  getRealmInstance(): any {
    return this.realm;
  }

  addListener(entityType: string, callback: (changes: any) => void): void {
    if (!this.listeners.has(entityType)) {
      this.listeners.set(entityType, []);
    }
    this.listeners.get(entityType)!.push(callback);
    
    // Add Realm listener
    const objects = this.realm.objects(this.getSchemaName(entityType));
    objects.addListener(callback);
  }

  removeListener(entityType: string, callback: (changes: any) => void): void {
    const callbacks = this.listeners.get(entityType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        
        // Remove Realm listener
        const objects = this.realm.objects(this.getSchemaName(entityType));
        objects.removeListener(callback);
      }
    }
  }

  private getSchemaName(entityType: string): string {
    // Map entity types to schema names
    const schemaMap: Record<string, string> = {
      'entities': 'Entity',
      'metadata': 'EntityMetadata',
      'sync_queue': 'SyncQueue',
      'conflicts': 'ConflictResolution',
      'media_cache': 'MediaCache',
      'offline_sessions': 'OfflineSession',
      'sync_status': 'SyncStatus'
    };
    
    return schemaMap[entityType] || 'Entity';
  }

  // Entity Operations
  async create<T>(entityType: string, data: T): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    this.realm.write(() => {
      this.realm.create('Entity', {
        id,
        entityType,
        data: JSON.stringify(data),
        createdAt: now,
        updatedAt: now
      });
    });
    
    return id;
  }

  async read<T>(entityType: string, id: string): Promise<T | null> {
    const entity = this.realm.objectForPrimaryKey('Entity', id);
    
    if (entity && entity.entityType === entityType) {
      return JSON.parse(entity.data);
    }
    
    return null;
  }

  async update<T>(entityType: string, id: string, data: Partial<T>): Promise<void> {
    const entity = this.realm.objectForPrimaryKey('Entity', id);
    
    if (!entity || entity.entityType !== entityType) {
      throw new Error(`Entity ${entityType}:${id} not found`);
    }
    
    const existingData = JSON.parse(entity.data);
    const updatedData = { ...existingData, ...data };
    
    this.realm.write(() => {
      entity.data = JSON.stringify(updatedData);
      entity.updatedAt = new Date();
    });
  }

  async delete(entityType: string, id: string): Promise<void> {
    const entity = this.realm.objectForPrimaryKey('Entity', id);
    const metadata = this.realm.objects('EntityMetadata')
      .filtered('entityType = $0 AND entityId = $1', entityType, id)[0];
    
    this.realm.write(() => {
      if (entity) {
        this.realm.delete(entity);
      }
      if (metadata) {
        this.realm.delete(metadata);
      }
    });
  }

  async list<T>(entityType: string, options: QueryOptions = {}): Promise<T[]> {
    let objects = this.realm.objects('Entity').filtered('entityType = $0', entityType);
    
    // Apply sorting
    if (options.orderBy) {
      const sortDescriptor = options.orderDirection === 'desc' ? 
        `data.${options.orderBy} DESC` : 
        `data.${options.orderBy} ASC`;
      objects = objects.sorted(sortDescriptor);
    }
    
    // Convert to array and apply pagination
    let results = Array.from(objects).map((entity: any) => JSON.parse(entity.data));
    
    if (options.offset) {
      results = results.slice(options.offset);
    }
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    return results;
  }

  // Metadata Operations
  async getMetadata(entityType: string, id: string): Promise<EntityMetadata | null> {
    const metadata = this.realm.objects('EntityMetadata')
      .filtered('entityType = $0 AND entityId = $1', entityType, id)[0];
    
    if (metadata) {
      return {
        id: metadata.id,
        entityType: metadata.entityType,
        version: metadata.version,
        lastModified: metadata.lastModified,
        checksum: metadata.checksum,
        isDeleted: metadata.isDeleted,
        syncStatus: metadata.syncStatus
      };
    }
    
    return null;
  }

  async updateMetadata(entityType: string, id: string, metadata: Partial<EntityMetadata>): Promise<void> {
    const existing = this.realm.objects('EntityMetadata')
      .filtered('entityType = $0 AND entityId = $1', entityType, id)[0];
    
    this.realm.write(() => {
      if (existing) {
        // Update existing metadata
        if (metadata.version !== undefined) existing.version = metadata.version;
        if (metadata.lastModified) existing.lastModified = metadata.lastModified;
        if (metadata.checksum) existing.checksum = metadata.checksum;
        if (metadata.isDeleted !== undefined) existing.isDeleted = metadata.isDeleted;
        if (metadata.syncStatus) existing.syncStatus = metadata.syncStatus;
      } else {
        // Create new metadata
        this.realm.create('EntityMetadata', {
          id: this.generateId(),
          entityType,
          entityId: id,
          version: metadata.version || 1,
          lastModified: metadata.lastModified || new Date(),
          checksum: metadata.checksum || '',
          isDeleted: metadata.isDeleted || false,
          syncStatus: metadata.syncStatus || 'pending'
        });
      }
    });
  }

  // Sync Queue Operations
  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'createdAt'>): Promise<string> {
    const id = this.generateId();
    
    this.realm.write(() => {
      this.realm.create('SyncQueue', {
        id,
        entityType: operation.entityType,
        entityId: operation.entityId,
        operation: operation.operation,
        priority: operation.priority,
        data: JSON.stringify(operation.data),
        retryCount: operation.retryCount,
        maxRetries: operation.maxRetries,
        nextRetryAt: operation.nextRetryAt,
        createdAt: new Date(),
        error: operation.error || null
      });
    });
    
    return id;
  }

  async getSyncQueue(priority?: SyncPriority): Promise<SyncOperation[]> {
    let objects = this.realm.objects('SyncQueue')
      .filtered('nextRetryAt <= $0', new Date());
    
    if (priority) {
      objects = objects.filtered('priority = $0', priority);
    }
    
    objects = objects.sorted('priority ASC, createdAt ASC');
    
    return Array.from(objects).map((item: any) => ({
      id: item.id,
      entityType: item.entityType,
      entityId: item.entityId,
      operation: item.operation,
      priority: item.priority,
      data: JSON.parse(item.data),
      retryCount: item.retryCount,
      maxRetries: item.maxRetries,
      nextRetryAt: item.nextRetryAt,
      createdAt: item.createdAt,
      error: item.error
    }));
  }

  async updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void> {
    const operation = this.realm.objectForPrimaryKey('SyncQueue', id);
    
    if (!operation) {
      throw new Error(`Sync operation ${id} not found`);
    }
    
    this.realm.write(() => {
      if (updates.retryCount !== undefined) operation.retryCount = updates.retryCount;
      if (updates.nextRetryAt) operation.nextRetryAt = updates.nextRetryAt;
      if (updates.error !== undefined) operation.error = updates.error;
    });
  }

  async removeSyncOperation(id: string): Promise<void> {
    const operation = this.realm.objectForPrimaryKey('SyncQueue', id);
    
    if (operation) {
      this.realm.write(() => {
        this.realm.delete(operation);
      });
    }
  }

  // Conflict Resolution Operations
  async addConflict(conflict: Omit<ConflictResolution, 'id'>): Promise<string> {
    const id = this.generateId();
    
    this.realm.write(() => {
      this.realm.create('ConflictResolution', {
        id,
        entityType: conflict.entityType,
        entityId: conflict.entityId,
        conflictType: conflict.conflictType,
        localVersion: conflict.localVersion,
        remoteVersion: conflict.remoteVersion,
        localData: JSON.stringify(conflict.localData),
        remoteData: JSON.stringify(conflict.remoteData),
        strategy: conflict.strategy || null,
        resolvedData: conflict.resolvedData ? JSON.stringify(conflict.resolvedData) : null,
        status: conflict.status
      });
    });
    
    return id;
  }

  async getConflicts(): Promise<ConflictResolution[]> {
    const conflicts = this.realm.objects('ConflictResolution').sorted('id DESC');
    
    return Array.from(conflicts).map((item: any) => ({
      id: item.id,
      entityType: item.entityType,
      entityId: item.entityId,
      conflictType: item.conflictType,
      localVersion: item.localVersion,
      remoteVersion: item.remoteVersion,
      localData: JSON.parse(item.localData),
      remoteData: JSON.parse(item.remoteData),
      strategy: item.strategy,
      resolvedData: item.resolvedData ? JSON.parse(item.resolvedData) : undefined,
      status: item.status
    }));
  }

  async resolveConflict(id: string, resolution: Partial<ConflictResolution>): Promise<void> {
    const conflict = this.realm.objectForPrimaryKey('ConflictResolution', id);
    
    if (!conflict) {
      throw new Error(`Conflict ${id} not found`);
    }
    
    this.realm.write(() => {
      if (resolution.strategy) conflict.strategy = resolution.strategy;
      if (resolution.resolvedData) conflict.resolvedData = JSON.stringify(resolution.resolvedData);
      if (resolution.status) conflict.status = resolution.status;
    });
  }

  // Media Cache Operations
  async addToMediaCache(entry: Omit<MediaCacheEntry, 'id'>): Promise<string> {
    const id = this.generateId();
    
    this.realm.write(() => {
      this.realm.create('MediaCache', {
        id,
        mediaUrl: entry.mediaUrl,
        localPath: entry.localPath,
        mediaType: entry.mediaType,
        fileSize: entry.fileSize,
        priority: entry.priority,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        expiresAt: entry.expiresAt || null,
        checksum: entry.checksum,
        isSynced: entry.isSynced
      });
    });
    
    return id;
  }

  async getMediaCache(url: string): Promise<MediaCacheEntry | null> {
    const entry = this.realm.objects('MediaCache')
      .filtered('mediaUrl = $0', url)[0];
    
    if (entry) {
      return {
        id: entry.id,
        mediaUrl: entry.mediaUrl,
        localPath: entry.localPath,
        mediaType: entry.mediaType,
        fileSize: entry.fileSize,
        priority: entry.priority,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        expiresAt: entry.expiresAt,
        checksum: entry.checksum,
        isSynced: entry.isSynced
      };
    }
    
    return null;
  }

  async updateMediaCache(id: string, updates: Partial<MediaCacheEntry>): Promise<void> {
    const entry = this.realm.objectForPrimaryKey('MediaCache', id);
    
    if (!entry) {
      throw new Error(`Media cache entry ${id} not found`);
    }
    
    this.realm.write(() => {
      if (updates.accessCount !== undefined) entry.accessCount = updates.accessCount;
      if (updates.lastAccessed) entry.lastAccessed = updates.lastAccessed;
      if (updates.isSynced !== undefined) entry.isSynced = updates.isSynced;
    });
  }

  async cleanupMediaCache(maxSizeMB: number): Promise<void> {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const entries = this.realm.objects('MediaCache').sorted('lastAccessed ASC');
    
    let totalSize = entries.sum('fileSize');
    
    if (totalSize > maxSizeBytes) {
      this.realm.write(() => {
        for (const entry of entries) {
          if (totalSize <= maxSizeBytes) break;
          totalSize -= entry.fileSize;
          this.realm.delete(entry);
        }
      });
    }
  }

  // Offline Session Operations
  async createOfflineSession(session: Omit<OfflineSession, 'id'>): Promise<string> {
    const id = this.generateId();
    
    this.realm.write(() => {
      this.realm.create('OfflineSession', {
        id,
        sessionType: session.sessionType,
        localSessionId: session.localSessionId,
        data: JSON.stringify(session.data),
        startedAt: session.startedAt,
        endedAt: session.endedAt || null,
        isSynced: session.isSynced,
        syncAttempts: session.syncAttempts,
        lastSyncAttempt: session.lastSyncAttempt || null,
        syncError: session.syncError || null
      });
    });
    
    return id;
  }

  async getOfflineSession(localSessionId: string): Promise<OfflineSession | null> {
    const session = this.realm.objects('OfflineSession')
      .filtered('localSessionId = $0', localSessionId)[0];
    
    if (session) {
      return {
        id: session.id,
        sessionType: session.sessionType,
        localSessionId: session.localSessionId,
        data: JSON.parse(session.data),
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        isSynced: session.isSynced,
        syncAttempts: session.syncAttempts,
        lastSyncAttempt: session.lastSyncAttempt,
        syncError: session.syncError
      };
    }
    
    return null;
  }

  async updateOfflineSession(id: string, updates: Partial<OfflineSession>): Promise<void> {
    const session = this.realm.objectForPrimaryKey('OfflineSession', id);
    
    if (!session) {
      throw new Error(`Offline session ${id} not found`);
    }
    
    this.realm.write(() => {
      if (updates.endedAt) session.endedAt = updates.endedAt;
      if (updates.isSynced !== undefined) session.isSynced = updates.isSynced;
      if (updates.syncAttempts !== undefined) session.syncAttempts = updates.syncAttempts;
      if (updates.lastSyncAttempt) session.lastSyncAttempt = updates.lastSyncAttempt;
      if (updates.syncError !== undefined) session.syncError = updates.syncError;
    });
  }

  async getUnsyncedSessions(): Promise<OfflineSession[]> {
    const sessions = this.realm.objects('OfflineSession')
      .filtered('isSynced = false')
      .sorted('startedAt ASC');
    
    return Array.from(sessions).map((item: any) => ({
      id: item.id,
      sessionType: item.sessionType,
      localSessionId: item.localSessionId,
      data: JSON.parse(item.data),
      startedAt: item.startedAt,
      endedAt: item.endedAt,
      isSynced: item.isSynced,
      syncAttempts: item.syncAttempts,
      lastSyncAttempt: item.lastSyncAttempt,
      syncError: item.syncError
    }));
  }

  // Sync Status Operations
  async updateSyncStatus(sessionId: string, status: Partial<SyncStatusInfo>): Promise<void> {
    const existing = this.realm.objects('SyncStatus')
      .filtered('sessionId = $0', sessionId)[0];
    
    this.realm.write(() => {
      if (existing) {
        // Update existing status
        if (status.totalOperations !== undefined) existing.totalOperations = status.totalOperations;
        if (status.completedOperations !== undefined) existing.completedOperations = status.completedOperations;
        if (status.failedOperations !== undefined) existing.failedOperations = status.failedOperations;
        if (status.currentOperation !== undefined) existing.currentOperation = status.currentOperation;
        if (status.progressPercentage !== undefined) existing.progressPercentage = status.progressPercentage;
        if (status.status) existing.status = status.status;
        if (status.startedAt) existing.startedAt = status.startedAt;
        if (status.completedAt) existing.completedAt = status.completedAt;
        if (status.errorDetails) existing.errorDetails = JSON.stringify(status.errorDetails);
        existing.lastActivity = new Date();
      } else {
        // Create new status
        this.realm.create('SyncStatus', {
          id: this.generateId(),
          sessionId,
          totalOperations: status.totalOperations || 0,
          completedOperations: status.completedOperations || 0,
          failedOperations: status.failedOperations || 0,
          currentOperation: status.currentOperation || null,
          progressPercentage: status.progressPercentage || 0,
          status: status.status || 'idle',
          startedAt: status.startedAt || null,
          completedAt: status.completedAt || null,
          lastActivity: new Date(),
          errorDetails: status.errorDetails ? JSON.stringify(status.errorDetails) : null
        });
      }
    });
  }

  async getSyncStatus(sessionId: string): Promise<SyncStatusInfo | null> {
    const status = this.realm.objects('SyncStatus')
      .filtered('sessionId = $0', sessionId)[0];
    
    if (status) {
      return {
        sessionId: status.sessionId,
        totalOperations: status.totalOperations,
        completedOperations: status.completedOperations,
        failedOperations: status.failedOperations,
        currentOperation: status.currentOperation,
        progressPercentage: status.progressPercentage,
        status: status.status,
        startedAt: status.startedAt,
        completedAt: status.completedAt,
        lastActivity: status.lastActivity,
        errorDetails: status.errorDetails ? JSON.parse(status.errorDetails) : undefined
      };
    }
    
    return null;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
