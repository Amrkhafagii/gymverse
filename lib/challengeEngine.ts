import { supabase } from './supabase';
import { Challenge, UserChallenge, generateDailyChallenge, generateWeeklyChallenge, getDifficultyMultiplier } from './challenges';

export class ChallengeEngine {
  private static instance: ChallengeEngine;
  
  static getInstance(): ChallengeEngine {
    if (!ChallengeEngine.instance) {
      ChallengeEngine.instance = new ChallengeEngine();
    }
    return ChallengeEngine.instance;
  }

  async generateDailyChallenges(): Promise<Challenge[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if daily challenges already exist for today
      const { data: existingChallenges } = await supabase
        .from('challenges')
        .select('*')
        .gte('start_date', today)
        .eq('duration_days', 1);

      if (existingChallenges && existingChallenges.length > 0) {
        return existingChallenges;
      }

      // Generate 3 random daily challenges
      const challenges: Challenge[] = [];
      for (let i = 0; i < 3; i++) {
        const challenge = generateDailyChallenge();
        challenges.push(challenge);
      }

      // Insert challenges into database
      const { data: insertedChallenges } = await supabase
        .from('challenges')
        .insert(challenges)
        .select();

      return insertedChallenges || [];
    } catch (error) {
      console.error('Error generating daily challenges:', error);
      return [];
    }
  }

  async generateWeeklyChallenges(): Promise<Challenge[]> {
    try {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
      
      // Check if weekly challenges already exist for this week
      const { data: existingChallenges } = await supabase
        .from('challenges')
        .select('*')
        .gte('start_date', startOfWeekStr)
        .eq('duration_days', 7);

      if (existingChallenges && existingChallenges.length > 0) {
        return existingChallenges;
      }

      // Generate 2 weekly challenges
      const challenges: Challenge[] = [];
      for (let i = 0; i < 2; i++) {
        const challenge = generateWeeklyChallenge();
        challenges.push(challenge);
      }

      // Insert challenges into database
      const { data: insertedChallenges } = await supabase
        .from('challenges')
        .insert(challenges)
        .select();

      return insertedChallenges || [];
    } catch (error) {
      console.error('Error generating weekly challenges:', error);
      return [];
    }
  }

  async getUserChallenges(userId: string): Promise<UserChallenge[]> {
    try {
      const { data } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Error getting user challenges:', error);
      return [];
    }
  }

  async joinChallenge(userId: string, challengeId: string): Promise<UserChallenge | null> {
    try {
      // Check if user already joined this challenge
      const { data: existing } = await supabase
        .from('user_challenges')
        .select('*')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (existing) {
        return existing;
      }

      // Join the challenge
      const { data: userChallenge } = await supabase
        .from('user_challenges')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          progress: 0,
          is_completed: false,
          rewards_claimed: false
        })
        .select()
        .single();

      return userChallenge;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return null;
    }
  }

  async updateChallengeProgress(userId: string, metric: string, value: number): Promise<void> {
    try {
      // Get active user challenges that track this metric
      const { data: userChallenges } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('user_id', userId)
        .eq('is_completed', false);

      if (!userChallenges) return;

      for (const userChallenge of userChallenges) {
        const challenge = userChallenge.challenge;
        if (!challenge || challenge.requirements.metric !== metric) continue;

        // Check if challenge is still active
        const now = new Date();
        const endDate = new Date(challenge.end_date);
        if (now > endDate) continue;

        // Update progress
        const newProgress = Math.min(userChallenge.progress + value, challenge.requirements.target);
        const isCompleted = newProgress >= challenge.requirements.target;

        await supabase
          .from('user_challenges')
          .update({
            progress: newProgress,
            is_completed: isCompleted,
            completed_at: isCompleted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userChallenge.id);

        // Award rewards if completed
        if (isCompleted && !userChallenge.rewards_claimed) {
          await this.awardChallengeRewards(userId, challenge);
        }
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }

  private async awardChallengeRewards(userId: string, challenge: Challenge): Promise<void> {
    try {
      const basePoints = challenge.rewards.points;
      const difficultyMultiplier = getDifficultyMultiplier(challenge.difficulty);
      const bonusMultiplier = challenge.rewards.bonus_multiplier || 1;
      
      const totalPoints = Math.floor(basePoints * difficultyMultiplier * bonusMultiplier);

      // Insert reward record
      await supabase
        .from('user_rewards')
        .insert({
          user_id: userId,
          reward_type: 'challenge_completion',
          reward_data: JSON.stringify({
            challenge_id: challenge.id,
            challenge_title: challenge.title,
            difficulty: challenge.difficulty,
            special_reward: challenge.rewards.special_reward
          }),
          points_awarded: totalPoints,
          is_claimed: false,
          earned_at: new Date().toISOString()
        });

      // Update user points
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', userId)
        .single();

      const currentPoints = profile?.total_points || 0;
      
      await supabase
        .from('profiles')
        .update({ 
          total_points: currentPoints + totalPoints,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Mark rewards as claimed
      await supabase
        .from('user_challenges')
        .update({ rewards_claimed: true })
        .eq('user_id', userId)
        .eq('challenge_id', challenge.id);

      console.log(`Challenge rewards awarded: ${totalPoints} points for completing ${challenge.title}`);
    } catch (error) {
      console.error('Error awarding challenge rewards:', error);
    }
  }

  async getActiveChallenges(): Promise<Challenge[]> {
    try {
      const now = new Date().toISOString();
      
      const { data } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Error getting active challenges:', error);
      return [];
    }
  }

  // Helper methods for specific challenge progress updates
  async onWorkoutCompleted(userId: string, workoutData: any): Promise<void> {
    const workoutTime = new Date(workoutData.created_at);
    const isMorning = workoutTime.getHours() < 9;
    
    await this.updateChallengeProgress(userId, 'daily_workouts', 1);
    
    if (isMorning) {
      await this.updateChallengeProgress(userId, 'morning_workouts', 1);
    }
  }

  async onStrengthExerciseCompleted(userId: string, exerciseData: any): Promise<void> {
    if (exerciseData.reps >= 8) {
      await this.updateChallengeProgress(userId, 'strength_exercises_completed', 1);
    }
  }

  async onCardioCompleted(userId: string, minutes: number): Promise<void> {
    await this.updateChallengeProgress(userId, 'cardio_minutes', minutes);
    await this.updateChallengeProgress(userId, 'weekly_cardio_minutes', minutes);
  }

  async onSocialInteraction(userId: string): Promise<void> {
    await this.updateChallengeProgress(userId, 'social_interactions', 1);
  }

  async onProgressLogged(userId: string): Promise<void> {
    await this.updateChallengeProgress(userId, 'progress_logs', 1);
  }

  async onCommunityHelp(userId: string): Promise<void> {
    await this.updateChallengeProgress(userId, 'community_helps', 1);
  }
}
