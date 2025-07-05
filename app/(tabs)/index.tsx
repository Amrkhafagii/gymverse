import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Flame,
  Zap,
  ChevronRight,
} from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { workouts, achievements } = useData();

  const todayWorkouts = workouts.filter(
    workout => new Date(workout.date).toDateString() === new Date().toDateString()
  );

  const weeklyStats = {
    workoutsCompleted: 4,
    totalMinutes: 240,
    caloriesBurned: 1200,
    streak: 7,
  };

  const quickActions = [
    { icon: Zap, title: 'Quick Workout', subtitle: '15 min HIIT', color: '#FF6B35' },
    { icon: Target, title: 'Today\'s Goal', subtitle: '3 exercises left', color: '#9E7FFF' },
    { icon: Calendar, title: 'Schedule', subtitle: 'Plan your week', color: '#00D4AA' },
    { icon: TrendingUp, title: 'Progress', subtitle: 'View stats', color: '#FFB800' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good morning!</Text>
              <Text style={styles.username}>Ready to crush your goals?</Text>
            </View>
            <View style={styles.streakContainer}>
              <Flame size={20} color="#FF6B35" />
              <Text style={styles.streakText}>{weeklyStats.streak} day streak</Text>
            </View>
          </View>

          {/* Weekly Stats */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Trophy size={24} color="#FFB800" />
                <Text style={styles.statNumber}>{weeklyStats.workoutsCompleted}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statCard}>
                <Clock size={24} color="#9E7FFF" />
                <Text style={styles.statNumber}>{weeklyStats.totalMinutes}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statCard}>
                <Flame size={24} color="#FF6B35" />
                <Text style={styles.statNumber}>{weeklyStats.caloriesBurned}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity key={index} style={styles.quickActionCard}>
                  <LinearGradient
                    colors={[`${action.color}20`, `${action.color}10`]}
                    style={styles.quickActionGradient}
                  >
                    <action.icon size={24} color={action.color} />
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Today's Workouts */}
          <View style={styles.todayContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Workouts</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color="#9E7FFF" />
              </TouchableOpacity>
            </View>
            
            {todayWorkouts.length > 0 ? (
              todayWorkouts.slice(0, 2).map((workout) => (
                <TouchableOpacity key={workout.id} style={styles.workoutCard}>
                  <LinearGradient
                    colors={['#1a1a1a', '#2a2a2a']}
                    style={styles.workoutCardGradient}
                  >
                    <View style={styles.workoutHeader}>
                      <Text style={styles.workoutName}>{workout.name}</Text>
                      <View style={styles.workoutBadge}>
                        <Text style={styles.workoutBadgeText}>{workout.exercises.length} exercises</Text>
                      </View>
                    </View>
                    <Text style={styles.workoutDescription}>{workout.description}</Text>
                    <View style={styles.workoutStats}>
                      <View style={styles.workoutStat}>
                        <Clock size={16} color="#999" />
                        <Text style={styles.workoutStatText}>{workout.duration} min</Text>
                      </View>
                      <View style={styles.workoutStat}>
                        <Target size={16} color="#999" />
                        <Text style={styles.workoutStatText}>{workout.targetMuscles.join(', ')}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Calendar size={48} color="#666" />
                <Text style={styles.emptyStateTitle}>No workouts scheduled</Text>
                <Text style={styles.emptyStateText}>Plan your first workout to get started</Text>
                <TouchableOpacity style={styles.planWorkoutButton}>
                  <LinearGradient
                    colors={['#9E7FFF', '#7C3AED']}
                    style={styles.planWorkoutGradient}
                  >
                    <Text style={styles.planWorkoutText}>Plan Workout</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Recent Achievements */}
          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            {achievements.slice(0, 3).map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementIcon}>
                  <Trophy size={20} color="#FFB800" />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
                <Text style={styles.achievementDate}>
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  username: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  streakText: {
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginLeft: 6,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumber: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 52) / 2,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    textAlign: 'center',
  },
  todayContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#9E7FFF',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    marginRight: 4,
  },
  workoutCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  workoutCardGradient: {
    padding: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  workoutBadge: {
    backgroundColor: '#9E7FFF20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  workoutBadgeText: {
    color: '#9E7FFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workoutStatText: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  planWorkoutButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  planWorkoutGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  planWorkoutText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  achievementsContainer: {
    paddingHorizontal: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB80020',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});
