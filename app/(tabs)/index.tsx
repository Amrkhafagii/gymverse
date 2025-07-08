import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StreakCard } from '@/components/StreakCard';
import { useStreakTracking } from '@/hooks/useStreakTracking';
import { useWorkoutHistory } from '@/contexts/WorkoutHistoryContext';
import { useAchievements } from '@/contexts/AchievementContext';

export default function HomeScreen() {
  const router = useRouter();
  const { streakData } = useStreakTracking();
  const { stats } = useWorkoutHistory();
  const { recentUnlocks, totalPoints } = useAchievements();

  const quickStats = [
    {
      label: 'Total Workouts',
      value: stats.totalWorkouts.toString(),
      icon: '🏋️',
      color: '#3B82F6',
    },
    {
      label: 'This Week',
      value: stats.workoutsThisWeek.toString(),
      icon: '📅',
      color: '#10B981',
    },
    {
      label: 'Achievement Points',
      value: totalPoints.toString(),
      icon: '🏆',
      color: '#F59E0B',
    },
    {
      label: 'Longest Streak',
      value: `${streakData.longestStreak} days`,
      icon: '🔥',
      color: '#EF4444',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>GymVerse</Text>
        <Text style={styles.subtitle}>Your Fitness Journey</Text>
      </View>

      {/* Streak Card */}
      <StreakCard />

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          {quickStats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <View style={styles.statInfo}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Recent Achievements */}
      {recentUnlocks.length > 0 && (
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Recent Achievements 🎉</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {recentUnlocks.slice(0, 5).map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementPoints}>+{achievement.points} pts</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
            onPress={() => router.push('/workout-session')}
          >
            <Text style={styles.actionIcon}>🏋️</Text>
            <Text style={styles.actionText}>Start Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10B981' }]}
            onPress={() => router.push('/progress')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>View Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
            onPress={() => router.push('/achievements')}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionText}>Achievements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => router.push('/social')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Social</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Motivational Quote */}
      <View style={styles.quoteContainer}>
        <Text style={styles.quoteIcon}>💭</Text>
        <Text style={styles.quoteText}>
          "The groundwork for all happiness is good health."
        </Text>
        <Text style={styles.quoteAuthor}>- Leigh Hunt</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsContainer: {
    padding: 20,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  achievementCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quoteContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quoteIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
