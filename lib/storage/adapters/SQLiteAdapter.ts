/**
 * SQLite storage adapter implementation
 * Cross-platform SQLite operations using expo-sqlite
 */

import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
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

export class SQLiteStorageAdapter implements IStorageAdapter {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;

  async initialize(config: StorageConfig): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Open database
      this.db = await SQLite.openDatabaseAsync(config.databaseName);
      
      // Enable foreign keys and WAL mode for better performance
      await this.db.execAsync('PRAGMA foreign_keys = ON');
      if (Platform.OS !== 'web') {
        await this.db.execAsync('PRAGMA journal_mode = WAL');
      }

      // Create tables
      await this.createTables();
      
      this.isInitialized = true;
      console.log('SQLite adapter initialized');
    } catch (error) {
      console.error('SQLite initialization failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      // Entity metadata table
      `CREATE TABLE IF NOT EXISTS entity_metadata (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        last_modified TEXT NOT NULL,
        checksum TEXT NOT NULL,
        is_deleted INTEGER DEFAULT 0,
        sync_status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // Sync operations queue
      `CREATE TABLE IF NOT EXISTS sync_operations (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        priority INTEGER NOT NULL DEFAULT 2,
        data TEXT NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        max_retries INTEGER NOT NULL DEFAULT 3,
        next_retry_at TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        error TEXT
      )`,

      // Conflict resolution
      `CREATE TABLE IF NOT EXISTS conflict_resolutions (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        conflict_type TEXT NOT NULL,
        local_version INTEGER NOT NULL,
        remote_version INTEGER NOT NULL,
        local_data TEXT NOT NULL,
        remote_data TEXT NOT NULL,
        strategy TEXT,
        resolved_data TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // Media cache
      `CREATE TABLE IF NOT EXISTS media_cache (
        id TEXT PRIMARY KEY,
        media_url TEXT UNIQUE NOT NULL,
        local_path TEXT NOT NULL,
        media_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        priority INTEGER NOT NULL DEFAULT 2,
        access_count INTEGER NOT NULL DEFAULT 0,
        last_accessed TEXT NOT NULL,
        expires_at TEXT,
        checksum TEXT NOT NULL,
        is_synced INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // Offline sessions
      `CREATE TABLE IF NOT EXISTS offline_sessions (
        id TEXT PRIMARY KEY,
        session_type TEXT NOT NULL,
        local_session_id TEXT UNIQUE NOT NULL,
        data TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        is_synced INTEGER NOT NULL DEFAULT 0,
        sync_attempts INTEGER NOT NULL DEFAULT 0,
        last_sync_attempt TEXT,
        sync_error TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,

      // Sync status tracking
      `CREATE TABLE IF NOT EXISTS sync_status (
        session_id TEXT PRIMARY KEY,
        total_operations INTEGER NOT NULL DEFAULT 0,
        completed_operations INTEGER NOT NULL DEFAULT 0,
        failed_operations INTEGER NOT NULL DEFAULT 0,
        current_operation TEXT,
        progress_percentage INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'idle',
        started_at TEXT,
        completed_at TEXT,
        last_activity TEXT NOT NULL,
        error_details TEXT
      )`,

      // Generic entity storage (JSON documents)
      `CREATE TABLE IF NOT EXISTS entities (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tables) {
      await this.db.execAsync(tableSQL);
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_entity_metadata_type ON entity_metadata(entity_type)',
      'CREATE INDEX IF NOT EXISTS idx_entity_metadata_sync_status ON entity_metadata(sync_status)',
      'CREATE INDEX IF NOT EXISTS idx_sync_operations_priority ON sync_operations(priority, next_retry_at)',
      'CREATE INDEX IF NOT EXISTS idx_sync_operations_entity ON sync_operations(entity_type, entity_id)',
      'CREATE INDEX IF NOT EXISTS idx_conflict_resolutions_status ON conflict_resolutions(status)',
      'CREATE INDEX IF NOT EXISTS idx_media_cache_url ON media_cache(media_url)',
      'CREATE INDEX IF NOT EXISTS idx_media_cache_accessed ON media_cache(last_accessed)',
      'CREATE INDEX IF NOT EXISTS idx_offline_sessions_synced ON offline_sessions(is_synced)',
      'CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(entity_type)',
      'CREATE INDEX IF NOT EXISTS idx_entities_updated ON entities(updated_at)'
    ];

    for (const indexSQL of indexes) {
      await this.db.execAsync(indexSQL);
    }
  }

  // Entity operations
  async create<T>(entityType: string, data: T): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      'INSERT INTO entities (id, entity_type, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, entityType, JSON.stringify(data), now, now]
    );

    return id;
  }

  async read<T>(entityType: string, id: string): Promise<T | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT data FROM entities WHERE id = ? AND entity_type = ?',
      [id, entityType]
    ) as { data: string } | null;

    if (!result) return null;

    try {
      return JSON.parse(result.data) as T;
    } catch (error) {
      console.error('Failed to parse entity data:', error);
      return null;
    }
  }

  async update<T>(entityType: string, id: string, data: Partial<T>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Get current data
    const current = await this.read<T>(entityType, id);
    if (!current) {
      throw new Error(`Entity ${entityType}:${id} not found`);
    }

    // Merge with updates
    const updated = { ...current, ...data };
    const now = new Date().toISOString();

    await this.db.runAsync(
      'UPDATE entities SET data = ?, updated_at = ? WHERE id = ? AND entity_type = ?',
      [JSON.stringify(updated), now, id, entityType]
    );
  }

  async delete(entityType: string, id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'DELETE FROM entities WHERE id = ? AND entity_type = ?',
      [id, entityType]
    );
  }

  async list<T>(entityType: string, options: QueryOptions = {}): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sql = 'SELECT data FROM entities WHERE entity_type = ?';
    const params: any[] = [entityType];

    // Add WHERE conditions
    if (options.where) {
      for (const [key, value] of Object.entries(options.where)) {
        sql += ` AND JSON_EXTRACT(data, '$.${key}') = ?`;
        params.push(value);
      }
    }

    // Add ORDER BY
    if (options.orderBy) {
      const direction = options.orderDirection === 'desc' ? 'DESC' : 'ASC';
      sql += ` ORDER BY JSON_EXTRACT(data, '$.${options.orderBy}') ${direction}`;
    }

    // Add LIMIT and OFFSET
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }
    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const results = await this.db.getAllAsync(sql, params) as { data: string }[];

    return results.map(row => {
      try {
        return JSON.parse(row.data) as T;
      } catch (error) {
        console.error('Failed to parse entity data:', error);
        return null;
      }
    }).filter(Boolean) as T[];
  }

  // Metadata operations
  async getMetadata(entityType: string, id: string): Promise<EntityMetadata | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM entity_metadata WHERE id = ? AND entity_type = ?',
      [id, entityType]
    ) as any;

    if (!result) return null;

    return {
      id: result.id,
      entityType: result.entity_type,
      version: result.version,
      lastModified: new Date(result.last_modified),
      checksum: result.checksum,
      isDeleted: Boolean(result.is_deleted),
      syncStatus: result.sync_status
    };
  }

  async updateMetadata(entityType: string, id: string, metadata: Partial<EntityMetadata>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updates: string[] = [];
    const params: any[] = [];

    if (metadata.version !== undefined) {
      updates.push('version = ?');
      params.push(metadata.version);
    }
    if (metadata.lastModified !== undefined) {
      updates.push('last_modified = ?');
      params.push(metadata.lastModified.toISOString());
    }
    if (metadata.checksum !== undefined) {
      updates.push('checksum = ?');
      params.push(metadata.checksum);
    }
    if (metadata.isDeleted !== undefined) {
      updates.push('is_deleted = ?');
      params.push(metadata.isDeleted ? 1 : 0);
    }
    if (metadata.syncStatus !== undefined) {
      updates.push('sync_status = ?');
      params.push(metadata.syncStatus);
    }

    if (updates.length === 0) return;

    params.push(id, entityType);

    await this.db.runAsync(
      `INSERT OR REPLACE INTO entity_metadata 
       (id, entity_type, version, last_modified, checksum, is_deleted, sync_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET ${updates.join(', ')}`,
      [id, entityType, metadata.version || 1, 
       (metadata.lastModified || new Date()).toISOString(),
       metadata.checksum || '', metadata.isDeleted ? 1 : 0, 
       metadata.syncStatus || 'pending', ...params.slice(0, -2)]
    );
  }

  // Sync operations
  async addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'createdAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO sync_operations 
       (id, entity_type, entity_id, operation, priority, data, retry_count, max_retries, next_retry_at, created_at, error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, operation.entityType, operation.entityId, operation.operation,
        operation.priority, JSON.stringify(operation.data), operation.retryCount,
        operation.maxRetries, operation.nextRetryAt.toISOString(), now, operation.error || null
      ]
    );

    return id;
  }

  async getSyncQueue(priority?: SyncPriority): Promise<SyncOperation[]> {
    if (!this.db) throw new Error('Database not initialized');

    let sql = 'SELECT * FROM sync_operations WHERE next_retry_at <= ?';
    const params: any[] = [new Date().toISOString()];

    if (priority !== undefined) {
      sql += ' AND priority = ?';
      params.push(priority);
    }

    sql += ' ORDER BY priority ASC, created_at ASC';

    const results = await this.db.getAllAsync(sql, params) as any[];

    return results.map(row => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      operation: row.operation,
      priority: row.priority,
      data: JSON.parse(row.data),
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      nextRetryAt: new Date(row.next_retry_at),
      createdAt: new Date(row.created_at),
      error: row.error
    }));
  }

  async updateSyncOperation(id: string, updates: Partial<SyncOperation>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.retryCount !== undefined) {
      updateFields.push('retry_count = ?');
      params.push(updates.retryCount);
    }
    if (updates.nextRetryAt !== undefined) {
      updateFields.push('next_retry_at = ?');
      params.push(updates.nextRetryAt.toISOString());
    }
    if (updates.error !== undefined) {
      updateFields.push('error = ?');
      params.push(updates.error);
    }

    if (updateFields.length === 0) return;

    params.push(id);

    await this.db.runAsync(
      `UPDATE sync_operations SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
  }

  async removeSyncOperation(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM sync_operations WHERE id = ?', [id]);
  }

  // Conflict resolution
  async addConflict(conflict: Omit<ConflictResolution, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO conflict_resolutions 
       (id, entity_type, entity_id, conflict_type, local_version, remote_version, 
        local_data, remote_data, strategy, resolved_data, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, conflict.entityType, conflict.entityId, conflict.conflictType,
        conflict.localVersion, conflict.remoteVersion,
        JSON.stringify(conflict.localData), JSON.stringify(conflict.remoteData),
        conflict.strategy || null, conflict.resolvedData ? JSON.stringify(conflict.resolvedData) : null,
        conflict.status, now
      ]
    );

    return id;
  }

  async getConflicts(): Promise<ConflictResolution[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync('SELECT * FROM conflict_resolutions ORDER BY created_at DESC') as any[];

    return results.map(row => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      conflictType: row.conflict_type,
      localVersion: row.local_version,
      remoteVersion: row.remote_version,
      localData: JSON.parse(row.local_data),
      remoteData: JSON.parse(row.remote_data),
      strategy: row.strategy,
      resolvedData: row.resolved_data ? JSON.parse(row.resolved_data) : undefined,
      status: row.status
    }));
  }

  async resolveConflict(id: string, resolution: Partial<ConflictResolution>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updateFields: string[] = [];
    const params: any[] = [];

    if (resolution.strategy !== undefined) {
      updateFields.push('strategy = ?');
      params.push(resolution.strategy);
    }
    if (resolution.resolvedData !== undefined) {
      updateFields.push('resolved_data = ?');
      params.push(JSON.stringify(resolution.resolvedData));
    }
    if (resolution.status !== undefined) {
      updateFields.push('status = ?');
      params.push(resolution.status);
    }

    if (updateFields.length === 0) return;

    params.push(id);

    await this.db.runAsync(
      `UPDATE conflict_resolutions SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
  }

  // Media cache operations
  async addToMediaCache(entry: Omit<MediaCacheEntry, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO media_cache 
       (id, media_url, local_path, media_type, file_size, priority, access_count, 
        last_accessed, expires_at, checksum, is_synced, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, entry.mediaUrl, entry.localPath, entry.mediaType, entry.fileSize,
        entry.priority, entry.accessCount, entry.lastAccessed.toISOString(),
        entry.expiresAt?.toISOString() || null, entry.checksum, entry.isSynced ? 1 : 0, now
      ]
    );

    return id;
  }

  async getMediaCache(url: string): Promise<MediaCacheEntry | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM media_cache WHERE media_url = ?',
      [url]
    ) as any;

    if (!result) return null;

    return {
      id: result.id,
      mediaUrl: result.media_url,
      localPath: result.local_path,
      mediaType: result.media_type,
      fileSize: result.file_size,
      priority: result.priority,
      accessCount: result.access_count,
      lastAccessed: new Date(result.last_accessed),
      expiresAt: result.expires_at ? new Date(result.expires_at) : undefined,
      checksum: result.checksum,
      isSynced: Boolean(result.is_synced)
    };
  }

  async updateMediaCache(id: string, updates: Partial<MediaCacheEntry>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.accessCount !== undefined) {
      updateFields.push('access_count = ?');
      params.push(updates.accessCount);
    }
    if (updates.lastAccessed !== undefined) {
      updateFields.push('last_accessed = ?');
      params.push(updates.lastAccessed.toISOString());
    }

    if (updateFields.length === 0) return;

    params.push(id);

    await this.db.runAsync(
      `UPDATE media_cache SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
  }

  async cleanupMediaCache(maxSize: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    if (maxSize === 0) {
      // Remove all
      await this.db.runAsync('DELETE FROM media_cache');
      return;
    }

    // Remove expired entries first
    await this.db.runAsync(
      'DELETE FROM media_cache WHERE expires_at IS NOT NULL AND expires_at < ?',
      [new Date().toISOString()]
    );

    // Then remove least recently used entries if still over limit
    // This is a simplified implementation - in production you'd calculate actual sizes
    const totalEntries = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM media_cache') as { count: number };
    
    if (totalEntries.count > maxSize) {
      const entriesToRemove = totalEntries.count - maxSize;
      await this.db.runAsync(
        'DELETE FROM media_cache WHERE id IN (SELECT id FROM media_cache ORDER BY last_accessed ASC LIMIT ?)',
        [entriesToRemove]
      );
    }
  }

  // Offline session operations
  async createOfflineSession(session: Omit<OfflineSession, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO offline_sessions 
       (id, session_type, local_session_id, data, started_at, ended_at, 
        is_synced, sync_attempts, last_sync_attempt, sync_error, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, session.sessionType, session.localSessionId, JSON.stringify(session.data),
        session.startedAt.toISOString(), session.endedAt?.toISOString() || null,
        session.isSynced ? 1 : 0, session.syncAttempts,
        session.lastSyncAttempt?.toISOString() || null, session.syncError || null, now
      ]
    );

    return id;
  }

  async getOfflineSession(localSessionId: string): Promise<OfflineSession | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM offline_sessions WHERE local_session_id = ?',
      [localSessionId]
    ) as any;

    if (!result) return null;

    return {
      id: result.id,
      sessionType: result.session_type,
      localSessionId: result.local_session_id,
      data: JSON.parse(result.data),
      startedAt: new Date(result.started_at),
      endedAt: result.ended_at ? new Date(result.ended_at) : undefined,
      isSynced: Boolean(result.is_synced),
      syncAttempts: result.sync_attempts,
      lastSyncAttempt: result.last_sync_attempt ? new Date(result.last_sync_attempt) : undefined,
      syncError: result.sync_error
    };
  }

  async updateOfflineSession(id: string, updates: Partial<OfflineSession>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updateFields: string[] = [];
    const params: any[] = [];

    if (updates.endedAt !== undefined) {
      updateFields.push('ended_at = ?');
      params.push(updates.endedAt?.toISOString() || null);
    }
    if (updates.isSynced !== undefined) {
      updateFields.push('is_synced = ?');
      params.push(updates.isSynced ? 1 : 0);
    }
    if (updates.syncAttempts !== undefined) {
      updateFields.push('sync_attempts = ?');
      params.push(updates.syncAttempts);
    }
    if (updates.lastSyncAttempt !== undefined) {
      updateFields.push('last_sync_attempt = ?');
      params.push(updates.lastSyncAttempt?.toISOString() || null);
    }
    if (updates.syncError !== undefined) {
      updateFields.push('sync_error = ?');
      params.push(updates.syncError);
    }

    if (updateFields.length === 0) return;

    params.push(id);

    await this.db.runAsync(
      `UPDATE offline_sessions SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );
  }

  async getUnsyncedSessions(): Promise<OfflineSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync(
      'SELECT * FROM offline_sessions WHERE is_synced = 0 ORDER BY started_at ASC'
    ) as any[];

    return results.map(row => ({
      id: row.id,
      sessionType: row.session_type,
      localSessionId: row.local_session_id,
      data: JSON.parse(row.data),
      startedAt: new Date(row.started_at),
      endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
      isSynced: Boolean(row.is_synced),
      syncAttempts: row.sync_attempts,
      lastSyncAttempt: row.last_sync_attempt ? new Date(row.last_sync_attempt) : undefined,
      syncError: row.sync_error
    }));
  }

  // Sync status operations
  async updateSyncStatus(sessionId: string, status: Partial<SyncStatusInfo>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updateFields: string[] = [];
    const params: any[] = [];

    if (status.totalOperations !== undefined) {
      updateFields.push('total_operations = ?');
      params.push(status.totalOperations);
    }
    if (status.completedOperations !== undefined) {
      updateFields.push('completed_operations = ?');
      params.push(status.completedOperations);
    }
    if (status.failedOperations !== undefined) {
      updateFields.push('failed_operations = ?');
      params.push(status.failedOperations);
    }
    if (status.currentOperation !== undefined) {
      updateFields.push('current_operation = ?');
      params.push(status.currentOperation);
    }
    if (status.progressPercentage !== undefined) {
      updateFields.push('progress_percentage = ?');
      params.push(status.progressPercentage);
    }
    if (status.status !== undefined) {
      updateFields.push('status = ?');
      params.push(status.status);
    }
    if (status.startedAt !== undefined) {
      updateFields.push('started_at = ?');
      params.push(status.startedAt.toISOString());
    }
    if (status.completedAt !== undefined) {
      updateFields.push('completed_at = ?');
      params.push(status.completedAt?.toISOString() || null);
    }
    if (status.lastActivity !== undefined) {
      updateFields.push('last_activity = ?');
      params.push(status.lastActivity.toISOString());
    }
    if (status.errorDetails !== undefined) {
      updateFields.push('error_details = ?');
      params.push(status.errorDetails ? JSON.stringify(status.errorDetails) : null);
    }

    if (updateFields.length === 0) return;

    params.push(sessionId);

    await this.db.runAsync(
      `INSERT OR REPLACE INTO sync_status 
       (session_id, total_operations, completed_operations, failed_operations, 
        current_operation, progress_percentage, status, started_at, completed_at, 
        last_activity, error_details)
       VALUES (?, 0, 0, 0, NULL, 0, 'idle', NULL, NULL, ?, NULL)
       ON CONFLICT(session_id) DO UPDATE SET ${updateFields.join(', ')}`,
      [sessionId, new Date().toISOString(), ...params.slice(0, -1)]
    );
  }

  async getSyncStatus(sessionId: string): Promise<SyncStatusInfo | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync(
      'SELECT * FROM sync_status WHERE session_id = ?',
      [sessionId]
    ) as any;

    if (!result) return null;

    return {
      sessionId: result.session_id,
      totalOperations: result.total_operations,
      completedOperations: result.completed_operations,
      failedOperations: result.failed_operations,
      currentOperation: result.current_operation,
      progressPercentage: result.progress_percentage,
      status: result.status,
      startedAt: result.started_at ? new Date(result.started_at) : undefined,
      completedAt: result.completed_at ? new Date(result.completed_at) : undefined,
      lastActivity: new Date(result.last_activity),
      errorDetails: result.error_details ? JSON.parse(result.error_details) : undefined
    };
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Raw SQL execution for advanced operations
  async executeRaw(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.getAllAsync(sql, params);
  }

  // Transaction support
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.execAsync('BEGIN TRANSACTION');
    try {
      const result = await callback();
      await this.db.execAsync('COMMIT');
      return result;
    } catch (error) {
      await this.db.execAsync('ROLLBACK');
      throw error;
    }
  }
}
