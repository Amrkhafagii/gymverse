import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { Trophy, Star, Target, Award, Crown, Zap, Users, Medal } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementProgressCard from '@/components/AchievementProgressCard';
import AchievementsHeader from '@/components/AchievementsHeader';
import AchievementCategoryFilter from '@/components/AchievementCategoryFilter';
import { Achievement } from '@/lib/supabase';
import { ScreenState } from '@/components/ScreenState';
import { useTheme } from '@/theme/ThemeProvider';

export default function AchievementsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
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
    { id: 'consistency', name: 'Consistency', icon: Zap },
    { id: 'endurance', name: 'Endurance', icon: Medal },
    { id: 'social', name: 'Social', icon: Users },
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
    return achievementProgress.filter((progress) => {
      const achievement = userAchievements.find(
        (ua) => ua.achievement_id === progress.achievement_id
      )?.achievement;
      return achievement?.category === selectedCategory;
    });
  };

  const getAchievementData = (progress: any): Achievement | null => {
    if (progress.achievement) return progress.achievement;
    const userAchievement = userAchievements.find(
      (ua) => ua.achievement_id === progress.achievement_id
    );
    return userAchievement?.achievement ?? null;
  };

  const filteredProgress = getAchievementsByCategory();
  const unlockedProgress = filteredProgress.filter((p) => p.unlocked);
  const lockedProgress = filteredProgress.filter((p) => !p.unlocked);

  // Calculate completion percentage
  const completionPercentage =
    getTotalAchievements() > 0
      ? Math.round((getUnlockedCount() / getTotalAchievements()) * 100)
      : 0;

  const displayItems = useMemo(() => {
    const items: ({ type: 'header'; label: string } | { type: 'card'; data: any })[] = [];
    if (unlockedProgress.length > 0) {
      items.push({ type: 'header', label: `Unlocked (${unlockedProgress.length})` });
      unlockedProgress.forEach((p) => items.push({ type: 'card', data: p }));
    }
    if (lockedProgress.length > 0) {
      items.push({ type: 'header', label: `In Progress (${lockedProgress.length})` });
      lockedProgress.forEach((p) => items.push({ type: 'card', data: p }));
    }
    return items;
  }, [lockedProgress, unlockedProgress]);

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.sectionHeader}>
          <Target size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>{item.label}</Text>
        </View>
      );
    }
    const achievement = getAchievementData(item.data);
    if (!achievement) return null;
    return <AchievementProgressCard achievement={achievement} progress={item.data} />;
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={displayItems}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={renderItem}
      ListHeaderComponent={
        <>
          <AchievementsHeader
            unlockedCount={getUnlockedCount()}
            totalPoints={getTotalPoints()}
            completionPercentage={completionPercentage}
          />

          <View style={styles.content}>
            <AchievementCategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />

            {/* Achievement Summary */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Crown size={24} color="#FFD700" />
                    <Text style={styles.summaryValue}>{getUnlockedCount()}</Text>
                    <Text style={styles.summaryLabel}>Unlocked</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Star size={24} color="#FF6B35" />
                    <Text style={styles.summaryValue}>{getTotalPoints()}</Text>
                    <Text style={styles.summaryLabel}>Total Points</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Target size={24} color="#4A90E2" />
                    <Text style={styles.summaryValue}>{completionPercentage}%</Text>
                    <Text style={styles.summaryLabel}>Complete</Text>
                  </View>
                </View>
              </View>
            </View>

            {loading && <ScreenState variant="loading" title="Loading achievements..." />}

            {!loading && filteredProgress.length === 0 && (
              <View style={styles.emptyContainer}>
                <Trophy size={64} color="#666" />
                <Text style={styles.emptyTitle}>No achievements yet</Text>
                <Text style={styles.emptyText}>
                  Complete workouts to start unlocking achievements!
                </Text>
                <TouchableOpacity style={styles.startButton}>
                  <Text style={styles.startButtonText}>Start Your First Workout</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Motivational Section */}
            {getUnlockedCount() > 0 && (
              <View style={styles.motivationContainer}>
                <View style={styles.motivationCard}>
                  <Star size={32} color="#FFD700" />
                  <Text style={styles.motivationTitle}>Keep Going! 🎉</Text>
                  <Text style={styles.motivationText}>
                    You've unlocked {getUnlockedCount()} achievement
                    {getUnlockedCount() > 1 ? 's' : ''} and earned {getTotalPoints()} points.
                    {lockedProgress.length > 0 &&
                      ` ${lockedProgress.length} more achievement${lockedProgress.length > 1 ? 's' : ''} await${lockedProgress.length === 1 ? 's' : ''}!`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </>
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        !loading && filteredProgress.length === 0 ? (
          <ScreenState
            variant="empty"
            title="No achievements yet"
            message="Complete workouts to start unlocking achievements!"
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  summaryContainer: {
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  motivationContainer: {
    marginTop: 20,
  },
  motivationCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  motivationTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 12,
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});
