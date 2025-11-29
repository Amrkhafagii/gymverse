import { View, StyleSheet, Text, RefreshControl, TouchableOpacity, FlatList, ListRenderItemInfo, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Plus, Filter, Search, Dumbbell, Clock, Target, TrendingUp, Users } from 'lucide-react-native';
import { supabase, Workout } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import WorkoutSearchBar from '@/components/WorkoutSearchBar';
import WorkoutQuickStartSection from '@/components/WorkoutQuickStartSection';
import WorkoutTemplatesSection from '@/components/WorkoutTemplatesSection';
import WorkoutCategoryCard from '@/components/WorkoutCategoryCard';
import { ScreenState } from '@/components/ScreenState';
import { useTheme } from '@/theme/ThemeProvider';
import { useWorkoutsData } from '@/hooks/useWorkoutsData';
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
  const [filteredTemplates, setFilteredTemplates] = useState<Workout[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const [workoutCategories, setWorkoutCategories] = useState<WorkoutCategory[]>([]);

  useEffect(() => {
    filterWorkouts();
  }, [workoutTemplates, searchQuery, selectedFilter]);
  useEffect(() => {
    generateWorkoutCategories(workoutTemplates);
  }, [workoutTemplates]);

  const generateWorkoutCategories = (templates: Workout[]) => {
    const categoryMap = new Map<string, WorkoutCategory>();

    templates.forEach(template => {
      const type = template.workout_type;
      const key = type;

      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          name: formatCategoryName(type),
          exercises: 0,
          duration: '0 min',
          color: getCategoryColor(type),
          type: type,
          difficulty: template.difficulty_level,
        });
      }

      const category = categoryMap.get(key)!;
      category.exercises += 1;
      const currentDuration = parseInt(category.duration) || 0;
      const templateDuration = template.estimated_duration_minutes || 0;
      const avgDuration = Math.round((currentDuration + templateDuration) / 2);
      category.duration = `${avgDuration} min`;
    });

    if (categoryMap.size === 0) {
      const defaultCategories: WorkoutCategory[] = [
        { name: 'Strength', exercises: 0, duration: '45 min', color: '#FF6B35', type: 'strength', difficulty: 'intermediate' },
        { name: 'Cardio', exercises: 0, duration: '30 min', color: '#E74C3C', type: 'cardio', difficulty: 'beginner' },
        { name: 'HIIT', exercises: 0, duration: '25 min', color: '#9B59B6', type: 'hiit', difficulty: 'intermediate' },
        { name: 'Flexibility', exercises: 0, duration: '20 min', color: '#27AE60', type: 'flexibility', difficulty: 'beginner' },
      ];
      setWorkoutCategories(defaultCategories);
    } else {
      setWorkoutCategories(Array.from(categoryMap.values()));
    }
  };

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

  const filterWorkouts = () => {
    let filtered = workoutTemplates;

    if (searchQuery.trim()) {
      filtered = filtered.filter(workout =>
        workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.workout_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workout.difficulty_level.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(workout => workout.workout_type === selectedFilter);
    }

    setFilteredTemplates(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleFilterPress = () => {
    console.log('Filter pressed - implement filter modal');
  };

  const handleCategoryPress = (category: WorkoutCategory) => {
    setSelectedFilter(category.type);
    setSearchQuery('');
  };

  const handleWorkoutPress = (workout: Workout) => {
    router.push(routes.workoutDetail(workout.id));
  };

  const handleCreateWorkout = () => {
    router.push(routes.createWorkout as any);
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

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={listData}
      renderItem={renderTemplateSection}
      keyExtractor={(item) => item.id.toString()}
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

          <WorkoutQuickStartSection
            workoutCategories={workoutCategories}
            onCategoryPress={handleCategoryPress}
            selectedCategory={selectedFilter}
          />

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  selectedFilter === 'all' && styles.filterChipActive
                ]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === 'all' && styles.filterChipTextActive
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {workoutCategories.map((category) => (
                <TouchableOpacity
                  key={category.type}
                  style={[
                    styles.filterChip,
                    selectedFilter === category.type && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedFilter(category.type)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedFilter === category.type && styles.filterChipTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {loading && <ScreenState variant="loading" title="Loading workouts..." />}
          {!loading && filteredTemplates.length === 0 && (
            <ScreenState variant="empty" title="No workouts found" message="Try adjusting filters or search." />
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
                        <Text style={styles.statText}>{workout.estimated_duration_minutes} min</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Target size={16} color={getDifficultyColor(workout.difficulty_level)} />
                        <Text style={[styles.statText, { color: getDifficultyColor(workout.difficulty_level) }]}>
                          {workout.difficulty_level}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={[styles.workoutTypeText, { color: getWorkoutTypeColor(workout.workout_type) }]}>
                          {workout.workout_type}
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
  );
}

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
});
