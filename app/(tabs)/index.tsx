import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Clock,
  Flame,
  Zap,
  ChevronRight,
  Calculator,
  Plus,
  Grid3X3,
  X,
  Dumbbell,
  Users,
  Settings,
  BookOpen,
  Camera,
  Share2,
  Award,
  BarChart3,
  Timer,
  Heart,
  MapPin,
  Bell,
  Search,
} from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { workouts, achievements } = useData();
  const router = useRouter();
  const [showAllActions, setShowAllActions] = useState(false);

  const todayWorkouts = workouts.filter(
    workout => new Date(workout.date).toDateString() === new Date().toDateString()
  );

  const weeklyStats = {
    workoutsCompleted: 4,
    totalMinutes: 240,
    caloriesBurned: 1200,
    streak: 7,
  };

  // Primary Quick Actions (Most Used)
  const primaryActions = [
    { 
      icon: Zap, 
      title: 'Quick Workout', 
      subtitle: '15 min HIIT', 
      color: '#FF6B35',
      onPress: () => {
        // Navigate to quick workout
      }
    },
    { 
      icon: Calculator, 
      title: 'TDEE Calculator', 
      subtitle: 'Calculate daily calories', 
      color: '#00D4AA',
      onPress: () => {
        router.push('/tdee-calculator');
      }
    },
    { 
      icon: Target, 
      title: 'Today\'s Goal', 
      subtitle: '3 exercises left', 
      color: '#9E7FFF',
      onPress: () => {
        // Navigate to goals
      }
    },
    { 
      icon: Plus, 
      title: 'More Actions', 
      subtitle: 'View all features', 
      color: '#666',
      onPress: () => setShowAllActions(true)
    },
  ];

  // Categorized Secondary Actions
  const secondaryActions = {
    'Workout & Training': [
      { icon: Dumbbell, title: 'Custom Workout', subtitle: 'Create your own', color: '#FF6B35' },
      { icon: Timer, title: 'Rest Timer', subtitle: 'Track your breaks', color: '#FFB800' },
      { icon: BookOpen, title: 'Exercise Library', subtitle: 'Browse exercises', color: '#00D4AA' },
      { icon: Calendar, title: 'Schedule Workout', subtitle: 'Plan ahead', color: '#9E7FFF' },
    ],
    'Progress & Analytics': [
      { icon: TrendingUp, title: 'Progress Charts', subtitle: 'View your growth', color: '#00D4AA' },
      { icon: BarChart3, title: 'Detailed Stats', subtitle: 'Advanced metrics', color: '#9E7FFF' },
      { icon: Award, title: 'Achievements', subtitle: 'Your milestones', color: '#FFB800' },
      { icon: Camera, title: 'Progress Photos', subtitle: 'Visual tracking', color: '#FF6B35' },
    ],
    'Social & Community': [
      { icon: Users, title: 'Find Friends', subtitle: 'Connect with others', color: '#9E7FFF' },
      { icon: Share2, title: 'Share Progress', subtitle: 'Post achievements', color: '#00D4AA' },
      { icon: Trophy, title: 'Leaderboards', subtitle: 'See rankings', color: '#FFB800' },
      { icon: Heart, title: 'Challenges', subtitle: 'Join competitions', color: '#FF6B35' },
    ],
    'Tools & Settings': [
      { icon: Settings, title: 'Settings', subtitle: 'App preferences', color: '#666' },
      { icon: Bell, title: 'Notifications', subtitle: 'Manage alerts', color: '#9E7FFF' },
      { icon: MapPin, title: 'Gym Locator', subtitle: 'Find nearby gyms', color: '#00D4AA' },
      { icon: Search, title: 'Search', subtitle: 'Find anything', color: '#FFB800' },
    ],
  };

  const renderActionModal = () => (
    <Modal
      visible={showAllActions}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAllActions(false)}
    >
      <View style={styles.modalContainer}>
        <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.modalGradient}>
          <SafeAreaView style={styles.modalSafeArea}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Features</Text>
              <TouchableOpacity 
                onPress={() => setShowAllActions(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalContent}>
              {Object.entries(secondaryActions).map(([category, actions]) => (
                <View key={category} style={styles.categorySection}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  <View style={styles.categoryGrid}>
                    {actions.map((action, index) => (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.modalActionCard}
                        onPress={() => {
                          setShowAllActions(false);
                          action.onPress?.();
                        }}
                      >
                        <View style={[styles.modalActionIcon, { backgroundColor: `${action.color}20` }]}>
                          <action.icon size={20} color={action.color} />
                        </View>
                        <Text style={styles.modalActionTitle}>{action.title}</Text>
                        <Text style={styles.modalActionSubtitle}>{action.subtitle}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </Modal>
  );

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

          {/* Weekly Stats - Condensed */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Trophy size={20} color="#FFB800" />
                <Text style={styles.statNumber}>{weeklyStats.workoutsCompleted}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statCard}>
                <Clock size={20} color="#9E7FFF" />
                <Text style={styles.statNumber}>{weeklyStats.totalMinutes}</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </View>
              <View style={styles.statCard}>
                <Flame size={20} color="#FF6B35" />
                <Text style={styles.statNumber}>{weeklyStats.caloriesBurned}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
            </View>
          </View>

          {/* Primary Quick Actions - Reorganized */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {primaryActions.map((action, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.quickActionCard}
                  onPress={action.onPress}
                >
                  <LinearGradient
                    colors={[`${action.color}20`, `${action.color}10`]}
                    style={styles.quickActionGradient}
                  >
                    <action.icon size={24} color={action.color} />
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                    {action.title === 'More Actions' && (
                      <View style={styles.moreActionsBadge}>
                        <Grid3X3 size={12} color="#666" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Today's Workouts - Streamlined */}
          <View style={styles.todayContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Workouts</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color="#9E7FFF" />
              </TouchableOpacity>
            </View>
            
            {todayWorkouts.length > 0 ? (
              todayWorkouts.slice(0, 1).map((workout) => (
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

          {/* Recent Achievements - Condensed */}
          <View style={styles.achievementsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Achievements</Text>
              <TouchableOpacity style={styles.seeAllButton}>
                <Text style={styles.seeAllText}>View All</Text>
                <ChevronRight size={16} color="#9E7FFF" />
              </TouchableOpacity>
            </View>
            {achievements.slice(0, 2).map((achievement) => (
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

        {/* Action Modal */}
        {renderActionModal()}
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
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumber: {
    fontSize: 20,
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
    position: 'relative',
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
  moreActionsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 4,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginVertical: 20,
  },
  categoryTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalActionCard: {
    width: (width - 52) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalActionTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalActionSubtitle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});
