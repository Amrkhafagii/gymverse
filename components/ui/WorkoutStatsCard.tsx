import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DesignTokens } from '@/design-system/tokens';

interface WorkoutStatsCardProps {
  stats: {
    totalExercises: number;
    totalSets: number;
    estimatedDuration: number;
    averageRest: number;
    muscleGroups: string[];
    equipment: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    calories?: number;
  };
}

export const WorkoutStatsCard: React.FC<WorkoutStatsCardProps> = ({ stats }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#10B981';
      case 'intermediate':
        return '#F59E0B';
      case 'advanced':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#2a2a2a']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout Overview</Text>
        <View style={[
          styles.difficultyBadge,
          { backgroundColor: getDifficultyColor(stats.difficulty) }
        ]}>
          <Text style={styles.difficultyText}>
            {stats.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Main Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalExercises}</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalSets}</Text>
          <Text style={styles.statLabel}>Total Sets</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatDuration(stats.estimatedDuration)}
          </Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.averageRest}s</Text>
          <Text style={styles.statLabel}>Avg Rest</Text>
        </View>
      </View>

      {/* Secondary Stats */}
      {stats.calories && (
        <View style={styles.caloriesContainer}>
          <LinearGradient
            colors={['#FF6B3520', '#FF6B3510']}
            style={styles.caloriesCard}
          >
            <Text style={styles.caloriesValue}>~{stats.calories}</Text>
            <Text style={styles.caloriesLabel}>Estimated Calories</Text>
          </LinearGradient>
        </View>
      )}

      {/* Muscle Groups */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Target Muscles</Text>
        <View style={styles.muscleGroups}>
          {stats.muscleGroups.slice(0, 6).map((muscle, index) => (
            <View key={index} style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>{muscle}</Text>
            </View>
          ))}
          {stats.muscleGroups.length > 6 && (
            <View style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>
                +{stats.muscleGroups.length - 6}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Equipment */}
      {stats.equipment.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Needed</Text>
          <View style={styles.equipmentList}>
            {stats.equipment.slice(0, 4).map((item, index) => (
              <View key={index} style={styles.equipmentTag}>
                <Text style={styles.equipmentTagText}>{item}</Text>
              </View>
            ))}
            {stats.equipment.length > 4 && (
              <View style={styles.equipmentTag}>
                <Text style={styles.equipmentTagText}>
                  +{stats.equipment.length - 4} more
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing[5],
    ...DesignTokens.shadow.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[5],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  difficultyBadge: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
  },
  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: DesignTokens.spacing[4],
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[3],
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  caloriesContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  caloriesCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
  },
  caloriesValue: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: '#FF6B35',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  caloriesLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  section: {
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[3],
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    backgroundColor: `${DesignTokens.colors.primary[500]}20`,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    marginRight: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },
  muscleTagText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentTag: {
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    marginRight: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[2],
  },
  equipmentTagText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'capitalize',
  },
});
