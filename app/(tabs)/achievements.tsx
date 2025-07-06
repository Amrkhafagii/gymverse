import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';

export default function AchievementsScreen() {
  const { achievements, loading } = useData();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {unlockedAchievements.length}/{achievements.length}
            </Text>
          </View>
        </View>

        {/* Progress Overview */}
        <View style={styles.section}>
          <View style={styles.overviewCard}>
            <LinearGradient
              colors={['#9E7FFF', '#7C3AED']}
              style={styles.overviewGradient}
            >
              <View style={styles.overviewContent}>
                <Ionicons name="trophy" size={32} color="#FFFFFF" />
                <View style={styles.overviewText}>
                  <Text style={styles.overviewTitle}>
                    {unlockedAchievements.length} Unlocked
                  </Text>
                  <Text style={styles.overviewSubtitle}>
                    {lockedAchievements.length} more to go!
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(unlockedAchievements.length / achievements.length) * 100}%` }
                  ]} 
                />
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unlocked</Text>
            {unlockedAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <LinearGradient
                  colors={['#1f2937', '#111827']}
                  style={styles.achievementGradient}
                >
                  <View style={styles.achievementIcon}>
                    <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementName}>{achievement.name}</Text>
                    <Text style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    {achievement.unlocked_at && (
                      <Text style={styles.achievementDate}>
                        Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.achievementBadge}>
                    <Ionicons name="checkmark" size={20} color="#10b981" />
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>
        )}

        {/* Locked Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {unlockedAchievements.length > 0 ? 'Locked' : 'All Achievements'}
          </Text>
          {lockedAchievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <LinearGradient
                colors={['#1f2937', '#111827']}
                style={[styles.achievementGradient, styles.lockedAchievement]}
              >
                <View style={[styles.achievementIcon, styles.lockedIcon]}>
                  <Text style={[styles.achievementEmoji, styles.lockedEmoji]}>
                    {achievement.icon}
                  </Text>
                </View>
                <View style={styles.achievementContent}>
                  <Text style={[styles.achievementName, styles.lockedText]}>
                    {achievement.name}
                  </Text>
                  <Text style={[styles.achievementDescription, styles.lockedText]}>
                    {achievement.description}
                  </Text>
                  {achievement.category && (
                    <Text style={styles.achievementCategory}>
                      {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                    </Text>
                  )}
                </View>
                <View style={styles.achievementBadge}>
                  <Ionicons name="lock-closed" size={20} color="#A3A3A3" />
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Motivation */}
        <View style={styles.section}>
          <View style={styles.motivationCard}>
            <LinearGradient
              colors={['#f472b6', '#ec4899']}
              style={styles.motivationGradient}
            >
              <Ionicons name="star" size={24} color="#FFFFFF" />
              <Text style={styles.motivationTitle}>Keep Going!</Text>
              <Text style={styles.motivationText}>
                Complete workouts and hit milestones to unlock more achievements
              </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  progressBadge: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
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
  overviewCard: {
    marginBottom: 8,
  },
  overviewGradient: {
    padding: 20,
    borderRadius: 16,
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewText: {
    marginLeft: 16,
    flex: 1,
  },
  overviewTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  overviewSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    opacity: 0.9,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  achievementCard: {
    marginBottom: 12,
  },
  achievementGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  lockedAchievement: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(158, 127, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lockedIcon: {
    backgroundColor: 'rgba(163, 163, 163, 0.2)',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  lockedEmoji: {
    opacity: 0.5,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: '#10b981',
    fontFamily: 'Inter-Medium',
  },
  achievementCategory: {
    fontSize: 12,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
  },
  lockedText: {
    opacity: 0.7,
  },
  achievementBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationCard: {
    marginBottom: 20,
  },
  motivationGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    opacity: 0.9,
  },
});
