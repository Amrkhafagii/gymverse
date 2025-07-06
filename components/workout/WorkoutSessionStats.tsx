import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Clock,
  Target,
  TrendingUp,
  Zap,
  Award,
  Activity,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface WorkoutSessionStatsProps {
  totalDuration: number;
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
  personalBests: number;
  estimatedCalories: number;
  averageRestTime: number;
}

export default function WorkoutSessionStats({
  totalDuration,
  completedSets,
  totalSets,
  completedExercises,
  totalExercises,
  personalBests,
  estimatedCalories,
  averageRestTime,
}: WorkoutSessionStatsProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getCompletionPercentage = () => {
    if (totalSets === 0) return 0;
    return Math.round((completedSets / totalSets) * 100);
  };

  const getExerciseProgress = () => {
    if (totalExercises === 0) return 0;
    return Math.round((completedExercises / totalExercises) * 100);
  };

  const stats = [
    {
      icon: Clock,
      label: 'Duration',
      value: formatTime(totalDuration),
      color: DesignTokens.colors.primary[500],
      gradient: ['#9E7FFF', '#7C3AED'],
    },
    {
      icon: Target,
      label: 'Sets',
      value: `${completedSets}/${totalSets}`,
      subtitle: `${getCompletionPercentage()}% complete`,
      color: DesignTokens.colors.success[500],
      gradient: ['#10b981', '#059669'],
    },
    {
      icon: Activity,
      label: 'Exercises',
      value: `${completedExercises}/${totalExercises}`,
      subtitle: `${getExerciseProgress()}% done`,
      color: DesignTokens.colors.warning[500],
      gradient: ['#f59e0b', '#d97706'],
    },
    {
      icon: TrendingUp,
      label: 'Personal Bests',
      value: personalBests.toString(),
      subtitle: personalBests > 0 ? 'New records!' : 'Keep pushing!',
      color: DesignTokens.colors.error[500],
      gradient: ['#ef4444', '#dc2626'],
    },
    {
      icon: Zap,
      label: 'Est. Calories',
      value: estimatedCalories.toString(),
      subtitle: 'kcal burned',
      color: '#f472b6',
      gradient: ['#f472b6', '#ec4899'],
    },
    {
      icon: Award,
      label: 'Avg Rest',
      value: formatTime(averageRestTime),
      subtitle: 'between sets',
      color: '#06b6d4',
      gradient: ['#06b6d4', '#0891b2'],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
        <Text style={styles.title}>Session Stats</Text>
        
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <LinearGradient colors={stat.gradient} style={styles.statGradient}>
                <View style={styles.statIcon}>
                  <stat.icon size={20} color={DesignTokens.colors.text.primary} />
                </View>
                
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  {stat.subtitle && (
                    <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
                  )}
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Progress Indicators */}
        <View style={styles.progressSection}>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressPercentage}>{getCompletionPercentage()}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getCompletionPercentage()}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Exercise Progress</Text>
              <Text style={styles.progressPercentage}>{getExerciseProgress()}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  styles.exerciseProgressFill,
                  { width: `${getExerciseProgress()}%` }
                ]} 
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
  },
  gradient: {
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[4],
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },
  statCard: {
    width: '48%',
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  statGradient: {
    padding: DesignTokens.spacing[3],
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  statIcon: {
    marginBottom: DesignTokens.spacing[2],
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
    marginBottom: DesignTokens.spacing[1],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    opacity: 0.9,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: DesignTokens.spacing[1],
  },
  progressSection: {
    gap: DesignTokens.spacing[3],
  },
  progressItem: {
    backgroundColor: DesignTokens.colors.neutral[850],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  progressLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  progressPercentage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  progressBar: {
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 4,
  },
  exerciseProgressFill: {
    backgroundColor: DesignTokens.colors.warning[500],
  },
});
