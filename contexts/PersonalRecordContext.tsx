import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalRecord, ExerciseProgress, PRDetectionEngine } from '@/lib/analytics/prDetection';
import { useWorkoutHistory } from './WorkoutHistoryContext';
import { useAchievements } from './AchievementContext';

interface PersonalRecordContextType {
  personalRecords: PersonalRecord[];
  exerciseProgress: ExerciseProgress[];
  recentPRs: PersonalRecord[];
  totalPRs: number;
  isLoading: boolean;
  refreshPRs: () => Promise<void>;
  getPRsForExercise: (exerciseId: string) => PersonalRecord[];
  getExerciseProgress: (exerciseId: string) => ExerciseProgress | undefined;
  getTopExercises: (limit?: number) => ExerciseProgress[];
  getPRsByType: (type: PersonalRecord['recordType']) => PersonalRecord[];
  celebratePR: (recordId: string) => void;
  dismissPRCelebration: (recordId: string) => void;
  pendingCelebrations: PersonalRecord[];
}

const PersonalRecordContext = createContext<PersonalRecordContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PERSONAL_RECORDS: '@gymverse_personal_records',
  EXERCISE_PROGRESS: '@gymverse_exercise_progress',
  CELEBRATED_PRS: '@gymverse_celebrated_prs',
  PENDING_CELEBRATIONS: '@gymverse_pending_celebrations',
};

interface PersonalRecordProviderProps {
  children: ReactNode;
}

export function PersonalRecordProvider({ children }: PersonalRecordProviderProps) {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([]);
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [pendingCelebrations, setPendingCelebrations] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { workouts } = useWorkoutHistory();
  const { unlockAchievement } = useAchievements();

  useEffect(() => {
    loadStoredData();
  }, []);

  useEffect(() => {
    if (workouts.length > 0) {
      detectAndUpdatePRs();
    }
  }, [workouts]);

  const loadStoredData = async () => {
    try {
      setIsLoading(true);
      
      const [storedPRs, storedProgress, celebratedPRs, pendingCelebrations] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PERSONAL_RECORDS),
        AsyncStorage.getItem(STORAGE_KEYS.EXERCISE_PROGRESS),
        AsyncStorage.getItem(STORAGE_KEYS.CELEBRATED_PRS),
        AsyncStorage.getItem(STORAGE_KEYS.PENDING_CELEBRATIONS),
      ]);

      if (storedPRs) {
        const prs = JSON.parse(storedPRs);
        setPersonalRecords(prs);
        updateRecentPRs(prs);
      }

      if (storedProgress) {
        setExerciseProgress(JSON.parse(storedProgress));
      }

      if (pendingCelebrations) {
        setPendingCelebrations(JSON.parse(pendingCelebrations));
      }
    } catch (error) {
      console.error('Error loading personal records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const detectAndUpdatePRs = async () => {
    try {
      // Detect new personal records
      const detectedPRs = PRDetectionEngine.detectPersonalRecords(workouts);
      
      // Load existing PRs to compare
      const existingPRsData = await AsyncStorage.getItem(STORAGE_KEYS.PERSONAL_RECORDS);
      const existingPRs: PersonalRecord[] = existingPRsData ? JSON.parse(existingPRsData) : [];
      
      // Find new PRs
      const newPRs = detectedPRs.filter(newPR => 
        !existingPRs.some(existingPR => existingPR.id === newPR.id)
      );

      // Update personal records
      setPersonalRecords(detectedPRs);
      updateRecentPRs(detectedPRs);

      // Calculate exercise progress
      const progressData = calculateExerciseProgress(detectedPRs);
      setExerciseProgress(progressData);

      // Add new PRs to pending celebrations
      if (newPRs.length > 0) {
        const currentPending = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CELEBRATIONS);
        const existingPending: PersonalRecord[] = currentPending ? JSON.parse(currentPending) : [];
        const updatedPending = [...existingPending, ...newPRs];
        
        setPendingCelebrations(updatedPending);
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CELEBRATIONS, JSON.stringify(updatedPending));

        // Trigger achievement unlocks for PRs
        await triggerPRAchievements(newPRs, detectedPRs);
      }

      // Save to storage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PERSONAL_RECORDS, JSON.stringify(detectedPRs)),
        AsyncStorage.setItem(STORAGE_KEYS.EXERCISE_PROGRESS, JSON.stringify(progressData)),
      ]);
    } catch (error) {
      console.error('Error detecting personal records:', error);
    }
  };

  const calculateExerciseProgress = (prs: PersonalRecord[]): ExerciseProgress[] => {
    const exerciseMap = new Map<string, { name: string; muscleGroups: string[] }>();
    
    // Extract exercise info from workouts
    workouts.forEach(workout => {
      workout.exercises?.forEach((exercise: any) => {
        exerciseMap.set(exercise.id, {
          name: exercise.exercise_name,
          muscleGroups: exercise.muscle_groups || [],
        });
      });
    });

    const progressData: ExerciseProgress[] = [];

    exerciseMap.forEach((exerciseInfo, exerciseId) => {
      const sets = PRDetectionEngine['extractAllSets'](workouts)
        .filter(set => set.exerciseId === exerciseId);
      
      const exerciseRecords = prs.filter(pr => pr.exerciseId === exerciseId);
      
      const progress = PRDetectionEngine.calculateExerciseProgress(
        exerciseId,
        exerciseInfo.name,
        exerciseInfo.muscleGroups,
        sets,
        exerciseRecords
      );

      if (progress.totalSessions > 0) {
        progressData.push(progress);
      }
    });

    return progressData.sort((a, b) => b.progressScore - a.progressScore);
  };

  const updateRecentPRs = (prs: PersonalRecord[]) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recent = prs.filter(pr => new Date(pr.achievedAt) >= thirtyDaysAgo);
    setRecentPRs(recent);
  };

  const triggerPRAchievements = async (newPRs: PersonalRecord[], allPRs: PersonalRecord[]) => {
    // First PR achievement
    if (allPRs.length === 1 && newPRs.length === 1) {
      await unlockAchievement('first_pr');
    }

    // PR milestones
    const prMilestones = [5, 10, 25, 50, 100];
    for (const milestone of prMilestones) {
      if (allPRs.length >= milestone && allPRs.length - newPRs.length < milestone) {
        await unlockAchievement(`pr_milestone_${milestone}`);
      }
    }

    // Weight PR achievements
    const weightPRs = newPRs.filter(pr => pr.recordType === 'weight');
    if (weightPRs.length > 0) {
      await unlockAchievement('weight_pr');
      
      // Check for heavy lifting milestones
      const heavyPRs = weightPRs.filter(pr => pr.value >= 100); // 100kg+
      if (heavyPRs.length > 0) {
        await unlockAchievement('heavy_lifter');
      }
    }

    // Volume PR achievements
    const volumePRs = newPRs.filter(pr => pr.recordType === 'volume');
    if (volumePRs.length > 0) {
      await unlockAchievement('volume_pr');
    }

    // Multiple PRs in one workout
    const workoutPRCounts = new Map<string, number>();
    newPRs.forEach(pr => {
      const count = workoutPRCounts.get(pr.workoutId) || 0;
      workoutPRCounts.set(pr.workoutId, count + 1);
    });

    const maxPRsInWorkout = Math.max(...Array.from(workoutPRCounts.values()));
    if (maxPRsInWorkout >= 3) {
      await unlockAchievement('pr_spree');
    }
  };

  const refreshPRs = async () => {
    await detectAndUpdatePRs();
  };

  const getPRsForExercise = (exerciseId: string): PersonalRecord[] => {
    return personalRecords.filter(pr => pr.exerciseId === exerciseId);
  };

  const getExerciseProgress = (exerciseId: string): ExerciseProgress | undefined => {
    return exerciseProgress.find(progress => progress.exerciseId === exerciseId);
  };

  const getTopExercises = (limit: number = 10): ExerciseProgress[] => {
    return exerciseProgress
      .sort((a, b) => b.progressScore - a.progressScore)
      .slice(0, limit);
  };

  const getPRsByType = (type: PersonalRecord['recordType']): PersonalRecord[] => {
    return personalRecords.filter(pr => pr.recordType === type);
  };

  const celebratePR = async (recordId: string) => {
    try {
      // Remove from pending celebrations
      const updatedPending = pendingCelebrations.filter(pr => pr.id !== recordId);
      setPendingCelebrations(updatedPending);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CELEBRATIONS, JSON.stringify(updatedPending));

      // Add to celebrated PRs
      const celebratedData = await AsyncStorage.getItem(STORAGE_KEYS.CELEBRATED_PRS);
      const celebrated: string[] = celebratedData ? JSON.parse(celebratedData) : [];
      celebrated.push(recordId);
      await AsyncStorage.setItem(STORAGE_KEYS.CELEBRATED_PRS, JSON.stringify(celebrated));
    } catch (error) {
      console.error('Error celebrating PR:', error);
    }
  };

  const dismissPRCelebration = async (recordId: string) => {
    try {
      const updatedPending = pendingCelebrations.filter(pr => pr.id !== recordId);
      setPendingCelebrations(updatedPending);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CELEBRATIONS, JSON.stringify(updatedPending));
    } catch (error) {
      console.error('Error dismissing PR celebration:', error);
    }
  };

  const value: PersonalRecordContextType = {
    personalRecords,
    exerciseProgress,
    recentPRs,
    totalPRs: personalRecords.length,
    isLoading,
    refreshPRs,
    getPRsForExercise,
    getExerciseProgress,
    getTopExercises,
    getPRsByType,
    celebratePR,
    dismissPRCelebration,
    pendingCelebrations,
  };

  return (
    <PersonalRecordContext.Provider value={value}>
      {children}
    </PersonalRecordContext.Provider>
  );
}

export function usePersonalRecords() {
  const context = useContext(PersonalRecordContext);
  if (context === undefined) {
    throw new Error('usePersonalRecords must be used within a PersonalRecordProvider');
  }
  return context;
}
