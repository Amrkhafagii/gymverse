import { supabase } from './supabase';
import { ACHIEVEMENT_TEMPLATES, AchievementTemplate } from './achievements';

export interface UserProgress {
  userId: string;
  workouts_completed: number;
  personal_records: number;
  workout_days_streak: number;
  max_weight_kg: number;
  powerlifting_total_kg: number;
  cardio_minutes: number;
  distance_km: number;
  likes_given: number;
  likes_received: number;
  comments_made: number;
  workouts_shared: number;
  goals_completed: number;
  progress_logged_days: number;
  active_days: number;
  unique_exercises: number;
  workout_types: number;
  early_morning_workouts: number;
  workout_categories_completed: number;
  [key: string]: any;
}

export class AchievementEngine {
  private static instance: AchievementEngine;
  
  static getInstance(): AchievementEngine {
    if (!AchievementEngine.instance) {
      AchievementEngine.instance = new AchievementEngine();
    }
    return AchievementEngine.instance;
  }

  async checkAchievements(userId: string, updatedMetrics: Partial<UserProgress>): Promise<string[]> {
    try {
      // Get current user progress
      const userProgress = await this.getUserProgress(userId);
      
      // Update progress with new metrics
      const newProgress = { ...userProgress, ...updatedMetrics };
      
      // Get user's current achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);
      
      const unlockedAchievementIds = new Set(
        userAchievements?.map(ua => ua.achievement_id) || []
      );
      
      // Check each achievement template
      const newlyUnlocked: string[] = [];
      
      for (const template of ACHIEVEMENT_TEMPLATES) {
        if (unlockedAchievementIds.has(template.id)) {
          continue; // Already unlocked
        }
        
        if (this.checkAchievementRequirement(template, newProgress)) {
          await this.unlockAchievement(userId, template);
          newlyUnlocked.push(template.id);
        }
      }
      
      // Update user progress in database
      if (Object.keys(updatedMetrics).length > 0) {
        await this.updateUserProgress(userId, updatedMetrics);
      }
      
      return newlyUnlocked;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  private checkAchievementRequirement(
    template: AchievementTemplate, 
    progress: UserProgress
  ): boolean {
    const { requirement } = template;
    const currentValue = progress[requirement.metric] || 0;
    
    switch (requirement.type) {
      case 'count':
        return currentValue >= requirement.target;
      
      case 'streak':
        return currentValue >= requirement.target;
      
      case 'total':
        return currentValue >= requirement.target;
      
      case 'single':
        return currentValue >= requirement.target;
      
      case 'percentage':
        return currentValue >= requirement.target;
      
      default:
        return false;
    }
  }

  private async unlockAchievement(userId: string, template: AchievementTemplate): Promise<void> {
    try {
      // Insert into user_achievements
      await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: template.id,
          unlocked_at: new Date().toISOString(),
          points_earned: template.points
        });

      // Update user's total points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single();

      const currentPoints = profile?.total_points || 0;
      
      await supabase
        .from('profiles')
        .update({ 
          total_points: currentPoints + template.points,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      console.log(`Achievement unlocked: ${template.name} for user ${userId}`);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  }

  private async getUserProgress(userId: string): Promise<UserProgress> {
    try {
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      return data || this.getDefaultProgress(userId);
    } catch (error) {
      return this.getDefaultProgress(userId);
    }
  }

  private async updateUserProgress(userId: string, metrics: Partial<UserProgress>): Promise<void> {
    try {
      await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          ...metrics,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  }

  private getDefaultProgress(userId: string): UserProgress {
    return {
      userId,
      workouts_completed: 0,
      personal_records: 0,
      workout_days_streak: 0,
      max_weight_kg: 0,
      powerlifting_total_kg: 0,
      cardio_minutes: 0,
      distance_km: 0,
      likes_given: 0,
      likes_received: 0,
      comments_made: 0,
      workouts_shared: 0,
      goals_completed: 0,
      progress_logged_days: 0,
      active_days: 0,
      unique_exercises: 0,
      workout_types: 0,
      early_morning_workouts: 0,
      workout_categories_completed: 0
    };
  }

  // Helper methods for specific achievement triggers
  async onWorkoutCompleted(userId: string, workoutData: any): Promise<string[]> {
    const metrics: Partial<UserProgress> = {
      workouts_completed: (await this.getUserProgress(userId)).workouts_completed + 1
    };

    // Check if it's an early morning workout (before 7 AM)
    const workoutTime = new Date(workoutData.created_at);
    if (workoutTime.getHours() < 7) {
      metrics.early_morning_workouts = (await this.getUserProgress(userId)).early_morning_workouts + 1;
    }

    // Update workout duration if it's a record
    if (workoutData.duration_minutes) {
      const currentProgress = await this.getUserProgress(userId);
      if (workoutData.duration_minutes > (currentProgress.workout_duration_minutes || 0)) {
        metrics.workout_duration_minutes = workoutData.duration_minutes;
      }
    }

    return this.checkAchievements(userId, metrics);
  }

  async onPersonalRecordSet(userId: string, weight: number): Promise<string[]> {
    const currentProgress = await this.getUserProgress(userId);
    const metrics: Partial<UserProgress> = {
      personal_records: currentProgress.personal_records + 1
    };

    if (weight > currentProgress.max_weight_kg) {
      metrics.max_weight_kg = weight;
    }

    return this.checkAchievements(userId, metrics);
  }

  async onStreakUpdated(userId: string, streakDays: number): Promise<string[]> {
    return this.checkAchievements(userId, {
      workout_days_streak: streakDays
    });
  }

  async onSocialAction(userId: string, action: 'like_given' | 'like_received' | 'comment_made' | 'workout_shared'): Promise<string[]> {
    const currentProgress = await this.getUserProgress(userId);
    const metrics: Partial<UserProgress> = {};

    switch (action) {
      case 'like_given':
        metrics.likes_given = currentProgress.likes_given + 1;
        break;
      case 'like_received':
        metrics.likes_received = currentProgress.likes_received + 1;
        break;
      case 'comment_made':
        metrics.comments_made = currentProgress.comments_made + 1;
        break;
      case 'workout_shared':
        metrics.workouts_shared = currentProgress.workouts_shared + 1;
        break;
    }

    return this.checkAchievements(userId, metrics);
  }
}
