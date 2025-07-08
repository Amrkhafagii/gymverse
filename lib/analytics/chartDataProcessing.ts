import { WorkoutSession, ExerciseSet } from '@/types/workout';
import { PersonalRecord } from '@/types/personalRecord';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: any;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsInsight {
  type: 'improvement' | 'plateau' | 'decline' | 'milestone';
  title: string;
  description: string;
  value?: number;
  recommendation?: string;
}

export class ChartDataProcessor {
  static processWorkoutVolume(workouts: WorkoutSession[], timeframe: 'week' | 'month' | 'year' = 'month'): ChartDataPoint[] {
    const groupedData = this.groupWorkoutsByTimeframe(workouts, timeframe);
    
    return Object.entries(groupedData).map(([date, workoutGroup]) => {
      const totalVolume = workoutGroup.reduce((sum, workout) => {
        return sum + workout.exercises.reduce((exerciseSum, exercise) => {
          return exerciseSum + exercise.sets.reduce((setSum, set) => {
            return setSum + (set.weight * set.reps);
          }, 0);
        }, 0);
      }, 0);

      return {
        date,
        value: totalVolume,
        label: `${totalVolume.toLocaleString()} lbs`,
        metadata: { workoutCount: workoutGroup.length }
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  static processExerciseProgress(
    workouts: WorkoutSession[], 
    exerciseName: string, 
    metric: 'weight' | 'reps' | 'volume' = 'weight'
  ): ChartDataPoint[] {
    const exerciseData: ChartDataPoint[] = [];
    
    workouts.forEach(workout => {
      const exercise = workout.exercises.find(ex => ex.name === exerciseName);
      if (!exercise || exercise.sets.length === 0) return;

      let value: number;
      switch (metric) {
        case 'weight':
          value = Math.max(...exercise.sets.map(set => set.weight));
          break;
        case 'reps':
          value = Math.max(...exercise.sets.map(set => set.reps));
          break;
        case 'volume':
          value = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
          break;
        default:
          value = 0;
      }

      exerciseData.push({
        date: workout.date,
        value,
        label: `${value}${metric === 'weight' ? ' lbs' : metric === 'reps' ? ' reps' : ' lbs'}`,
        metadata: { 
          workoutId: workout.id,
          sets: exercise.sets.length,
          bestSet: exercise.sets.reduce((best, set) => 
            (set.weight * set.reps) > (best.weight * best.reps) ? set : best
          )
        }
      });
    });

    return exerciseData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  static processWorkoutFrequency(workouts: WorkoutSession[], timeframe: 'week' | 'month' = 'week'): ChartDataPoint[] {
    const groupedData = this.groupWorkoutsByTimeframe(workouts, timeframe);
    
    return Object.entries(groupedData).map(([date, workoutGroup]) => ({
      date,
      value: workoutGroup.length,
      label: `${workoutGroup.length} workout${workoutGroup.length !== 1 ? 's' : ''}`,
      metadata: { workouts: workoutGroup.map(w => w.name) }
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  static calculateTrend(data: ChartDataPoint[], periods: number = 2): TrendData {
    if (data.length < periods) {
      return {
        current: data[data.length - 1]?.value || 0,
        previous: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable'
      };
    }

    const recent = data.slice(-periods);
    const current = recent[recent.length - 1].value;
    const previous = recent[0].value;
    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'up' : 'down';
    }

    return {
      current,
      previous,
      change,
      changePercent,
      trend
    };
  }

  static generateInsights(
    workouts: WorkoutSession[], 
    personalRecords: PersonalRecord[]
  ): AnalyticsInsight[] {
    const insights: AnalyticsInsight[] = [];
    
    // Recent PR insights
    const recentPRs = personalRecords.filter(pr => {
      const prDate = new Date(pr.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return prDate >= weekAgo;
    });

    if (recentPRs.length > 0) {
      insights.push({
        type: 'milestone',
        title: `${recentPRs.length} New Personal Record${recentPRs.length > 1 ? 's' : ''}!`,
        description: `You've achieved ${recentPRs.length} new PR${recentPRs.length > 1 ? 's' : ''} this week`,
        value: recentPRs.length,
        recommendation: 'Keep up the great work! Consider progressive overload for continued gains.'
      });
    }

    // Workout consistency insights
    const recentWorkouts = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      return workoutDate >= monthAgo;
    });

    const weeklyAverage = recentWorkouts.length / 4;
    if (weeklyAverage >= 4) {
      insights.push({
        type: 'improvement',
        title: 'Excellent Consistency!',
        description: `You're averaging ${weeklyAverage.toFixed(1)} workouts per week`,
        value: weeklyAverage,
        recommendation: 'Your consistency is paying off! Consider adding variety to prevent plateaus.'
      });
    } else if (weeklyAverage < 2) {
      insights.push({
        type: 'decline',
        title: 'Consistency Opportunity',
        description: `You're averaging ${weeklyAverage.toFixed(1)} workouts per week`,
        value: weeklyAverage,
        recommendation: 'Try to aim for at least 3 workouts per week for optimal progress.'
      });
    }

    // Volume trend insights
    const volumeData = this.processWorkoutVolume(recentWorkouts, 'week');
    if (volumeData.length >= 3) {
      const trend = this.calculateTrend(volumeData, 3);
      
      if (trend.trend === 'up' && trend.changePercent > 10) {
        insights.push({
          type: 'improvement',
          title: 'Volume Increasing!',
          description: `Your training volume has increased by ${trend.changePercent.toFixed(1)}%`,
          value: trend.changePercent,
          recommendation: 'Great progress! Monitor recovery to ensure sustainable growth.'
        });
      } else if (trend.trend === 'down' && trend.changePercent < -15) {
        insights.push({
          type: 'decline',
          title: 'Volume Declining',
          description: `Your training volume has decreased by ${Math.abs(trend.changePercent).toFixed(1)}%`,
          value: Math.abs(trend.changePercent),
          recommendation: 'Consider reviewing your program or addressing any recovery issues.'
        });
      }
    }

    return insights;
  }

  private static groupWorkoutsByTimeframe(
    workouts: WorkoutSession[], 
    timeframe: 'week' | 'month' | 'year'
  ): Record<string, WorkoutSession[]> {
    const grouped: Record<string, WorkoutSession[]> = {};

    workouts.forEach(workout => {
      const date = new Date(workout.date);
      let key: string;

      switch (timeframe) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = workout.date;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(workout);
    });

    return grouped;
  }

  static getTopExercises(workouts: WorkoutSession[], limit: number = 5): Array<{
    name: string;
    frequency: number;
    totalVolume: number;
    averageWeight: number;
  }> {
    const exerciseStats: Record<string, {
      frequency: number;
      totalVolume: number;
      totalWeight: number;
      setCount: number;
    }> = {};

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (!exerciseStats[exercise.name]) {
          exerciseStats[exercise.name] = {
            frequency: 0,
            totalVolume: 0,
            totalWeight: 0,
            setCount: 0
          };
        }

        exerciseStats[exercise.name].frequency++;
        exercise.sets.forEach(set => {
          exerciseStats[exercise.name].totalVolume += set.weight * set.reps;
          exerciseStats[exercise.name].totalWeight += set.weight;
          exerciseStats[exercise.name].setCount++;
        });
      });
    });

    return Object.entries(exerciseStats)
      .map(([name, stats]) => ({
        name,
        frequency: stats.frequency,
        totalVolume: stats.totalVolume,
        averageWeight: stats.setCount > 0 ? stats.totalWeight / stats.setCount : 0
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }
}
