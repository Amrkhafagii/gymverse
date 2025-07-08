import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  Dimensions 
} from 'react-native';
import { AchievementBadge } from './AchievementBadge';
import { Achievement, AchievementEngine } from '@/lib/achievementEngine';
import { useAchievements, useAchievementUtils } from '@/hooks/useAchievements';

const { width } = Dimensions.get('window');

interface AchievementGridProps {
  achievements?: Achievement[];
  columns?: number;
  showProgress?: boolean;
  showFilters?: boolean;
  onAchievementPress?: (achievement: Achievement) => void;
}

type FilterType = 'all' | 'unlocked' | 'locked' | string;

export function AchievementGrid({
  achievements: propAchievements,
  columns = 3,
  showProgress = true,
  showFilters = true,
  onAchievementPress,
}: AchievementGridProps) {
  const { achievements: contextAchievements } = useAchievements();
  const { getCategoryColor, getRarityColor } = useAchievementUtils();
  
  const achievements = propAchievements || contextAchievements;
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  
  const categories = AchievementEngine.getCategories();
  const rarities = AchievementEngine.getRarities();

  const getFilteredAchievements = (): Achievement[] => {
    switch (selectedFilter) {
      case 'all':
        return achievements;
      case 'unlocked':
        return achievements.filter(a => a.unlocked);
      case 'locked':
        return achievements.filter(a => !a.unlocked);
      default:
        // Check if it's a category or rarity filter
        if (categories[selectedFilter]) {
          return achievements.filter(a => a.category === selectedFilter);
        }
        if (rarities[selectedFilter]) {
          return achievements.filter(a => a.rarity === selectedFilter);
        }
        return achievements;
    }
  };

  const filteredAchievements = getFilteredAchievements();
  const itemWidth = (width - 40 - (columns - 1) * 12) / columns;

  const FilterButton = ({ filter, label, color }: { 
    filter: FilterType; 
    label: string; 
    color?: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
        color && selectedFilter === filter && { backgroundColor: color }
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderAchievement = ({ item, index }: { item: Achievement; index: number }) => (
    <View style={[styles.achievementItem, { width: itemWidth }]}>
      <AchievementBadge
        achievement={item}
        size="medium"
        showProgress={showProgress}
        onPress={() => onAchievementPress?.(item)}
      />
    </View>
  );

  const renderStats = () => {
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalPoints = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{achievements.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalPoints}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {Math.round((unlockedCount / achievements.length) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Stats */}
      {renderStats()}

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            <FilterButton filter="all" label="All" />
            <FilterButton filter="unlocked" label="Unlocked" color="#10B981" />
            <FilterButton filter="locked" label="Locked" color="#6B7280" />
            
            {/* Category Filters */}
            {Object.entries(categories).map(([key, category]) => (
              <FilterButton
                key={key}
                filter={key}
                label={category.name}
                color={category.color}
              />
            ))}
            
            {/* Rarity Filters */}
            {Object.entries(rarities).map(([key, rarity]) => (
              <FilterButton
                key={key}
                filter={key}
                label={rarity.name}
                color={rarity.color}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Achievement Grid */}
      <FlatList
        data={filteredAchievements}
        renderItem={renderAchievement}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🏆</Text>
          <Text style={styles.emptyStateTitle}>No achievements found</Text>
          <Text style={styles.emptyStateText}>
            Try changing your filter or complete more workouts to unlock achievements
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  filtersSection: {
    marginBottom: 16,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  gridContainer: {
    padding: 20,
    gap: 12,
  },
  achievementItem: {
    marginRight: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
