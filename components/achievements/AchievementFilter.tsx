import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Filter, X } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface AchievementFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  showDifficulty?: boolean;
  selectedDifficulty?: string;
  onDifficultySelect?: (difficulty: string) => void;
  showStatus?: boolean;
  selectedStatus?: string;
  onStatusSelect?: (status: string) => void;
}

const DIFFICULTY_LEVELS = ['Bronze', 'Silver', 'Gold', 'Platinum'];
const STATUS_OPTIONS = ['all', 'unlocked', 'locked', 'in_progress'];

export const AchievementFilter: React.FC<AchievementFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  showDifficulty = false,
  selectedDifficulty = 'all',
  onDifficultySelect,
  showStatus = false,
  selectedStatus = 'all',
  onStatusSelect,
}) => {
  const getCategoryDisplayName = (category: string): string => {
    if (category === 'all') return 'All Categories';
    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Bronze':
        return '#CD7F32';
      case 'Silver':
        return '#C0C0C0';
      case 'Gold':
        return '#FFD700';
      case 'Platinum':
        return '#E5E4E2';
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'unlocked':
        return DesignTokens.colors.success[500];
      case 'locked':
        return DesignTokens.colors.error[500];
      case 'in_progress':
        return DesignTokens.colors.warning[500];
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  const getStatusDisplayName = (status: string): string => {
    switch (status) {
      case 'all':
        return 'All Status';
      case 'unlocked':
        return 'Unlocked';
      case 'locked':
        return 'Locked';
      case 'in_progress':
        return 'In Progress';
      default:
        return status;
    }
  };

  const hasActiveFilters = selectedCategory !== 'all' || 
                          (showDifficulty && selectedDifficulty !== 'all') ||
                          (showStatus && selectedStatus !== 'all');

  const clearAllFilters = () => {
    onCategorySelect('all');
    if (showDifficulty && onDifficultySelect) {
      onDifficultySelect('all');
    }
    if (showStatus && onStatusSelect) {
      onStatusSelect('all');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Filter size={20} color={DesignTokens.colors.text.primary} />
          <Text style={styles.title}>Filters</Text>
        </View>
        
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
            <X size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Category</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                selectedCategory === category && styles.filterChipActive,
              ]}
              onPress={() => onCategorySelect(category)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === category && styles.filterChipTextActive,
                ]}
              >
                {getCategoryDisplayName(category)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Difficulty Filter */}
      {showDifficulty && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Difficulty</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedDifficulty === 'all' && styles.filterChipActive,
              ]}
              onPress={() => onDifficultySelect?.('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedDifficulty === 'all' && styles.filterChipTextActive,
                ]}
              >
                All Levels
              </Text>
            </TouchableOpacity>
            
            {DIFFICULTY_LEVELS.map((difficulty) => (
              <TouchableOpacity
                key={difficulty}
                style={[
                  styles.filterChip,
                  styles.difficultyChip,
                  selectedDifficulty === difficulty && [
                    styles.filterChipActive,
                    { backgroundColor: getDifficultyColor(difficulty) + '20' }
                  ],
                ]}
                onPress={() => onDifficultySelect?.(difficulty)}
              >
                <View 
                  style={[
                    styles.difficultyIndicator,
                    { backgroundColor: getDifficultyColor(difficulty) }
                  ]} 
                />
                <Text
                  style={[
                    styles.filterChipText,
                    selectedDifficulty === difficulty && [
                      styles.filterChipTextActive,
                      { color: getDifficultyColor(difficulty) }
                    ],
                  ]}
                >
                  {difficulty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Status Filter */}
      {showStatus && (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Status</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterChip,
                  selectedStatus === status && [
                    styles.filterChipActive,
                    { backgroundColor: getStatusColor(status) + '20' }
                  ],
                ]}
                onPress={() => onStatusSelect?.(status)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedStatus === status && [
                      styles.filterChipTextActive,
                      { color: getStatusColor(status) }
                    ],
                  ]}
                >
                  {getStatusDisplayName(status)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <View style={styles.activeFilters}>
          <Text style={styles.activeFiltersLabel}>Active filters:</Text>
          <View style={styles.activeFiltersList}>
            {selectedCategory !== 'all' && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterTagText}>
                  {getCategoryDisplayName(selectedCategory)}
                </Text>
              </View>
            )}
            {showDifficulty && selectedDifficulty !== 'all' && (
              <View style={[
                styles.activeFilterTag,
                { backgroundColor: getDifficultyColor(selectedDifficulty!) + '20' }
              ]}>
                <Text style={[
                  styles.activeFilterTagText,
                  { color: getDifficultyColor(selectedDifficulty!) }
                ]}>
                  {selectedDifficulty}
                </Text>
              </View>
            )}
            {showStatus && selectedStatus !== 'all' && (
              <View style={[
                styles.activeFilterTag,
                { backgroundColor: getStatusColor(selectedStatus!) + '20' }
              ]}>
                <Text style={[
                  styles.activeFilterTagText,
                  { color: getStatusColor(selectedStatus!) }
                ]}>
                  {getStatusDisplayName(selectedStatus!)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  clearButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  filterSection: {
    marginBottom: DesignTokens.spacing[4],
  },
  filterLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  filterScrollContent: {
    paddingRight: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[2],
  },
  filterChip: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: DesignTokens.colors.surface.primary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[700],
  },
  filterChipActive: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    borderColor: DesignTokens.colors.primary[500],
  },
  filterChipText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  filterChipTextActive: {
    color: DesignTokens.colors.primary[500],
  },
  difficultyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  difficultyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeFilters: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[3],
  },
  activeFiltersLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[2],
  },
  activeFiltersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
  },
  activeFilterTag: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    backgroundColor: DesignTokens.colors.primary[500] + '20',
  },
  activeFilterTagText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
