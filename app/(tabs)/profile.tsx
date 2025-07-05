import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Settings, 
  Trophy, 
  Calendar, 
  Users, 
  Activity,
  Target,
  Award,
  TrendingUp
} from 'lucide-react-native';
import { useData } from '@/contexts/DataContext';

export default function ProfileScreen() {
  const { currentUser, userWorkouts, userAchievements } = useData();

  if (!currentUser) {
    return null;
  }

  const stats = [
    { label: 'Workouts', value: userWorkouts.length, icon: Activity, color: '#FF6B35' },
    { label: 'Followers', value: currentUser.followers_count, icon: Users, color: '#9E7FFF' },
    { label: 'Following', value: currentUser.following_count, icon: TrendingUp, color: '#00D4AA' },
    { label: 'Achievements', value: userAchievements.length, icon: Trophy, color: '#FFD700' },
  ];

  const recentAchievements = userAchievements.slice(0, 3);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: currentUser.avatar_url }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{currentUser.full_name}</Text>
              <Text style={styles.username}>@{currentUser.username}</Text>
              {currentUser.bio && (
                <Text style={styles.bio}>{currentUser.bio}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <stat.icon size={20} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value.toLocaleString()}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Recent Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award size={20} color="#FFD700" />
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
          </View>
          
          {recentAchievements.length > 0 ? (
            <View style={styles.achievementsGrid}>
              {recentAchievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Trophy size={48} color="#333" />
              <Text style={styles.emptyStateText}>No achievements yet</Text>
              <Text style={styles.emptyStateSubtext}>Complete workouts to earn your first achievement!</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#FF6B35', '#FF8C42']}
                style={styles.actionGradient}
              >
                <Target size={24} color="#fff" />
                <Text style={styles.actionText}>Set Goals</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <LinearGradient
                colors={['#9E7FFF', '#B794FF']}
                style={styles.actionGradient}
              >
                <Calendar size={24} color="#fff" />
                <Text style={styles.actionText}>Schedule</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workout Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{userWorkouts.length}</Text>
              <Text style={styles.summaryLabel}>Total Workouts</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {userWorkouts.reduce((total, workout) => total + workout.duration, 0)}m
              </Text>
              <Text style={styles.summaryLabel}>Total Time</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {userWorkouts.reduce((total, workout) => total + (workout.calories_burned || 0), 0)}
              </Text>
              <Text style={styles.summaryLabel}>Calories Burned</Text>
            </View>
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
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9E7FFF',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#A3A3A3',
    lineHeight: 20,
  },
  settingsButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#A3A3A3',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 8,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    borderWidth: 1,
    borderColor: '#333',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#A3A3A3',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#A3A3A3',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#A3A3A3',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
    marginHorizontal: 16,
  },
});
