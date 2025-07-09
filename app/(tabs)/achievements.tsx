import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, Target, Award, TrendingUp, Filter } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { AchievementGrid } from '@/components/AchievementGrid';
import { AchievementBadge } from '@/components/AchievementBadge';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { AchievementProgress } from '@/components/achievements/AchievementProgress';
import { AchievementStats } from '@/components/achievements/AchievementStats';
import { AchievementFilter } from '@/components/achievements/AchievementFilter';
import { AchievementNotification } from '@/components/achievements/AchievementNotification';
import { useAchievements } from '@/hooks/useAchievements';
import { useLocalAchievements } from '@/hooks/useLocalAchievements';

const { width } = Dimensions.get('window');

export default function AchievementsScreen() {
  const {
    achievements,
    unlockedAchievements,
    recentUnlocks,
    totalPoints,
    isLoading,
    refreshAchievements,
  } = useAchievements();

  const {
    achievements: localAchievements,
    categories,
    getAchievementsByCategory,
    getProgressStats,
  } = useLocalAchievements();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const progressStats = getProgressStats();
  const filteredAchievements = selectedCategory === 'all' 
    ? localAchievements 
    : getAchievementsByCategory(selectedCategory);

  useEffect(() => {
    // Initialize achievements on mount
    refreshAchievements();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAchievements();
    setRefreshing(false);
  };

  const handleAchievementPress = (achievement: any) => {
    // Handle achievement press - could show modal with details
    console.log('Achievement pressed:', achievement.name || achievement.title);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setShowFilters(false);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[DesignTokens.colors.primary[600], DesignTokens.colors.primary[500]]}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <Trophy size={32} color="#FFFFFF" />
          <Text style={styles.title}>Achievements</Text>
        </View>
        
        <Text style={styles.subtitle}>
          {unlockedAchievements.length} of {achievements.length || localAchievements.length} unlocked
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Award size={20} color="#FFFFFF" />
            <Text style={styles.statValue}>{totalPoints.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          
          <View style={styles.statItem}>
            <Star size={20} color="#FFFFFF" />
            <Text style={styles.statValue}>{progressStats.completionRate}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
          
          <View style={styles.statItem}>
            <TrendingUp size={20} color="#FFFFFF" />
            <Text style={styles.statValue}>{recentUnlocks.length}</Text>
            <Text style={styles.statLabel}>Recent</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} color="#FFFFFF" />
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Text style={styles.viewToggleText}>
              {viewMode === 'grid' ? 'List' : 'Grid'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderRecentUnlocks = () => {
    if (recentUnlocks.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Unlocks 🎉</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentUnlocks}
        >
          {recentUnlocks.map((achievement, index) => (
            <View key={achievement.id || index} style={styles.recentUnlockItem}>
              <AchievementBadge
                achievement={achievement}
                size="medium"
                onPress={() => handleAchievementPress(achievement)}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAchievementStats = () => (
    <View style={styles.section}>
      <AchievementStats
        totalAchievements={achievements.length || localAchievements.length}
        unlockedCount={unlockedAchievements.length}
        totalPoints={totalPoints}
        categories={categories}
        progressStats={progressStats}
      />
    </View>
  );

  const renderFilters = () => {
    if (!showFilters) return null;

    return (
      <View style={styles.filtersContainer}>
        <AchievementFilter
          categories={['all', ...categories]}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategoryFilter}
        />
      </View>
    );
  };

  const renderAchievements = () => {
    if (viewMode === 'grid') {
      return (
        <View style={styles.section}>
          <AchievementGrid
            achievements={filteredAchievements}
            columns={2}
            showProgress={true}
            showFilters={false}
            onAchievementPress={handleAchievementPress}
          />
        </View>
      );
    }

    return (
      <View style={styles.section}>
        {filteredAchievements.map((achievement, index) => (
          <AchievementCard
            key={achievement.id || index}
            achievement={achievement}
            onPress={() => handleAchievementPress(achievement)}
            variant="detailed"
            style={styles.achievementCard}
          />
        ))}
      </View>
    );
  };

  const renderProgressSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Progress Overview</Text>
      <AchievementProgress
        achievements={filteredAchievements}
        showCategoryBreakdown={true}
        showRecentActivity={true}
      />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Trophy size={48} color={DesignTokens.colors.primary[500]} />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderFilters()}
        {renderRecentUnlocks()}
        {renderAchievementStats()}
        {renderProgressSection()}
        {renderAchievements()}
        
        {/* Achievement Notifications */}
        <AchievementNotification />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: DesignTokens.spacing[4],
  },
  
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  
  scrollView: {
    flex: 1,
  },
  
  header: {
    paddingTop: DesignTokens.spacing[6],
    paddingBottom: DesignTokens.spacing[6],
    paddingHorizontal: DesignTokens.spacing[5],
    borderBottomLeftRadius: DesignTokens.borderRadius.xl,
    borderBottomRightRadius: DesignTokens.borderRadius.xl,
    marginBottom: DesignTokens.spacing[5],
    ...DesignTokens.shadow.lg,
  },
  
  headerContent: {
    alignItems: 'center',
  },
  
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
  },
  
  title: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: DesignTokens.spacing[4],
  },
  
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: DesignTokens.spacing[4],
  },
  
  statItem: {
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  
  statValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  headerActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[2],
  },
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },
  
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  
  viewToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },
  
  viewToggleText: {
    color: '#FFFFFF',
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  
  filtersContainer: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[4],
  },
  
  recentUnlocks: {
    paddingRight: DesignTokens.spacing[5],
    gap: DesignTokens.spacing[3],
  },
  
  recentUnlockItem: {
    // Individual styling handled by AchievementBadge
  },
  
  achievementCard: {
    marginBottom: DesignTokens.spacing[3],
  },
});
