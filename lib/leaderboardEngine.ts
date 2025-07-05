import { supabase } from './supabase';
import { LeaderboardEntry, UserLeaderboardStats, LEADERBOARD_TYPES, getLeaderboardRewards } from './leaderboards';

export class LeaderboardEngine {
  private static instance: LeaderboardEngine;
  
  static getInstance(): LeaderboardEngine {
    if (!LeaderboardEngine.instance) {
      LeaderboardEngine.instance = new LeaderboardEngine();
    }
    return LeaderboardEngine.instance;
  }

  async updateUserStats(userId: string, updates: Partial<UserLeaderboardStats>): Promise<void> {
    try {
      // Get or create user stats
      let { data: stats } = await supabase
        .from('user_leaderboard_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!stats) {
        // Create new stats record
        const { data: newStats } = await supabase
          .from('user_leaderboard_stats')
          .insert({
            user_id: userId,
            total_points: 0,
            workouts_completed: 0,
            streak_days: 0,
            achievements_earned: 0,
            challenges_completed: 0,
            social_score: 0,
            consistency_score: 0,
            strength_score: 0,
            cardio_score: 0,
            ...updates
          })
          .select()
          .single();
        
        stats = newStats;
      } else {
        // Update existing stats
        const { data: updatedStats } = await supabase
          .from('user_leaderboard_stats')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();
        
        stats = updatedStats;
      }

      // Update leaderboard rankings
      await this.updateLeaderboardRankings();
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }

  async updateLeaderboardRankings(): Promise<void> {
    try {
      for (const leaderboardType of LEADERBOARD_TYPES) {
        await this.updateSpecificLeaderboard(leaderboardType.id);
      }
    } catch (error) {
      console.error('Error updating leaderboard rankings:', error);
    }
  }

  private async updateSpecificLeaderboard(leaderboardTypeId: string): Promise<void> {
    try {
      const leaderboardType = LEADERBOARD_TYPES.find(type => type.id === leaderboardTypeId);
      if (!leaderboardType) return;

      // Get timeframe dates
      const { startDate, endDate } = this.getTimeframeDates(leaderboardType.timeframe);
      
      // Get user stats for this leaderboard
      const userStats = await this.getUserStatsForLeaderboard(leaderboardType, startDate, endDate);
      
      // Sort by score and assign ranks
      userStats.sort((a, b) => b.score - a.score);
      
      // Update or create leaderboard entries
      for (let i = 0; i < userStats.length; i++) {
        const userStat = userStats[i];
        const newRank = i + 1;
        
        // Get previous rank
        const { data: previousEntry } = await supabase
          .from('leaderboard_entries')
          .select('rank')
          .eq('user_id', userStat.user_id)
          .eq('leaderboard_type', leaderboardTypeId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Upsert leaderboard entry
        await supabase
          .from('leaderboard_entries')
          .upsert({
            user_id: userStat.user_id,
            leaderboard_type: leaderboardTypeId,
            score: userStat.score,
            rank: newRank,
            previous_rank: previousEntry?.rank,
            timeframe_start: startDate.toISOString(),
            timeframe_end: endDate.toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,leaderboard_type,timeframe_start'
          });
      }

      // Award leaderboard rewards
      await this.awardLeaderboardRewards(leaderboardTypeId, userStats);
    } catch (error) {
      console.error(`Error updating ${leaderboardTypeId} leaderboard:`, error);
    }
  }

  private async getUserStatsForLeaderboard(
    leaderboardType: any, 
    startDate: Date, 
    endDate: Date
  ): Promise<Array<{ user_id: string; score: number }>> {
    try {
      let query = supabase.from('user_leaderboard_stats').select('user_id, ' + leaderboardType.metric);
      
      // Add time-based filtering for non-all-time leaderboards
      if (leaderboardType.timeframe !== 'all_time') {
        // For time-based metrics, we need to calculate scores from activities within the timeframe
        // This is a simplified version - in production, you'd have more complex aggregation
        query = query.gte('updated_at', startDate.toISOString());
      }
      
      const { data } = await query;
      
      return (data || []).map(item => ({
        user_id: item.user_id,
        score: item[leaderboardType.metric] || 0
      }));
    } catch (error) {
      console.error('Error getting user stats for leaderboard:', error);
      return [];
    }
  }

  private getTimeframeDates(timeframe: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    
    switch (timeframe) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(now.getDate() - daysToMonday);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(endDate.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'all_time':
        startDate = new Date('2020-01-01');
        endDate = new Date('2030-12-31');
        break;
    }
    
    return { startDate, endDate };
  }

  private async awardLeaderboardRewards(leaderboardTypeId: string, userStats: Array<{ user_id: string; score: number }>): Promise<void> {
    try {
      const rewards = getLeaderboardRewards(leaderboardTypeId);
      
      for (const reward of rewards) {
        const [minRank, maxRank] = reward.rank_range;
        const eligibleUsers = userStats.slice(minRank - 1, maxRank);
        
        for (const user of eligibleUsers) {
          await this.awardRewardToUser(user.user_id, reward, leaderboardTypeId);
        }
      }
    } catch (error) {
      console.error('Error awarding leaderboard rewards:', error);
    }
  }

  private async awardRewardToUser(userId: string, reward: any, leaderboardType: string): Promise<void> {
    try {
      // Check if reward already awarded for this period
      const { data: existingReward } = await supabase
        .from('user_rewards')
        .select('id')
        .eq('user_id', userId)
        .eq('reward_type', 'leaderboard_reward')
        .eq('reward_data', JSON.stringify({ 
          leaderboard_type: leaderboardType,
          reward_title: reward.title 
        }))
        .single();

      if (existingReward) return;

      // Award the reward
      await supabase
        .from('user_rewards')
        .insert({
          user_id: userId,
          reward_type: 'leaderboard_reward',
          reward_data: JSON.stringify({
            leaderboard_type: leaderboardType,
            reward_title: reward.title,
            reward_description: reward.description
          }),
          points_awarded: reward.reward_type === 'points' ? reward.reward_value : 0,
          is_claimed: false,
          earned_at: new Date().toISOString()
        });

      // Update user points if applicable
      if (reward.reward_type === 'points') {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_points')
          .eq('id', userId)
          .single();

        const currentPoints = profile?.total_points || 0;
        
        await supabase
          .from('profiles')
          .update({ 
            total_points: currentPoints + reward.reward_value,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error awarding reward to user:', error);
    }
  }

  async getLeaderboard(leaderboardTypeId: string, limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      const leaderboardType = LEADERBOARD_TYPES.find(type => type.id === leaderboardTypeId);
      if (!leaderboardType) return [];

      const { startDate } = this.getTimeframeDates(leaderboardType.timeframe);

      const { data } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          user:profiles(id, username, full_name, avatar_url)
        `)
        .eq('leaderboard_type', leaderboardTypeId)
        .gte('timeframe_start', startDate.toISOString())
        .order('rank', { ascending: true })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async getUserRank(userId: string, leaderboardTypeId: string): Promise<LeaderboardEntry | null> {
    try {
      const leaderboardType = LEADERBOARD_TYPES.find(type => type.id === leaderboardTypeId);
      if (!leaderboardType) return null;

      const { startDate } = this.getTimeframeDates(leaderboardType.timeframe);

      const { data } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          user:profiles(id, username, full_name, avatar_url)
        `)
        .eq('user_id', userId)
        .eq('leaderboard_type', leaderboardTypeId)
        .gte('timeframe_start', startDate.toISOString())
        .single();

      return data;
    } catch (error) {
      console.error('Error getting user rank:', error);
      return null;
    }
  }

  // Event handlers for updating stats
  async onWorkoutCompleted(userId: string, workoutData: any): Promise<void> {
    await this.updateUserStats(userId, {
      workouts_completed: (await this.getCurrentStats(userId)).workouts_completed + 1,
      consistency_score: (await this.getCurrentStats(userId)).consistency_score + 10
    });
  }

  async onPointsEarned(userId: string, points: number): Promise<void> {
    const currentStats = await this.getCurrentStats(userId);
    await this.updateUserStats(userId, {
      total_points: currentStats.total_points + points
    });
  }

  async onStreakUpdated(userId: string, streakDays: number): Promise<void> {
    await this.updateUserStats(userId, {
      streak_days: streakDays,
      consistency_score: (await this.getCurrentStats(userId)).consistency_score + streakDays
    });
  }

  async onAchievementEarned(userId: string): Promise<void> {
    await this.updateUserStats(userId, {
      achievements_earned: (await this.getCurrentStats(userId)).achievements_earned + 1
    });
  }

  async onChallengeCompleted(userId: string): Promise<void> {
    await this.updateUserStats(userId, {
      challenges_completed: (await this.getCurrentStats(userId)).challenges_completed + 1
    });
  }

  async onSocialActivity(userId: string, activityType: string): Promise<void> {
    const currentStats = await this.getCurrentStats(userId);
    const socialBonus = activityType === 'post' ? 5 : activityType === 'comment' ? 3 : 1;
    
    await this.updateUserStats(userId, {
      social_score: currentStats.social_score + socialBonus
    });
  }

  async onStrengthImprovement(userId: string, improvement: number): Promise<void> {
    await this.updateUserStats(userId, {
      strength_score: (await this.getCurrentStats(userId)).strength_score + improvement
    });
  }

  async onCardioCompleted(userId: string, minutes: number): Promise<void> {
    await this.updateUserStats(userId, {
      cardio_score: (await this.getCurrentStats(userId)).cardio_score + minutes
    });
  }

  private async getCurrentStats(userId: string): Promise<UserLeaderboardStats> {
    try {
      const { data } = await supabase
        .from('user_leaderboard_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      return data || {
        user_id: userId,
        total_points: 0,
        workouts_completed: 0,
        streak_days: 0,
        achievements_earned: 0,
        challenges_completed: 0,
        social_score: 0,
        consistency_score: 0,
        strength_score: 0,
        cardio_score: 0
      };
    } catch (error) {
      return {
        user_id: userId,
        total_points: 0,
        workouts_completed: 0,
        streak_days: 0,
        achievements_earned: 0,
        challenges_completed: 0,
        social_score: 0,
        consistency_score: 0,
        strength_score: 0,
        cardio_score: 0
      };
    }
  }
}
