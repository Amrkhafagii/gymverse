import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { challengeEngine } from '@/lib/challenges/challengeEngine';
import { localLeaderboards } from '@/lib/challenges/localLeaderboards';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'community';
  category: 'strength' | 'cardio' | 'consistency' | 'distance' | 'time' | 'social';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: {
    start: string;
    end: string;
    daysLeft: number;
  };
  target: {
    value: number;
    unit: string;
    metric: string; // 'workouts', 'minutes', 'distance', 'weight', 'reps', 'sets'
  };
  reward: {
    points: number;
    badge?: string;
    title?: string;
    xp?: number;
  };
  participants: number;
  maxParticipants?: number;
  isJoined: boolean;
  isCompleted: boolean;
  isFeatured: boolean;
  progress?: {
    current: number;
    percentage: number;
    lastUpdated: string;
  };
  image?: string;
  color: string;
  createdBy?: string;
  tags: string[];
  requirements?: {
    minLevel?: number;
    completedChallenges?: string[];
    achievements?: string[];
  };
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: string;
  progress: {
    current: number;
    percentage: number;
    lastUpdated: string;
    milestones: Array<{
      value: number;
      achievedAt: string;
    }>;
  };
  rank?: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface ChallengeStats {
  totalChallenges: number;
  activeChallenges: number;
  completedChallenges: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  favoriteCategory: string;
  successRate: number;
  averageCompletion: number;
}

interface ChallengeContextType {
  // State
  challenges: Challenge[];
  userParticipations: ChallengeParticipant[];
  challengeStats: ChallengeStats;
  isLoading: boolean;
  
  // Challenge Management
  loadChallenges: () => Promise<void>;
  createChallenge: (challenge: Omit<Challenge, 'id' | 'participants' | 'isJoined' | 'isCompleted'>) => Promise<string>;
  joinChallenge: (challengeId: string) => Promise<boolean>;
  leaveChallenge: (challengeId: string) => Promise<boolean>;
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
  
  // Data Queries
  getChallenge: (challengeId: string) => Challenge | null;
  getUserChallenges: (status?: 'active' | 'completed' | 'all') => Challenge[];
  getChallengesByCategory: (category: Challenge['category']) => Challenge[];
  getFeaturedChallenges: () => Challenge[];
  getSuggestedChallenges: () => Challenge[];
  
  // Progress & Analytics
  getChallengeProgress: (challengeId: string) => ChallengeParticipant | null;
  calculateChallengeStats: () => Promise<ChallengeStats>;
  getChallengeLeaderboard: (challengeId: string) => Promise<ChallengeParticipant[]>;
  
  // Utilities
  refreshChallenges: () => Promise<void>;
  syncChallengeData: () => Promise<void>;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CHALLENGES: 'challenges_data',
  PARTICIPATIONS: 'challenge_participations',
  STATS: 'challenge_stats',
  LAST_SYNC: 'challenges_last_sync',
};

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userParticipations, setUserParticipations] = useState<ChallengeParticipant[]>([]);
  const [challengeStats, setChallengeStats] = useState<ChallengeStats>({
    totalChallenges: 0,
    activeChallenges: 0,
    completedChallenges: 0,
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    favoriteCategory: 'strength',
    successRate: 0,
    averageCompletion: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize challenges on mount
  useEffect(() => {
    initializeChallenges();
  }, []);

  const initializeChallenges = async () => {
    try {
      setIsLoading(true);
      await loadChallenges();
      await loadUserParticipations();
      await calculateChallengeStats();
    } catch (error) {
      console.error('Error initializing challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChallenges = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHALLENGES);
      if (stored) {
        const parsedChallenges = JSON.parse(stored);
        // Update days left for all challenges
        const updatedChallenges = parsedChallenges.map((challenge: Challenge) => ({
          ...challenge,
          duration: {
            ...challenge.duration,
            daysLeft: challengeEngine.calculateDaysLeft(challenge.duration.end),
          },
        }));
        setChallenges(updatedChallenges);
      } else {
        // Initialize with default challenges
        const defaultChallenges = challengeEngine.generateDefaultChallenges();
        setChallenges(defaultChallenges);
        await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(defaultChallenges));
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const loadUserParticipations = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PARTICIPATIONS);
      if (stored) {
        setUserParticipations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user participations:', error);
    }
  };

  const createChallenge = async (challengeData: Omit<Challenge, 'id' | 'participants' | 'isJoined' | 'isCompleted'>): Promise<string> => {
    try {
      const newChallenge: Challenge = {
        ...challengeData,
        id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        participants: 1, // Creator is first participant
        isJoined: true,
        isCompleted: false,
      };

      const updatedChallenges = [...challenges, newChallenge];
      setChallenges(updatedChallenges);
      await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updatedChallenges));

      // Auto-join the creator
      await joinChallenge(newChallenge.id);

      return newChallenge.id;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  };

  const joinChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return false;

      // Check if already joined
      const existingParticipation = userParticipations.find(p => p.challengeId === challengeId);
      if (existingParticipation) return false;

      // Check max participants
      if (challenge.maxParticipants && challenge.participants >= challenge.maxParticipants) {
        return false;
      }

      // Create participation record
      const participation: ChallengeParticipant = {
        id: `participation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current_user', // In real app, get from auth context
        challengeId,
        joinedAt: new Date().toISOString(),
        progress: {
          current: 0,
          percentage: 0,
          lastUpdated: new Date().toISOString(),
          milestones: [],
        },
        isCompleted: false,
      };

      // Update challenge
      const updatedChallenges = challenges.map(c => 
        c.id === challengeId 
          ? { ...c, participants: c.participants + 1, isJoined: true }
          : c
      );

      // Update participations
      const updatedParticipations = [...userParticipations, participation];

      setChallenges(updatedChallenges);
      setUserParticipations(updatedParticipations);

      await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updatedChallenges));
      await AsyncStorage.setItem(STORAGE_KEYS.PARTICIPATIONS, JSON.stringify(updatedParticipations));

      return true;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
  };

  const leaveChallenge = async (challengeId: string): Promise<boolean> => {
    try {
      const participation = userParticipations.find(p => p.challengeId === challengeId);
      if (!participation) return false;

      // Update challenge
      const updatedChallenges = challenges.map(c => 
        c.id === challengeId 
          ? { ...c, participants: Math.max(0, c.participants - 1), isJoined: false }
          : c
      );

      // Remove participation
      const updatedParticipations = userParticipations.filter(p => p.challengeId !== challengeId);

      setChallenges(updatedChallenges);
      setUserParticipations(updatedParticipations);

      await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updatedChallenges));
      await AsyncStorage.setItem(STORAGE_KEYS.PARTICIPATIONS, JSON.stringify(updatedParticipations));

      return true;
    } catch (error) {
      console.error('Error leaving challenge:', error);
      return false;
    }
  };

  const updateChallengeProgress = async (challengeId: string, progress: number) => {
    try {
      const participation = userParticipations.find(p => p.challengeId === challengeId);
      if (!participation) return;

      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const percentage = Math.min((progress / challenge.target.value) * 100, 100);
      const isCompleted = percentage >= 100;

      const updatedParticipation: ChallengeParticipant = {
        ...participation,
        progress: {
          ...participation.progress,
          current: progress,
          percentage,
          lastUpdated: new Date().toISOString(),
          milestones: challengeEngine.calculateMilestones(participation.progress.milestones, progress, challenge.target.value),
        },
        isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : participation.completedAt,
      };

      const updatedParticipations = userParticipations.map(p => 
        p.challengeId === challengeId ? updatedParticipation : p
      );

      // Update challenge progress
      const updatedChallenges = challenges.map(c => 
        c.id === challengeId 
          ? { 
              ...c, 
              progress: {
                current: progress,
                percentage,
                lastUpdated: new Date().toISOString(),
              },
              isCompleted,
            }
          : c
      );

      setUserParticipations(updatedParticipations);
      setChallenges(updatedChallenges);

      await AsyncStorage.setItem(STORAGE_KEYS.PARTICIPATIONS, JSON.stringify(updatedParticipations));
      await AsyncStorage.setItem(STORAGE_KEYS.CHALLENGES, JSON.stringify(updatedChallenges));

      // Auto-complete if target reached
      if (isCompleted) {
        await completeChallenge(challengeId);
      }
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  };

  const completeChallenge = async (challengeId: string) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      const participation = userParticipations.find(p => p.challengeId === challengeId);
      
      if (!challenge || !participation) return;

      // Award points and rewards
      const currentStats = await calculateChallengeStats();
      const updatedStats: ChallengeStats = {
        ...currentStats,
        completedChallenges: currentStats.completedChallenges + 1,
        totalPoints: currentStats.totalPoints + challenge.reward.points,
      };

      setChallengeStats(updatedStats);
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));

      // Trigger achievement check (if achievement system is available)
      // achievementEngine.checkChallengeAchievements(challenge, participation);
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  const getChallenge = (challengeId: string): Challenge | null => {
    return challenges.find(c => c.id === challengeId) || null;
  };

  const getUserChallenges = (status: 'active' | 'completed' | 'all' = 'all'): Challenge[] => {
    const userChallengeIds = userParticipations.map(p => p.challengeId);
    const userChallenges = challenges.filter(c => userChallengeIds.includes(c.id));

    switch (status) {
      case 'active':
        return userChallenges.filter(c => !c.isCompleted && c.duration.daysLeft > 0);
      case 'completed':
        return userChallenges.filter(c => c.isCompleted);
      default:
        return userChallenges;
    }
  };

  const getChallengesByCategory = (category: Challenge['category']): Challenge[] => {
    return challenges.filter(c => c.category === category);
  };

  const getFeaturedChallenges = (): Challenge[] => {
    return challenges.filter(c => c.isFeatured).slice(0, 5);
  };

  const getSuggestedChallenges = (): Challenge[] => {
    return challengeEngine.getSuggestedChallenges(challenges, userParticipations);
  };

  const getChallengeProgress = (challengeId: string): ChallengeParticipant | null => {
    return userParticipations.find(p => p.challengeId === challengeId) || null;
  };

  const calculateChallengeStats = async (): Promise<ChallengeStats> => {
    try {
      const stats = challengeEngine.calculateUserStats(challenges, userParticipations);
      setChallengeStats(stats);
      await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Error calculating challenge stats:', error);
      return challengeStats;
    }
  };

  const getChallengeLeaderboard = async (challengeId: string): Promise<ChallengeParticipant[]> => {
    try {
      return await localLeaderboards.getChallengeLeaderboard(challengeId);
    } catch (error) {
      console.error('Error getting challenge leaderboard:', error);
      return [];
    }
  };

  const refreshChallenges = async () => {
    await loadChallenges();
    await loadUserParticipations();
    await calculateChallengeStats();
  };

  const syncChallengeData = async () => {
    try {
      // Update last sync timestamp
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      
      // In real app, sync with backend here
      console.log('Challenge data synced');
    } catch (error) {
      console.error('Error syncing challenge data:', error);
    }
  };

  const value: ChallengeContextType = {
    // State
    challenges,
    userParticipations,
    challengeStats,
    isLoading,
    
    // Challenge Management
    loadChallenges,
    createChallenge,
    joinChallenge,
    leaveChallenge,
    updateChallengeProgress,
    completeChallenge,
    
    // Data Queries
    getChallenge,
    getUserChallenges,
    getChallengesByCategory,
    getFeaturedChallenges,
    getSuggestedChallenges,
    
    // Progress & Analytics
    getChallengeProgress,
    calculateChallengeStats,
    getChallengeLeaderboard,
    
    // Utilities
    refreshChallenges,
    syncChallengeData,
  };

  return (
    <ChallengeContext.Provider value={value}>
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallenges() {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenges must be used within a ChallengeProvider');
  }
  return context;
}
