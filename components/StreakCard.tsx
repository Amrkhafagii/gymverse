/**
 * StreakCard - Previously unused, now integrated into home screen
 * Displays current streak with visual indicators and motivation
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Calendar, TrendingUp } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

export interface StreakStatus {
  isActive: boolean;
  daysUntilBreak: number;
  lastWorkoutDate: string;
  streakType: 'daily' | 'weekly' | 'custom';
}

export interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  streakStatus: StreakStatus;
  onPress: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  style?: ViewStyle;
}

export const StreakCard: React.FC<StreakCardProps> = ({
  currentStreak,
  longestStreak,
  streakStatus,
  onPress,
  variant = 'default',
  style,
}) => {
  const getStreakColor = () => {
    if (!streakStatus.isActive) return ['#6B7280', '#4B5563'];
    if (currentStreak >= 30) return ['#F59E0B', '#D97706'];
    if (currentStreak >= 14) return ['#EF4444', '#DC2626'];
    if (currentStreak >= 7) return ['#F97316', '#EA580C'];
    return ['#10B981', '#059669'];
  };

  const getStreakMessage = () => {
    if (!streakStatus.isActive) return 'Start your streak today!';
    if (currentStreak === 1) return 'Great start! Keep it up!';
    if (currentStreak >= 30) return 'Incredible dedication!';
    if (currentStreak >= 14) return 'You\'re on fire!';
    if (currentStreak >= 7) return 'Amazing consistency!';
    return 'Building momentum!';
  };

  const getFlameSize = () => {
    if (variant === 'compact') return 16;
    if (variant === 'detailed') return 28;
    return 20;
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={[styles.compactContainer, style]} onPress={onPress}>
        <LinearGradient colors={getStreakColor()} style={styles.compactGradient}>
          <Flame size={getFlameSize()} color="#FFFFFF" />
          <Text style={styles.compactStreak}>{currentStreak}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={getStreakColor()} style={styles.gradient}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Flame size={getFlameSize()} color="#FFFFFF" />
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{currentStreak}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        <Text style={styles.message}>{getStreakMessage()}</Text>

        {variant === 'detailed' && (
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <TrendingUp size={14} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.detailText}>Best: {longestStreak} days</Text>
            </View>
            <View style={styles.detailItem}>
              <Calendar size={14} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.detailText}>
                {streakStatus.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        )}

        {!streakStatus.isActive && (
          <View style={styles.inactiveOverlay}>
            <Text style={styles.inactiveText}>Streak Broken</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.md,
  },

  compactContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...DesignTokens.shadow.sm,
  },

  gradient: {
    padding: DesignTokens.spacing[4],
    minHeight: 100,
  },

  compactGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[1],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },

  iconContainer: {
    marginRight: DesignTokens.spacing[3],
  },

  streakInfo: {
    flex: 1,
  },

  streakNumber: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    lineHeight: DesignTokens.typography.fontSize.xl * 1.2,
  },

  streakLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },

  compactStreak: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  message: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: DesignTokens.spacing[2],
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: DesignTokens.spacing[2],
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  detailText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderBottomLeftRadius: DesignTokens.borderRadius.md,
  },

  inactiveText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
