/**
 * WorkoutStatsOverview - Previously unused, now integrated into workout summary
 * Comprehensive workout statistics with visual indicators and comparisons
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Clock, 
  Dumbbell, 
  Target, 
  TrendingUp,
  Award,
  Zap,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

export interface WorkoutStats {
  duration: number; // in minutes
  totalSets: number;
  completedSets: number;
  totalVolume: number; // in kg
  averageRestTime: number; // in seconds
  personalRecords: number;
  caloriesBurned: number;
  muscleGroups: string[];
  exerciseCount: number;
  intensityScore: number; // 1-10
}

export interface WorkoutComparison {
  previousWorkout?: {
    duration: number;
    totalVolume: number;
    totalSets: number;
  };
  personalBests?: {
    longestDuration: number;
    highestVolume: number;
    mostSets: number;
  };
  averages?: {
    duration: number;
    volume: number;
    sets: number;
  };
}

export interface WorkoutStatsOverviewProps {
  stats: WorkoutStats;
  comparison?: WorkoutComparison;
  showComparison?: boolean;
  variant?: 'summary' | 'detailed';
}

export const WorkoutStatsOverview: React.FC<WorkoutStatsOverviewProps> = ({
  stats,
  comparison,
  showComparison = true,
  variant = 'summary',
}) => {
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k kg`;
    return `${volume.toFixed(0)} kg`;
  };

  const formatRestTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCompletionPercentage = (): number => {
    return (stats.completedSets / stats.totalSets) * 100;
  };

  const getIntensityColor = (intensity: number): string[] => {
    if (intensity >= 8) return ['#EF4444', '#DC2626']; // High intensity - Red
    if (intensity >= 6) return ['#F59E0B', '#D97706']; // Medium intensity - Orange
    if (intensity >= 4) return ['#10B981', '#059669']; // Low-medium intensity - Green
    return ['#6B7280', '#4B5563']; // Low intensity - Gray
  };

  const getIntensityLabel = (intensity: number): string => {
    if (intensity >= 8) return 'High';
    if (intensity >= 6) return 'Medium';
    if (intensity >= 4) return 'Moderate';
    return 'Light';
  };

  const getComparisonIndicator = (current: number, previous?: number) => {
    if (!previous) return null;
    
    const change = ((current - previous) / previous) * 100;
    const isImprovement = change > 0;
    
    return {
      change: Math.abs(change),
      isImprovement,
      icon: isImprovement ? <TrendingUp size={12} color={DesignTokens.colors.success[500]} /> : 
                           <TrendingUp size={12} color={DesignTokens.colors.error[500]} style={{ transform: [{ rotate: '180deg' }] }} />,
      color: isImprovement ? DesignTokens.colors.success[500] : DesignTokens.colors.error[500],
    };
  };

  const StatCard = ({ 
    icon, 
    label, 
    value, 
    comparison: comparisonValue,
    color = DesignTokens.colors.primary[500] 
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    comparison?: number;
    color?: string;
  }) => {
    const indicator = typeof comparisonValue === 'number' ? 
      getComparisonIndicator(parseFloat(value.replace(/[^\d.]/g, '')), comparisonValue) : null;

    return (
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          {React.cloneElement(icon as React.ReactElement, { 
            size: 16, 
            color 
          })}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
        {indicator && showComparison && (
          <View style={styles.comparisonIndicator}>
            {indicator.icon}
            <Text style={[styles.comparisonText, { color: indicator.color }]}>
              {indicator.change.toFixed(1)}%
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout Summary</Text>
        <BarChart3 size={20} color={DesignTokens.colors.primary[500]} />
      </View>

      {/* Completion Status */}
      <View style={styles.completionSection}>
        <LinearGradient 
          colors={getIntensityColor(stats.intensityScore)} 
          style={styles.completionGradient}
        >
          <View style={styles.completionHeader}>
            <Text style={styles.completionTitle}>
              {getCompletionPercentage().toFixed(0)}% Complete
            </Text>
            <Text style={styles.intensityLabel}>
              {getIntensityLabel(stats.intensityScore)} Intensity
            </Text>
          </View>
          
          <View style={styles.completionBar}>
            <View 
              style={[
                styles.completionFill, 
                { width: `${getCompletionPercentage()}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.completionText}>
            {stats.completedSets} of {stats.totalSets} sets completed
          </Text>
        </LinearGradient>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon={<Clock />}
          label="Duration"
          value={formatDuration(stats.duration)}
          comparison={comparison?.previousWorkout?.duration}
          color="#3B82F6"
        />
        
        <StatCard
          icon={<Dumbbell />}
          label="Total Volume"
          value={formatVolume(stats.totalVolume)}
          comparison={comparison?.previousWorkout?.totalVolume}
          color="#10B981"
        />
        
        <StatCard
          icon={<Target />}
          label="Sets"
          value={`${stats.completedSets}/${stats.totalSets}`}
          comparison={comparison?.previousWorkout?.totalSets}
          color="#F59E0B"
        />
        
        <StatCard
          icon={<Award />}
          label="Personal Records"
          value={stats.personalRecords.toString()}
          color="#EF4444"
        />
      </View>

      {variant === 'detailed' && (
        <>
          {/* Secondary Stats */}
          <View style={styles.secondaryStats}>
            <StatCard
              icon={<Zap />}
              label="Calories Burned"
              value={stats.caloriesBurned.toString()}
              color="#8B5CF6"
            />
            
            <StatCard
              icon={<Clock />}
              label="Avg Rest Time"
              value={formatRestTime(stats.averageRestTime)}
              color="#06B6D4"
            />
            
            <StatCard
              icon={<Calendar />}
              label="Exercises"
              value={stats.exerciseCount.toString()}
              color="#84CC16"
            />
          </View>

          {/* Muscle Groups */}
          <View style={styles.muscleGroupsSection}>
            <Text style={styles.sectionTitle}>Muscle Groups Trained</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.muscleGroupsScroll}
            >
              {stats.muscleGroups.map((muscle, index) => (
                <View key={index} style={styles.muscleGroupTag}>
                  <Text style={styles.muscleGroupText}>{muscle}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Personal Bests Comparison */}
          {comparison?.personalBests && showComparison && (
            <View style={styles.personalBestsSection}>
              <Text style={styles.sectionTitle}>Personal Bests</Text>
              <View style={styles.personalBestsGrid}>
                <View style={styles.personalBestItem}>
                  <Text style={styles.personalBestLabel}>Duration</Text>
                  <Text style={styles.personalBestValue}>
                    {formatDuration(comparison.personalBests.longestDuration)}
                  </Text>
                  <Text style={styles.personalBestStatus}>
                    {stats.duration >= comparison.personalBests.longestDuration ? '🏆 New Record!' : 'Best'}
                  </Text>
                </View>
                
                <View style={styles.personalBestItem}>
                  <Text style={styles.personalBestLabel}>Volume</Text>
                  <Text style={styles.personalBestValue}>
                    {formatVolume(comparison.personalBests.highestVolume)}
                  </Text>
                  <Text style={styles.personalBestStatus}>
                    {stats.totalVolume >= comparison.personalBests.highestVolume ? '🏆 New Record!' : 'Best'}
                  </Text>
                </View>
                
                <View style={styles.personalBestItem}>
                  <Text style={styles.personalBestLabel}>Sets</Text>
                  <Text style={styles.personalBestValue}>
                    {comparison.personalBests.mostSets}
                  </Text>
                  <Text style={styles.personalBestStatus}>
                    {stats.completedSets >= comparison.personalBests.mostSets ? '🏆 New Record!' : 'Best'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing[5],
    ...DesignTokens.shadow.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },

  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  completionSection: {
    marginBottom: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },

  completionGradient: {
    padding: DesignTokens.spacing[4],
  },

  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },

  completionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  intensityLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  completionBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: DesignTokens.spacing[2],
    overflow: 'hidden',
  },

  completionFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },

  completionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },

  secondaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[5],
  },

  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
  },

  statIcon: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    marginBottom: DesignTokens.spacing[2],
  },

  statValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },

  statLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },

  comparisonIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginTop: DesignTokens.spacing[1],
  },

  comparisonText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  muscleGroupsSection: {
    marginBottom: DesignTokens.spacing[5],
  },

  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },

  muscleGroupsScroll: {
    marginTop: DesignTokens.spacing[2],
  },

  muscleGroupTag: {
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    marginRight: DesignTokens.spacing[2],
  },

  muscleGroupText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  personalBestsSection: {
    marginBottom: DesignTokens.spacing[4],
  },

  personalBestsGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },

  personalBestItem: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
    alignItems: 'center',
  },

  personalBestLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },

  personalBestValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },

  personalBestStatus: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.success[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textAlign: 'center',
  },
});
