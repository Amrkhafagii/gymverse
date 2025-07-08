import React, { createContext, useContext, ReactNode } from 'react';
import { useLeaderboards } from '@/hooks/useLeaderboards';
import { LeaderboardEntry, GlobalLeaderboardEntry, LeaderboardStats } from '@/lib/challenges/localLeaderboards';

interface LeaderboardContextType {
  // Data
  challengeLeaderboards: Record<string, LeaderboardEntry[]>;
  globalLeaderboard: GlobalLeaderboardEntry[];
  leaderboardStats: Record<string, LeaderboardStats>;
  userRankings: {
    global: number | null;
    byCategory: Record<string, number | null>;
    recentChallenges: Array<{ challengeId: string; rank: number; title: string }>;
  };
  isLoading: boolean;

  // Filters
  filters: {
    timeframe: 'all' | 'week' | 'month' | 'year';
    category: 'all' | 'strength' | 'cardio' | 'consistency' | 'distance' | 'time' | 'social';
    type: 'challenge' | 'global';
  };
  setFilters: (filters: any) => void;

  // Actions
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>;
  refreshLeaderboards: () => Promise<void>;
  clearLeaderboardCache: () => Promise<void>;

  // Queries
  getChallengeLeaderboard: (challengeId: string) => LeaderboardEntry[];
  getChallengeStats: (challengeId: string) => LeaderboardStats | null;
  getNearbyCompetitors: (challengeId: string, range?: number) => Promise<LeaderboardEntry[]>;
  getUserGlobalRank: () => number | null;

  // Analytics
  analytics: {
    totalChallengeParticipants: number;
    averageRank: number;
    topRanks: number;
    globalRank: number | null;
    activeChallengeLeaderboards: number;
    completionRate: number;
  };
}

const LeaderboardContext = createContext<LeaderboardContextType | undefined>(undefined);

export function LeaderboardProvider({ children }: { children: ReactNode }) {
  const leaderboardData = useLeaderboards();

  return (
    <LeaderboardContext.Provider value={leaderboardData}>
      {children}
    </LeaderboardContext.Provider>
  );
}

export function useLeaderboardContext() {
  const context = useContext(LeaderboardContext);
  if (context === undefined) {
    throw new Error('useLeaderboardContext must be used within a LeaderboardProvider');
  }
  return context;
}
