import { usePersonalRecords as usePersonalRecordsContext } from '@/contexts/PersonalRecordContext';
import { PersonalRecord, ExerciseProgress } from '@/lib/analytics/prDetection';
import { useMemo } from 'react';

export interface PRStats {
  totalPRs: number;
  recentPRs: number;
  weightPRs: number;
  repPRs: number;
  volumePRs: number;
  durationPRs: number;
  averageImprovement: number;
  bestImprovement: PersonalRecord | null;
  prStreak: number;
  lastPRDate: string | null;
}

export interface ExerciseProgressStats {
  totalExercises: number;
  improvingExercises: number;
  stableExercises: number;
  decliningExercises: number;
  averageProgressScore: number;
  topPerformingExercise: ExerciseProgress | null;
  mostImprovedExercise: ExerciseProgress | null;
}

export function usePersonalRecords() {
  const context = usePersonalRecordsContext();

  const prStats = useMemo((): PRStats => {
    const { personalRecords, recentPRs } = context;

    const weightPRs = personalRecords.filter(pr => pr.recordType === 'weight').length;
    const repPRs = personalRecords.filter(pr => pr.recordType === 'reps').length;
    const volumePRs = personalRecords.filter(pr => pr.recordType === 'volume').length;
    const durationPRs = personalRecords.filter(pr => pr.recordType === 'duration').length;

    const improvements = personalRecords.map(pr => pr.improvementPercentage);
    const averageImprovement = improvements.length > 0 
      ? improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length 
      : 0;

    const bestImprovement = personalRecords.reduce((best, current) => 
      !best || current.improvementPercentage > best.improvementPercentage ? current : best
    , null as PersonalRecord | null);

    // Calculate PR streak (consecutive days with PRs)
    const prDates = personalRecords
      .map(pr => new Date(pr.achievedAt).toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort();

    let prStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    prDates.forEach(dateStr => {
      const date = new Date(dateStr);
      if (lastDate) {
        const daysDiff = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) { // Within a week
          currentStreak++;
        } else {
          prStreak = Math.max(prStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      lastDate = date;
    });
    prStreak = Math.max(prStreak, currentStreak);

    const lastPRDate = personalRecords.length > 0 
      ? personalRecords.sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())[0].achievedAt
      : null;

    return {
      totalPRs: personalRecords.length,
      recentPRs: recentPRs.length,
      weightPRs,
      repPRs,
      volumePRs,
      durationPRs,
      averageImprovement,
      bestImprovement,
      prStreak,
      lastPRDate,
    };
  }, [context.personalRecords, context.recentPRs]);

  const exerciseProgressStats = useMemo((): ExerciseProgressStats => {
    const { exerciseProgress } = context;

    const improvingExercises = exerciseProgress.filter(ep => ep.progressTrend === 'improving').length;
    const stableExercises = exerciseProgress.filter(ep => ep.progressTrend === 'stable').length;
    const decliningExercises = exerciseProgress.filter(ep => ep.progressTrend === 'declining').length;

    const averageProgressScore = exerciseProgress.length > 0
      ? exerciseProgress.reduce((sum, ep) => sum + ep.progressScore, 0) / exerciseProgress.length
      : 0;

    const topPerformingExercise = exerciseProgress.reduce((best, current) =>
      !best || current.progressScore > best.progressScore ? current : best
    , null as ExerciseProgress | null);

    // Most improved based on recent PRs
    const mostImprovedExercise = exerciseProgress.reduce((best, current) => {
      const recentPRs = current.records.filter(record => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return new Date(record.achievedAt) >= thirtyDaysAgo;
      });

      const currentRecentPRs = best ? best.records.filter(record => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return new Date(record.achievedAt) >= thirtyDaysAgo;
      }).length : 0;

      return recentPRs.length > currentRecentPRs ? current : best;
    }, null as ExerciseProgress | null);

    return {
      totalExercises: exerciseProgress.length,
      improvingExercises,
      stableExercises,
      decliningExercises,
      averageProgressScore,
      topPerformingExercise,
      mostImprovedExercise,
    };
  }, [context.exerciseProgress]);

  return {
    ...context,
    prStats,
    exerciseProgressStats,
  };
}

export function useExerciseProgress(exerciseId?: string) {
  const { getExerciseProgress, getPRsForExercise } = usePersonalRecords();

  const exerciseProgress = exerciseId ? getExerciseProgress(exerciseId) : undefined;
  const exercisePRs = exerciseId ? getPRsForExercise(exerciseId) : [];

  const progressData = useMemo(() => {
    if (!exerciseProgress) return null;

    // Generate progress chart data
    const chartData = exercisePRs
      .filter(pr => pr.recordType === 'weight' || pr.recordType === 'volume')
      .sort((a, b) => new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime())
      .map(pr => ({
        date: pr.achievedAt,
        value: pr.value,
        type: pr.recordType,
        improvement: pr.improvementPercentage,
      }));

    return {
      ...exerciseProgress,
      chartData,
      recentPRs: exercisePRs.filter(pr => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return new Date(pr.achievedAt) >= thirtyDaysAgo;
      }),
    };
  }, [exerciseProgress, exercisePRs]);

  return progressData;
}
