import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search,
  Filter,
  X,
  Target,
  Clock,
  Zap,
  Star,
  Crown,
  Users,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface FilterOptions {
  workoutTypes: string[];
  difficulties: string[];
  durations: string[];
  equipment: string[];
  muscleGroups: string[];
}

interface TemplateFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    workoutType?: string;
    difficulty?: string;
    duration?: string;
    equipment?: string[];
    muscleGroup?: string;
    isPremium?: boolean;
    isFeatured?: boolean;
    minRating?: number;
  };
  onFiltersChange: (filters: any) => void;
  filterOptions: FilterOptions;
  showFilters: boolean;
  onToggleFilters: () => void;
  resultCount: number;
}

export const TemplateFilterBar: React.FC<TemplateFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  filterOptions,
  showFilters,
  onToggleFilters,
  resultCount,
}) => {
  const [activeFilterCategory, setActiveFilterCategory] = useState<string | null>(null);

  const handleToggleFilters = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleFilters();
  };

  const handleFilterSelect = async (category: string, value: string | number | boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (category === 'equipment') {
      const currentEquipment = filters.equipment || [];
      const newEquipment = currentEquipment.includes(value as string)
        ? currentEquipment.filter(eq => eq !== value)
        : [...currentEquipment, value as string];
      
      onFiltersChange({
        ...filters,
        equipment: newEquipment,
      });
    } else if (category === 'isPremium' || category === 'isFeatured') {
      onFiltersChange({
        ...filters,
        [category]: filters[category as keyof typeof filters] === value ? undefined : value,
      });
    } else {
      onFiltersChange({
        ...filters,
        [category]: filters[category as keyof typeof filters] === value ? undefined : value,
      });
    }
  };

  const clearAllFilters = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onFiltersChange({});
    onSearchChange('');
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.workoutType) count++;
    if (filters.difficulty) count++;
    if (filters.duration) count++;
    if (filters.equipment && filters.equipment.length > 0) count += filters.equipment.length;
    if (filters.muscleGroup) count++;
    if (filters.isPremium) count++;
    if (filters.isFeatured) count++;
    if (filters.minRating) count++;
    return count;
  };

  const formatFilterValue = (value: string) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDurationOptions = () => [
    { value: 'quick', label: 'Quick (< 30min)' },
    { value: 'medium', label: 'Medium (30-60min)' },
    { value: 'long', label: 'Long (> 60min)' },
  ];

  const getRatingOptions = () => [
    { value: 4.5, label: '4.5+ Stars' },
    { value: 4.0, label: '4.0+ Stars' },
    { value: 3.5, label: '3.5+ Stars' },
    { value: 3.0, label: '3.0+ Stars' },
  ];

  return (
    <View style={styles.container}>
      {/* Search and Filter Toggle */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={DesignTokens.colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workout templates..."
            placeholderTextColor={DesignTokens.colors.text.secondary}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} style={styles.clearButton}>
              <X size={16} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.filterToggle,
            showFilters && styles.filterToggleActive,
            getActiveFilterCount() > 0 && styles.filterToggleWithBadge,
          ]}
          onPress={handleToggleFilters}
        >
          <Filter size={20} color={showFilters ? DesignTokens.colors.primary[500] : DesignTokens.colors.text.primary} />
          {getActiveFilterCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      {(searchQuery || getActiveFilterCount() > 0) && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {resultCount} template{resultCount !== 1 ? 's' : ''} found
          </Text>
          {getActiveFilterCount() > 0 && (
            <TouchableOpacity onPress={clearAllFilters} style={styles.clearAllButton}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter Categories */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <LinearGradient
            colors={['#1f2937', '#111827']}
            style={styles.filtersGradient}
          >
            {/* Filter Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterCategories}>
              <TouchableOpacity
                style={[
                  styles.filterCategory,
                  activeFilterCategory === 'workoutType' && styles.filterCategoryActive,
                ]}
                onPress={() => setActiveFilterCategory(
                  activeFilterCategory === 'workoutType' ? null : 'workoutType'
                )}
              >
                <Target size={16} color={DesignTokens.colors.text.primary} />
                <Text style={styles.filterCategoryText}>Type</Text>
                {filters.workoutType && <View style={styles.filterCategoryDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterCategory,
                  activeFilterCategory === 'difficulty' && styles.filterCategoryActive,
                ]}
                onPress={() => setActiveFilterCategory(
                  activeFilterCategory === 'difficulty' ? null : 'difficulty'
                )}
              >
                <Zap size={16} color={DesignTokens.colors.text.primary} />
                <Text style={styles.filterCategoryText}>Difficulty</Text>
                {filters.difficulty && <View style={styles.filterCategoryDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterCategory,
                  activeFilterCategory === 'duration' && styles.filterCategoryActive,
                ]}
                onPress={() => setActiveFilterCategory(
                  activeFilterCategory === 'duration' ? null : 'duration'
                )}
              >
                <Clock size={16} color={DesignTokens.colors.text.primary} />
                <Text style={styles.filterCategoryText}>Duration</Text>
                {filters.duration && <View style={styles.filterCategoryDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterCategory,
                  activeFilterCategory === 'muscleGroup' && styles.filterCategoryActive,
                ]}
                onPress={() => setActiveFilterCategory(
                  activeFilterCategory === 'muscleGroup' ? null : 'muscleGroup'
                )}
              >
                <Target size={16} color={DesignTokens.colors.text.primary} />
                <Text style={styles.filterCategoryText}>Muscles</Text>
                {filters.muscleGroup && <View style={styles.filterCategoryDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterCategory,
                  activeFilterCategory === 'rating' && styles.filterCategoryActive,
                ]}
                onPress={() => setActiveFilterCategory(
                  activeFilterCategory === 'rating' ? null : 'rating'
                )}
              >
                <Star size={16} color={DesignTokens.colors.text.primary} />
                <Text style={styles.filterCategoryText}>Rating</Text>
                {filters.minRating && <View style={styles.filterCategoryDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterCategory,
                  activeFilterCategory === 'special' && styles.filterCategoryActive,
                ]}
                onPress={() => setActiveFilterCategory(
                  activeFilterCategory === 'special' ? null : 'special'
                )}
              >
                <Crown size={16} color={DesignTokens.colors.text.primary} />
                <Text style={styles.filterCategoryText}>Special</Text>
                {(filters.isPremium || filters.isFeatured) && <View style={styles.filterCategoryDot} />}
              </TouchableOpacity>
            </ScrollView>

            {/* Filter Options */}
            {activeFilterCategory && (
              <View style={styles.filterOptions}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {activeFilterCategory === 'workoutType' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          !filters.workoutType && styles.filterOptionActive,
                        ]}
                        onPress={() => handleFilterSelect('workoutType', '')}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          !filters.workoutType && styles.filterOptionTextActive,
                        ]}>
                          All Types
                        </Text>
                      </TouchableOpacity>
                      {filterOptions.workoutTypes.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.filterOption,
                            filters.workoutType === type && styles.filterOptionActive,
                          ]}
                          onPress={() => handleFilterSelect('workoutType', type)}
                        >
                          <Text style={[
                            styles.filterOptionText,
                            filters.workoutType === type && styles.filterOptionTextActive,
                          ]}>
                            {formatFilterValue(type)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {activeFilterCategory === 'difficulty' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          !filters.difficulty && styles.filterOptionActive,
                        ]}
                        onPress={() => handleFilterSelect('difficulty', '')}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          !filters.difficulty && styles.filterOptionTextActive,
                        ]}>
                          All Levels
                        </Text>
                      </TouchableOpacity>
                      {filterOptions.difficulties.map((difficulty) => (
                        <TouchableOpacity
                          key={difficulty}
                          style={[
                            styles.filterOption,
                            filters.difficulty === difficulty && styles.filterOptionActive,
                          ]}
                          onPress={() => handleFilterSelect('difficulty', difficulty)}
                        >
                          <Text style={[
                            styles.filterOptionText,
                            filters.difficulty === difficulty && styles.filterOptionTextActive,
                          ]}>
                            {formatFilterValue(difficulty)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {activeFilterCategory === 'duration' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          !filters.duration && styles.filterOptionActive,
                        ]}
                        onPress={() => handleFilterSelect('duration', '')}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          !filters.duration && styles.filterOptionTextActive,
                        ]}>
                          Any Duration
                        </Text>
                      </TouchableOpacity>
                      {getDurationOptions().map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.filterOption,
                            filters.duration === option.value && styles.filterOptionActive,
                          ]}
                          onPress={() => handleFilterSelect('duration', option.value)}
                        >
                          <Text style={[
                            styles.filterOptionText,
                            filters.duration === option.value && styles.filterOptionTextActive,
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {activeFilterCategory === 'muscleGroup' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          !filters.muscleGroup && styles.filterOptionActive,
                        ]}
                        onPress={() => handleFilterSelect('muscleGroup', '')}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          !filters.muscleGroup && styles.filterOptionTextActive,
                        ]}>
                          All Muscles
                        </Text>
                      </TouchableOpacity>
                      {filterOptions.muscleGroups.map((muscle) => (
                        <TouchableOpacity
                          key={muscle}
                          style={[
                            styles.filterOption,
                            filters.muscleGroup === muscle && styles.filterOptionActive,
                          ]}
                          onPress={() => handleFilterSelect('muscleGroup', muscle)}
                        >
                          <Text style={[
                            styles.filterOptionText,
                            filters.muscleGroup === muscle && styles.filterOptionTextActive,
                          ]}>
                            {formatFilterValue(muscle)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {activeFilterCategory === 'rating' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          !filters.minRating && styles.filterOptionActive,
                        ]}
                        onPress={() => handleFilterSelect('minRating', 0)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          !filters.minRating && styles.filterOptionTextActive,
                        ]}>
                          Any Rating
                        </Text>
                      </TouchableOpacity>
                      {getRatingOptions().map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.filterOption,
                            filters.minRating === option.value && styles.filterOptionActive,
                          ]}
                          onPress={() => handleFilterSelect('minRating', option.value)}
                        >
                          <Text style={[
                            styles.filterOptionText,
                            filters.minRating === option.value && styles.filterOptionTextActive,
                          ]}>
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {activeFilterCategory === 'special' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          filters.isFeatured && styles.filterOptionActive,
                        ]}
                        onPress={() => handleFilterSelect('isFeatured', true)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.isFeatured && styles.filterOptionTextActive,
                        ]}>
                          Featured
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          filters.isPremium && styles.filterOptionActive,
                        ]}
                        onPress={() => handleFilterSelect('isPremium', true)}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          filters.isPremium && styles.filterOptionTextActive,
                        ]}>
                          Premium
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </ScrollView>
              </View>
            )}
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    paddingHorizontal: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  searchInput: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    paddingVertical: DesignTokens.spacing[3],
    marginLeft: DesignTokens.spacing[3],
  },
  clearButton: {
    padding: DesignTokens.spacing[1],
  },
  filterToggle: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
    position: 'relative',
  },
  filterToggleActive: {
    borderColor: DesignTokens.colors.primary[500],
    backgroundColor: DesignTokens.colors.primary[500] + '20',
  },
  filterToggleWithBadge: {
    borderColor: DesignTokens.colors.primary[500],
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[1],
  },
  resultsText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  clearAllButton: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
  },
  clearAllText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  filtersContainer: {
    marginTop: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
  },
  filtersGradient: {
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  filterCategories: {
    marginBottom: DesignTokens.spacing[4],
  },
  filterCategory: {
    alignItems: 'center',
    padding: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    position: 'relative',
    marginRight: DesignTokens.spacing[3],
    minWidth: 80,
  },
  filterCategoryActive: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
  },
  filterCategoryText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[1],
    textAlign: 'center',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  filterCategoryDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DesignTokens.colors.primary[500],
  },
  filterOptions: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[4],
  },
  filterOption: {
    backgroundColor: DesignTokens.colors.neutral[800],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    marginRight: DesignTokens.spacing[2],
  },
  filterOptionActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  filterOptionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  filterOptionTextActive: {
    color: DesignTokens.colors.text.primary,
  },
});
