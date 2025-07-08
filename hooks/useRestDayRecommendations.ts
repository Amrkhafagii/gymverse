import { useState, useEffect, useCallback } from 'react';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { recoveryAnalysis, RecoveryMetrics, RecoveryInsight } from '@/lib/ai/recoveryAnalysis';
import { fatigueDetection, FatigueIndicator, FatiguePattern, FatigueAlert } from '@/lib/ai/fatigueDetection';

export interface RestDayRecommendation {
  id: string;
  type: 'immediate' | 'planned' | 'optional';
  title: string;
  description: string;
  daysRecommended: number;
  reasoning: string[];
  alternatives: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RecoveryPlan {
  currentPhase: 'active' | 'recovery' | 'deload' | 'maintenance';
  recommendedDuration: number; // days
  activities: string[];
  restrictions: string[];
  nextEvaluation: string; // ISO date
}

export interface UseRestDayRecommendationsReturn {
  // Core data
  recoveryMetrics: RecoveryMetrics | null;
  fatigueIndicators: FatigueIndicator[];
  fatiguePatterns: FatiguePattern[];
  fatigueAlerts: FatigueAlert[];
  recoveryInsights: RecoveryInsight[];
  
  // Recommendations
  restDayRecommendations: RestDayRecommendation[];
  recoveryPlan: RecoveryPlan | null;
  
  // Status
  isLoading: boolean;
  lastUpdated: string | null;
  
  // Actions
  refreshAnalysis: () => Promise<void>;
  dismissAlert: (alertId: string) => void;
  markRecommendationFollowed: (recommendationId: string) => void;
  
  // Utilities
  shouldTakeRestDay: boolean;
  fatigueLevel: 'low' | 'moderate' | 'high' | 'critical';
  recoveryTrendData: Array<{ date: string; fatigueLevel: number; recoveryScore: number }>;
}

export function useRestDayRecommendations(): UseRestDayRecommendationsReturn {
  const { workouts } = useWorkoutHistory();
  
  // State
  const [recoveryMetrics, setRecoveryMetrics] = useState<RecoveryMetrics | null>(null);
  const [fatigueIndicators, setFatigueIndicators] = useState<FatigueIndicator[]>([]);
  const [fatiguePatterns, setFatiguePatterns] = useState<FatiguePattern[]>([]);
  const [fatigueAlerts, setFatigueAlerts] = useState<FatigueAlert[]>([]);
  const [recoveryInsights, setRecoveryInsights] = useState<RecoveryInsight[]>([]);
  const [restDayRecommendations, setRestDayRecommendations] = useState<RestDayRecommendation[]>([]);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null);
  const [recoveryTrendData, setRecoveryTrendData] = useState<Array<{ date: string; fatigueLevel: number; recoveryScore: number }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Analyze recovery status
  const analyzeRecovery = useCallback(async () => {
    if (workouts.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // Get recovery metrics
      const metrics = await recoveryAnalysis.analyzeRecoveryStatus(workouts);
      setRecoveryMetrics(metrics);
      
      // Detect fatigue indicators
      const indicators = fatigueDetection.detectFatigueIndicators(workouts, metrics);
      setFatigueIndicators(indicators);
      
      // Detect fatigue patterns
      const patterns = fatigueDetection.detectFatiguePatterns(workouts, indicators);
      setFatiguePatterns(patterns);
      
      // Generate alerts
      const alerts = fatigueDetection.generateFatigueAlerts(indicators, patterns);
      setFatigueAlerts(alerts.filter(alert => !dismissedAlerts.has(alert.id)));
      
      // Generate insights
      const insights = await recoveryAnalysis.generateRecoveryInsights(metrics, workouts);
      setRecoveryInsights(insights);
      
      // Generate rest day recommendations
      const recommendations = generateRestDayRecommendations(metrics, indicators, patterns, insights);
      setRestDayRecommendations(recommendations);
      
      // Create recovery plan
      const plan = createRecoveryPlan(metrics, patterns, indicators);
      setRecoveryPlan(plan);
      
      // Get trend data
      const trendData = await recoveryAnalysis.getRecoveryTrendData(14);
      setRecoveryTrendData(trendData);
      
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Error analyzing recovery:', error);
    } finally {
      setIsLoading(false);
    }
  }, [workouts, dismissedAlerts]);

  // Generate rest day recommendations
  const generateRestDayRecommendations = useCallback((
    metrics: RecoveryMetrics,
    indicators: FatigueIndicator[],
    patterns: FatiguePattern[],
    insights: RecoveryInsight[]
  ): RestDayRecommendation[] => {
    const recommendations: RestDayRecommendation[] = [];
    
    // Critical fatigue - immediate rest
    if (metrics.fatigueLevel > 80) {
      recommendations.push({
        id: 'critical-rest',
        type: 'immediate',
        title: 'Immediate Rest Required',
        description: 'Your fatigue levels are critically high. Take immediate rest to prevent overtraining.',
        daysRecommended: 3,
        reasoning: [
          'Fatigue level is above 80%',
          'Risk of overtraining syndrome',
          'Performance likely to decline further without rest',
        ],
        alternatives: [
          'Light walking or gentle stretching only',
          'Focus on sleep and nutrition',
          'Consider massage or other recovery modalities',
        ],
        priority: 'critical',
      });
    }
    
    // High fatigue - planned rest
    else if (metrics.fatigueLevel > 60) {
      recommendations.push({
        id: 'high-fatigue-rest',
        type: 'planned',
        title: 'Plan Rest Days',
        description: 'Your body is showing signs of high fatigue. Plan 1-2 rest days this week.',
        daysRecommended: metrics.recommendedRestDays,
        reasoning: [
          `Fatigue level is ${metrics.fatigueLevel}%`,
          'Recovery score is below optimal',
          'Multiple fatigue indicators detected',
        ],
        alternatives: [
          'Active recovery with light cardio',
          'Yoga or mobility work',
          'Reduce workout intensity by 40%',
        ],
        priority: 'high',
      });
    }
    
    // Overtraining pattern detected
    const overtrainingPattern = patterns.find(p => p.type === 'overtraining');
    if (overtrainingPattern) {
      recommendations.push({
        id: 'overtraining-rest',
        type: 'immediate',
        title: 'Overtraining Recovery',
        description: 'Signs of overtraining detected. Extended rest period recommended.',
        daysRecommended: 7,
        reasoning: [
          `Overtraining pattern detected with ${overtrainingPattern.confidence}% confidence`,
          'Multiple systems showing fatigue',
          'Performance decline evident',
        ],
        alternatives: [
          'Complete rest for first 3 days',
          'Light movement after initial rest',
          'Gradual return to training',
        ],
        priority: 'critical',
      });
    }
    
    // Deload week recommendation
    const deloadPattern = patterns.find(p => p.type === 'deload_needed');
    if (deloadPattern) {
      recommendations.push({
        id: 'deload-week',
        type: 'planned',
        title: 'Deload Week Recommended',
        description: 'Your body would benefit from a planned deload week to optimize recovery.',
        daysRecommended: 7,
        reasoning: [
          'Consistent moderate fatigue detected',
          'Training volume has been high',
          'Performance plateau or slight decline',
        ],
        alternatives: [
          'Reduce weights by 40-60%',
          'Maintain movement patterns',
          'Focus on technique refinement',
        ],
        priority: 'medium',
      });
    }
    
    // Muscle group specific rest
    Object.entries(metrics.muscleGroupFatigue).forEach(([muscleGroup, fatigue]) => {
      if (fatigue > 75) {
        recommendations.push({
          id: `muscle-rest-${muscleGroup}`,
          type: 'planned',
          title: `${muscleGroup} Rest Needed`,
          description: `Your ${muscleGroup.toLowerCase()} muscles are highly fatigued and need targeted rest.`,
          daysRecommended: 2,
          reasoning: [
            `${muscleGroup} fatigue level is ${fatigue}%`,
            'Risk of injury if continued without rest',
            'Other muscle groups can still be trained',
          ],
          alternatives: [
            `Train other muscle groups while ${muscleGroup.toLowerCase()} recovers`,
            'Light stretching and mobility work',
            'Massage or foam rolling',
          ],
          priority: 'medium',
        });
      }
    });
    
    // Preventive rest for good recovery
    if (metrics.fatigueLevel < 30 && metrics.recoveryScore > 80) {
      recommendations.push({
        id: 'preventive-rest',
        type: 'optional',
        title: 'Optional Recovery Day',
        description: 'You\'re recovering well! Consider an optional rest day to maintain this status.',
        daysRecommended: 1,
        reasoning: [
          'Currently in excellent recovery state',
          'Preventive rest can maintain performance',
          'Opportunity for other activities',
        ],
        alternatives: [
          'Light cardio or walking',
          'Mobility and flexibility work',
          'Recreational activities',
        ],
        priority: 'low',
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, []);

  // Create recovery plan
  const createRecoveryPlan = useCallback((
    metrics: RecoveryMetrics,
    patterns: FatiguePattern[],
    indicators: FatigueIndicator[]
  ): RecoveryPlan => {
    const criticalIndicators = indicators.filter(i => i.status === 'critical').length;
    const highIndicators = indicators.filter(i => i.status === 'high').length;
    const overtrainingPattern = patterns.find(p => p.type === 'overtraining');
    const deloadPattern = patterns.find(p => p.type === 'deload_needed');
    
    // Determine current phase
    let currentPhase: RecoveryPlan['currentPhase'] = 'active';
    let recommendedDuration = 0;
    let activities: string[] = [];
    let restrictions: string[] = [];
    
    if (overtrainingPattern || criticalIndicators >= 2) {
      currentPhase = 'recovery';
      recommendedDuration = 7;
      activities = [
        'Complete rest for first 2-3 days',
        'Light walking after initial rest',
        'Focus on sleep (8+ hours)',
        'Proper nutrition and hydration',
        'Stress management techniques',
      ];
      restrictions = [
        'No intense exercise',
        'Avoid additional stressors',
        'No new training programs',
      ];
    } else if (deloadPattern || metrics.fatigueLevel > 60) {
      currentPhase = 'deload';
      recommendedDuration = 7;
      activities = [
        'Reduce training intensity by 40-60%',
        'Maintain movement patterns',
        'Focus on mobility work',
        'Light cardio if desired',
        'Technique practice',
      ];
      restrictions = [
        'No personal record attempts',
        'Avoid high-intensity intervals',
        'Limit training duration',
      ];
    } else if (highIndicators >= 1 || metrics.fatigueLevel > 40) {
      currentPhase = 'maintenance';
      recommendedDuration = 3;
      activities = [
        'Continue current routine with caution',
        'Add extra rest day if needed',
        'Monitor fatigue levels closely',
        'Prioritize recovery activities',
      ];
      restrictions = [
        'Avoid increasing training volume',
        'Monitor for worsening symptoms',
      ];
    } else {
      currentPhase = 'active';
      recommendedDuration = 0;
      activities = [
        'Continue current training routine',
        'Maintain good recovery habits',
        'Regular monitoring of fatigue',
      ];
      restrictions = [];
    }
    
    const nextEvaluation = new Date();
    nextEvaluation.setDate(nextEvaluation.getDate() + Math.max(3, recommendedDuration));
    
    return {
      currentPhase,
      recommendedDuration,
      activities,
      restrictions,
      nextEvaluation: nextEvaluation.toISOString(),
    };
  }, []);

  // Actions
  const refreshAnalysis = useCallback(async () => {
    await analyzeRecovery();
  }, [analyzeRecovery]);

  const dismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    setFatigueAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  const markRecommendationFollowed = useCallback((recommendationId: string) => {
    setRestDayRecommendations(prev => 
      prev.filter(rec => rec.id !== recommendationId)
    );
  }, []);

  // Computed values
  const shouldTakeRestDay = recoveryMetrics ? 
    recoveryMetrics.fatigueLevel > 60 || recoveryMetrics.recommendedRestDays > 0 : false;
  
  const fatigueLevel: 'low' | 'moderate' | 'high' | 'critical' = recoveryMetrics ? 
    recoveryMetrics.fatigueLevel < 25 ? 'low' :
    recoveryMetrics.fatigueLevel < 50 ? 'moderate' :
    recoveryMetrics.fatigueLevel < 75 ? 'high' : 'critical'
    : 'low';

  // Effects
  useEffect(() => {
    if (workouts.length > 0) {
      analyzeRecovery();
    }
  }, [workouts.length]); // Only re-run when workout count changes

  return {
    // Core data
    recoveryMetrics,
    fatigueIndicators,
    fatiguePatterns,
    fatigueAlerts,
    recoveryInsights,
    
    // Recommendations
    restDayRecommendations,
    recoveryPlan,
    
    // Status
    isLoading,
    lastUpdated,
    
    // Actions
    refreshAnalysis,
    dismissAlert,
    markRecommendationFollowed,
    
    // Utilities
    shouldTakeRestDay,
    fatigueLevel,
    recoveryTrendData,
  };
}
