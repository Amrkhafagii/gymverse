import { useState, useEffect, useMemo } from 'react';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useStreakTracking } from '@/contexts/StreakContext';
import { SmartInsight } from '@/types/aiRecommendation';
import { PatternAnalysis } from '@/lib/ai/patternAnalysis';

export function useSmartInsights() {
  const { workouts } = useWorkoutHistory();
  const { personalRecords } = usePersonalRecords();
  const { currentStreak, longestStreak } = useStreakTracking();
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  // Generate insights based on workout data
  const generatedInsights = useMemo((): SmartInsight[] => {
    const newInsights: SmartInsight[] = [];
    const now = new Date();

    if (workouts.length === 0) {
      return [{
        id: 'welcome_insight',
        type: 'suggestion',
        title: 'Welcome to Your Fitness Journey!',
        message: 'Start by completing your first workout to unlock personalized AI insights and recommendations.',
        priority: 'high',
        actionable: true,
        action: {
          label: 'Start First Workout',
          type: 'workout',
        },
        confidence: 100,
        createdAt: now.toISOString(),
      }];
    }

    // Analyze patterns
    const muscleAnalysis = PatternAnalysis.analyzeMuscleGroupPatterns(workouts);
    const frequencyAnalysis = PatternAnalysis.analyzeWorkoutFrequency(workouts);
    const intensityAnalysis = PatternAnalysis.analyzeIntensityPatterns(workouts);
    const progressAnalysis = PatternAnalysis.analyzeProgressTrends(personalRecords);

    // Achievement insights
    if (currentStreak >= 7) {
      newInsights.push({
        id: `streak_achievement_${currentStreak}`,
        type: 'achievement',
        title: `${currentStreak}-Day Streak! 🔥`,
        message: `Amazing consistency! You've maintained a ${currentStreak}-day workout streak. Keep up the momentum!`,
        priority: 'high',
        actionable: false,
        confidence: 95,
        createdAt: now.toISOString(),
      });
    }

    if (currentStreak === longestStreak && longestStreak >= 14) {
      newInsights.push({
        id: `personal_best_streak_${longestStreak}`,
        type: 'milestone',
        title: 'Personal Best Streak!',
        message: `You've reached your longest streak ever at ${longestStreak} days! This is a significant milestone in your fitness journey.`,
        priority: 'high',
        actionable: true,
        action: {
          label: 'Share Achievement',
          type: 'workout',
        },
        confidence: 100,
        createdAt: now.toISOString(),
      });
    }

    // Progress insights
    if (progressAnalysis.improvingExercises.length > 0) {
      const topImproving = progressAnalysis.improvingExercises.slice(0, 2);
      newInsights.push({
        id: `progress_improvement_${Date.now()}`,
        type: 'achievement',
        title: 'Great Progress Detected!',
        message: `You're showing excellent improvement in ${topImproving.join(' and ')}. Your consistent training is paying off!`,
        priority: 'medium',
        actionable: true,
        action: {
          label: 'View Progress Details',
          type: 'exercise',
          data: { exercises: topImproving },
        },
        confidence: 85,
        createdAt: now.toISOString(),
      });
    }

    // Plateau warnings
    if (progressAnalysis.plateauExercises.length > 0) {
      const plateauExercise = progressAnalysis.plateauExercises[0];
      newInsights.push({
        id: `plateau_warning_${plateauExercise}`,
        type: 'warning',
        title: 'Plateau Detected',
        message: `Your progress in ${plateauExercise} has stalled. Consider changing your approach with different rep ranges, increased volume, or exercise variations.`,
        priority: 'medium',
        actionable: true,
        action: {
          label: 'Get Plateau-Breaking Tips',
          type: 'exercise',
          data: { exercise: plateauExercise },
        },
        confidence: 80,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });
    }

    // Muscle imbalance warnings
    if (muscleAnalysis.needsAttention.length > 0) {
      const neglectedMuscles = muscleAnalysis.needsAttention.slice(0, 2);
      newInsights.push({
        id: `muscle_imbalance_${neglectedMuscles.join('_')}`,
        type: 'warning',
        title: 'Muscle Group Imbalance',
        message: `You haven't trained ${neglectedMuscles.join(' and ')} recently. Balanced training prevents injuries and improves overall strength.`,
        priority: 'high',
        actionable: true,
        action: {
          label: 'Get Balanced Workout',
          type: 'workout',
          data: { focusMuscles: neglectedMuscles },
        },
        confidence: 90,
        createdAt: now.toISOString(),
      });
    }

    // Recovery suggestions
    if (intensityAnalysis.recoveryNeeded) {
      newInsights.push({
        id: `recovery_needed_${Date.now()}`,
        type: 'suggestion',
        title: 'Recovery Recommended',
        message: 'Your recent workouts have been high intensity. Consider a rest day or active recovery session to optimize your progress.',
        priority: 'high',
        actionable: true,
        action: {
          label: 'Plan Recovery Day',
          type: 'rest',
        },
        confidence: 85,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
      });
    }

    // Frequency insights
    if (frequencyAnalysis.consistency < 0.7) {
      newInsights.push({
        id: `consistency_improvement_${Date.now()}`,
        type: 'suggestion',
        title: 'Improve Consistency',
        message: `Your workout schedule varies significantly. Try to maintain ${Math.round(frequencyAnalysis.averageFrequency)} workouts per week for better results.`,
        priority: 'medium',
        actionable: true,
        action: {
          label: 'Set Workout Schedule',
          type: 'workout',
        },
        confidence: 75,
        createdAt: now.toISOString(),
      });
    }

    // Milestone celebrations
    const totalWorkouts = workouts.length;
    const milestones = [10, 25, 50, 100, 200, 500];
    const recentMilestone = milestones.find(m => totalWorkouts >= m && totalWorkouts <= m + 2);
    
    if (recentMilestone) {
      newInsights.push({
        id: `workout_milestone_${recentMilestone}`,
        type: 'milestone',
        title: `${recentMilestone} Workouts Completed! 🎉`,
        message: `Congratulations on completing ${recentMilestone} workouts! This is a significant achievement that shows your dedication to fitness.`,
        priority: 'high',
        actionable: true,
        action: {
          label: 'Share Milestone',
          type: 'workout',
        },
        confidence: 100,
        createdAt: now.toISOString(),
      });
    }

    // Pattern recognition insights
    if (frequencyAnalysis.preferredDays.length > 0 && frequencyAnalysis.consistency > 0.8) {
      newInsights.push({
        id: `pattern_recognition_${Date.now()}`,
        type: 'pattern',
        title: 'Workout Pattern Identified',
        message: `You consistently work out on ${frequencyAnalysis.preferredDays.slice(0, 2).join(' and ')} during ${frequencyAnalysis.preferredTimes[0]?.toLowerCase()}. This routine is working well for you!`,
        priority: 'low',
        actionable: false,
        confidence: 70,
        createdAt: now.toISOString(),
      });
    }

    // Personal record insights
    const recentPRs = personalRecords.filter(pr => {
      const prDate = new Date(pr.achievedAt);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return prDate > weekAgo;
    });

    if (recentPRs.length > 0) {
      newInsights.push({
        id: `recent_pr_${recentPRs.length}`,
        type: 'achievement',
        title: `${recentPRs.length} New Personal Record${recentPRs.length > 1 ? 's' : ''}!`,
        message: `You've set ${recentPRs.length} personal record${recentPRs.length > 1 ? 's' : ''} this week in ${recentPRs.map(pr => pr.exerciseName).join(', ')}. Excellent progress!`,
        priority: 'high',
        actionable: true,
        action: {
          label: 'View Records',
          type: 'exercise',
          data: { records: recentPRs },
        },
        confidence: 95,
        createdAt: now.toISOString(),
      });
    }

    // Variety suggestions
    const recentExercises = new Set();
    workouts.slice(0, 5).forEach(workout => {
      workout.exercises.forEach(exercise => {
        recentExercises.add(exercise.name);
      });
    });

    if (recentExercises.size < 8 && workouts.length > 10) {
      newInsights.push({
        id: `variety_suggestion_${Date.now()}`,
        type: 'suggestion',
        title: 'Add Exercise Variety',
        message: 'You\'ve been doing similar exercises recently. Adding variety can prevent plateaus and target muscles differently.',
        priority: 'low',
        actionable: true,
        action: {
          label: 'Discover New Exercises',
          type: 'exercise',
        },
        confidence: 65,
        createdAt: now.toISOString(),
      });
    }

    return newInsights;
  }, [workouts, personalRecords, currentStreak, longestStreak]);

  // Update insights when data changes
  useEffect(() => {
    const activeInsights = generatedInsights.filter(insight => 
      !dismissedInsights.has(insight.id)
    );
    setInsights(activeInsights);
  }, [generatedInsights, dismissedInsights]);

  const dismissInsight = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  const clearDismissedInsights = () => {
    setDismissedInsights(new Set());
  };

  // Get insights by type
  const getInsightsByType = (type: SmartInsight['type']) => {
    return insights.filter(insight => insight.type === type);
  };

  // Get insights by priority
  const getInsightsByPriority = (priority: SmartInsight['priority']) => {
    return insights.filter(insight => insight.priority === priority);
  };

  // Get actionable insights
  const getActionableInsights = () => {
    return insights.filter(insight => insight.actionable);
  };

  // Get high-priority insights
  const getHighPriorityInsights = () => {
    return insights.filter(insight => insight.priority === 'high');
  };

  // Statistics
  const insightStats = useMemo(() => {
    const total = insights.length;
    const byType = insights.reduce((acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byPriority = insights.reduce((acc, insight) => {
      acc[insight.priority] = (acc[insight.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const actionable = insights.filter(i => i.actionable).length;
    const averageConfidence = insights.length > 0 
      ? insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length 
      : 0;

    return {
      total,
      byType,
      byPriority,
      actionable,
      averageConfidence,
    };
  }, [insights]);

  return {
    insights,
    dismissInsight,
    clearDismissedInsights,
    getInsightsByType,
    getInsightsByPriority,
    getActionableInsights,
    getHighPriorityInsights,
    insightStats,
  };
}
