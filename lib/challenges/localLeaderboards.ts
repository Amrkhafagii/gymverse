import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChallengeParticipant, Challenge } from '@/contexts/ChallengeContext';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  rank: number;
  progress: {
    current: number;
    percentage: number;
    lastUpdated: string;
  };
  achievements: string[];
  joinedAt: string;
  completedAt?: string;
  isCurrentUser?: boolean;
}

export interface GlobalLeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  totalPoints: number;
  completedChallenges: number;
  activeChallenges: number;
  rank: number;
  level: number;
  badges: string[];
  favoriteCategory: string;
  joinedAt: string;
  lastActive: string;
  isCurrentUser?: boolean;
}

export interface LeaderboardStats {
  totalParticipants: number;
  averageScore: number;
  topScore: number;
  userRank: number | null;
  userPercentile: number | null;
  completionRate: number;
  averageCompletionTime: number; // in days
}

export class LocalLeaderboards {
  private readonly STORAGE_KEYS = {
    CHALLENGE_LEADERBOARDS: 'challenge_leaderboards',
    GLOBAL_LEADERBOARD: 'global_leaderboard',
    LEADERBOARD_CACHE: 'leaderboard_cache',
    USER_RANKINGS: 'user_rankings',
  };

  /**
   * Get leaderboard for a specific challenge
   */
  async getChallengeLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.CHALLENGE_LEADERBOARDS);
      const allLeaderboards = stored ? JSON.parse(stored) : {};
      
      let challengeLeaderboard = allLeaderboards[challengeId];
      
      if (!challengeLeaderboard) {
        // Generate mock leaderboard data for demonstration
        challengeLeaderboard = this.generateMockChallengeLeaderboard(challengeId);
        allLeaderboards[challengeId] = challengeLeaderboard;
        await AsyncStorage.setItem(this.STORAGE_KEYS.CHALLENGE_LEADERBOARDS, JSON.stringify(allLeaderboards));
      }

      // Sort by score and assign ranks
      const sortedLeaderboard = challengeLeaderboard
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score)
        .map((entry: LeaderboardEntry, index: number) => ({
          ...entry,
          rank: index + 1,
        }));

      return sortedLeaderboard;
    } catch (error) {
      console.error('Error getting challenge leaderboard:', error);
      return [];
    }
  }

  /**
   * Update user's position in challenge leaderboard
   */
  async updateChallengeLeaderboard(
    challengeId: string,
    userId: string,
    progress: number,
    challenge: Challenge
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.CHALLENGE_LEADERBOARDS);
      const allLeaderboards = stored ? JSON.parse(stored) : {};
      
      if (!allLeaderboards[challengeId]) {
        allLeaderboards[challengeId] = this.generateMockChallengeLeaderboard(challengeId);
      }

      const leaderboard = allLeaderboards[challengeId];
      const userEntryIndex = leaderboard.findIndex((entry: LeaderboardEntry) => entry.userId === userId);

      const score = this.calculateChallengeScore(progress, challenge);
      const percentage = Math.min((progress / challenge.target.value) * 100, 100);

      const userEntry: LeaderboardEntry = {
        id: `${challengeId}_${userId}`,
        userId,
        username: 'You', // In real app, get from user context
        score,
        rank: 0, // Will be calculated when sorting
        progress: {
          current: progress,
          percentage,
          lastUpdated: new Date().toISOString(),
        },
        achievements: [], // Could be populated from achievement context
        joinedAt: new Date().toISOString(),
        completedAt: percentage >= 100 ? new Date().toISOString() : undefined,
        isCurrentUser: true,
      };

      if (userEntryIndex >= 0) {
        leaderboard[userEntryIndex] = userEntry;
      } else {
        leaderboard.push(userEntry);
      }

      allLeaderboards[challengeId] = leaderboard;
      await AsyncStorage.setItem(this.STORAGE_KEYS.CHALLENGE_LEADERBOARDS, JSON.stringify(allLeaderboards));
    } catch (error) {
      console.error('Error updating challenge leaderboard:', error);
    }
  }

  /**
   * Get global leaderboard across all challenges
   */
  async getGlobalLeaderboard(): Promise<GlobalLeaderboardEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.GLOBAL_LEADERBOARD);
      
      let globalLeaderboard = stored ? JSON.parse(stored) : null;
      
      if (!globalLeaderboard) {
        // Generate mock global leaderboard
        globalLeaderboard = this.generateMockGlobalLeaderboard();
        await AsyncStorage.setItem(this.STORAGE_KEYS.GLOBAL_LEADERBOARD, JSON.stringify(globalLeaderboard));
      }

      // Sort by total points and assign ranks
      const sortedLeaderboard = globalLeaderboard
        .sort((a: GlobalLeaderboardEntry, b: GlobalLeaderboardEntry) => b.totalPoints - a.totalPoints)
        .map((entry: GlobalLeaderboardEntry, index: number) => ({
          ...entry,
          rank: index + 1,
        }));

      return sortedLeaderboard;
    } catch (error) {
      console.error('Error getting global leaderboard:', error);
      return [];
    }
  }

  /**
   * Update user's global leaderboard position
   */
  async updateGlobalLeaderboard(
    userId: string,
    stats: {
      totalPoints: number;
      completedChallenges: number;
      activeChallenges: number;
      favoriteCategory: string;
    }
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.GLOBAL_LEADERBOARD);
      let globalLeaderboard = stored ? JSON.parse(stored) : this.generateMockGlobalLeaderboard();

      const userEntryIndex = globalLeaderboard.findIndex((entry: GlobalLeaderboardEntry) => entry.userId === userId);
      const level = Math.floor(stats.totalPoints / 100) + 1;

      const userEntry: GlobalLeaderboardEntry = {
        id: `global_${userId}`,
        userId,
        username: 'You',
        totalPoints: stats.totalPoints,
        completedChallenges: stats.completedChallenges,
        activeChallenges: stats.activeChallenges,
        rank: 0, // Will be calculated when sorting
        level,
        badges: [], // Could be populated from achievement context
        favoriteCategory: stats.favoriteCategory,
        joinedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isCurrentUser: true,
      };

      if (userEntryIndex >= 0) {
        globalLeaderboard[userEntryIndex] = userEntry;
      } else {
        globalLeaderboard.push(userEntry);
      }

      await AsyncStorage.setItem(this.STORAGE_KEYS.GLOBAL_LEADERBOARD, JSON.stringify(globalLeaderboard));
    } catch (error) {
      console.error('Error updating global leaderboard:', error);
    }
  }

  /**
   * Get leaderboard statistics for a challenge
   */
  async getChallengeLeaderboardStats(challengeId: string): Promise<LeaderboardStats> {
    try {
      const leaderboard = await this.getChallengeLeaderboard(challengeId);
      
      if (leaderboard.length === 0) {
        return {
          totalParticipants: 0,
          averageScore: 0,
          topScore: 0,
          userRank: null,
          userPercentile: null,
          completionRate: 0,
          averageCompletionTime: 0,
        };
      }

      const totalParticipants = leaderboard.length;
      const scores = leaderboard.map(entry => entry.score);
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalParticipants;
      const topScore = Math.max(...scores);
      
      const userEntry = leaderboard.find(entry => entry.isCurrentUser);
      const userRank = userEntry?.rank || null;
      const userPercentile = userRank ? ((totalParticipants - userRank + 1) / totalParticipants) * 100 : null;
      
      const completedEntries = leaderboard.filter(entry => entry.completedAt);
      const completionRate = (completedEntries.length / totalParticipants) * 100;
      
      // Calculate average completion time (simplified)
      const completionTimes = completedEntries
        .filter(entry => entry.completedAt)
        .map(entry => {
          const joined = new Date(entry.joinedAt);
          const completed = new Date(entry.completedAt!);
          return Math.floor((completed.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
        });
      
      const averageCompletionTime = completionTimes.length > 0
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
        : 0;

      return {
        totalParticipants,
        averageScore,
        topScore,
        userRank,
        userPercentile,
        completionRate,
        averageCompletionTime,
      };
    } catch (error) {
      console.error('Error getting challenge leaderboard stats:', error);
      return {
        totalParticipants: 0,
        averageScore: 0,
        topScore: 0,
        userRank: null,
        userPercentile: null,
        completionRate: 0,
        averageCompletionTime: 0,
      };
    }
  }

  /**
   * Get user's ranking across different categories
   */
  async getUserRankings(userId: string): Promise<{
    global: number | null;
    byCategory: Record<string, number | null>;
    recentChallenges: Array<{ challengeId: string; rank: number; title: string }>;
  }> {
    try {
      const globalLeaderboard = await this.getGlobalLeaderboard();
      const globalRank = globalLeaderboard.find(entry => entry.userId === userId)?.rank || null;

      // For category rankings, we'd need to implement category-specific leaderboards
      // For now, return mock data
      const byCategory = {
        strength: Math.floor(Math.random() * 100) + 1,
        cardio: Math.floor(Math.random() * 100) + 1,
        consistency: Math.floor(Math.random() * 100) + 1,
        distance: Math.floor(Math.random() * 100) + 1,
        time: Math.floor(Math.random() * 100) + 1,
        social: Math.floor(Math.random() * 100) + 1,
      };

      const recentChallenges = [
        { challengeId: 'welcome_challenge', rank: 15, title: 'Welcome to GymVerse' },
        { challengeId: 'strength_builder', rank: 8, title: 'Strength Builder Challenge' },
        { challengeId: 'consistency_champion', rank: 3, title: 'Consistency Champion' },
      ];

      return {
        global: globalRank,
        byCategory,
        recentChallenges,
      };
    } catch (error) {
      console.error('Error getting user rankings:', error);
      return {
        global: null,
        byCategory: {},
        recentChallenges: [],
      };
    }
  }

  /**
   * Get nearby competitors (users with similar scores)
   */
  async getNearbyCompetitors(challengeId: string, userId: string, range: number = 5): Promise<LeaderboardEntry[]> {
    try {
      const leaderboard = await this.getChallengeLeaderboard(challengeId);
      const userEntry = leaderboard.find(entry => entry.userId === userId);
      
      if (!userEntry) return [];

      const userRank = userEntry.rank;
      const startRank = Math.max(1, userRank - range);
      const endRank = Math.min(leaderboard.length, userRank + range);

      return leaderboard.slice(startRank - 1, endRank);
    } catch (error) {
      console.error('Error getting nearby competitors:', error);
      return [];
    }
  }

  /**
   * Calculate score for a challenge based on progress and challenge type
   */
  private calculateChallengeScore(progress: number, challenge: Challenge): number {
    let baseScore = progress;

    // Apply multipliers based on challenge difficulty
    switch (challenge.difficulty) {
      case 'beginner':
        baseScore *= 1;
        break;
      case 'intermediate':
        baseScore *= 1.5;
        break;
      case 'advanced':
        baseScore *= 2;
        break;
    }

    // Apply bonus for completion
    const percentage = (progress / challenge.target.value) * 100;
    if (percentage >= 100) {
      baseScore *= 1.2; // 20% completion bonus
    }

    // Apply time bonus (earlier completion gets higher score)
    const daysRemaining = challenge.duration.daysLeft;
    const totalDuration = Math.ceil(
      (new Date(challenge.duration.end).getTime() - new Date(challenge.duration.start).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    
    if (daysRemaining > 0) {
      const timeBonus = (daysRemaining / totalDuration) * 0.1; // Up to 10% time bonus
      baseScore *= (1 + timeBonus);
    }

    return Math.round(baseScore);
  }

  /**
   * Generate mock challenge leaderboard data
   */
  private generateMockChallengeLeaderboard(challengeId: string): LeaderboardEntry[] {
    const mockUsers = [
      { username: 'FitnessKing', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'GymWarrior', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'IronLifter', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'StrengthMaster', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'CardioQueen', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'FlexibilityPro', avatar: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'WorkoutBeast', avatar: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'FitnessFanatic', avatar: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=100' },
    ];

    return mockUsers.map((user, index) => {
      const progress = Math.floor(Math.random() * 100) + 20;
      const joinedDaysAgo = Math.floor(Math.random() * 10) + 1;
      const isCompleted = progress >= 100;

      return {
        id: `${challengeId}_user_${index}`,
        userId: `user_${index}`,
        username: user.username,
        avatar: user.avatar,
        score: Math.floor(Math.random() * 1000) + 100,
        rank: index + 1,
        progress: {
          current: progress,
          percentage: Math.min(progress, 100),
          lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        },
        achievements: ['First Challenge', 'Consistency Master'].slice(0, Math.floor(Math.random() * 3)),
        joinedAt: new Date(Date.now() - joinedDaysAgo * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: isCompleted ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined,
        isCurrentUser: false,
      };
    });
  }

  /**
   * Generate mock global leaderboard data
   */
  private generateMockGlobalLeaderboard(): GlobalLeaderboardEntry[] {
    const mockUsers = [
      { username: 'FitnessLegend', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'GymChampion', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'IronMaster', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'StrengthGuru', avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'CardioKing', avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'FlexibilityExpert', avatar: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'WorkoutPro', avatar: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=100' },
      { username: 'FitnessElite', avatar: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=100' },
    ];

    const categories = ['strength', 'cardio', 'consistency', 'distance', 'time', 'social'];

    return mockUsers.map((user, index) => {
      const totalPoints = Math.floor(Math.random() * 5000) + 1000;
      const completedChallenges = Math.floor(Math.random() * 20) + 5;
      const activeChallenges = Math.floor(Math.random() * 5) + 1;
      const level = Math.floor(totalPoints / 100) + 1;

      return {
        id: `global_user_${index}`,
        userId: `user_${index}`,
        username: user.username,
        avatar: user.avatar,
        totalPoints,
        completedChallenges,
        activeChallenges,
        rank: index + 1,
        level,
        badges: ['Champion', 'Consistent', 'Strong'].slice(0, Math.floor(Math.random() * 4)),
        favoriteCategory: categories[Math.floor(Math.random() * categories.length)],
        joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        isCurrentUser: false,
      };
    });
  }

  /**
   * Clear all leaderboard data (useful for testing)
   */
  async clearLeaderboardData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.STORAGE_KEYS.CHALLENGE_LEADERBOARDS),
        AsyncStorage.removeItem(this.STORAGE_KEYS.GLOBAL_LEADERBOARD),
        AsyncStorage.removeItem(this.STORAGE_KEYS.LEADERBOARD_CACHE),
        AsyncStorage.removeItem(this.STORAGE_KEYS.USER_RANKINGS),
      ]);
    } catch (error) {
      console.error('Error clearing leaderboard data:', error);
    }
  }

  /**
   * Export leaderboard data for sync with backend
   */
  async exportLeaderboardData(): Promise<{
    challengeLeaderboards: any;
    globalLeaderboard: any;
    userRankings: any;
  }> {
    try {
      const [challengeLeaderboards, globalLeaderboard, userRankings] = await Promise.all([
        AsyncStorage.getItem(this.STORAGE_KEYS.CHALLENGE_LEADERBOARDS),
        AsyncStorage.getItem(this.STORAGE_KEYS.GLOBAL_LEADERBOARD),
        AsyncStorage.getItem(this.STORAGE_KEYS.USER_RANKINGS),
      ]);

      return {
        challengeLeaderboards: challengeLeaderboards ? JSON.parse(challengeLeaderboards) : {},
        globalLeaderboard: globalLeaderboard ? JSON.parse(globalLeaderboard) : [],
        userRankings: userRankings ? JSON.parse(userRankings) : {},
      };
    } catch (error) {
      console.error('Error exporting leaderboard data:', error);
      return {
        challengeLeaderboards: {},
        globalLeaderboard: [],
        userRankings: {},
      };
    }
  }
}

export const localLeaderboards = new LocalLeaderboards();
