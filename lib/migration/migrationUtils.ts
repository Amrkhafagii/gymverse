import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataIntegrityCheck {
  table: string;
  localCount: number;
  remoteCount: number;
  isConsistent: boolean;
  missingRecords: string[];
}

export class MigrationUtils {
  
  // Validate local data before migration
  static async validateLocalData(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Check workout data structure
      const workoutData = await AsyncStorage.getItem('workout_history');
      if (workoutData) {
        const workouts = JSON.parse(workoutData);
        if (!Array.isArray(workouts)) {
          result.errors.push('Workout data is not in expected array format');
          result.isValid = false;
        } else {
          // Validate workout structure
          for (let i = 0; i < Math.min(workouts.length, 5); i++) {
            const workout = workouts[i];
            if (!workout.id) {
              result.warnings.push(`Workout at index ${i} missing ID`);
            }
            if (!workout.name && !workout.date) {
              result.warnings.push(`Workout at index ${i} missing name and date`);
            }
          }
        }
      }

      // Check measurements data
      const measurementData = await AsyncStorage.getItem('measurements');
      if (measurementData) {
        const measurements = JSON.parse(measurementData);
        if (!Array.isArray(measurements)) {
          result.errors.push('Measurement data is not in expected array format');
          result.isValid = false;
        }
      }

      // Check achievements data
      const achievementData = await AsyncStorage.getItem('user_achievements');
      if (achievementData) {
        const achievements = JSON.parse(achievementData);
        if (!Array.isArray(achievements)) {
          result.errors.push('Achievement data is not in expected array format');
          result.isValid = false;
        }
      }

      // Check progress photos
      const photoData = await AsyncStorage.getItem('progress_photos');
      if (photoData) {
        const photos = JSON.parse(photoData);
        if (!Array.isArray(photos)) {
          result.errors.push('Progress photo data is not in expected array format');
          result.isValid = false;
        } else {
          // Check for valid photo URLs
          const invalidPhotos = photos.filter(photo => !photo.url && !photo.uri);
          if (invalidPhotos.length > 0) {
            result.warnings.push(`${invalidPhotos.length} photos missing URL/URI`);
          }
        }
      }

    } catch (error) {
      result.errors.push(`Data validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }

    return result;
  }

  // Check data integrity after migration
  static async checkDataIntegrity(userId: string): Promise<DataIntegrityCheck[]> {
    const checks: DataIntegrityCheck[] = [];

    try {
      // Check workout sessions
      const localWorkouts = await AsyncStorage.getItem('workout_history');
      const localWorkoutCount = localWorkouts ? JSON.parse(localWorkouts).length : 0;
      
      const { count: remoteWorkoutCount } = await supabase
        .from('workout_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      checks.push({
        table: 'workout_sessions',
        localCount: localWorkoutCount,
        remoteCount: remoteWorkoutCount || 0,
        isConsistent: localWorkoutCount === (remoteWorkoutCount || 0),
        missingRecords: []
      });

      // Check measurements
      const localMeasurements = await AsyncStorage.getItem('measurements');
      const localMeasurementCount = localMeasurements ? JSON.parse(localMeasurements).length : 0;
      
      const { count: remoteMeasurementCount } = await supabase
        .from('user_measurements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      checks.push({
        table: 'user_measurements',
        localCount: localMeasurementCount,
        remoteCount: remoteMeasurementCount || 0,
        isConsistent: localMeasurementCount === (remoteMeasurementCount || 0),
        missingRecords: []
      });

      // Check achievements
      const localAchievements = await AsyncStorage.getItem('user_achievements');
      const localAchievementCount = localAchievements ? JSON.parse(localAchievements).length : 0;
      
      const { count: remoteAchievementCount } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      checks.push({
        table: 'user_achievements',
        localCount: localAchievementCount,
        remoteCount: remoteAchievementCount || 0,
        isConsistent: localAchievementCount === (remoteAchievementCount || 0),
        missingRecords: []
      });

      // Check progress photos
      const localPhotos = await AsyncStorage.getItem('progress_photos');
      const localPhotoCount = localPhotos ? JSON.parse(localPhotos).length : 0;
      
      const { count: remotePhotoCount } = await supabase
        .from('progress_photos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      checks.push({
        table: 'progress_photos',
        localCount: localPhotoCount,
        remoteCount: remotePhotoCount || 0,
        isConsistent: localPhotoCount === (remotePhotoCount || 0),
        missingRecords: []
      });

    } catch (error) {
      console.error('Data integrity check failed:', error);
    }

    return checks;
  }

  // Clean up corrupted or invalid data
  static async cleanupLocalData(): Promise<void> {
    const keysToClean = [
      'workout_sessions',
      'workout_history',
      'user_achievements',
      'measurements',
      'progress_photos',
      'social_posts'
    ];

    for (const key of keysToClean) {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            // Remove entries without required fields
            const cleaned = parsed.filter(item => {
              if (key === 'workout_history' || key === 'workout_sessions') {
                return item.id || item.date || item.name;
              }
              if (key === 'measurements') {
                return item.type && item.value !== undefined;
              }
              if (key === 'progress_photos') {
                return item.url || item.uri;
              }
              return item.id || item.date || item.timestamp;
            });

            if (cleaned.length !== parsed.length) {
              await AsyncStorage.setItem(key, JSON.stringify(cleaned));
              console.log(`Cleaned ${parsed.length - cleaned.length} invalid entries from ${key}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error cleaning ${key}:`, error);
        // If data is completely corrupted, remove it
        await AsyncStorage.removeItem(key);
      }
    }
  }

  // Generate migration report
  static async generateMigrationReport(migrationResult: any): Promise<string> {
    const report = {
      timestamp: new Date().toISOString(),
      success: migrationResult.success,
      migratedData: migrationResult.migratedData,
      errors: migrationResult.errors,
      totalMigrated: Object.values(migrationResult.migratedData).reduce((sum: number, count: any) => sum + count, 0),
      systemInfo: {
        platform: 'React Native',
        timestamp: new Date().toISOString()
      }
    };

    const reportString = JSON.stringify(report, null, 2);
    
    // Store report locally
    await AsyncStorage.setItem('migration_report', reportString);
    
    return reportString;
  }

  // Estimate migration time based on data size
  static async estimateMigrationTime(): Promise<number> {
    try {
      let totalRecords = 0;
      
      const dataKeys = [
        'workout_history',
        'user_achievements',
        'measurements',
        'progress_photos',
        'social_posts'
      ];

      for (const key of dataKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            totalRecords += parsed.length;
          }
        }
      }

      // Estimate ~100ms per record (conservative estimate)
      const estimatedMs = totalRecords * 100;
      
      // Return in seconds
      return Math.ceil(estimatedMs / 1000);
      
    } catch (error) {
      console.error('Error estimating migration time:', error);
      return 30; // Default estimate of 30 seconds
    }
  }

  // Check if database schema is up to date
  static async validateDatabaseSchema(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      // Check if required tables exist
      const requiredTables = [
        'workout_sessions',
        'exercises',
        'user_achievements',
        'user_measurements',
        'progress_photos'
      ];

      for (const table of requiredTables) {
        try {
          await supabase.from(table).select('id').limit(1);
        } catch (error) {
          result.errors.push(`Table ${table} does not exist or is not accessible`);
          result.isValid = false;
        }
      }

      // Check RLS policies are enabled
      // This is a basic check - in production you might want more comprehensive validation
      
    } catch (error) {
      result.errors.push(`Schema validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
    }

    return result;
  }

  // Rollback migration if needed
  static async rollbackMigration(): Promise<void> {
    try {
      // Restore from backup if available
      const backup = await AsyncStorage.getItem('data_backup');
      if (backup) {
        const backupData = JSON.parse(backup);
        
        for (const [key, data] of Object.entries(backupData.data)) {
          if (data) {
            await AsyncStorage.setItem(key, JSON.stringify(data));
          }
        }
      }

      // Clear migration status
      await AsyncStorage.multiRemove([
        'migration_completed',
        'migration_date',
        'migration_last_attempt'
      ]);

      console.log('Migration rollback completed');
    } catch (error) {
      console.error('Rollback failed:', error);
      throw new Error(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default MigrationUtils;
