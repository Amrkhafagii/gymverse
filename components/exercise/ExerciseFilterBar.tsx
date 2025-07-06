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
  Dumbbell,
  Zap,
  Star,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface FilterOptions {
  muscleGroups: string[];
  equipment: string[];
  difficulty: string[];
  exerciseTypes: string[];
}

interface ExerciseFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: {
    muscleGroup?: string;
    equipment?: string[];
    difficulty?: string;
    exerciseType?: string;
  };
  onFiltersChange: (filters: any) => void;
  filterOptions: FilterOptions;
  showFilters: boolean;
  onToggleFilters: () => void;
  resultCount: number;
}

export const ExerciseFilterBar: React.FC<ExerciseFilterBarProps> = ({
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

  const handleFilterSelect = async (category: string, value: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (category === 'equipment') {
      const currentEquipment = filters.equipment || [];
      const newEquipment = currentEquipment.includes(value)
        ? currentEquipment.filter(eq => eq !== value)
        : [...currentEquipment, value];
      
      onFiltersChange({
        ...filters,
        equipment: newEquipment,
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
    if (filters.muscleGroup) count++;
    if (filters.equipment && filters.equipment.length > 0) count += filters.equipment.length;
    if (filters.difficulty) count++;
    if (filters.exerciseType) count++;
    return count;
  };

  const formatFilterValue = (value: string) => {
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <View style={styles.container}>
      {/* Search and Filter Toggle */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={DesignTokens.colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
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
            {resultCount} exercise{resultCount !== 1 ? 's' : ''} found
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
            <View style={styles.filterCategories}>
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
                <Text style={styles.filterCategoryText}>Muscle Groups</Text>
                {filters.muscleGroup && <View style={styles.filterCategoryDot} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterCategory,
                  activeFilterCategory === 'equipment' && styles.filterCategoryActive,
                ]}
                onPress={() => setActiveFilterCategory(
                  activeFilterCategory === 'equipment' ? null : 'equipment'
                )}
              >
                <Dumbbell size={16} color={DesignTokens.colors.text.primary} />
                <Text style={styles.filterCategoryText}>Equipment</Text>
                {filters.equipment && filters.equipment.length > 0 && (
                  <View style={styles.filterCategoryBadge}>
                    <Text style={styles.filterCategoryBadgeText}>{filters.equipment.length}</Text>
                  </View>
                )}
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
                  activeFilterCategory === 'exerciseType' && styles.filterCategoryActive,
                ]}
                onPress={() => setActiveFilterCategory(
                  activeFilterCategory === 'exerciseType' ? null : 'exerciseType'
                )}
              >
                <Star size={16} color={DesignTokens.colors.text.primary} />
                <Text style={styles.filterCategoryText}>Type</Text>
                {filters.exerciseType && <View style={styles.filterCategoryDot} />}
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            {activeFilterCategory && (
              <View style={styles.filterOptions}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
                          All
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

                  {activeFilterCategory === 'equipment' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          (!filters.equipment || filters.equipment.length === 0) && styles.filterOptionActive,
                        ]}
                        onPress={() => onFiltersChange({ ...filters, equipment: [] })}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          (!filters.equipment || filters.equipment.length === 0) && styles.filterOptionTextActive,
                        ]}>
                          All
                        </Text>
                      </TouchableOpacity>
                      {filterOptions.equipment.map((equipment) => (
                        <TouchableOpacity
                          key={equipment}
                          style={[
                            styles.filterOption,
                            filters.equipment?.includes(equipment) && styles.filterOptionActive,
                          ]}
                          onPress={() => handleFilterSelect('equipment', equipment)}
                        >
                          <Text style={[
                            styles.filterOptionText,
                            filters.equipment?.includes(equipment) && styles.filterOptionTextActive,
                          ]}>
                            {formatFilterValue(equipment)}
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
                          All
                        </Text>
                      </TouchableOpacity>
                      {filterOptions.difficulty.map((difficulty) => (
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

                  {activeFilterCategory === 'exerciseType' && (
                    <>
                      <TouchableOpacity
                        style={[
                          styles.filterOption,
                          !filters.exerciseType && styles.filterOptionActive,
                        ]}
                        onPress={() => handleFilterSelect('exerciseType', '')}
                      >
                        <Text style={[
                          styles.filterOptionText,
                          !filters.exerciseType && styles.filterOptionTextActive,
                        ]}>
                          All
                        </Text>
                      </TouchableOpacity>
                      {filterOptions.exerciseTypes.map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.filterOption,
                            filters.exerciseType === type && styles.filterOptionActive,
                          ]}
                          onPress={() => handleFilterSelect('exerciseType', type)}
                        >
                          <Text style={[
                            styles.filterOptionText,
                            filters.exerciseType === type && styles.filterOptionTextActive,
                          ]}>
                            {formatFilterValue(type)}
                          </Text>
                        </TouchableOpacity>
                      ))}
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: DesignTokens.spacing[4],
  },
  filterCategory: {
    alignItems: 'center',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    position: 'relative',
    minWidth: 70,
  },
  filterCategoryActive: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
  },
  filterCategoryText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[1],
    textAlign: 'center',
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
  filterCategoryBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCategoryBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
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
