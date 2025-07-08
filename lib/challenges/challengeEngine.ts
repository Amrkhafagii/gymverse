import { Challenge, ChallengeParticipant, ChallengeStats } from '@/contexts/ChallengeContext';

export class ChallengeEngine {
  /**
   * Generate default challenges for new users
   */
  generateDefaultChallenges(): Challenge[] {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const oneMonthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return [
      {
        id: 'welcome_challenge',
        title: 'Welcome to GymVerse',
        description: 'Complete your first 3 workouts to get started on your fitness journey!',
        type: 'individual',
        category: 'consistency',
        difficulty: 'beginner',
        duration: {
          start: now.toISOString(),
          end: oneWeekFromNow.toISOString(),
          daysLeft: 7,
        },
        target: {
          value: 3,
          unit: 'workouts',
          metric: 'workouts',
        },
        reward: {
          points: 100,
          badge: 'First Steps',
          xp: 50,
        },
        participants: 1247,
        isJoined: false,
        isCompleted: false,
        isFeatured: true,
        color: '#00D4AA',
        tags: ['beginner', 'welcome', 'consistency'],
        image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'strength_builder',
        title: 'Strength Builder Challenge',
        description: 'Complete 10 strength training workouts this month and build your foundation!',
        type: 'community',
        category: 'strength',
        difficulty: 'intermediate',
        duration: {
          start: now.toISOString(),
          end: oneMonthFromNow.toISOString(),
          daysLeft: 30,
        },
        target: {
          value: 10,
          unit: 'workouts',
          metric: 'workouts',
        },
        reward: {
          points: 500,
          badge: 'Strength Master',
          title: 'Iron Warrior',
          xp: 250,
        },
        participants: 892,
        maxParticipants: 1000,
        isJoined: false,
        isCompleted: false,
        isFeatured: true,
        color: '#FF6B35',
        tags: ['strength', 'muscle', 'power'],
        image: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'cardio_crusher',
        title: 'Cardio Crusher',
        description: 'Burn 2000 calories through cardio workouts this month!',
        type: 'individual',
        category: 'cardio',
        difficulty: 'intermediate',
        duration: {
          start: now.toISOString(),
          end: oneMonthFromNow.toISOString(),
          daysLeft: 30,
        },
        target: {
          value: 2000,
          unit: 'calories',
          metric: 'calories',
        },
        reward: {
          points: 750,
          badge: 'Cardio King',
          xp: 375,
        },
        participants: 634,
        isJoined: false,
        isCompleted: false,
        isFeatured: false,
        color: '#9E7FFF',
        tags: ['cardio', 'endurance', 'calories'],
        image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'consistency_champion',
        title: 'Consistency Champion',
        description: 'Work out for 7 consecutive days and build the habit!',
        type: 'community',
        category: 'consistency',
        difficulty: 'beginner',
        duration: {
          start: now.toISOString(),
          end: twoWeeksFromNow.toISOString(),
          daysLeft: 14,
        },
        target: {
          value: 7,
          unit: 'days',
          metric: 'streak',
        },
        reward: {
          points: 300,
          badge: 'Streak Master',
          xp: 150,
        },
        participants: 1523,
        isJoined: false,
        isCompleted: false,
        isFeatured: true,
        color: '#FFD700',
        tags: ['consistency', 'habit', 'streak'],
        image: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'distance_destroyer',
        title: 'Distance Destroyer',
        description: 'Run or walk 50 miles this month and conquer the distance!',
        type: 'individual',
        category: 'distance',
        difficulty: 'advanced',
        duration: {
          start: now.toISOString(),
          end: oneMonthFromNow.toISOString(),
          daysLeft: 30,
        },
        target: {
          value: 50,
          unit: 'miles',
          metric: 'distance',
        },
        reward: {
          points: 1000,
          badge: 'Distance Destroyer',
          title: 'Marathon Warrior',
          xp: 500,
        },
        participants: 445,
        isJoined: false,
        isCompleted: false,
        isFeatured: false,
        color: '#E74C3C',
        tags: ['running', 'distance', 'endurance'],
        image: 'https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Share 5 workout posts and engage with the community!',
        type: 'community',
        category: 'social',
        difficulty: 'beginner',
        duration: {
          start: now.toISOString(),
          end: twoWeeksFromNow.toISOString(),
          daysLeft: 14,
        },
        target: {
          value: 5,
          unit: 'posts',
          metric: 'posts',
        },
        reward: {
          points: 200,
          badge: 'Community Star',
          xp: 100,
        },
        participants: 789,
        isJoined: false,
        isCompleted: false,
        isFeatured: false,
        color: '#3498DB',
        tags: ['social', 'community', 'sharing'],
        image: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
    ];
  }

  /**
   * Calculate days left until challenge ends
   */
  calculateDaysLeft(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * Calculate milestones for challenge progress
   */
  calculateMilestones(
    existingMilestones: Array<{ value: number; achievedAt: string }>,
    currentProgress: number,
    targetValue: number
  ): Array<{ value: number; achievedAt: string }> {
    const milestonePercentages = [25, 50, 75, 100];
    const newMilestones = [...existingMilestones];

    milestonePercentages.forEach(percentage => {
      const milestoneValue = (targetValue * percentage) / 100;
      const alreadyAchieved = existingMilestones.some(m => m.value === milestoneValue);
      
      if (!alreadyAchieved && currentProgress >= milestoneValue) {
        newMilestones.push({
          value: milestoneValue,
          achievedAt: new Date().toISOString(),
        });
      }
    });

    return newMilestones.sort((a, b) => a.value - b.value);
  }

  /**
   * Get suggested challenges based on user activity
   */
  getSuggestedChallenges(
    allChallenges: Challenge[],
    userParticipations: ChallengeParticipant[]
  ): Challenge[] {
    const joinedChallengeIds = userParticipations.map(p => p.challengeId);
    const availableChallenges = allChallenges.filter(c => !joinedChallengeIds.includes(c.id));

    // Calculate user preferences based on completed challenges
    const completedParticipations = userParticipations.filter(p => p.isCompleted);
    const completedChallenges = allChallenges.filter(c => 
      completedParticipations.some(p => p.challengeId === c.id)
    );

    // Determine favorite categories
    const categoryCount: Record<string, number> = {};
    completedChallenges.forEach(c => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });

    const favoriteCategories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .map(([category]) => category);

    // Score challenges based on user preferences
    const scoredChallenges = availableChallenges.map(challenge => {
      let score = 0;

      // Prefer favorite categories
      if (favoriteCategories.includes(challenge.category)) {
        score += 10;
      }

      // Prefer appropriate difficulty
      const userLevel = this.calculateUserLevel(completedChallenges);
      if (challenge.difficulty === 'beginner' && userLevel < 5) score += 5;
      if (challenge.difficulty === 'intermediate' && userLevel >= 5 && userLevel < 15) score += 5;
      if (challenge.difficulty === 'advanced' && userLevel >= 15) score += 5;

      // Prefer featured challenges
      if (challenge.isFeatured) score += 3;

      // Prefer challenges with more participants (popular)
      if (challenge.participants > 500) score += 2;

      // Prefer challenges ending soon (urgency)
      if (challenge.duration.daysLeft <= 7) score += 2;

      return { challenge, score };
    });

    return scoredChallenges
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.challenge);
  }

  /**
   * Calculate user level based on completed challenges
   */
  private calculateUserLevel(completedChallenges: Challenge[]): number {
    const totalPoints = completedChallenges.reduce((sum, c) => sum + c.reward.points, 0);
    return Math.floor(totalPoints / 100) + 1;
  }

  /**
   * Calculate comprehensive user statistics
   */
  calculateUserStats(
    allChallenges: Challenge[],
    userParticipations: ChallengeParticipant[]
  ): ChallengeStats {
    const joinedChallengeIds = userParticipations.map(p => p.challengeId);
    const userChallenges = allChallenges.filter(c => joinedChallengeIds.includes(c.id));
    
    const activeChallenges = userChallenges.filter(c => !c.isCompleted && c.duration.daysLeft > 0);
    const completedChallenges = userChallenges.filter(c => c.isCompleted);
    
    const totalPoints = completedChallenges.reduce((sum, c) => sum + c.reward.points, 0);
    
    // Calculate success rate
    const successRate = userChallenges.length > 0 
      ? (completedChallenges.length / userChallenges.length) * 100 
      : 0;

    // Calculate average completion percentage
    const averageCompletion = userParticipations.length > 0
      ? userParticipations.reduce((sum, p) => sum + p.progress.percentage, 0) / userParticipations.length
      : 0;

    // Find favorite category
    const categoryCount: Record<string, number> = {};
    completedChallenges.forEach(c => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });
    const favoriteCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'strength';

    // Calculate streaks (simplified - in real app, track daily completion)
    const currentStreak = this.calculateCurrentStreak(userParticipations);
    const longestStreak = this.calculateLongestStreak(userParticipations);

    return {
      totalChallenges: userChallenges.length,
      activeChallenges: activeChallenges.length,
      completedChallenges: completedChallenges.length,
      totalPoints,
      currentStreak,
      longestStreak,
      favoriteCategory,
      successRate,
      averageCompletion,
    };
  }

  /**
   * Calculate current challenge completion streak
   */
  private calculateCurrentStreak(participations: ChallengeParticipant[]): number {
    const completed = participations
      .filter(p => p.isCompleted && p.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

    let streak = 0;
    let lastDate: Date | null = null;

    for (const participation of completed) {
      const completedDate = new Date(participation.completedAt!);
      
      if (!lastDate) {
        streak = 1;
        lastDate = completedDate;
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) { // Within a week
          streak++;
          lastDate = completedDate;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  /**
   * Calculate longest challenge completion streak
   */
  private calculateLongestStreak(participations: ChallengeParticipant[]): number {
    const completed = participations
      .filter(p => p.isCompleted && p.completedAt)
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime());

    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const participation of completed) {
      const completedDate = new Date(participation.completedAt!);
      
      if (!lastDate) {
        currentStreak = 1;
        lastDate = completedDate;
      } else {
        const daysDiff = Math.floor((completedDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) { // Within a week
          currentStreak++;
          lastDate = completedDate;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
          lastDate = completedDate;
        }
      }
    }

    return Math.max(longestStreak, currentStreak);
  }

  /**
   * Validate challenge data
   */
  validateChallenge(challenge: Partial<Challenge>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!challenge.title || challenge.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }

    if (!challenge.description || challenge.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (!challenge.target?.value || challenge.target.value <= 0) {
      errors.push('Target value must be greater than 0');
    }

    if (!challenge.duration?.end) {
      errors.push('End date is required');
    } else {
      const endDate = new Date(challenge.duration.end);
      const now = new Date();
      if (endDate <= now) {
        errors.push('End date must be in the future');
      }
    }

    if (!challenge.reward?.points || challenge.reward.points <= 0) {
      errors.push('Reward points must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate challenge recommendations based on workout data
   */
  generatePersonalizedChallenges(
    workoutHistory: any[], // From workout context
    userPreferences: any
  ): Partial<Challenge>[] {
    // This would analyze workout patterns and create personalized challenges
    // For now, return some example personalized challenges
    return [
      {
        title: 'Personal Best Challenge',
        description: 'Beat your current personal records in 3 different exercises',
        category: 'strength',
        difficulty: 'intermediate',
        target: { value: 3, unit: 'PRs', metric: 'personal_records' },
        reward: { points: 400, badge: 'Record Breaker' },
      },
    ];
  }
}

export const challengeEngine = new ChallengeEngine();
