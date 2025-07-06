/**
 * Intelligent conflict resolution system
 * Handles different conflict types with configurable strategies
 */

import { 
  StorageManager, 
  ConflictResolution, 
  EntityMetadata 
} from '../storage/types';
import { NetworkManager } from './NetworkManager';

export interface ConflictResolutionResult {
  autoResolved: boolean;
  strategy: string;
  resolvedData?: any;
  requiresUserInput?: boolean;
  conflictId: string;
}

export interface ConflictResolutionStrategy {
  name: string;
  canAutoResolve: boolean;
  resolve(conflict: ConflictResolution): Promise<any>;
}

export class ConflictResolver {
  private storageManager: StorageManager;
  private networkManager: NetworkManager;
  private strategies: Map<string, ConflictResolutionStrategy> = new Map();

  constructor(storageManager: StorageManager, networkManager: NetworkManager) {
    this.storageManager = storageManager;
    this.networkManager = networkManager;
    this.initializeStrategies();
  }

  private initializeStrategies(): void {
    // Last Write Wins Strategy
    this.strategies.set('last_write_wins', {
      name: 'Last Write Wins',
      canAutoResolve: true,
      resolve: async (conflict: ConflictResolution) => {
        const localTime = new Date(conflict.localData.updatedAt || conflict.localData.createdAt);
        const remoteTime = new Date(conflict.remoteData.updatedAt || conflict.remoteData.createdAt);
        
        return localTime > remoteTime ? conflict.localData : conflict.remoteData;
      }
    });

    // Merge Strategy for compatible data
    this.strategies.set('merge', {
      name: 'Smart Merge',
      canAutoResolve: true,
      resolve: async (conflict: ConflictResolution) => {
        return this.performSmartMerge(conflict.localData, conflict.remoteData);
      }
    });

    // User Prompt Strategy
    this.strategies.set('user_prompt', {
      name: 'User Decision Required',
      canAutoResolve: false,
      resolve: async (conflict: ConflictResolution) => {
        // This will be handled by UI components
        throw new Error('User input required for conflict resolution');
      }
    });

    // Field-level merge for fitness data
    this.strategies.set('fitness_merge', {
      name: 'Fitness Data Merge',
      canAutoResolve: true,
      resolve: async (conflict: ConflictResolution) => {
        return this.performFitnessMerge(conflict.localData, conflict.remoteData);
      }
    });
  }

  async resolveConflict(conflictId: string): Promise<ConflictResolutionResult> {
    const conflicts = await this.storageManager.getConflicts();
    const conflict = conflicts.find(c => c.id === conflictId);
    
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    if (conflict.status !== 'pending') {
      return {
        autoResolved: conflict.status === 'resolved',
        strategy: conflict.strategy || 'unknown',
        conflictId
      };
    }

    // Determine best strategy for this conflict
    const strategy = this.selectResolutionStrategy(conflict);
    
    try {
      if (strategy.canAutoResolve) {
        const resolvedData = await strategy.resolve(conflict);
        
        // Apply resolution
        await this.applyResolution(conflict, strategy.name, resolvedData);
        
        return {
          autoResolved: true,
          strategy: strategy.name,
          resolvedData,
          conflictId
        };
      } else {
        // Mark as requiring user input
        await this.storageManager.resolveConflict(conflictId, {
          strategy: strategy.name,
          status: 'escalated'
        });
        
        return {
          autoResolved: false,
          strategy: strategy.name,
          requiresUserInput: true,
          conflictId
        };
      }
    } catch (error) {
      console.error(`Conflict resolution failed for ${conflictId}:`, error);
      
      // Escalate to manual resolution
      await this.storageManager.resolveConflict(conflictId, {
        status: 'escalated'
      });
      
      return {
        autoResolved: false,
        strategy: 'manual',
        requiresUserInput: true,
        conflictId
      };
    }
  }

  async resolveConflictManually(
    conflictId: string, 
    resolution: 'local' | 'remote' | 'custom',
    customData?: any
  ): Promise<void> {
    const conflicts = await this.storageManager.getConflicts();
    const conflict = conflicts.find(c => c.id === conflictId);
    
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    let resolvedData: any;
    let strategy: string;

    switch (resolution) {
      case 'local':
        resolvedData = conflict.localData;
        strategy = 'manual_local';
        break;
      case 'remote':
        resolvedData = conflict.remoteData;
        strategy = 'manual_remote';
        break;
      case 'custom':
        if (!customData) {
          throw new Error('Custom data required for custom resolution');
        }
        resolvedData = customData;
        strategy = 'manual_custom';
        break;
      default:
        throw new Error(`Invalid resolution type: ${resolution}`);
    }

    await this.applyResolution(conflict, strategy, resolvedData);
  }

  private selectResolutionStrategy(conflict: ConflictResolution): ConflictResolutionStrategy {
    // Entity-specific strategy selection
    switch (conflict.entityType) {
      case 'workout':
        return this.strategies.get('fitness_merge')!;
      case 'exercise':
      case 'user_profile':
        return this.strategies.get('merge')!;
      case 'progress_photo':
      case 'measurement':
        return this.strategies.get('last_write_wins')!;
      default:
        // Check conflict complexity
        if (this.isComplexConflict(conflict)) {
          return this.strategies.get('user_prompt')!;
        } else {
          return this.strategies.get('last_write_wins')!;
        }
    }
  }

  private isComplexConflict(conflict: ConflictResolution): boolean {
    // Determine if conflict requires human intervention
    const localKeys = Object.keys(conflict.localData);
    const remoteKeys = Object.keys(conflict.remoteData);
    
    // Check for structural differences
    const keyDifference = Math.abs(localKeys.length - remoteKeys.length);
    if (keyDifference > 2) return true;
    
    // Check for conflicting critical fields
    const criticalFields = ['id', 'userId', 'type', 'status'];
    for (const field of criticalFields) {
      if (conflict.localData[field] !== conflict.remoteData[field]) {
        return true;
      }
    }
    
    return false;
  }

  private async performSmartMerge(localData: any, remoteData: any): Promise<any> {
    const merged = { ...localData };
    
    // Merge strategy based on field types
    for (const [key, remoteValue] of Object.entries(remoteData)) {
      const localValue = localData[key];
      
      if (localValue === undefined) {
        // New field from remote
        merged[key] = remoteValue;
      } else if (localValue !== remoteValue) {
        // Conflict in field value
        merged[key] = this.resolveFieldConflict(key, localValue, remoteValue);
      }
    }
    
    // Update metadata
    merged.updatedAt = new Date().toISOString();
    merged.mergedAt = new Date().toISOString();
    merged.mergeSource = 'auto_merge';
    
    return merged;
  }

  private async performFitnessMerge(localData: any, remoteData: any): Promise<any> {
    const merged = { ...localData };
    
    // Fitness-specific merge logic
    if (localData.exercises && remoteData.exercises) {
      merged.exercises = this.mergeExerciseArrays(localData.exercises, remoteData.exercises);
    }
    
    if (localData.sets && remoteData.sets) {
      merged.sets = this.mergeSetsArrays(localData.sets, remoteData.sets);
    }
    
    // Prefer higher values for progress metrics
    const progressFields = ['weight', 'reps', 'duration', 'distance', 'calories'];
    for (const field of progressFields) {
      if (localData[field] !== undefined && remoteData[field] !== undefined) {
        merged[field] = Math.max(localData[field], remoteData[field]);
      }
    }
    
    // Use latest timestamps
    const timeFields = ['startedAt', 'endedAt', 'completedAt'];
    for (const field of timeFields) {
      if (localData[field] && remoteData[field]) {
        const localTime = new Date(localData[field]);
        const remoteTime = new Date(remoteData[field]);
        merged[field] = localTime > remoteTime ? localData[field] : remoteData[field];
      }
    }
    
    merged.updatedAt = new Date().toISOString();
    merged.mergeSource = 'fitness_merge';
    
    return merged;
  }

  private resolveFieldConflict(fieldName: string, localValue: any, remoteValue: any): any {
    // Field-specific resolution logic
    switch (fieldName) {
      case 'updatedAt':
      case 'lastModified':
        // Use latest timestamp
        return new Date(localValue) > new Date(remoteValue) ? localValue : remoteValue;
      
      case 'version':
        // Use higher version
        return Math.max(localValue, remoteValue);
      
      case 'tags':
      case 'categories':
        // Merge arrays
        if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
          return [...new Set([...localValue, ...remoteValue])];
        }
        return remoteValue;
      
      case 'notes':
      case 'description':
        // Concatenate text fields if both have content
        if (localValue && remoteValue && localValue !== remoteValue) {
          return `${localValue}\n\n[Merged]: ${remoteValue}`;
        }
        return localValue || remoteValue;
      
      default:
        // Default to remote value for unknown fields
        return remoteValue;
    }
  }

  private mergeExerciseArrays(localExercises: any[], remoteExercises: any[]): any[] {
    const exerciseMap = new Map();
    
    // Add local exercises
    localExercises.forEach(exercise => {
      exerciseMap.set(exercise.id || exercise.name, exercise);
    });
    
    // Merge remote exercises
    remoteExercises.forEach(exercise => {
      const key = exercise.id || exercise.name;
      if (exerciseMap.has(key)) {
        // Merge existing exercise
        const existing = exerciseMap.get(key);
        exerciseMap.set(key, this.performSmartMerge(existing, exercise));
      } else {
        // Add new exercise
        exerciseMap.set(key, exercise);
      }
    });
    
    return Array.from(exerciseMap.values());
  }

  private mergeSetsArrays(localSets: any[], remoteSets: any[]): any[] {
    // Combine sets and sort by order/timestamp
    const allSets = [...localSets, ...remoteSets];
    
    // Remove duplicates based on set identifier
    const uniqueSets = allSets.filter((set, index, array) => {
      return array.findIndex(s => 
        s.id === set.id || 
        (s.exerciseId === set.exerciseId && s.setNumber === set.setNumber)
      ) === index;
    });
    
    // Sort by set number or timestamp
    return uniqueSets.sort((a, b) => {
      if (a.setNumber !== undefined && b.setNumber !== undefined) {
        return a.setNumber - b.setNumber;
      }
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    });
  }

  private async applyResolution(
    conflict: ConflictResolution,
    strategy: string,
    resolvedData: any
  ): Promise<void> {
    // Update local entity with resolved data
    await this.storageManager.update(
      conflict.entityType,
      conflict.entityId,
      resolvedData
    );
    
    // Update entity metadata
    const newVersion = Math.max(conflict.localVersion, conflict.remoteVersion) + 1;
    await this.storageManager.updateMetadata(
      conflict.entityType,
      conflict.entityId,
      {
        version: newVersion,
        lastModified: new Date(),
        syncStatus: 'pending' // Will be synced again
      }
    );
    
    // Mark conflict as resolved
    await this.storageManager.resolveConflict(conflict.id, {
      strategy,
      resolvedData,
      status: 'resolved'
    });
    
    // Add back to sync queue to push resolved data
    await this.storageManager.addToSyncQueue({
      entityType: conflict.entityType,
      entityId: conflict.entityId,
      operation: 'update',
      priority: 1, // High priority for resolved conflicts
      data: resolvedData,
      retryCount: 0,
      maxRetries: 3,
      nextRetryAt: new Date()
    });
  }

  // Public API for getting conflict information
  async getPendingConflicts(): Promise<ConflictResolution[]> {
    const conflicts = await this.storageManager.getConflicts();
    return conflicts.filter(c => c.status === 'pending');
  }

  async getConflictById(conflictId: string): Promise<ConflictResolution | null> {
    const conflicts = await this.storageManager.getConflicts();
    return conflicts.find(c => c.id === conflictId) || null;
  }

  async getConflictsByEntity(entityType: string, entityId: string): Promise<ConflictResolution[]> {
    const conflicts = await this.storageManager.getConflicts();
    return conflicts.filter(c => 
      c.entityType === entityType && 
      c.entityId === entityId
    );
  }
}
