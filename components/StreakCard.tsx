import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { UserStreak, getStreakTypeInfo, getNextMilestone, calculateStreakMultiplier } from '@/lib/streaks';

interface StreakCardProps {
  streak: UserStreak;
  onPress?: () => void;
}

export default function StreakCard({ streak, onPress }: StreakCardProps) {
  const streakType = getStreakTypeInfo(streak.streak_type);
  const nextMilestone = getNextMilestone(streak.current_count);
  const multiplier = calculateStreakMultiplier(streak.current_count);
  
  if (!streakType) return null;

  const progress = nextMilestone 
    ? streak.current_count / nextMilestone.days 
    : 1;

  const getStreakGradient = (isActive: boolean, count: number) => {
    if (!isActive) return ['#6B7280', '#4B5563'];
    if (count >= 100) return ['#F59E0B', '#D97706']; // Legendary
    if (count >= 50) return ['#8B5CF6', '#7C3AED']; // Epic
    if (count >= 30) return ['#EF4444', '#DC2626']; // Rare
    if (count >= 7) return ['#10B981', '#059669']; // Uncommon
    return [streakType.color, streakType.color + '80']; // Common
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={getStreakGradient(streak.is_active, streak.current_count)}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{streakType.icon}</Text>
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakName}>{streakType.name}</Text>
            <Text style={styles.streakDescription}>{streakType.description}</Text>
          </View>
          {multiplier > 1 && (
            <View style={styles.multiplierBadge}>
              <Text style={styles.multiplierText}>{multiplier}x</Text>
            </View>
          )}
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streak.current_count}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streak.best_count}</Text>
            <Text style={styles.statLabel}>Best</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statusText, { color: streak.is_active ? '#10B981' : '#EF4444' }]}>
              {streak.is_active ? 'Active' : 'Broken'}
            </Text>
          </View>
        </View>

        {nextMilestone && streak.is_active && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.nextMilestoneText}>
                Next: {nextMilestone.title}
              </Text>
              <Text style={styles.progressText}>
                {streak.current_count}/{nextMilestone.days}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
            </View>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  streakInfo: {
    flex: 1,
  },
  streakName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  streakDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Regular',
  },
  multiplierBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  multiplierText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextMilestoneText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Inter-Medium',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Inter-Medium',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
});
