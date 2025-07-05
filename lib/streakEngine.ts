import { supabase } from './supabase';
import { STREAK_TYPES, UserStreak, getStreakMilestone, calculateStreakMultiplier } from './streaks';
import { AchievementEngine } from './achievementEngine';

export class StreakEngine {
  private static instance: StreakEngine;
  
  static getInstance(): StreakEngine {
    if (!StreakEngine.instance) {
      StreakEngine.instance = new StreakEngine();
    }
    return StreakEngine.instance;
  }

  async updateStreak(userId: string, streakType: string, activityDate?: Date): Promise<UserStreak | null> {
    try {
      const today = activityDate || new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Get or create user streak
      let userStreak = await this.getUserStreak(userId, streakType);
      
      if (!userStreak) {
        userStreak = await this.createUserStreak(userId, streakType);
      }

      const lastActivityDate = new Date(userStreak.last_activity_date);
      const lastActivityStr = lastActivityDate.toISOString().split('T')[0];
      
      // Check if already updated today
      if (lastActivityStr === todayStr) {
        return userStreak;
      }

      // Check if streak should continue or reset
      const daysDiff = Math.floor((today.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let newCount: number;
      let isActive = true;

      if (daysDiff === 1) {
        // Continue streak
        newCount = userStreak.current_count + 1;
      } else if (daysDiff > 1) {
        // Reset streak
        newCount = 1;
      } else {
        // Same day or future date
        return userStreak;
      }

      // Update best count if needed
      const newBestCount = Math.max(userStreak.best_count, newCount);

      // Update streak in database
      const { data: updatedStreak } = await supabase
        .from('user_streaks')
        .update({
          current_count: newCount,
          best_count: newBestCount,
          last_activity_date: todayStr,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', userStreak.id)
        .select()
        .single();

      if (updatedStreak) {
        // Check for milestone rewards
        await this.checkStreakMilestones(userId, streakType, newCount);
        
        // Update achievement progress
        const achievementEngine = AchievementEngine.getInstance();
        await achievementEngine.onStreakUpdated(userId, newCount);
      }

      return updatedStreak;
    } catch (error) {
      console.error('Error updating streak:', error);
      return null;
    }
  }

  async getUserStreaks(userId: string): Promise<UserStreak[]> {
    try {
      const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .order('current_count', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Error getting user streaks:', error);
      return [];
    }
  }

  async getUserStreak(userId: string, streakType: string): Promise<UserStreak | null> {
    try {
      const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', streakType)
        .single();

      return data;
    } catch (error) {
      return null;
    }
  }

  private async createUserStreak(userId: string, streakType: string): Promise<UserStreak> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data } = await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        streak_type: streakType,
        current_count: 0,
        best_count: 0,
        last_activity_date: today,
        is_active: true
      })
      .select()
      .single();

    return data;
  }

  private async checkStreakMilestones(userId: string, streakType: string, currentCount: number): Promise<void> {
    try {
      const milestone = getStreakMilestone(currentCount);
      if (!milestone) return;

      // Check if milestone already awarded
      const { data: existingReward } = await supabase
        .from('user_rewards')
        .select('id')
        .eq('user_id', userId)
        .eq('reward_type', 'streak_milestone')
        .eq('reward_data', JSON.stringify({ streak_type: streakType, days: currentCount }))
        .single();

      if (existingReward) return;

      // Award milestone reward
      await this.awardStreakMilestone(userId, streakType, milestone, currentCount);
    } catch (error) {
      console.error('Error checking streak milestones:', error);
    }
  }

  private async awardStreakMilestone(userId: string, streakType: string, milestone: any, days: number): Promise<void> {
    try {
      // Insert reward record
      await supabase
        .from('user_rewards')
        .insert({
          user_id: userId,
          reward_type: 'streak_milestone',
          reward_data: JSON.stringify({ 
            streak_type: streakType, 
            days: days,
            title: milestone.title,
            description: milestone.description
          }),
          points_awarded: milestone.reward.type === 'points' ? milestone.reward.value : 0,
          is_claimed: false,
          earned_at: new Date().toISOString()
        });

      // Update user points if applicable
      if (milestone.reward.type === 'points') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_points')
          .eq('id', userId)
          .single();

        const currentPoints = profile?.total_points || 0;
        
        await supabase
          .from('profiles')
          .update({ 
            total_points: currentPoints + milestone.reward.value,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }

      console.log(`Streak milestone awarded: ${milestone.title} for ${days} days of ${streakType}`);
    } catch (error) {
      console.error('Error awarding streak milestone:', error);
    }
  }

  async checkStreakExpiry(userId: string): Promise<void> {
    try {
      const userStreaks = await this.getUserStreaks(userId);
      const today = new Date();
      
      for (const streak of userStreaks) {
        if (!streak.is_active) continue;
        
        const lastActivity = new Date(streak.last_activity_date);
        const daysSinceActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        const streakType = STREAK_TYPES.find(type => type.id === streak.streak_type);
        if (!streakType) continue;
        
        // Check if streak should be marked as broken
        let shouldBreak = false;
        
        switch (streakType.resetCondition) {
          case 'daily':
            shouldBreak = daysSinceActivity > 1;
            break;
          case 'weekly':
            shouldBreak = daysSinceActivity > 7;
            break;
          case 'monthly':
            shouldBreak = daysSinceActivity > 30;
            break;
        }
        
        if (shouldBreak) {
          await supabase
            .from('user_streaks')
            .update({
              current_count: 0,
              is_active: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', streak.id);
        }
      }
    } catch (error) {
      console.error('Error checking streak expiry:', error);
    }
  }

  // Helper methods for specific streak types
  async onWorkoutCompleted(userId: string): Promise<void> {
    await this.updateStreak(userId, 'workout_days');
  }

  async onCardioCompleted(userId: string): Promise<void> {
    await this.updateStreak(userId, 'cardio_streak');
  }

  async onStrengthTrainingCompleted(userId: string): Promise<void> {
    await this.updateStreak(userId, 'strength_streak');
  }

  async onProgressLogged(userId: string): Promise<void> {
    await this.updateStreak(userId, 'progress_log_streak');
  }

  async onSocialActivity(userId: string): Promise<void> {
    await this.updateStreak(userId, 'social_streak');
  }

  async onWeeklyGoalCompleted(userId: string): Promise<void> {
    await this.updateStreak(userId, 'weekly_goals');
  }
}
