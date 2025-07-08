import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

export interface MigrationProgress {
  step: string;
  progress: number;
  total: number;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  error?: string;
}

export interface MigrationResult {
  success: boolean;
  migratedData: {
    workouts: number;
    achievements: number;
    measurements: number;
    photos: number;
    social: number;
  };
  errors: string[];
}

class DataMigrationService {
  private onProgress?: (progress: MigrationProgress) => void;

  constructor(onProgress?: (progress: MigrationProgress) => void) {
    this.onProgress = onProgress;
  }

  private updateProgress(step: string, progress: number, total: number, status: MigrationProgress['status'], error?: string) {
    this.onProgress?.({
      step,
      progress,
      total,
      status,
      error
    });
  }

  async migrateAllData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedData: {
        workouts: 0,
        achievements: 0,
        measurements: 0,
        photos: 0,
        social: 0
      },
      errors: []
    };

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      // Step 1: Migrate workout data
      this.updateProgress('Migrating workout sessions...', 0, 5, 'in_progress');
      try {
        result.migratedData.workouts = await this.migrateWorkoutData(user.id);
        this.updateProgress('Workout sessions migrated', 1, 5, 'completed');
      } catch (error) {
        const errorMsg = `Workout migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        this.updateProgress('Workout migration failed', 1, 5, 'error', errorMsg);
      }

      // Step 2: Migrate achievements
      this.updateProgress('Migrating achievements...', 1, 5, 'in_progress');
      try {
        result.migratedData.achievements = await this.migrateAchievementData(user.id);
        this.updateProgress('Achievements migrated', 2, 5, 'completed');
      } catch (error) {
        const errorMsg = `Achievement migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        this.updateProgress('Achievement migration failed', 2, 5, 'error', errorMsg);
      }

      // Step 3: Migrate measurements
      this.updateProgress('Migrating measurements...', 2, 5, 'in_progress');
      try {
        result.migratedData.measurements = await this.migrateMeasurementData(user.id);
        this.updateProgress('Measurements migrated', 3, 5, 'completed');
      } catch (error) {
        const errorMsg = `Measurement migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        this.updateProgress('Measurement migration failed', 3, 5, 'error', errorMsg);
      }

      // Step 4: Migrate progress photos
      this.updateProgress('Migrating progress photos...', 3, 5, 'in_progress');
      try {
        result.migratedData.photos = await this.migrateProgressPhotos(user.id);
        this.updateProgress('Progress photos migrated', 4, 5, 'completed');
      } catch (error) {
        const errorMsg = `Photo migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        this.updateProgress('Photo migration failed', 4, 5, 'error', errorMsg);
      }

      // Step 5: Migrate social data
      this.updateProgress('Migrating social data...', 4, 5, 'in_progress');
      try {
        result.migratedData.social = await this.migrateSocialData(user.id);
        this.updateProgress('Social data migrated', 5, 5, 'completed');
      } catch (error) {
        const errorMsg = `Social migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        this.updateProgress('Social migration failed', 5, 5, 'error', errorMsg);
      }

      // Mark migration as completed
      await AsyncStorage.setItem('migration_completed', 'true');
      await AsyncStorage.setItem('migration_date', new Date().toISOString());

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      const errorMsg = `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.errors.push(errorMsg);
      result.success = false;
      this.updateProgress('Migration failed', 0, 5, 'error', errorMsg);
      return result;
    }
  }

  private async migrateWorkoutData(userId: string): Promise<number> {
    let migratedCount = 0;

    try {
      // Get workout sessions from local storage
      const workoutSessionsData = await AsyncStorage.getItem('workout_sessions');
      const workoutHistoryData = await AsyncStorage.getItem('workout_history');
      
      const sessions = workoutSessionsData ? JSON.parse(workoutSessionsData) : [];
      const history = workoutHistoryData ? JSON.parse(workoutHistoryData) : [];
      
      const allWorkouts = [...sessions, ...history];

      for (const workout of allWorkouts) {
        try {
          // Insert workout session
          const { data: sessionData, error: sessionError } = await supabase
            .from('workout_sessions')
            .insert({
              user_id: userId,
              name: workout.name || 'Workout Session',
              notes: workout.notes,
              started_at: workout.startTime || workout.date,
              completed_at: workout.endTime || workout.completedAt,
              duration_seconds: workout.duration || 0,
              total_volume_kg: workout.totalVolume || 0,
              total_sets: workout.totalSets || 0,
              total_reps: workout.totalReps || 0,
              status: workout.status || 'completed'
            })
            .select()
            .single();

          if (sessionError) throw sessionError;

          // Insert exercises and sets
          if (workout.exercises && Array.isArray(workout.exercises)) {
            for (let i = 0; i < workout.exercises.length; i++) {
              const exercise = workout.exercises[i];
              
              // Find or create exercise
              let exerciseId = await this.findOrCreateExercise(exercise.name, exercise.category);
              
              // Insert workout exercise
              const { data: workoutExerciseData, error: workoutExerciseError } = await supabase
                .from('workout_exercises')
                .insert({
                  workout_session_id: sessionData.id,
                  exercise_id: exerciseId,
                  order_index: i,
                  target_sets: exercise.targetSets,
                  target_reps: exercise.targetReps,
                  target_weight_kg: exercise.targetWeight,
                  rest_time_seconds: exercise.restTime || 60,
                  completed: true
                })
                .select()
                .single();

              if (workoutExerciseError) throw workoutExerciseError;

              // Insert sets
              if (exercise.sets && Array.isArray(exercise.sets)) {
                for (let j = 0; j < exercise.sets.length; j++) {
                  const set = exercise.sets[j];
                  
                  await supabase
                    .from('exercise_sets')
                    .insert({
                      workout_exercise_id: workoutExerciseData.id,
                      set_number: j + 1,
                      reps: set.reps,
                      weight_kg: set.weight,
                      duration_seconds: set.duration,
                      rest_time_seconds: set.restTime,
                      completed: set.completed !== false,
                      completed_at: set.completedAt || sessionData.completed_at
                    });
                }
              }
            }
          }

          migratedCount++;
        } catch (error) {
          console.error('Error migrating workout:', error);
          // Continue with next workout
        }
      }

      return migratedCount;
    } catch (error) {
      console.error('Error in workout migration:', error);
      return migratedCount;
    }
  }

  private async migrateAchievementData(userId: string): Promise<number> {
    let migratedCount = 0;

    try {
      // Get achievements from local storage
      const achievementsData = await AsyncStorage.getItem('user_achievements');
      const streaksData = await AsyncStorage.getItem('streaks');
      
      const achievements = achievementsData ? JSON.parse(achievementsData) : [];
      const streaks = streaksData ? JSON.parse(streaksData) : {};

      // Migrate achievements
      for (const achievement of achievements) {
        try {
          // Find achievement definition by name
          const { data: achievementDef } = await supabase
            .from('achievement_definitions')
            .select('id')
            .eq('name', achievement.name)
            .single();

          if (achievementDef) {
            await supabase
              .from('user_achievements')
              .insert({
                user_id: userId,
                achievement_id: achievementDef.id,
                unlocked_at: achievement.unlockedAt || achievement.date,
                progress_data: achievement.progressData || {},
                celebration_viewed: achievement.viewed || false
              });
            
            migratedCount++;
          }
        } catch (error) {
          console.error('Error migrating achievement:', error);
        }
      }

      // Migrate streaks
      for (const [streakType, streakData] of Object.entries(streaks)) {
        try {
          await supabase
            .from('streaks')
            .insert({
              user_id: userId,
              streak_type: streakType,
              current_count: (streakData as any).current || 0,
              best_count: (streakData as any).best || 0,
              last_activity_date: (streakData as any).lastActivity,
              started_at: (streakData as any).startedAt,
              is_active: (streakData as any).isActive !== false
            });
          
          migratedCount++;
        } catch (error) {
          console.error('Error migrating streak:', error);
        }
      }

      return migratedCount;
    } catch (error) {
      console.error('Error in achievement migration:', error);
      return migratedCount;
    }
  }

  private async migrateMeasurementData(userId: string): Promise<number> {
    let migratedCount = 0;

    try {
      const measurementsData = await AsyncStorage.getItem('measurements');
      const measurements = measurementsData ? JSON.parse(measurementsData) : [];

      for (const measurement of measurements) {
        try {
          // Find measurement type
          const { data: measurementType } = await supabase
            .from('measurement_types')
            .select('id')
            .eq('name', measurement.type)
            .single();

          if (measurementType) {
            await supabase
              .from('user_measurements')
              .insert({
                user_id: userId,
                measurement_type_id: measurementType.id,
                value: measurement.value,
                measured_at: measurement.date || measurement.measuredAt,
                notes: measurement.notes,
                measurement_context: measurement.context
              });
            
            migratedCount++;
          }
        } catch (error) {
          console.error('Error migrating measurement:', error);
        }
      }

      return migratedCount;
    } catch (error) {
      console.error('Error in measurement migration:', error);
      return migratedCount;
    }
  }

  private async migrateProgressPhotos(userId: string): Promise<number> {
    let migratedCount = 0;

    try {
      const photosData = await AsyncStorage.getItem('progress_photos');
      const photos = photosData ? JSON.parse(photosData) : [];

      // Get or create default album
      let { data: defaultAlbum } = await supabase
        .from('photo_albums')
        .select('id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();

      if (!defaultAlbum) {
        const { data: newAlbum } = await supabase
          .from('photo_albums')
          .insert({
            user_id: userId,
            name: 'My Progress',
            description: 'Default album for progress photos',
            is_default: true,
            is_private: true
          })
          .select()
          .single();
        
        defaultAlbum = newAlbum;
      }

      for (const photo of photos) {
        try {
          await supabase
            .from('progress_photos')
            .insert({
              user_id: userId,
              album_id: defaultAlbum?.id,
              photo_url: photo.url || photo.uri,
              title: photo.title,
              description: photo.description,
              photo_date: photo.date,
              angle: photo.angle,
              weight_kg: photo.weight,
              tags: photo.tags || [],
              is_private: photo.isPrivate !== false
            });
          
          migratedCount++;
        } catch (error) {
          console.error('Error migrating photo:', error);
        }
      }

      return migratedCount;
    } catch (error) {
      console.error('Error in photo migration:', error);
      return migratedCount;
    }
  }

  private async migrateSocialData(userId: string): Promise<number> {
    let migratedCount = 0;

    try {
      const postsData = await AsyncStorage.getItem('social_posts');
      const posts = postsData ? JSON.parse(postsData) : [];

      for (const post of posts) {
        try {
          await supabase
            .from('social_posts')
            .insert({
              user_id: userId,
              content: post.content,
              post_type: post.type || 'text',
              media_urls: post.mediaUrls || [],
              tags: post.tags || [],
              is_public: post.isPublic !== false,
              like_count: post.likeCount || 0,
              comment_count: post.commentCount || 0
            });
          
          migratedCount++;
        } catch (error) {
          console.error('Error migrating post:', error);
        }
      }

      return migratedCount;
    } catch (error) {
      console.error('Error in social migration:', error);
      return migratedCount;
    }
  }

  private async findOrCreateExercise(name: string, category?: string): Promise<string> {
    // First try to find existing exercise
    const { data: existingExercise } = await supabase
      .from('exercises')
      .select('id')
      .eq('name', name)
      .single();

    if (existingExercise) {
      return existingExercise.id;
    }

    // Create new exercise
    const { data: newExercise, error } = await supabase
      .from('exercises')
      .insert({
        name,
        description: `Custom exercise: ${name}`,
        muscle_groups: category ? [category] : [],
        is_custom: true,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return newExercise.id;
  }

  async checkMigrationStatus(): Promise<{ completed: boolean; date?: string }> {
    try {
      const completed = await AsyncStorage.getItem('migration_completed');
      const date = await AsyncStorage.getItem('migration_date');
      
      return {
        completed: completed === 'true',
        date: date || undefined
      };
    } catch (error) {
      return { completed: false };
    }
  }

  async clearLocalData(): Promise<void> {
    const keys = [
      'workout_sessions',
      'workout_history',
      'user_achievements',
      'streaks',
      'measurements',
      'progress_photos',
      'social_posts'
    ];

    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }
}

export default DataMigrationService;
