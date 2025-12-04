import {
  View,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Plus, Dumbbell, Clock, Target, Users } from 'lucide-react-native';
import { Workout } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import WorkoutSearchBar from '@/components/WorkoutSearchBar';
import WorkoutQuickStartSection from '@/components/WorkoutQuickStartSection';
import WorkoutTemplatesSection from '@/components/WorkoutTemplatesSection';
import { ScreenState } from '@/components/ScreenState';
import { useTheme } from '@/theme/ThemeProvider';
import { useWorkoutsData } from '@/hooks/useWorkoutsData';
import { useCoachingPaths } from '@/hooks/useCoachingPaths';
import { getCoachingSessions, type CoachingSession } from '@/lib/supabase';
import { routes } from '@/utils/routes';

interface WorkoutCategory {
  name: string;
  exercises: number;
  duration: string;
  color: string;
  type: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function WorkoutsScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { templates: workoutTemplates, userWorkouts, loading, refetch } = useWorkoutsData(user?.id);
  const {
    activePath,
    loading: coachingLoading,
    refresh: refreshCoaching,
  } = useCoachingPaths(user?.id);
  const [workoutCategories, setWorkoutCategories] = useState<WorkoutCategory[]>([]);
  const [coachingSessions, setCoachingSessions] = useState<CoachingSession[]>([]);
  const coachingTemplateIds = useMemo(
    () => new Set(coachingSessions.map((session) => session.template_workout_id).filter(Boolean)),
    [coachingSessions]
  );
  const nextCoachingSession = useMemo(() => {
    if (coachingSessions.length === 0) return null;
    return [...coachingSessions].sort((a, b) => a.session_index - b.session_index)[0];
  }, [coachingSessions]);
  const [filteredTemplates, setFilteredTemplates] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedDuration, setSelectedDuration] = useState<string>('all');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  const generateWorkoutCategories = useCallback((templates: Workout[]) => {
    const categoryMap = new Map<string, WorkoutCategory>();

    templates.forEach((template) => {
      const type = template.workout_type || 'other';
      const key = type;

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          name: formatCategoryName(type),
          exercises: 0,
          duration: '0 min',
          color: getCategoryColor(type),
          type: type,
          difficulty: (template.difficulty_level as WorkoutCategory['difficulty']) || 'beginner',
        });
      }

      const category = categoryMap.get(key)!;
      category.exercises += 1;
      const currentDuration = parseInt(category.duration) || 0;
      const templateDuration = template.estimated_duration_minutes || 0;
      const avgDuration = Math.round((currentDuration + templateDuration) / 2);
      category.duration = `${avgDuration} min`;
    });

    setWorkoutCategories(Array.from(categoryMap.values()));
  }, []);

  const formatCategoryName = (type: string): string => {
    switch (type) {
      case 'hiit':
        return 'HIIT';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getCategoryColor = (type: string): string => {
    switch (type) {
      case 'strength':
        return '#FF6B35';
      case 'cardio':
        return '#E74C3C';
      case 'hiit':
        return '#9B59B6';
      case 'flexibility':
        return '#27AE60';
      case 'mixed':
        return '#4A90E2';
      default:
        return '#999';
    }
  };

  const filterWorkouts = useCallback(() => {
    let filtered = workoutTemplates;

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (workout) =>
          workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workout.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workout.workout_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workout.difficulty_level?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter === 'coaching') {
      filtered = filtered.filter((workout) => coachingTemplateIds.has(workout.id));
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter((workout) => (workout.workout_type || '') === selectedFilter);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(
        (workout) => (workout.difficulty_level || '').toLowerCase() === selectedDifficulty
      );
    }

    if (selectedEquipment !== 'all') {
      filtered = filtered.filter((workout) => {
        const equipmentList = (workout as Workout & { equipment?: string[] }).equipment;
        return Array.isArray(equipmentList)
          ? equipmentList.map((item) => item.toLowerCase()).includes(selectedEquipment)
          : false;
      });
    }

    if (selectedDuration !== 'all') {
      filtered = filtered.filter((workout) =>
        matchesDuration(workout.estimated_duration_minutes || 0, selectedDuration)
      );
    }

    setFilteredTemplates(filtered);
  }, [
    searchQuery,
    selectedFilter,
    workoutTemplates,
    selectedDifficulty,
    selectedEquipment,
    selectedDuration,
    coachingTemplateIds,
  ]);

  useEffect(() => {
    filterWorkouts();
  }, [filterWorkouts]);
  useEffect(() => {
    generateWorkoutCategories(workoutTemplates);
  }, [generateWorkoutCategories, workoutTemplates]);
  useEffect(() => {
    const loadCoachingSessions = async () => {
      if (!activePath) {
        setCoachingSessions([]);
        return;
      }
      const sessions = await getCoachingSessions(activePath.id);
      setCoachingSessions(sessions);
    };
    loadCoachingSessions();
  }, [activePath]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleFilterPress = () => {
    setFilterModalVisible(true);
  };

  const handleCategoryPress = (category: WorkoutCategory) => {
    setSelectedFilter(category.type);
    setSearchQuery('');
  };

  const handleWorkoutPress = (workout: Workout) => {
    router.push(routes.workoutDetail(workout.id));
  };

  const handleCreateWorkout = () => {
    router.push(routes.createWorkout);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#27AE60';
      case 'intermediate':
        return '#F39C12';
      case 'advanced':
        return '#E74C3C';
      default:
        return '#999';
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return '#FF6B35';
      case 'cardio':
        return '#E74C3C';
      case 'hiit':
        return '#9B59B6';
      case 'flexibility':
        return '#27AE60';
      case 'mixed':
        return '#4A90E2';
      default:
        return '#999';
    }
  };

  const renderTemplateSection = ({ item }: ListRenderItemInfo<Workout>) => (
    <WorkoutTemplatesSection
      loading={false}
      workoutTemplates={[item]}
      onWorkoutPress={handleWorkoutPress}
      getDifficultyColor={getDifficultyColor}
      getWorkoutTypeColor={getWorkoutTypeColor}
      searchQuery={searchQuery}
      selectedFilter={selectedFilter}
    />
  );

  const listData = useMemo(() => filteredTemplates, [filteredTemplates]);

  const skeletonItems = Array.from({ length: 4 }).map((_, i) => ({ id: `skeleton-${i}` }));

  const difficultyOptions = useMemo(() => {
    const unique = new Set<string>();
    workoutTemplates.forEach((w) => w.difficulty_level && unique.add(w.difficulty_level));
    return Array.from(unique);
  }, [workoutTemplates]);

  const typeOptions = useMemo(() => {
    const unique = new Set<string>();
    workoutTemplates.forEach((w) => w.workout_type && unique.add(w.workout_type));
    return Array.from(unique);
  }, [workoutTemplates]);

  const equipmentOptions = useMemo(() => {
    const unique = new Set<string>();
    workoutTemplates.forEach((w) => {
      const equipmentList = (w as Workout & { equipment?: string[] }).equipment;
      equipmentList?.forEach((item) => unique.add(item));
    });
    return Array.from(unique);
  }, [workoutTemplates]);

  const durationOptions = [
    { id: 'lt30', label: '< 30 min' },
    { id: '30-45', label: '30-45 min' },
    { id: '45-60', label: '45-60 min' },
    { id: 'gt60', label: '60+ min' },
  ];

  return (
    <>
      <FlashList
        style={[styles.container, { backgroundColor: colors.background }]}
        data={loading ? skeletonItems : listData}
        renderItem={(info) =>
          loading ? (
            <View style={styles.skeletonCard}>
              <View style={styles.skeletonLineShort} />
              <View style={styles.skeletonLine} />
              <View style={styles.skeletonLine} />
            </View>
          ) : (
            renderTemplateSection(info as any)
          )
        }
        estimatedItemSize={240}
        keyExtractor={(item: any) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListHeaderComponent={
          <>
            <LinearGradient colors={[colors.surface, colors.surfaceAlt]} style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={styles.headerTitle}>Workouts</Text>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateWorkout}>
                  <Plus size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.headerSubtitle}>Build your perfect routine</Text>
            </LinearGradient>

            <WorkoutSearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onFilterPress={handleFilterPress}
            />

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Dumbbell size={20} color="#FF6B35" />
                <Text style={styles.statValue}>{workoutTemplates.length}</Text>
                <Text style={styles.statLabel}>Templates</Text>
              </View>
              <View style={styles.statCard}>
                <Users size={20} color="#4A90E2" />
                <Text style={styles.statValue}>{userWorkouts.length}</Text>
                <Text style={styles.statLabel}>My Workouts</Text>
              </View>
              <View style={styles.statCard}>
                <Target size={20} color="#27AE60" />
                <Text style={styles.statValue}>{workoutCategories.length}</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
            </View>

            {user ? (
              <View style={[styles.coachingCard, { backgroundColor: colors.surface }]}>
                <View style={styles.coachingHeader}>
                  <Text style={[styles.coachingTitle, { color: colors.text }]}>Coaching Path</Text>
                  <TouchableOpacity onPress={() => refreshCoaching()} disabled={coachingLoading}>
                    <Text style={[styles.coachingAction, { color: colors.primary }]}>
                      {coachingLoading ? 'Refreshing' : 'Refresh'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {activePath ? (
                  <>
                    <Text style={[styles.coachingGoal, { color: colors.text }]}>
                      Goal: {activePath.goal_type}
                    </Text>
                    <Text style={[styles.coachingMeta, { color: colors.textMuted }]}>
                      Week {activePath.current_week} of {activePath.weeks} • {activePath.status}
                    </Text>
                  </>
                ) : (
                  <Text style={[styles.coachingMeta, { color: colors.textMuted }]}>
                    No active coaching path yet.
                  </Text>
                )}
              </View>
            ) : null}

            {activePath && nextCoachingSession ? (
              <TouchableOpacity
                style={[
                  styles.nextUpCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() =>
                  nextCoachingSession.template_workout_id
                    ? router.push(
                        routes.workoutSession(
                          nextCoachingSession.template_workout_id,
                          workoutTemplates.find(
                            (w) => w.id === nextCoachingSession.template_workout_id
                          )?.name || 'Coaching Session',
                          nextCoachingSession.id
                        )
                      )
                    : Alert.alert(
                        'No linked workout',
                        'This coaching session is missing a template.'
                      )
                }
              >
                <View style={styles.nextUpHeader}>
                  <Text style={[styles.nextUpLabel, { color: colors.textMuted }]}>Next up</Text>
                  <Text
                    style={[styles.pillSmall, { backgroundColor: colors.primary, color: '#000' }]}
                  >
                    Coaching
                  </Text>
                </View>
                <Text style={[styles.nextUpTitle, { color: colors.text }]}>
                  {workoutTemplates.find((w) => w.id === nextCoachingSession.template_workout_id)
                    ?.name || 'Session'}
                </Text>
                <Text style={[styles.nextUpMeta, { color: colors.textMuted }]}>
                  Planned {nextCoachingSession.planned_duration ?? 45} min • Session{' '}
                  {nextCoachingSession.session_index}
                </Text>
              </TouchableOpacity>
            ) : null}

            {workoutCategories.length > 0 ? (
              <WorkoutQuickStartSection
                workoutCategories={workoutCategories}
                onCategoryPress={handleCategoryPress}
                selectedCategory={selectedFilter}
              />
            ) : (
              <View style={styles.emptyCategories}>
                <Text style={styles.emptyCategoriesTitle}>No categories yet</Text>
                <Text style={styles.emptyCategoriesSubtitle}>
                  Add or import workouts to see quick-start categories.
                </Text>
              </View>
            )}

            <View style={styles.filterContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setSelectedFilter('all')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedFilter === 'all' && styles.filterChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {activePath ? (
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      selectedFilter === 'coaching' && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedFilter('coaching')}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedFilter === 'coaching' && styles.filterChipTextActive,
                      ]}
                    >
                      Coaching
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {workoutCategories.map((category) => (
                  <TouchableOpacity
                    key={category.type}
                    style={[
                      styles.filterChip,
                      selectedFilter === category.type && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedFilter(category.type)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedFilter === category.type && styles.filterChipTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.activeFilters}>
                {selectedDifficulty !== 'all' && (
                  <Text style={styles.activeFilterPill}>Difficulty: {selectedDifficulty}</Text>
                )}
                {selectedEquipment !== 'all' && (
                  <Text style={styles.activeFilterPill}>Equipment: {selectedEquipment}</Text>
                )}
                {selectedDuration !== 'all' && (
                  <Text style={styles.activeFilterPill}>
                    Duration: {durationOptions.find((d) => d.id === selectedDuration)?.label}
                  </Text>
                )}
              </View>
            </View>

            {loading && <ScreenState variant="loading" title="Loading workouts..." />}
            {!loading && filteredTemplates.length === 0 && (
              <ScreenState
                variant="empty"
                title="No workouts found"
                message="Try adjusting filters or search."
              />
            )}
          </>
        }
        ListFooterComponent={
          <>
            {user && userWorkouts.length > 0 && (
              <View style={styles.userWorkoutsSection}>
                <Text style={styles.sectionTitle}>My Workouts</Text>
                {userWorkouts.map((workout) => (
                  <TouchableOpacity
                    key={workout.id}
                    style={styles.workoutCard}
                    onPress={() => handleWorkoutPress(workout)}
                  >
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutName}>{workout.name}</Text>
                      <Text style={styles.workoutDescription}>{workout.description}</Text>
                      <View style={styles.workoutStats}>
                        <View style={styles.statItem}>
                          <Clock size={16} color="#999" />
                          <Text style={styles.statText}>
                            {workout.estimated_duration_minutes} min
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Target
                            size={16}
                            color={getDifficultyColor(workout.difficulty_level || 'beginner')}
                          />
                          <Text
                            style={[
                              styles.statText,
                              { color: getDifficultyColor(workout.difficulty_level || 'beginner') },
                            ]}
                          >
                            {workout.difficulty_level || 'beginner'}
                          </Text>
                        </View>
                        <View style={styles.statItem}>
                          <Text
                            style={[
                              styles.workoutTypeText,
                              { color: getWorkoutTypeColor(workout.workout_type || 'strength') },
                            ]}
                          >
                            {workout.workout_type || 'strength'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() => handleWorkoutPress(workout)}
                    >
                      <Text style={styles.startButtonText}>Start</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.bottomSpacer} />
          </>
        }
      />
      <Modal visible={isFilterModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Type</Text>
              <View style={styles.optionRow}>
                <FilterOptions
                  options={typeOptions}
                  selected={selectedFilter}
                  onSelect={setSelectedFilter}
                  fallbackLabel="All"
                />
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Difficulty</Text>
              <View style={styles.optionRow}>
                <FilterOptions
                  options={difficultyOptions}
                  selected={selectedDifficulty}
                  onSelect={setSelectedDifficulty}
                />
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Equipment</Text>
              <View style={styles.optionRow}>
                <FilterOptions
                  options={equipmentOptions}
                  selected={selectedEquipment}
                  onSelect={setSelectedEquipment}
                />
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Duration</Text>
              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[styles.optionChip, selectedDuration === 'all' && styles.optionChipActive]}
                  onPress={() => setSelectedDuration('all')}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedDuration === 'all' && styles.optionTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {durationOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionChip,
                      selectedDuration === option.id && styles.optionChipActive,
                    ]}
                    onPress={() => setSelectedDuration(option.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedDuration === option.id && styles.optionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => {
                setFilterModalVisible(false);
                filterWorkouts();
              }}
            >
              <Text style={styles.applyButtonText}>Apply filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const matchesDuration = (duration: number, filter: string) => {
  switch (filter) {
    case 'lt30':
      return duration > 0 && duration < 30;
    case '30-45':
      return duration >= 30 && duration <= 45;
    case '45-60':
      return duration > 45 && duration <= 60;
    case 'gt60':
      return duration > 60;
    default:
      return true;
  }
};

const FilterOptions = ({
  options,
  selected,
  onSelect,
  fallbackLabel = 'All',
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  fallbackLabel?: string;
}) => (
  <>
    <TouchableOpacity
      style={[styles.optionChip, selected === 'all' && styles.optionChipActive]}
      onPress={() => onSelect('all')}
    >
      <Text style={[styles.optionText, selected === 'all' && styles.optionTextActive]}>
        {fallbackLabel}
      </Text>
    </TouchableOpacity>
    {options.map((option) => (
      <TouchableOpacity
        key={option}
        style={[styles.optionChip, selected === option.toLowerCase() && styles.optionChipActive]}
        onPress={() => onSelect(option.toLowerCase())}
      >
        <Text
          style={[styles.optionText, selected === option.toLowerCase() && styles.optionTextActive]}
        >
          {option}
        </Text>
      </TouchableOpacity>
    ))}
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  createButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  activeFilterPill: {
    backgroundColor: '#1f2933',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#333',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterChipText: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  coachingCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  coachingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  coachingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  coachingAction: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
  },
  coachingGoal: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
  },
  coachingMeta: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  nextUpCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  nextUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nextUpLabel: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  nextUpTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  nextUpMeta: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  pillSmall: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  emptyCategories: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 16,
  },
  emptyCategoriesTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  emptyCategoriesSubtitle: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  userWorkoutsSection: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  workoutInfo: {
    flex: 1,
    marginRight: 12,
  },
  workoutName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  workoutDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
  },
  workoutTypeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  startButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  bottomSpacer: {
    height: 100,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  skeletonCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#222',
    gap: 10,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  skeletonLineShort: {
    height: 12,
    width: '40%',
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  statsContainerFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listContent: {
    paddingBottom: 60,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0f1115',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  modalClose: {
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  modalSection: {
    marginTop: 12,
  },
  modalSectionTitle: {
    color: '#ccc',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  optionChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  optionText: {
    color: '#ccc',
    fontFamily: 'Inter-Medium',
  },
  optionTextActive: {
    color: '#fff',
  },
  applyButton: {
    marginTop: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});
