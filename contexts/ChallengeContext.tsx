import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'workout_count' | 'streak' | 'exercise_specific' | 'time_based' | 'social';
  target: number;
  progress: number;
  startDate: string;
  endDate: string;
  reward: {
    type: 'badge' | 'points' | 'title';
    value: string;
  };
  isCompleted: boolean;
  participants: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'strength' | 'cardio' | 'flexibility' | 'general';
}

export interface UserChallengeProgress {
  challengeId: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  isActive: boolean;
}

interface ChallengeContextType {
  challenges: Challenge[];
  userProgress: UserChallengeProgress[];
  activeChallenges: Challenge[];
  completedChallenges: Challenge[];
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>;
  getChallengeProgress: (challengeId: string) => UserChallengeProgress | null;
  getRecommendedChallenges: () => Challenge[];
  isLoading: boolean;
  refreshChallenges: () => Promise<void>;
}

const ChallengeContext = createContext<ChallengeContextType | undefined>(undefined);

const CHALLENGES_STORAGE_KEY = '@gymverse_challenges';
const USER_PROGRESS_STORAGE_KEY = '@gymverse_challenge_progress';

// Mock challenges data
const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: '7-Day Workout Streak',
    description: 'Complete a workout for 7 consecutive days',
    type: 'streak',
    target: 7,
    progress: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    reward: { type: 'badge', value: 'Streak Master' },
    isCompleted: false,
    participants: 1247,
    difficulty: 'medium',
    category: 'general',
  },
  {
    id: '2',
    title: 'Push-up Champion',
    description: 'Complete 1000 push-ups this month',
    type: 'exercise_specific',
    target: 1000,
    progress: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    reward: { type: 'title', value: 'Push-up Champion' },
    isCompleted: false,
    participants: 892,
    difficulty: 'hard',
    category: 'strength',
  },
  {
    id: '3',
    title: 'Cardio Crusher',
    description: 'Complete 10 cardio workouts this month',
    type: 'workout_count',
    target: 10,
    progress: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    reward: { type: 'points', value: '500' },
    isCompleted: false,
    participants: 2156,
    difficulty: 'easy',
    category: 'cardio',
  },
  {
    id: '4',
    title: 'Flexibility Focus',
    description: 'Complete 15 stretching sessions this month',
    type: 'workout_count',
    target: 15,
    progress: 0,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    reward: { type: 'badge', value: 'Flexibility Master' },
    isCompleted: false,
    participants: 743,
    difficulty: 'medium',
    category: 'flexibility',
  },
];

export function ChallengeProvider({ children }: { children: ReactNode }) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userProgress, setUserProgress] = useState<UserChallengeProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
    loadUserProgress();
  }, []);

  const loadChallenges = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHALLENGES_STORAGE_KEY);
      if (stored) {
        setChallenges(JSON.parse(stored));
      } else {
        // Initialize with mock data
        setChallenges(mockChallenges);
        await AsyncStorage.setItem(CHALLENGES_STORAGE_KEY, JSON.stringify(mockChallenges));
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
      setChallenges(mockChallenges);
    }
  };

  const loadUserProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_PROGRESS_STORAGE_KEY);
      if (stored) {
        setUserProgress(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserProgress = async (progress: UserChallengeProgress[]) => {
    try {
      await AsyncStorage.setItem(USER_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      setUserProgress(progress);
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    const existingProgress = userProgress.find(p => p.challengeId === challengeId);
    if (existingProgress) return;

    const newProgress: UserChallengeProgress = {
      challengeId,
      progress: 0,
      startedAt: new Date().toISOString(),
      isActive: true,
    };

    await saveUserProgress([...userProgress, newProgress]);
  };

  const leaveChallenge = async (challengeId: string) => {
    const updatedProgress = userProgress.map(p =>
      p.challengeId === challengeId ? { ...p, isActive: false } : p
    );
    await saveUserProgress(updatedProgress);
  };

  const updateChallengeProgress = async (challengeId: string, progress: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const updatedProgress = userProgress.map(p => {
      if (p.challengeId === challengeId) {
        const isCompleted = progress >= challenge.target;
        return {
          ...p,
          progress,
          completedAt: isCompleted && !p.completedAt ? new Date().toISOString() : p.completedAt,
        };
      }
      return p;
    });

    await saveUserProgress(updatedProgress);
  };

  const getChallengeProgress = (challengeId: string): UserChallengeProgress | null => {
    return userProgress.find(p => p.challengeId === challengeId) || null;
  };

  const getRecommendedChallenges = (): Challenge[] => {
    // Simple recommendation logic - return challenges user hasn't joined
    const joinedChallengeIds = userProgress.map(p => p.challengeId);
    return challenges.filter(c => !joinedChallengeIds.includes(c.id)).slice(0, 3);
  };

  const refreshChallenges = async () => {
    setIsLoading(true);
    await loadChallenges();
    setIsLoading(false);
  };

  const activeChallenges = challenges.filter(challenge => {
    const progress = getChallengeProgress(challenge.id);
    return progress?.isActive && !progress.completedAt;
  });

  const completedChallenges = challenges.filter(challenge => {
    const progress = getChallengeProgress(challenge.id);
    return progress?.completedAt;
  });

  return (
    <ChallengeContext.Provider
      value={{
        challenges,
        userProgress,
        activeChallenges,
        completedChallenges,
        joinChallenge,
        leaveChallenge,
        updateChallengeProgress,
        getChallengeProgress,
        getRecommendedChallenges,
        isLoading,
        refreshChallenges,
      }}
    >
      {children}
    </ChallengeContext.Provider>
  );
}

export function useChallenge() {
  const context = useContext(ChallengeContext);
  if (context === undefined) {
    throw new Error('useChallenge must be used within a ChallengeProvider');
  }
  return context;
}
