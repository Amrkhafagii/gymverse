import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { profile, streak, achievements, loading } = useData();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{profile?.username || 'GymVerse User'}</Text>
            <Text style={styles.date}>{todayDate}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#9E7FFF', '#7C3AED']}
                style={styles.statGradient}
              >
                <Ionicons name="flame" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>{streak?.current_streak || 0}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#f472b6', '#ec4899']}
                style={styles.statGradient}
              >
                <Ionicons name="trophy" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>{unlockedAchievements}</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#38bdf8', '#0ea5e9']}
                style={styles.statGradient}
              >
                <Ionicons name="trending-up" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>{streak?.longest_streak || 0}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#262626', '#171717']}
                style={styles.actionGradient}
              >
                <Ionicons name="play" size={32} color="#9E7FFF" />
                <Text style={styles.actionTitle}>Start Workout</Text>
                <Text style={styles.actionSubtitle}>Begin your session</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <LinearGradient
                colors={['#262626', '#171717']}
                style={styles.actionGradient}
              >
                <Ionicons name="create" size={32} color="#f472b6" />
                <Text style={styles.actionTitle}>Custom Workout</Text>
                <Text style={styles.actionSubtitle}>Create your own</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Focus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Focus</Text>
          <View style={styles.focusCard}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.focusGradient}
            >
              <View style={styles.focusHeader}>
                <Ionicons name="flash" size={24} color="#38bdf8" />
                <Text style={styles.focusTitle}>Upper Body Strength</Text>
              </View>
              <Text style={styles.focusDescription}>
                Focus on building upper body strength with compound movements
              </Text>
              <View style={styles.focusStats}>
                <View style={styles.focusStat}>
                  <Ionicons name="time" size={16} color="#A3A3A3" />
                  <Text style={styles.focusStatText}>45 min</Text>
                </View>
                <View style={styles.focusStat}>
                  <Ionicons name="fitness" size={16} color="#A3A3A3" />
                  <Text style={styles.focusStatText}>6 exercises</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.activityGradient}
            >
              <Text style={styles.activityTitle}>No recent workouts</Text>
              <Text style={styles.activitySubtitle}>
                Start your first workout to see your progress here
              </Text>
              <TouchableOpacity style={styles.activityButton}>
                <Text style={styles.activityButtonText}>Get Started</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Motivation Quote */}
        <View style={styles.section}>
          <View style={styles.quoteCard}>
            <LinearGradient
              colors={['#9E7FFF', '#7C3AED']}
              style={styles.quoteGradient}
            >
              <Text style={styles.quote}>
                "The only bad workout is the one that didn't happen."
              </Text>
              <Text style={styles.quoteAuthor}>- Unknown</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  username: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  actionGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  actionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 12,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  focusCard: {
    marginBottom: 8,
  },
  focusGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  focusTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 12,
  },
  focusDescription: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 16,
  },
  focusStats: {
    flexDirection: 'row',
  },
  focusStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  focusStatText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  activityCard: {
    marginBottom: 8,
  },
  activityGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  activityTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  activityButton: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  activityButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  quoteCard: {
    marginBottom: 20,
  },
  quoteGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  quote: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    opacity: 0.8,
  },
});
