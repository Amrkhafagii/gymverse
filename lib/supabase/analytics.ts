import { supabase } from './index';
import { getWorkoutSessions } from './workouts';
import { getBodyMeasurements } from './measurements';
import { getProgressPhotos } from './progressPhotos';

export interface WorkoutAnalytics {
  total_workouts: number;
  total_duration_minutes: number;
  total_calories_burned: number;
  average_workout_duration: number;
  workouts_this_week: number;
  workouts_this_month: number;
  current_streak: number;
  longest_streak: number;
  favorite_muscle_groups: { muscle_group: string; count: number }[];
  workout_frequency_by_day: { day: string; count: number }[];
  monthly_progress: { month: string; workouts: number; duration: number }[];
}

export interface ProgressAnalytics {
  measurement_trends: {
    measurement_type: string;
    current_value: number;
    change_30_days: number;
    change_90_days: number;
    trend_direction: 'up' | 'down' | 'stable';
  }[];
  photo_progress: {
    total_photos: number;
    photos_this_month: number;
    transformation_timeline: {
      date: string;
      photo_count: number;
      weight?: number;
      body_fat?: number;
    }[];
  };
  achievement_stats: {
    total_achievements: number;
    recent_achievements: string[];
    completion_rate: number;
  };
}

export interface ExerciseAnalytics {
  exercise_id: string;
  exercise_name: string;
  total_sessions: number;
  total_volume: number;
  max_weight: number;
  average_weight: number;
  progress_trend: 'improving' | 'declining' | 'stable';
  last_performed: string;
  personal_records: {
    max_weight: { value: number; date: string };
    max_reps: { value: number; date: string };
    max_volume: { value: number; date: string };
  };
  progress_history: {
    date: string;
    weight: number;
    reps: number;
    volume: number;
  }[];
}

export async function getWorkoutAnalytics(days: number = 90): Promise<WorkoutAnalytics> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get workout sessions with exercises
  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_exercises (
        exercise_id,
        exercises (name, muscle_groups),
        sets (weight, reps)
      )
    `)
    .eq('user_id', user.id)
    .gte('workout_date', startDate.toISOString())
    .order('workout_date', { ascending: false });

  if (error) throw error;

  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Calculate basic stats
  const totalWorkouts = sessions.length;
  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const totalCalories = sessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0);
  const averageDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

  const workoutsThisWeek = sessions.filter(s => new Date(s.workout_date) >= weekStart).length;
  const workoutsThisMonth = sessions.filter(s => new Date(s.workout_date) >= monthStart).length;

  // Calculate streaks
  const sortedSessions = sessions.sort((a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime());
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedSessions.length; i++) {
    const sessionDate = new Date(sortedSessions[i].workout_date);
    sessionDate.setHours(0, 0, 0, 0);

    if (i === 0) {
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        currentStreak = 1;
        tempStreak = 1;
      }
    } else {
      const prevDate = new Date(sortedSessions[i - 1].workout_date);
      prevDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
        if (i === 0) currentStreak = 0;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Analyze muscle groups
  const muscleGroupCounts: Record<string, number> = {};
  sessions.forEach(session => {
    session.workout_exercises?.forEach(we => {
      const muscleGroups = we.exercises?.muscle_groups || [];
      muscleGroups.forEach(mg => {
        muscleGroupCounts[mg] = (muscleGroupCounts[mg] || 0) + 1;
      });
    });
  });

  const favoriteMuscleGroups = Object.entries(muscleGroupCounts)
    .map(([muscle_group, count]) => ({ muscle_group, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Workout frequency by day
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCount = new Array(7).fill(0);
  sessions.forEach(session => {
    const day = new Date(session.workout_date).getDay();
    dayCount[day]++;
  });

  const workoutFrequencyByDay = dayNames.map((day, index) => ({
    day,
    count: dayCount[index],
  }));

  // Monthly progress
  const monthlyData: Record<string, { workouts: number; duration: number }> = {};
  sessions.forEach(session => {
    const date = new Date(session.workout_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { workouts: 0, duration: 0 };
    }
    
    monthlyData[monthKey].workouts++;
    monthlyData[monthKey].duration += session.duration_minutes || 0;
  });

  const monthlyProgress = Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months

  return {
    total_workouts: totalWorkouts,
    total_duration_minutes: totalDuration,
    total_calories_burned: totalCalories,
    average_workout_duration: averageDuration,
    workouts_this_week: workoutsThisWeek,
    workouts_this_month: workoutsThisMonth,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    favorite_muscle_groups: favoriteMuscleGroups,
    workout_frequency_by_day: workoutFrequencyByDay,
    monthly_progress: monthlyProgress,
  };
}

export async function getProgressAnalytics(): Promise<ProgressAnalytics> {
  const [measurements, photos] = await Promise.all([
    getBodyMeasurements(),
    getProgressPhotos(),
  ]);

  // Measurement trends
  const measurementTrends = [];
  const measurementTypes = ['weight', 'body_fat_percentage', 'muscle_mass'];
  
  for (const type of measurementTypes) {
    const values = measurements
      .map(m => ({ date: m.measurement_date, value: m[type as keyof typeof m] as number }))
      .filter(v => v.value !== null && v.value !== undefined)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (values.length === 0) continue;

    const currentValue = values[0].value;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const value30DaysAgo = values.find(v => new Date(v.date) <= thirtyDaysAgo)?.value;
    const value90DaysAgo = values.find(v => new Date(v.date) <= ninetyDaysAgo)?.value;

    const change30Days = value30DaysAgo ? currentValue - value30DaysAgo : 0;
    const change90Days = value90DaysAgo ? currentValue - value90DaysAgo : 0;

    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change30Days) > 0.5) {
      trendDirection = change30Days > 0 ? 'up' : 'down';
    }

    measurementTrends.push({
      measurement_type: type,
      current_value: currentValue,
      change_30_days: change30Days,
      change_90_days: change90Days,
      trend_direction: trendDirection,
    });
  }

  // Photo progress
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const photosThisMonth = photos.filter(p => new Date(p.photo_date) >= monthStart).length;

  // Group photos by month for timeline
  const photosByMonth: Record<string, { photos: typeof photos; weight?: number; body_fat?: number }> = {};
  photos.forEach(photo => {
    const date = new Date(photo.photo_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!photosByMonth[monthKey]) {
      photosByMonth[monthKey] = { photos: [] };
    }
    
    photosByMonth[monthKey].photos.push(photo);
    
    // Use the latest weight/body fat for the month
    if (photo.weight_at_time) {
      photosByMonth[monthKey].weight = photo.weight_at_time;
    }
    if (photo.body_fat_at_time) {
      photosByMonth[monthKey].body_fat = photo.body_fat_at_time;
    }
  });

  const transformationTimeline = Object.entries(photosByMonth)
    .map(([date, data]) => ({
      date,
      photo_count: data.photos.length,
      weight: data.weight,
      body_fat: data.body_fat,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    measurement_trends: measurementTrends,
    photo_progress: {
      total_photos: photos.length,
      photos_this_month: photosThisMonth,
      transformation_timeline: transformationTimeline,
    },
    achievement_stats: {
      total_achievements: 0, // Will be implemented with achievements system
      recent_achievements: [],
      completion_rate: 0,
    },
  };
}

export async function getExerciseAnalytics(exerciseId: string): Promise<ExerciseAnalytics | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Get exercise details and all workout data
  const { data: exerciseData, error: exerciseError } = await supabase
    .from('workout_exercises')
    .select(`
      *,
      exercises (name),
      sets (*),
      workout_sessions (workout_date)
    `)
    .eq('exercise_id', exerciseId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (exerciseError) throw exerciseError;
  if (!exerciseData || exerciseData.length === 0) return null;

  const exerciseName = exerciseData[0].exercises?.name || 'Unknown Exercise';
  const totalSessions = exerciseData.length;

  // Calculate volume and records
  let totalVolume = 0;
  let maxWeight = 0;
  let maxReps = 0;
  let maxVolume = 0;
  const weights: number[] = [];
  const progressHistory: { date: string; weight: number; reps: number; volume: number }[] = [];

  exerciseData.forEach(we => {
    const sessionDate = we.workout_sessions?.workout_date || we.created_at;
    let sessionWeight = 0;
    let sessionReps = 0;
    let sessionVolume = 0;

    we.sets?.forEach(set => {
      const weight = set.weight || 0;
      const reps = set.reps || 0;
      const volume = weight * reps;

      sessionWeight = Math.max(sessionWeight, weight);
      sessionReps = Math.max(sessionReps, reps);
      sessionVolume += volume;

      maxWeight = Math.max(maxWeight, weight);
      maxReps = Math.max(maxReps, reps);
      weights.push(weight);
    });

    totalVolume += sessionVolume;
    maxVolume = Math.max(maxVolume, sessionVolume);

    progressHistory.push({
      date: sessionDate,
      weight: sessionWeight,
      reps: sessionReps,
      volume: sessionVolume,
    });
  });

  const averageWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0;

  // Determine progress trend
  const recentSessions = progressHistory.slice(0, 5);
  const olderSessions = progressHistory.slice(5, 10);
  
  let progressTrend: 'improving' | 'declining' | 'stable' = 'stable';
  
  if (recentSessions.length >= 3 && olderSessions.length >= 3) {
    const recentAvgWeight = recentSessions.reduce((sum, s) => sum + s.weight, 0) / recentSessions.length;
    const olderAvgWeight = olderSessions.reduce((sum, s) => sum + s.weight, 0) / olderSessions.length;
    
    const improvement = (recentAvgWeight - olderAvgWeight) / olderAvgWeight;
    
    if (improvement > 0.05) progressTrend = 'improving';
    else if (improvement < -0.05) progressTrend = 'declining';
  }

  // Find record dates
  const maxWeightSession = progressHistory.find(p => p.weight === maxWeight);
  const maxRepsSession = progressHistory.find(p => p.reps === maxReps);
  const maxVolumeSession = progressHistory.find(p => p.volume === maxVolume);

  return {
    exercise_id: exerciseId,
    exercise_name: exerciseName,
    total_sessions: totalSessions,
    total_volume: totalVolume,
    max_weight: maxWeight,
    average_weight: averageWeight,
    progress_trend: progressTrend,
    last_performed: progressHistory[0]?.date || '',
    personal_records: {
      max_weight: { value: maxWeight, date: maxWeightSession?.date || '' },
      max_reps: { value: maxReps, date: maxRepsSession?.date || '' },
      max_volume: { value: maxVolume, date: maxVolumeSession?.date || '' },
    },
    progress_history: progressHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  };
}

export async function getTopExercises(limit: number = 10) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('workout_exercises')
    .select(`
      exercise_id,
      exercises (name, muscle_groups),
      sets (weight, reps)
    `)
    .eq('user_id', user.id);

  if (error) throw error;

  // Group by exercise and calculate stats
  const exerciseStats: Record<string, {
    id: string;
    name: string;
    muscle_groups: string[];
    session_count: number;
    total_volume: number;
    max_weight: number;
    last_performed: string;
  }> = {};

  data.forEach(we => {
    const exerciseId = we.exercise_id;
    const exerciseName = we.exercises?.name || 'Unknown';
    const muscleGroups = we.exercises?.muscle_groups || [];

    if (!exerciseStats[exerciseId]) {
      exerciseStats[exerciseId] = {
        id: exerciseId,
        name: exerciseName,
        muscle_groups: muscleGroups,
        session_count: 0,
        total_volume: 0,
        max_weight: 0,
        last_performed: we.created_at,
      };
    }

    exerciseStats[exerciseId].session_count++;
    exerciseStats[exerciseId].last_performed = we.created_at;

    we.sets?.forEach(set => {
      const volume = (set.weight || 0) * (set.reps || 0);
      exerciseStats[exerciseId].total_volume += volume;
      exerciseStats[exerciseId].max_weight = Math.max(exerciseStats[exerciseId].max_weight, set.weight || 0);
    });
  });

  return Object.values(exerciseStats)
    .sort((a, b) => b.session_count - a.session_count)
    .slice(0, limit);
}
