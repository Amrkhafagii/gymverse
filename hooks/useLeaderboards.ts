import { useState, useEffect, useCallback } from 'react';
import { localLeaderboards, LeaderboardEntry, GlobalLeaderboardEntry, LeaderboardStats } from '@/lib/challenges/localLeaderboards';
import { useChallenges } from '@/contexts/ChallengeContext';
import * as Haptics from 'expo-haptics';

export interface LeaderboardFilters {
  timeframe: 'all' | 'week' | 'month' | 'year';
  category: 'all' | 'strength' | 'cardio' | 'consistency' | 'distance' | 'time' | 'social';
  type: 'challenge' | 'global';
}

export function useLeaderboards() {
  const { challenges, userParticipations, challengeStats } = useChallenges();
  const [challengeLeaderboards, setChallengeLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([]);
  const [leaderboardStats, setLeaderboardStats] = useState<Record<string, LeaderboardStats>>({});
  const [userRankings, setUserRankings] = useState<{
    global: number | null;
    byCategory: Record<string, number | null>;
    recentChallenges: Array<{ challengeId: string; rank: number; title: string }>;
  }>({
    global: null,
    byCategory: {},
    recentChallenges: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<LeaderboardFilters>({
    timeframe: 'all',
    category: 'all',
    type: 'global',
  });

  // Load leaderboard data on mount and when challenges change
  useEffect(() => {
    loadLeaderboardData();
  }, [challenges, userParticipations]);

  const loadLeaderboardData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadChallengeLeaderboards(),
        loadGlobalLeaderboard(),
        loadUserRankings(),
      ]);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChallengeLeaderboards = async () => {
    try {
      const leaderboards: Record<string, LeaderboardEntry[]> = {};
      const stats: Record<string, LeaderboardStats> = {};

      // Load leaderboards for all user's challenges
      const userChallengeIds = userParticipations.map(p => p.challengeId);
      
      for (const challengeId of userChallengeIds) {
        const [leaderboard, challengeStats] = await Promise.all([
          localLeaderboards.getChallengeLeaderboard(challengeId),
          localLeaderboards.getChallengeLeaderboardStats(challengeId),
        ]);
        
        leaderboards[challengeId] = leaderboard;
        stats[challengeId] = challengeStats;
      }

      setChallengeLeaderboards(leaderboards);
      setLeaderboardStats(stats);
    } catch (error) {
      console.error('Error loading challenge leaderboards:', error);
    }
  };

  const loadGlobalLeaderboard = async () => {
    try {
      const leaderboard = await localLeaderboards.getGlobalLeaderboard();
      setGlobalLeaderboard(leaderboard);

      // Update user's global position if they have stats
      if (challengeStats.totalPoints > 0) {
        await localLeaderboards.updateGlobalLeaderboard('current_user', {
          totalPoints: challengeStats.totalPoints,
          completedChallenges: challengeStats.completedChallenges,
          activeChallenges: challengeStats.activeChallenges,
          favoriteCategory: challengeStats.favoriteCategory,
        });
        
        // Reload to get updated rankings
        const updatedLeaderboard = await localLeaderboards.getGlobalLeaderboard();
        setGlobalLeaderboard(updatedLeaderboard);
      }
    } catch (error) {
      console.error('Error loading global leaderboard:', error);
    }
  };

  const loadUserRankings = async () => {
    try {
      const rankings = await localLeaderboards.getUserRankings('current_user');
      setUserRankings(rankings);
    } catch (error) {
      console.error('Error loading user rankings:', error);
    }
  };

  // Update challenge leaderboard when user progress changes
  const updateChallengeProgress = useCallback(async (challengeId: string, progress: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      await localLeaderboards.updateChallengeLeaderboard(challengeId, 'current_user', progress, challenge);
      
      // Reload the specific challenge leaderboard
      const [updatedLeaderboard, updatedStats] = await Promise.all([
        localLeaderboards.getChallengeLeaderboard(challengeId),
        localLeaderboards.getChallengeLeaderboardStats(challengeId),
      ]);

      setChallengeLeaderboards(prev => ({
        ...prev,
        [challengeId]: updatedLeaderboard,
      }));

      setLeaderboardStats(prev => ({
        ...prev,
        [challengeId]: updatedStats,
      }));

      // Update global leaderboard if needed
      await loadGlobalLeaderboard();
      await loadUserRankings();
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }, [challenges]);

  // Get leaderboard for specific challenge
  const getChallengeLeaderboard = useCallback((challengeId: string): LeaderboardEntry[] => {
    return challengeLeaderboards[challengeId] || [];
  }, [challengeLeaderboards]);

  // Get leaderboard stats for specific challenge
  const getChallengeStats = useCallback((challengeId: string): LeaderboardStats | null => {
    return leaderboardStats[challengeId] || null;
  }, [leaderboardStats]);

  // Get nearby competitors for a challenge
  const getNearbyCompetitors = useCallback(async (challengeId: string, range: number = 5): Promise<LeaderboardEntry[]> => {
    try {
      return await localLeaderboards.getNearbyCompetitors(challengeId, 'current_user', range);
    } catch (error) {
      console.error('Error getting nearby competitors:', error);
      return [];
    }
  }, []);

  // Filter global leaderboard based on current filters
  const getFilteredGlobalLeaderboard = useCallback((): GlobalLeaderboardEntry[] => {
    let filtered = [...globalLeaderboard];

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(entry => entry.favoriteCategory === filters.category);
    }

    // Apply timeframe filter (simplified - in real app, would filter by activity date)
    if (filters.timeframe !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.timeframe) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      filtered = filtered.filter(entry => new Date(entry.lastActive) >= cutoffDate);
    }

    return filtered;
  }, [globalLeaderboard, filters]);

  // Get user's current position in global leaderboard
  const getUserGlobalRank = useCallback((): number | null => {
    const filtered = getFilteredGlobalLeaderboard();
    const userEntry = filtered.find(entry => entry.isCurrentUser);
    return userEntry?.rank || null;
  }, [getFilteredGlobalLeaderboard]);

  // Get leaderboard analytics
  const getLeaderboardAnalytics = useCallback(() => {
    const totalChallengeParticipants = Object.values(challengeLeaderboards)
      .reduce((sum, leaderboard) => sum + leaderboard.length, 0);

    const averageRank = Object.values(challengeLeaderboards)
      .map(leaderboard => leaderboard.find(entry => entry.isCurrentUser)?.rank)
      .filter(rank => rank !== undefined)
      .reduce((sum, rank, _, arr) => sum + (rank || 0) / arr.length, 0);

    const topRanks = Object.values(challengeLeaderboards)
      .map(leaderboard => leaderboard.find(entry => entry.isCurrentUser)?.rank)
      .filter(rank => rank !== undefined && rank <= 3).length;

    return {
      totalChallengeParticipants,
      averageRank: Math.round(averageRank),
      topRanks,
      globalRank: getUserGlobalRank(),
      activeChallengeLeaderboards: Object.keys(challengeLeaderboards).length,
      completionRate: challengeStats.successRate,
    };
  }, [challengeLeaderboards, getUserGlobalRank, challengeStats]);

  // Refresh all leaderboard data
  const refreshLeaderboards = useCallback(async () => {
    await loadLeaderboardData();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Clear leaderboard cache
  const clearLeaderboardCache = useCallback(async () => {
    try {
      await localLeaderboards.clearLeaderboardData();
      setChallengeLeaderboards({});
      setGlobalLeaderboard([]);
      setLeaderboardStats({});
      setUserRankings({
        global: null,
        byCategory: {},
        recentChallenges: [],
      });
      await loadLeaderboardData();
    } catch (error) {
      console.error('Error clearing leaderboard cache:', error);
    }
  }, []);

  return {
    // Data
    challengeLeaderboards,
    globalLeaderboard: getFilteredGlobalLeaderboard(),
    leaderboardStats,
    userRankings,
    isLoading,

    // Filters
    filters,
    setFilters,

    // Actions
    updateChallengeProgress,
    refreshLeaderboards,
    clearLeaderboardCache,

    // Queries
    getChallengeLeaderboard,
    getChallengeStats,
    getNearbyCompetitors,
    getUserGlobalRank,

    // Analytics
    analytics: getLeaderboardAnalytics(),
  };
}

export default useLeaderboards;
