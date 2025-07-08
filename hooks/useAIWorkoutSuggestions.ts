import { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkoutRecommendation, AIInsight, UserProfile } from '@/types/aiRecommendation';
import { WorkoutRecommendationEngine } from '@/lib/ai/workoutRecommendations';
import { PatternAnalysis } from '@/lib/ai/patternAnalysis';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';

export function useAIWorkoutSuggestions() {
  const { workouts, isLoading: workoutsLoading } = useWorkoutHistory();
  const { personalRecords, isLoading: prsLoading } = usePersonalRecords();
  
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate recommendations and insights
  const generateRecommendations = useCallback(async () => {
    if (workoutsLoading || prsLoading) return;

    try {
      setIsGenerating(true);
      setError(null);

      // Create user profile from workout history
      const profile = PatternAnalysis.createUserProfile(workouts);
      setUserProfile(profile);

      // Generate AI insights
      const aiInsights = PatternAnalysis.generateInsights(workouts, personalRecords);
      setInsights(aiInsights);

      // Generate workout recommendations
      const workoutRecommendations = WorkoutRecommendationEngine.generateRecommendations(
        workouts,
        personalRecords,
        profile
      );
      setRecommendations(workoutRecommendations);

      setLastGenerated(new Date().toISOString());
    } catch (err) {
      console.error('Failed to generate AI recommendations:', err);
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [workouts, personalRecords, workoutsLoading, prsLoading]);

  // Auto-generate recommendations when data changes
  useEffect(() => {
    if (!workoutsLoading && !prsLoading && workouts.length > 0) {
      generateRecommendations();
    }
  }, [workouts.length, personalRecords.length, workoutsLoading, prsLoading]);

  // Get recommendations by priority
  const getRecommendationsByPriority = useCallback((priority: 'high' | 'medium' | 'low') => {
    return recommendations.filter(rec => rec.priority === priority);
  }, [recommendations]);

  // Get recommendations by type
  const getRecommendationsByType = useCallback((workoutType: string) => {
    return recommendations.filter(rec => rec.workoutType === workoutType);
  }, [recommendations]);

  // Get insights by type
  const getInsightsByType = useCallback((type: 'pattern' | 'improvement' | 'warning' | 'suggestion') => {
    return insights.filter(insight => insight.type === type);
  }, [insights]);

  // Check if recommendations need refresh (older than 24 hours)
  const needsRefresh = useMemo(() => {
    if (!lastGenerated) return true;
    const lastGen = new Date(lastGenerated);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastGen.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24;
  }, [lastGenerated]);

  // Get recommendation confidence level
  const getAverageConfidence = useMemo(() => {
    if (recommendations.length === 0) return 0;
    const totalConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence, 0);
    return Math.round(totalConfidence / recommendations.length);
  }, [recommendations]);

  // Get workout frequency analysis
  const frequencyAnalysis = useMemo(() => {
    if (workouts.length === 0) return null;
    return PatternAnalysis.analyzeWorkoutFrequency(workouts);
  }, [workouts]);

  // Get muscle group analysis
  const muscleGroupAnalysis = useMemo(() => {
    if (workouts.length === 0) return null;
    return PatternAnalysis.analyzeMuscleGroupPatterns(workouts);
  }, [workouts]);

  // Get intensity analysis
  const intensityAnalysis = useMemo(() => {
    if (workouts.length === 0) return null;
    return PatternAnalysis.analyzeIntensityPatterns(workouts);
  }, [workouts]);

  // Get progress analysis
  const progressAnalysis = useMemo(() => {
    return PatternAnalysis.analyzeProgressTrends(personalRecords);
  }, [personalRecords]);

  // Dismiss a recommendation
  const dismissRecommendation = useCallback((recommendationId: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId));
  }, []);

  // Mark insight as read
  const markInsightAsRead = useCallback((insightIndex: number) => {
    setInsights(prev => prev.filter((_, index) => index !== insightIndex));
  }, []);

  // Force refresh recommendations
  const refreshRecommendations = useCallback(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  // Get recommendation summary stats
  const summaryStats = useMemo(() => {
    const highPriority = recommendations.filter(r => r.priority === 'high').length;
    const mediumPriority = recommendations.filter(r => r.priority === 'medium').length;
    const lowPriority = recommendations.filter(r => r.priority === 'low').length;
    
    const warningInsights = insights.filter(i => i.type === 'warning').length;
    const suggestionInsights = insights.filter(i => i.type === 'suggestion').length;
    const improvementInsights = insights.filter(i => i.type === 'improvement').length;

    return {
      totalRecommendations: recommendations.length,
      highPriority,
      mediumPriority,
      lowPriority,
      totalInsights: insights.length,
      warningInsights,
      suggestionInsights,
      improvementInsights,
      averageConfidence: getAverageConfidence
    };
  }, [recommendations, insights, getAverageConfidence]);

  return {
    // Data
    recommendations,
    insights,
    userProfile,
    summaryStats,
    
    // Analysis
    frequencyAnalysis,
    muscleGroupAnalysis,
    intensityAnalysis,
    progressAnalysis,
    
    // State
    isGenerating,
    isLoading: workoutsLoading || prsLoading,
    lastGenerated,
    needsRefresh,
    error,
    
    // Actions
    generateRecommendations,
    refreshRecommendations,
    dismissRecommendation,
    markInsightAsRead,
    
    // Utilities
    getRecommendationsByPriority,
    getRecommendationsByType,
    getInsightsByType,
    
    // Clear error
    clearError: () => setError(null),
  };
}
