import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  BookOpen,
  Star,
  TrendingUp,
  Zap,
  Target,
  Plus,
  Bookmark,
  Play,
  Award,
  Brain,
  Users,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { ExerciseFilterBar } from '@/components/exercise/ExerciseFilterBar';
import { 
  EXERCISE_DATABASE,
  ExerciseData,
  getExercisesByMuscleGroup,
  getExercisesByEquipment,
  getExercisesByDifficulty,
  getExercisesByType,
  searchExercises,
  getPopularExercises,
  getCompoundExercises,
  MUSCLE_GROUPS,
  EQUIPMENT_LIST,
  EXERCISE_TYPES
} from '@/lib/data/exerciseDatabase';
import * as Haptics from 'expo-haptics';

type ViewMode = 'discover' | 'popular' | 'bookmarked' | 'recent' | 'all';

export default function ExerciseLibraryScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    muscleGroup?: string;
    equipment?: string[];
    difficulty?: string;
    exerciseType?: string;
  }>({});
  const [bookmarkedExercises, setBookmarkedExercises] = useState<string[]>([]);
  const [recentExercises, setRecentExercises] = useState<string[]>([]);

  // Mock personal stats - in real app, this would come from API/database
  const personalStats = {
    'push-up': { totalSessions: 15, maxWeight: 0, lastPerformed: '2024-01-20' },
    'squat': { totalSessions: 12, maxWeight: 80, lastPerformed: '2024-01-19' },
    'deadlift': { totalSessions: 8, maxWeight: 120, lastPerformed: '2024-01-18' },
  };

  const filterOptions = {
    muscleGroups: MUSCLE_GROUPS,
    equipment: EQUIPMENT_LIST,
    difficulty: ['beginner', 'intermediate', 'advanced'],
    exerciseTypes: EXERCISE_TYPES,
  };

  const filteredExercises = useMemo(() => {
    let exercises = EXERCISE_DATABASE;

    // Apply search filter
    if (searchQuery.trim()) {
      exercises = searchExercises(searchQuery.trim());
    }

    // Apply category filters
    if (filters.muscleGroup) {
      exercises = exercises.filter(ex => ex.muscle_groups.includes(filters.muscleGroup!));
    }

    if (filters.equipment && filters.equipment.length > 0) {
      exercises = exercises.filter(ex => 
        filters.equipment!.some(eq => ex.equipment.includes(eq)) ||
        (filters.equipment!.includes('bodyweight') && ex.equipment.length === 0)
      );
    }

    if (filters.difficulty) {
      exercises = exercises.filter(ex => ex.difficulty_level === filters.difficulty);
    }

    if (filters.exerciseType) {
      exercises = exercises.filter(ex => ex.exercise_type === filters.exerciseType);
    }

    // Apply view mode filters
    switch (viewMode) {
      case 'popular':
        return getPopularExercises(50).filter(ex => exercises.includes(ex));
      case 'bookmarked':
        return exercises.filter(ex => bookmarkedExercises.includes(ex.id));
      case 'recent':
        return exercises.filter(ex => recentExercises.includes(ex.id));
      case 'discover':
      case 'all':
      default:
        return exercises;
    }
  }, [searchQuery, filters, viewMode, bookmarkedExercises, recentExercises]);

  const featuredExercises = getPopularExercises(3);
  const compoundExercises = getCompoundExercises().slice(0, 5);
  const beginnerFriendly = EXERCISE_DATABASE.filter(ex => ex.difficulty_level === 'beginner').slice(0, 5);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleViewModeChange = async (mode: ViewMode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(mode);
  };

  const handleExercisePress = async (exercise: ExerciseData) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Add to recent exercises
    setRecentExercises(prev => {
      const updated = [exercise.id, ...prev.filter(id => id !== exercise.id)];
      return updated.slice(0, 10); // Keep only last 10
    });

    router.push({
      pathname: '/exercise-detail',
      params: { exerciseId: exercise.id }
    });
  };

  const handleBookmark = async (exerciseId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setBookmarkedExercises(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  const handleQuickStart = async (exercise: ExerciseData) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Quick Start',
      `Start a quick workout with ${exercise.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => router.push({
            pathname: '/workout-session',
            params: { exerciseId: exercise.id, mode: 'quick' }
          })
        },
      ]
    );
  };

  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'discover': return 'Discover Exercises';
      case 'popular': return 'Popular Exercises';
      case 'bookmarked': return 'Bookmarked Exercises';
      case 'recent': return 'Recent Exercises';
      case 'all': return 'All Exercises';
      default: return 'Exercise Library';
    }
  };

  const getViewModeDescription = () => {
    switch (viewMode) {
      case 'discover': return 'Curated exercises for your fitness journey';
      case 'popular': return 'Most loved exercises by the community';
      case 'bookmarked': return `${bookmarkedExercises.length} saved exercises`;
      case 'recent': return `${recentExercises.length} recently viewed`;
      case 'all': return `${EXERCISE_DATABASE.length} total exercises`;
      default: return 'Explore our comprehensive exercise database';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <BookOpen size={28} color={DesignTokens.colors.primary[500]} />
            <View style={styles.headerText}>
              <Text style={styles.title}>Exercise Library</Text>
              <Text style={styles.subtitle}>{EXERCISE_DATABASE.length} exercises</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/create-exercise')} 
            style={styles.headerButton}
          >
            <Plus size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* View Mode Selector */}
        <View style={styles.viewModeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'discover', label: 'Discover', icon: <Brain size={16} color="#fff" /> },
              { key: 'popular', label: 'Popular', icon: <Star size={16} color="#fff" /> },
              { key: 'bookmarked', label: 'Saved', icon: <Bookmark size={16} color="#fff" /> },
              { key: 'recent', label: 'Recent', icon: <TrendingUp size={16} color="#fff" /> },
              { key: 'all', label: 'All', icon: <Target size={16} color="#fff" /> },
            ].map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.viewModeTab,
                  viewMode === mode.key && styles.viewModeTabActive
                ]}
                onPress={() => handleViewModeChange(mode.key as ViewMode)}
              >
                {mode.icon}
                <Text style={[
                  styles.viewModeText,
                  viewMode === mode.key && styles.viewModeTextActive
                ]}>
                  {mode.label}
                </Text>
                {mode.key === 'bookmarked' && bookmarkedExercises.length > 0 && (
                  <View style={styles.viewModeBadge}>
                    <Text style={styles.viewModeBadgeText}>{bookmarkedExercises.length}</Text>
                  </View>
                )}
                {mode.key === 'recent' && recentExercises.length > 0 && (
                  <View style={styles.viewModeBadge}>
                    <Text style={styles.viewModeBadgeText}>{recentExercises.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* View Mode Info */}
        <View style={styles.viewModeInfo}>
          <Text style={styles.viewModeTitle}>{getViewModeTitle()}</Text>
          <Text style={styles.viewModeDescription}>{getViewModeDescription()}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search and Filters */}
        <ExerciseFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          filterOptions={filterOptions}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          resultCount={filteredExercises.length}
        />

        {/* Discover Mode - Curated Content */}
        {viewMode === 'discover' && !searchQuery && Object.keys(filters).length === 0 && (
          <>
            {/* Featured Exercises */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🌟 Featured This Week</Text>
                <TouchableOpacity onPress={() => handleViewModeChange('popular')}>
                  <Text style={styles.sectionAction}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {featuredExercises.map((exercise, index) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  variant="featured"
                  isBookmarked={bookmarkedExercises.includes(exercise.id)}
                  personalStats={personalStats[exercise.id as keyof typeof personalStats]}
                  onPress={() => handleExercisePress(exercise)}
                  onBookmark={() => handleBookmark(exercise.id)}
                  onQuickStart={() => handleQuickStart(exercise)}
                />
              ))}
            </View>

            {/* Compound Movements */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>💪 Compound Movements</Text>
                <TouchableOpacity onPress={() => setFilters({ exerciseType: 'strength' })}>
                  <Text style={styles.sectionAction}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {compoundExercises.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    variant="compact"
                    isBookmarked={bookmarkedExercises.includes(exercise.id)}
                    personalStats={personalStats[exercise.id as keyof typeof personalStats]}
                    onPress={() => handleExercisePress(exercise)}
                    onBookmark={() => handleBookmark(exercise.id)}
                    onQuickStart={() => handleQuickStart(exercise)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Beginner Friendly */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎯 Beginner Friendly</Text>
                <TouchableOpacity onPress={() => setFilters({ difficulty: 'beginner' })}>
                  <Text style={styles.sectionAction}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {beginnerFriendly.map((exercise) => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    variant="compact"
                    isBookmarked={bookmarkedExercises.includes(exercise.id)}
                    personalStats={personalStats[exercise.id as keyof typeof personalStats]}
                    onPress={() => handleExercisePress(exercise)}
                    onBookmark={() => handleBookmark(exercise.id)}
                    onQuickStart={() => handleQuickStart(exercise)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Quick Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Library Stats</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.statGradient}>
                    <Target size={24} color="#FFFFFF" />
                    <Text style={styles.statValue}>{MUSCLE_GROUPS.length}</Text>
                    <Text style={styles.statLabel}>Muscle Groups</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statGradient}>
                    <Zap size={24} color="#FFFFFF" />
                    <Text style={styles.statValue}>{EXERCISE_TYPES.length}</Text>
                    <Text style={styles.statLabel}>Exercise Types</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.statGradient}>
                    <Award size={24} color="#FFFFFF" />
                    <Text style={styles.statValue}>{bookmarkedExercises.length}</Text>
                    <Text style={styles.statLabel}>Bookmarked</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statGradient}>
                    <Users size={24} color="#FFFFFF" />
                    <Text style={styles.statValue}>{Object.keys(personalStats).length}</Text>
                    <Text style={styles.statLabel}>Performed</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Exercise List */}
        <View style={styles.section}>
          {viewMode !== 'discover' && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {getViewModeTitle()} ({filteredExercises.length})
              </Text>
            </View>
          )}

          {filteredExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient colors={['#1f2937', '#111827']} style={styles.emptyStateGradient}>
                <BookOpen size={48} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.emptyStateTitle}>
                  {viewMode === 'bookmarked' ? 'No bookmarked exercises' :
                   viewMode === 'recent' ? 'No recent exercises' :
                   'No exercises found'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {viewMode === 'bookmarked' ? 'Bookmark exercises to see them here' :
                   viewMode === 'recent' ? 'View exercises to see them here' :
                   'Try adjusting your search or filters'}
                </Text>
                {viewMode !== 'bookmarked' && viewMode !== 'recent' && (
                  <TouchableOpacity 
                    style={styles.clearFiltersButton} 
                    onPress={() => {
                      setFilters({});
                      setSearchQuery('');
                    }}
                  >
                    <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          ) : (
            filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                variant="default"
                isBookmarked={bookmarkedExercises.includes(exercise.id)}
                personalStats={personalStats[exercise.id as keyof typeof personalStats]}
                onPress={() => handleExercisePress(exercise)}
                onBookmark={() => handleBookmark(exercise.id)}
                onQuickStart={() => handleQuickStart(exercise)}
              />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[2],
    paddingBottom: DesignTokens.spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: DesignTokens.spacing[3],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  headerButton: {
    padding: DesignTokens.spacing[2],
  },
  viewModeContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  viewModeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    marginRight: DesignTokens.spacing[3],
    position: 'relative',
  },
  viewModeTabActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  viewModeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginLeft: DesignTokens.spacing[2],
  },
  viewModeTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  viewModeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  viewModeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
  },
  viewModeTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  viewModeDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  sectionAction: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  statGradient: {
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginTop: DesignTokens.spacing[2],
    fontFamily: 'SF Mono',
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: DesignTokens.spacing[1],
    textAlign: 'center',
  },
  emptyState: {
    marginBottom: DesignTokens.spacing[4],
  },
  emptyStateGradient: {
    padding: DesignTokens.spacing[8],
    borderRadius: DesignTokens.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
    lineHeight: DesignTokens.typography.fontSize.base * 1.4,
  },
  clearFiltersButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[6],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.full,
  },
  clearFiltersButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  bottomPadding: {
    height: 100,
  },
});
