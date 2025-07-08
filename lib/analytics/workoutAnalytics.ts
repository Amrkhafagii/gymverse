import { WorkoutSession } from '@/contexts/WorkoutSessionContext';

export interface WorkoutMetrics {
  totalDuration: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  averageRestTime: number;
  caloriesBurned: number;
  intensityScore: number;
}

export interface ExerciseMetrics {
  name: string;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  maxWeight: number;
  averageWeight: number;
  progressTrend: 'up' | 'down' | 'stable';
  lastPerformed: string;
  personalRecords: PersonalRecord[];
}

export interface PersonalRecord {
  type: 'weight' | 'reps' | 'volume' | 'duration';
  value: number;
  date: string;
  previousBest?: number;
  improvement?: number;
}

export interface ProgressTrend {
  date: string;
  value: number;
  type: 'weight' | 'volume' | 'duration' | 'frequency';
  label?: string;
}

export interface WorkoutAnalytics {
  totalWorkouts: number;
  totalDuration: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  averageWorkoutDuration: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  favoriteExercises: { name: string; count: number }[];
  recentPRs: PersonalRecord[];
  weeklyTrends: ProgressTrend[];
  monthlyTrends: ProgressTrend[];
  exerciseProgress: { [exerciseName: string]: ExerciseMetrics };
}

export class WorkoutAnalyticsEngine {
  static calculateWorkoutMetrics(workout: WorkoutSession): WorkoutMetrics {
    const completedSets = workout.exercises.flatMap(exercise => 
      exercise.sets.filter(set => set.is_completed)
    );

    const totalVolume = completedSets.reduce((sum, set) => 
      sum + ((set.actual_weight_kg || 0) * (set.actual_reps || 0)), 0
    );

    const totalReps = completedSets.reduce((sum, set) => 
      sum + (set.actual_reps || 0), 0
    );

    const averageRestTime = completedSets.reduce((sum, set) => 
      sum + (set.rest_duration_seconds || 0), 0
    ) / completedSets.length || 0;

    // Estimate calories burned (rough calculation based on duration and intensity)
    const durationMinutes = workout.total_duration_seconds / 60;
    const intensityFactor = this.calculateIntensityFactor(workout);
    const caloriesBurned = Math.round(durationMinutes * 8 * intensityFactor);

    const intensityScore = this.calculateIntensityScore(workout);

    return {
      totalDuration: workout.total_duration_seconds,
      totalVolume,
      totalSets: completedSets.length,
      totalReps,
      averageRestTime,
      caloriesBurned,
      intensityScore,
    };
  }

  static calculateExerciseMetrics(workouts: WorkoutSession[], exerciseName: string): ExerciseMetrics {
    const exerciseData = workouts.flatMap(workout => 
      workout.exercises
        .filter(exercise => exercise.exercise_name.toLowerCase().includes(exerciseName.toLowerCase()))
        .map(exercise => ({
          ...exercise,
          workoutDate: workout.completed_at || workout.started_at,
        }))
    );

    if (exerciseData.length === 0) {
      return {
        name: exerciseName,
        totalSets: 0,
        totalReps: 0,
        totalVolume: 0,
        maxWeight: 0,
        averageWeight: 0,
        progressTrend: 'stable',
        lastPerformed: '',
        personalRecords: [],
      };
    }

    const allSets = exerciseData.flatMap(exercise => 
      exercise.sets.filter(set => set.is_completed)
    );

    const weights = allSets.map(set => set.actual_weight_kg || 0).filter(w => w > 0);
    const totalVolume = allSets.reduce((sum, set) => 
      sum + ((set.actual_weight_kg || 0) * (set.actual_reps || 0)), 0
    );

    const maxWeight = Math.max(...weights, 0);
    const averageWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;

    // Calculate progress trend
    const progressTrend = this.calculateProgressTrend(exerciseData);

    // Find last performed date
    const lastPerformed = exerciseData
      .map(exercise => exercise.workoutDate)
      .filter(date => date)
      .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0] || '';

    // Calculate personal records
    const personalRecords = this.detectPersonalRecords(exerciseData);

    return {
      name: exerciseName,
      totalSets: allSets.length,
      totalReps: allSets.reduce((sum, set) => sum + (set.actual_reps || 0), 0),
      totalVolume,
      maxWeight,
      averageWeight,
      progressTrend,
      lastPerformed,
      personalRecords,
    };
  }

  static generateWorkoutAnalytics(workouts: WorkoutSession[]): WorkoutAnalytics {
    const completedWorkouts = workouts.filter(w => w.completed_at);
    
    // Basic stats
    const totalWorkouts = completedWorkouts.length;
    const totalDuration = completedWorkouts.reduce((sum, w) => sum + w.total_duration_seconds, 0);
    const totalVolume = this.calculateTotalVolume(completedWorkouts);
    const totalSets = this.calculateTotalSets(completedWorkouts);
    const totalReps = this.calculateTotalReps(completedWorkouts);
    const averageWorkoutDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

    // Time-based stats
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setMonth(monthStart.getMonth() - 1);

    const workoutsThisWeek = completedWorkouts.filter(w => 
      new Date(w.completed_at!) >= weekStart
    ).length;

    const workoutsThisMonth = completedWorkouts.filter(w => 
      new Date(w.completed_at!) >= monthStart
    ).length;

    // Streak calculation
    const { currentStreak, longestStreak } = this.calculateStreaks(completedWorkouts);

    // Favorite exercises
    const favoriteExercises = this.calculateFavoriteExercises(completedWorkouts);

    // Recent PRs
    const recentPRs = this.calculateRecentPRs(completedWorkouts);

    // Trends
    const weeklyTrends = this.generateProgressTrends(completedWorkouts, 'week', 'duration');
    const monthlyTrends = this.generateProgressTrends(completedWorkouts, 'month', 'duration');

    // Exercise progress
    const exerciseProgress = this.generateExerciseProgress(completedWorkouts);

    return {
      totalWorkouts,
      totalDuration,
      totalVolume,
      totalSets,
      totalReps,
      averageWorkoutDuration,
      workoutsThisWeek,
      workoutsThisMonth,
      currentStreak,
      longestStreak,
      favoriteExercises,
      recentPRs,
      weeklyTrends,
      monthlyTrends,
      exerciseProgress,
    };
  }

  static generateProgressTrends(
    workouts: WorkoutSession[],
    timeframe: 'week' | 'month' | 'year',
    type: 'weight' | 'volume' | 'duration' | 'frequency'
  ): ProgressTrend[] {
    const now = new Date();
    const trends: ProgressTrend[] = [];

    let periods: { start: Date; end: Date; label: string }[] = [];

    if (timeframe === 'week') {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        periods.push({ 
          start, 
          end, 
          label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
    } else if (timeframe === 'month') {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        periods.push({ 
          start, 
          end, 
          label: start.toLocaleDateString('en-US', { month: 'short' })
        });
      }
    } else {
      for (let i = 4; i >= 0; i--) {
        const start = new Date(now.getFullYear() - i, 0, 1);
        const end = new Date(now.getFullYear() - i, 11, 31);
        periods.push({ 
          start, 
          end, 
          label: start.getFullYear().toString()
        });
      }
    }

    periods.forEach(period => {
      const periodWorkouts = workouts.filter(workout => {
        if (!workout.completed_at) return false;
        const workoutDate = new Date(workout.completed_at);
        return workoutDate >= period.start && workoutDate <= period.end;
      });

      let value = 0;

      switch (type) {
        case 'duration':
          value = periodWorkouts.reduce((sum, w) => sum + w.total_duration_seconds, 0) / 60; // minutes
          break;
        case 'volume':
          value = this.calculateTotalVolume(periodWorkouts);
          break;
        case 'frequency':
          value = periodWorkouts.length;
          break;
        case 'weight':
          const allSets = periodWorkouts.flatMap(w => 
            w.exercises.flatMap(e => e.sets.filter(s => s.is_completed))
          );
          const weights = allSets.map(s => s.actual_weight_kg || 0).filter(w => w > 0);
          value = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 0;
          break;
      }

      trends.push({
        date: period.start.toISOString(),
        value,
        type,
        label: period.label,
      });
    });

    return trends;
  }

  static exportWorkoutData(workouts: WorkoutSession[], format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV(workouts);
    }
    
    return JSON.stringify(workouts, null, 2);
  }

  private static calculateIntensityFactor(workout: WorkoutSession): number {
    const completedSets = workout.exercises.flatMap(exercise => 
      exercise.sets.filter(set => set.is_completed)
    );

    if (completedSets.length === 0) return 1;

    const totalVolume = completedSets.reduce((sum, set) => 
      sum + ((set.actual_weight_kg || 0) * (set.actual_reps || 0)), 0
    );

    const durationMinutes = workout.total_duration_seconds / 60;
    const volumePerMinute = totalVolume / durationMinutes;

    // Normalize intensity factor between 0.5 and 2.0
    return Math.max(0.5, Math.min(2.0, volumePerMinute / 50));
  }

  private static calculateIntensityScore(workout: WorkoutSession): number {
    const completedSets = workout.exercises.flatMap(exercise => 
      exercise.sets.filter(set => set.is_completed)
    );

    if (completedSets.length === 0) return 0;

    const durationFactor = Math.min(workout.total_duration_seconds / 3600, 1); // Max 1 hour
    const volumeFactor = Math.min(this.calculateTotalVolume([workout]) / 10000, 1); // Max 10k volume
    const setsFactor = Math.min(completedSets.length / 30, 1); // Max 30 sets
    const restFactor = 1 - Math.min(workout.total_rest_seconds / workout.total_duration_seconds, 0.5);

    return Math.round((durationFactor + volumeFactor + setsFactor + restFactor) * 25);
  }

  private static calculateTotalVolume(workouts: WorkoutSession[]): number {
    return workouts.reduce((total, workout) => {
      const workoutVolume = workout.exercises.reduce((exerciseTotal, exercise) => {
        const setsVolume = exercise.sets
          .filter(set => set.is_completed)
          .reduce((setTotal, set) => {
            return setTotal + ((set.actual_weight_kg || 0) * (set.actual_reps || 0));
          }, 0);
        return exerciseTotal + setsVolume;
      }, 0);
      return total + workoutVolume;
    }, 0);
  }

  private static calculateTotalSets(workouts: WorkoutSession[]): number {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal, exercise) => {
        return exerciseTotal + exercise.sets.filter(set => set.is_completed).length;
      }, 0);
    }, 0);
  }

  private static calculateTotalReps(workouts: WorkoutSession[]): number {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal, exercise) => {
        return exerciseTotal + exercise.sets
          .filter(set => set.is_completed)
          .reduce((setTotal, set) => setTotal + (set.actual_reps || 0), 0);
      }, 0);
    }, 0);
  }

  private static calculateStreaks(workouts: WorkoutSession[]): { currentStreak: number; longestStreak: number } {
    const workoutDates = workouts
      .map(w => new Date(w.completed_at!))
      .sort((a, b) => a.getTime() - b.getTime())
      .map(date => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

    // Remove duplicates
    const uniqueDates = [...new Set(workoutDates)];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Calculate current streak
    let checkDate = todayTime;
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const workoutDate = uniqueDates[i];
      if (workoutDate === checkDate || workoutDate === checkDate - oneDayMs) {
        currentStreak++;
        checkDate -= oneDayMs;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = uniqueDates[i - 1];
        const currentDate = uniqueDates[i];
        if (currentDate - prevDate === oneDayMs) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return { currentStreak, longestStreak };
  }

  private static calculateFavoriteExercises(workouts: WorkoutSession[]): { name: string; count: number }[] {
    const exerciseCounts: { [name: string]: number } = {};

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const name = exercise.exercise_name;
        exerciseCounts[name] = (exerciseCounts[name] || 0) + 1;
      });
    });

    return Object.entries(exerciseCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private static calculateRecentPRs(workouts: WorkoutSession[]): PersonalRecord[] {
    const prs: PersonalRecord[] = [];
    const exerciseRecords: { [key: string]: { weight: number; reps: number; volume: number; date: string } } = {};

    // Sort workouts by date
    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(a.completed_at!).getTime() - new Date(b.completed_at!).getTime()
    );

    sortedWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const completedSets = exercise.sets.filter(set => set.is_completed);
        if (completedSets.length === 0) return;

        const maxWeight = Math.max(...completedSets.map(set => set.actual_weight_kg || 0));
        const totalReps = completedSets.reduce((sum, set) => sum + (set.actual_reps || 0), 0);
        const volume = maxWeight * totalReps;

        const exerciseName = exercise.exercise_name;
        const currentRecord = exerciseRecords[exerciseName];

        if (!currentRecord) {
          exerciseRecords[exerciseName] = {
            weight: maxWeight,
            reps: totalReps,
            volume,
            date: workout.completed_at!,
          };
        } else {
          // Check for weight PR
          if (maxWeight > currentRecord.weight) {
            prs.push({
              type: 'weight',
              value: maxWeight,
              date: workout.completed_at!,
              previousBest: currentRecord.weight,
              improvement: maxWeight - currentRecord.weight,
            });
            exerciseRecords[exerciseName].weight = maxWeight;
          }

          // Check for volume PR
          if (volume > currentRecord.volume) {
            prs.push({
              type: 'volume',
              value: volume,
              date: workout.completed_at!,
              previousBest: currentRecord.volume,
              improvement: volume - currentRecord.volume,
            });
            exerciseRecords[exerciseName].volume = volume;
          }
        }
      });
    });

    // Return recent PRs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return prs
      .filter(pr => new Date(pr.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }

  private static calculateProgressTrend(exerciseData: any[]): 'up' | 'down' | 'stable' {
    if (exerciseData.length < 2) return 'stable';

    const recentData = exerciseData.slice(-3);
    const olderData = exerciseData.slice(-6, -3);

    if (olderData.length === 0) return 'stable';

    const recentAvg = recentData.reduce((sum, exercise) => {
      const avgWeight = exercise.sets
        .filter((set: any) => set.is_completed)
        .reduce((setSum: number, set: any) => setSum + (set.actual_weight_kg || 0), 0) / 
        exercise.sets.filter((set: any) => set.is_completed).length || 0;
      return sum + avgWeight;
    }, 0) / recentData.length;

    const olderAvg = olderData.reduce((sum, exercise) => {
      const avgWeight = exercise.sets
        .filter((set: any) => set.is_completed)
        .reduce((setSum: number, set: any) => setSum + (set.actual_weight_kg || 0), 0) / 
        exercise.sets.filter((set: any) => set.is_completed).length || 0;
      return sum + avgWeight;
    }, 0) / olderData.length;

    const difference = recentAvg - olderAvg;
    const threshold = olderAvg * 0.05; // 5% threshold

    if (difference > threshold) return 'up';
    if (difference < -threshold) return 'down';
    return 'stable';
  }

  private static detectPersonalRecords(exerciseData: any[]): PersonalRecord[] {
    const records: PersonalRecord[] = [];
    let maxWeight = 0;
    let maxVolume = 0;

    exerciseData.forEach(exercise => {
      const completedSets = exercise.sets.filter((set: any) => set.is_completed);
      if (completedSets.length === 0) return;

      const sessionMaxWeight = Math.max(...completedSets.map((set: any) => set.actual_weight_kg || 0));
      const sessionVolume = completedSets.reduce((sum: number, set: any) => 
        sum + ((set.actual_weight_kg || 0) * (set.actual_reps || 0)), 0
      );

      if (sessionMaxWeight > maxWeight) {
        records.push({
          type: 'weight',
          value: sessionMaxWeight,
          date: exercise.workoutDate,
          previousBest: maxWeight,
          improvement: sessionMaxWeight - maxWeight,
        });
        maxWeight = sessionMaxWeight;
      }

      if (sessionVolume > maxVolume) {
        records.push({
          type: 'volume',
          value: sessionVolume,
          date: exercise.workoutDate,
          previousBest: maxVolume,
          improvement: sessionVolume - maxVolume,
        });
        maxVolume = sessionVolume;
      }
    });

    return records;
  }

  private static generateExerciseProgress(workouts: WorkoutSession[]): { [exerciseName: string]: ExerciseMetrics } {
    const exerciseProgress: { [exerciseName: string]: ExerciseMetrics } = {};
    const exerciseNames = new Set<string>();

    // Collect all unique exercise names
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exerciseNames.add(exercise.exercise_name);
      });
    });

    // Calculate metrics for each exercise
    exerciseNames.forEach(exerciseName => {
      exerciseProgress[exerciseName] = this.calculateExerciseMetrics(workouts, exerciseName);
    });

    return exerciseProgress;
  }

  private static exportToCSV(workouts: WorkoutSession[]): string {
    const headers = [
      'Date',
      'Workout Name',
      'Duration (minutes)',
      'Exercise',
      'Sets',
      'Reps',
      'Weight (kg)',
      'Volume (kg)',
      'Rest (seconds)'
    ];

    const rows = [headers.join(',')];

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.is_completed) {
            const row = [
              workout.completed_at || workout.started_at,
              workout.workout_name,
              Math.round(workout.total_duration_seconds / 60),
              exercise.exercise_name,
              '1', // Each row represents one set
              set.actual_reps || 0,
              set.actual_weight_kg || 0,
              (set.actual_weight_kg || 0) * (set.actual_reps || 0),
              set.rest_duration_seconds || 0
            ];
            rows.push(row.join(','));
          }
        });
      });
    });

    return rows.join('\n');
  }
}
