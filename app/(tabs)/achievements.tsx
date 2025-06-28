import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Trophy, Star, Target, Award, Filter } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementProgressCard from '@/components/AchievementProgressCard';
import AchievementsHeader from '@/components/AchievementsHeader';
import AchievementCategoryFilter from '@/components/AchievementCategoryFilter';
import { Achievement } from '@/lib/supabase';

export default function AchievementsScreen() {
  const { user } = useAuth();
  const {
    userAchievements,
    achievementProgress,
    loading,
    getTotalPoints,
    getUnlockedCount,
    getTotalAchievements,
    refreshAchievements,
    refreshProgress,
  } = useAchievements(user?.id || null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: Target },
    { id: 'workout', name: 'Workout', icon: Trophy },
    { id: 'strength', name: 'Strength', icon: Award },
    { id: 'consistency', name: 'Consistency', icon: Star },
    { id: 'endurance', name: 'Endurance', icon: Target },
    { id: 'social', name: 'Social', icon: Trophy },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshAchievements(), refreshProgress()]);
    setRefreshing(false);
  };

  const getAchievementsByCategory = () => {
    if (selectedCategory === 'all') {
      return achievementProgress;
    }
    return achievementProgress.filter(progress => {
      const achievement = userAchievements.find(ua => ua.achievement_id === progress.achievement_id)?.achievement;
      return achievement?.category === selectedCategory;
    });
  };

  const getAchievementData = (progress: any): Achievement | null => {
    const userAchievement = userAchievements.find(ua => ua.achievement_id === progress.achievement_id);
    if (userAchievement) {
      return userAchievement.achievement;
    }
    return null;
  };

  const filteredProgress = getAchievementsByCategory();
  const unlockedProgress = filteredProgress.filter(p => p.unlocked);
  const lockedProgress = filteredProgress.filter(p => !p.unlocked);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <AchievementsHeader
        unlockedCount={getUnlockedCount()}
        totalPoints={getTotalPoints()}
        completionPercentage={Math.round((getUnlockedCount() / getTotalAchievements()) * 100)}
      />

      <View style={styles.content}>
        <AchievementCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {unlockedProgress.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Unlocked ({unlockedProgress.length})</Text>
            {unlockedProgress.map((progress) => {
              const achievement = getAchievementData(progress);
              if (!achievement) return null;
              
              return (
                <AchievementProgressCard
                  key={progress.achievement_id}
                  achievement={achievement}
                  progress={progress}
                />
              );
            })}
          </View>
        )}

        {lockedProgress.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress ({lockedProgress.length})</Text>
            {lockedProgress.map((progress) => {
              const achievement = getAchievementData(progress);
              if (!achievement) return null;
              
              return (
                <AchievementProgressCard
                  key={progress.achievement_id}
                  achievement={achievement}
                  progress={progress}
                />
              );
            })}
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading achievements...</Text>
          </View>
        )}

        {!loading && filteredProgress.length === 0 && (
          <View style={styles.emptyContainer}>
            <Trophy size={48} color="#666" />
            <Text style={styles.emptyTitle}>No achievements yet</Text>
            <Text style={styles.emptyText}>
              Complete workouts to start unlocking achievements!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});