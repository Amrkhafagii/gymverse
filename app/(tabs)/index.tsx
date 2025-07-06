import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock,
  Flame,
  Award,
  ChevronRight,
  Play
} from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const quickStats = [
    { label: 'Streak', value: '12', unit: 'days', icon: Flame, color: '#FF6B6B' },
    { label: 'This Week', value: '4', unit: 'workouts', icon: Target, color: '#4ECDC4' },
    { label: 'Total Time', value: '8.5', unit: 'hours', icon: Clock, color: '#45B7D1' },
    { label: 'PR Count', value: '23', unit: 'records', icon: Award, color: '#96CEB4' },
  ];

  const recentWorkouts = [
    {
      id: 1,
      name: 'Push Day - Chest & Triceps',
      date: 'Today',
      duration: '45 min',
      exercises: 6,
      image: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 2,
      name: 'Pull Day - Back & Biceps',
      date: 'Yesterday',
      duration: '52 min',
      exercises: 7,
      image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const quickActions = [
    { title: 'Start Workout', icon: Play, action: () => router.push('/workout-session') },
    { title: 'View Progress', icon: TrendingUp, action: () => router.push('/(tabs)/progress') },
    { title: 'Schedule', icon: Calendar, action: () => router.push('/schedule') },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>Alex</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                    <IconComponent size={20} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statUnit}>{stat.unit}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.actionButton}
                  onPress={action.action}
                >
                  <LinearGradient
                    colors={['#9E7FFF', '#7C3AED']}
                    style={styles.actionGradient}
                  >
                    <IconComponent size={24} color="#FFFFFF" />
                    <Text style={styles.actionText}>{action.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Workouts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <TouchableOpacity onPress={() => router.push('/workout-history')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => router.push('/workout-detail')}
            >
              <Image source={{ uri: workout.image }} style={styles.workoutImage} />
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutMeta}>
                  {workout.date} • {workout.duration} • {workout.exercises} exercises
                </Text>
              </View>
              <ChevronRight size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Goal */}
        <View style={styles.section}>
          <View style={styles.goalCard}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.goalGradient}
            >
              <View style={styles.goalContent}>
                <Target size={32} color="#FFFFFF" />
                <View style={styles.goalText}>
                  <Text style={styles.goalTitle}>Today's Goal</Text>
                  <Text style={styles.goalDescription}>Complete your Push Day workout</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.goalButton}
                onPress={() => router.push('/workout-session')}
              >
                <Text style={styles.goalButtonText}>Start Now</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  userName: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    width: (width - 56) / 2,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  statUnit: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  goalCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  goalGradient: {
    padding: 20,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalText: {
    marginLeft: 16,
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  goalDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    opacity: 0.9,
    marginTop: 4,
  },
  goalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  goalButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
});
