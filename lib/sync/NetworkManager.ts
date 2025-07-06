/**
 * Network operations manager
 * Handles API communication with retry logic and offline detection
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export interface NetworkResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  conflict?: boolean;
  conflictData?: any;
  statusCode?: number;
}

export interface NetworkConfig {
  supabaseUrl: string;
  supabaseKey: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export class NetworkManager {
  private supabase: SupabaseClient;
  private config: NetworkConfig;
  private isOnlineState = true;
  private networkListeners: ((isOnline: boolean) => void)[] = [];

  constructor(config: NetworkConfig) {
    this.config = config;
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.initializeNetworkMonitoring();
  }

  private async initializeNetworkMonitoring(): Promise<void> {
    if (Platform.OS !== 'web') {
      // React Native network monitoring
      const unsubscribe = NetInfo.addEventListener(state => {
        const wasOnline = this.isOnlineState;
        this.isOnlineState = state.isConnected ?? false;
        
        if (wasOnline !== this.isOnlineState) {
          this.notifyNetworkChange(this.isOnlineState);
        }
      });
      
      // Get initial state
      const state = await NetInfo.fetch();
      this.isOnlineState = state.isConnected ?? false;
    } else {
      // Web network monitoring
      const updateOnlineStatus = () => {
        const wasOnline = this.isOnlineState;
        this.isOnlineState = navigator.onLine;
        
        if (wasOnline !== this.isOnlineState) {
          this.notifyNetworkChange(this.isOnlineState);
        }
      };
      
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
      
      this.isOnlineState = navigator.onLine;
    }
  }

  private notifyNetworkChange(isOnline: boolean): void {
    console.log(`Network status changed: ${isOnline ? 'online' : 'offline'}`);
    this.networkListeners.forEach(listener => {
      try {
        listener(isOnline);
      } catch (error) {
        console.error('Network listener error:', error);
      }
    });
  }

  isOnline(): boolean {
    return this.isOnlineState;
  }

  addNetworkListener(listener: (isOnline: boolean) => void): void {
    this.networkListeners.push(listener);
  }

  removeNetworkListener(listener: (isOnline: boolean) => void): void {
    const index = this.networkListeners.indexOf(listener);
    if (index > -1) {
      this.networkListeners.splice(index, 1);
    }
  }

  async createEntity(entityType: string, data: any): Promise<NetworkResponse> {
    if (!this.isOnline()) {
      return { success: false, error: 'Device is offline' };
    }

    try {
      const tableName = this.getTableName(entityType);
      const { data: result, error } = await this.supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        return { 
          success: false, 
          error: error.message,
          statusCode: this.getErrorStatusCode(error)
        };
      }

      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network request failed' 
      };
    }
  }

  async updateEntity(
    entityType: string, 
    entityId: string, 
    data: any, 
    expectedVersion?: number
  ): Promise<NetworkResponse> {
    if (!this.isOnline()) {
      return { success: false, error: 'Device is offline' };
    }

    try {
      const tableName = this.getTableName(entityType);
      
      // First, check current version if version checking is enabled
      if (expectedVersion !== undefined) {
        const { data: current, error: fetchError } = await this.supabase
          .from('entity_versions')
          .select('version_number, data_snapshot')
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Not found is ok for new entities
          return { 
            success: false, 
            error: fetchError.message,
            statusCode: this.getErrorStatusCode(fetchError)
          };
        }

        if (current && current.version_number > expectedVersion) {
          // Version conflict detected
          return {
            success: false,
            conflict: true,
            conflictData: {
              version: current.version_number,
              data: current.data_snapshot,
              ...current
            },
            error: 'Version conflict'
          };
        }
      }

      // Perform the update
      const { data: result, error } = await this.supabase
        .from(tableName)
        .update(data)
        .eq('id', entityId)
        .select()
        .single();

      if (error) {
        return { 
          success: false, 
          error: error.message,
          statusCode: this.getErrorStatusCode(error)
        };
      }

      // Update version tracking
      if (expectedVersion !== undefined) {
        await this.updateEntityVersion(entityType, entityId, expectedVersion + 1, result);
      }

      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network request failed' 
      };
    }
  }

  async deleteEntity(entityType: string, entityId: string): Promise<NetworkResponse> {
    if (!this.isOnline()) {
      return { success: false, error: 'Device is offline' };
    }

    try {
      const tableName = this.getTableName(entityType);
      const { error } = await this.supabase
        .from(tableName)
        .delete()
        .eq('id', entityId);

      if (error) {
        return { 
          success: false, 
          error: error.message,
          statusCode: this.getErrorStatusCode(error)
        };
      }

      // Clean up version tracking
      await this.supabase
        .from('entity_versions')
        .delete()
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network request failed' 
      };
    }
  }

  async fetchEntity(entityType: string, entityId: string): Promise<NetworkResponse> {
    if (!this.isOnline()) {
      return { success: false, error: 'Device is offline' };
    }

    try {
      const tableName = this.getTableName(entityType);
      const { data, error } = await this.supabase
        .from(tableName)
        .select('*')
        .eq('id', entityId)
        .single();

      if (error) {
        return { 
          success: false, 
          error: error.message,
          statusCode: this.getErrorStatusCode(error)
        };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network request failed' 
      };
    }
  }

  async fetchEntities(
    entityType: string, 
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'asc' | 'desc';
      filters?: Record<string, any>;
    } = {}
  ): Promise<NetworkResponse> {
    if (!this.isOnline()) {
      return { success: false, error: 'Device is offline' };
    }

    try {
      const tableName = this.getTableName(entityType);
      let query = this.supabase.from(tableName).select('*');

      // Apply filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy, { 
          ascending: options.orderDirection !== 'desc' 
        });
      }

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
      }

      const { data, error } = await query;

      if (error) {
        return { 
          success: false, 
          error: error.message,
          statusCode: this.getErrorStatusCode(error)
        };
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Network request failed' 
      };
    }
  }

  async uploadMedia(file: File | Blob, path: string): Promise<NetworkResponse> {
    if (!this.isOnline()) {
      return { success: false, error: 'Device is offline' };
    }

    try {
      const { data, error } = await this.supabase.storage
        .from('media')
        .upload(path, file);

      if (error) {
        return { 
          success: false, 
          error: error.message,
          statusCode: this.getErrorStatusCode(error)
        };
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('media')
        .getPublicUrl(path);

      return { 
        success: true, 
        data: { 
          ...data, 
          publicUrl: urlData.publicUrl 
        } 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Media upload failed' 
      };
    }
  }

  async downloadMedia(url: string): Promise<NetworkResponse<Blob>> {
    if (!this.isOnline()) {
      return { success: false, error: 'Device is offline' };
    }

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status
        };
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Media download failed' 
      };
    }
  }

  private async updateEntityVersion(
    entityType: string, 
    entityId: string, 
    version: number, 
    data: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('entity_versions')
        .upsert({
          entity_type: entityType,
          entity_id: entityId,
          version_number: version,
          last_modified_at: new Date().toISOString(),
          data_snapshot: data
        });
    } catch (error) {
      console.error('Failed to update entity version:', error);
    }
  }

  private getTableName(entityType: string): string {
    // Map entity types to Supabase table names
    const tableMap: Record<string, string> = {
      'workout': 'workouts',
      'exercise': 'exercises',
      'user_profile': 'user_profiles',
      'progress_photo': 'progress_photos',
      'measurement': 'measurements',
      'workout_session': 'workout_sessions',
      'exercise_set': 'exercise_sets'
    };

    return tableMap[entityType] || entityType;
  }

  private getErrorStatusCode(error: any): number {
    // Extract status code from Supabase error
    if (error.code) {
      switch (error.code) {
        case 'PGRST116': return 404; // Not found
        case 'PGRST301': return 409; // Conflict
        case '23505': return 409; // Unique violation
        case '23503': return 400; // Foreign key violation
        default: return 500;
      }
    }
    return 500;
  }

  // Health check
  async checkConnection(): Promise<boolean> {
    if (!this.isOnline()) return false;

    try {
      const { error } = await this.supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }
}
