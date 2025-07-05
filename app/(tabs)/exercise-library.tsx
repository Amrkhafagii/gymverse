import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Search, 
  Filter, 
  Plus, 
  Star, 
  Clock, 
  Target, 
  Zap,
  ChevronRight,
  Dumbbell,
  Heart,
  Activity,
  Shield,
  Users,
  Flame,
  Smartphone,
  User
} from 'lucide-react-native';
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
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FilterCategory = 'all' | 'muscle' | 'equipment' | 'difficulty' | 'type';

interface DeviceExerciseStats {
  deviceId: string;
  exerciseId: string;
  totalSessions: number;
  totalSets: number;
  totalReps: number;
  maxWeight: number;
  lastPerformed: string;
  personalBest: {
    weight?: number;
    reps?: number;
    duration?: number;
  };
}

export default function ExerciseLibraryScreen() {
  const { user, isAuthenticated, updateLastActive } = useDeviceAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'popular' | 'all' | 'compound' | 'personal'>('popular');
  const [deviceStats, setDeviceStats] = useState<DeviceExerciseStats[]>([]);

  // Load device-specific exercise stats
  React.useEffect(() => {
    if (isAuthenticated && user) {
      loadDeviceExerciseStats();
    }
  }, [isAuthenticated, user]);

  const loadDeviceExerciseStats = async () => {
    if (!user) return;

    try {
      const statsKey = `device_exercise_stats_${user.deviceId}`;
      const storedStats = await AsyncStorage.getItem(statsKey);
      if (storedStats) {
        setDeviceStats(JSON.parse(storedStats));
      }
    } catch (error) {
      console.error('Error loading device exercise stats:', error);
    }
  };

  const getDeviceStatsForExercise = (exerciseId: string): DeviceExerciseStats | null => {
    return deviceStats.find(stat => stat.exerciseId === exerciseId) || null;
  };

  const getPersonalExercises = (): ExerciseData[] => {
    if (!isAuthenticated || deviceStats.length === 0) return [];
    
    // Return exercises that have been performed on this device
    const performedExerciseIds = deviceStats.map(stat => stat.exerciseId);
    return EXERCISE_DATABASE.filter(ex => performedExerciseIds.includes(ex.id));
  };

  const filteredExercises = useMemo(() => {
    let exercises = EXERCISE_DATABASE;

    // Apply search filter first
    if (searchQuery.trim()) {
      exercises = searchExercises(searchQuery.trim());
    } else {
      // Apply view mode filters when no search
      switch (viewMode) {
        case 'popular':
          exercises = getPopularExercises(20);
          break;
        case 'compound':
          exercises = getCompoundExercises();
          break;
        case 'personal':
          exercises = getPersonalExercises();
          break;
        case 'all':
        default:
          exercises = EXERCISE_DATABASE;
          break;
      }
    }

    // Apply category filters
    if (selectedMuscle !== 'all') {
      exercises = exercises.filter(ex => ex.muscle_groups.includes(selectedMuscle));
    }

    if (selectedEquipment.length > 0) {
      exercises = exercises.filter(ex => 
        selectedEquipment.every(eq => ex.equipment.includes(eq)) ||
        (selectedEquipment.includes('none') && ex.equipment.length === 0)
      );
    }

    if (selectedDifficulty !== 'all') {
      exercises = exercises.filter(ex => ex.difficulty_level === selectedDifficulty);
    }

    if (selectedType !== 'all') {
      exercises = exercises.filter(ex => ex.exercise_type === selectedType);
    }

    return exercises;
  }, [searchQuery, viewMode, selectedMuscle, selectedEquipment, selectedDifficulty, selectedType, deviceStats]);

  const popularExercises = getPopularExercises(5);
  const compoundExercises = getCompoundExercises().slice(0, 5);
  const personalExercises = getPersonalExercises().slice(0, 5);

  const handleExercisePress = async (exercise: ExerciseData) => {
    if (isAuthenticated && user) {
      await updateLastActive();
    }
    
    router.push({
      pathname: '/exercise-detail',
      params: { exerciseId: exercise.id }
    });
  };

  const handleCreateCustomExercise = async () => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Device Authentication Required',
        'Please ensure your device is authenticated to create custom exercises.',
        [
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      await updateLastActive();
      router.push('/create-exercise');
    } catch (error) {
      console.error('Error navigating to create exercise:', error);
    }
  };

  const handleViewProgress = async (exercise: ExerciseData) => {
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Device Authentication Required',
        'Please ensure your device is authenticated to view exercise progress.',
        [
          { text: 'OK', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      await updateLastActive();
      router.push({
        pathname: '/exercise-progress',
        params: { exerciseId: exercise.id }
      });
    } catch (error) {
      console.error('Error navigating to exercise progress:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#2ECC71';
      case 'intermediate': return '#F39C12';
      case 'advanced': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell size={16} color="#FF6B35" />;
      case 'cardio': return <Heart size={16} color="#E74C3C" />;
      case 'flexibility': return <Zap size={16} color="#2ECC71" />;
      case 'balance': return <Target size={16} color="#9B59B6" />;
      case 'plyometric': return <Activity size={16} color="#3498DB" />;
      default: return <Target size={16} color="#95A5A6" />;
    }
  };

  const getSafetyColor = (rating: number) => {
    if (rating >= 4) return '#2ECC71';
    if (rating >= 3) return '#F39C12';
    return '#E74C3C';
  };

  const clearAllFilters = () => {
    setSelectedMuscle('all');
    setSelectedEquipment([]);
    setSelectedDifficulty('all');
    setSelectedType('all');
    setSearchQuery('');
    setViewMode('popular');
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(eq => eq !== equipment)
        : [...prev, equipment]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Exercise Library</Text>
              <Text style={styles.subtitle}>{EXERCISE_DATABASE.length} exercises available</Text>
            </View>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateCustomExercise}>
              <Plus size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Device Status */}
        {isAuthenticated && user && (
          <View style={styles.deviceStatus}>
            <LinearGradient colors={['#1f2937', '#111827']} style={styles.deviceStatusGradient}>
              <Smartphone size={16} color="#FF6B35" />
              <Text style={styles.deviceStatusText}>
                Tracking on {user.platform} • {deviceStats.length} exercises performed
              </Text>
              <View style={styles.activeIndicator}>
                <View style={styles.activeIndicatorDot} />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Search and Filter Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? "#FF6B35" : "#fff"} />
          </TouchableOpacity>
        </View>

        {/* View Mode Tabs */}
        {!searchQuery && (
          <View style={styles.viewModeContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'popular', label: 'Popular', icon: <Star size={16} color="#fff" /> },
                { key: 'all', label: 'All Exercises', icon: <Target size={16} color="#fff" /> },
                { key: 'compound', label: 'Compound', icon: <Dumbbell size={16} color="#fff" /> },
                ...(isAuthenticated && deviceStats.length > 0 ? [
                  { key: 'personal', label: 'My Exercises', icon: <User size={16} color="#fff" /> }
                ] : [])
              ].map((mode) => (
                <TouchableOpacity
                  key={mode.key}
                  style={[
                    styles.viewModeTab,
                    viewMode === mode.key && styles.viewModeTabActive
                  ]}
                  onPress={() => setViewMode(mode.key as any)}
                >
                  {mode.icon}
                  <Text style={[
                    styles.viewModeText,
                    viewMode === mode.key && styles.viewModeTextActive
                  ]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filters</Text>
              <TouchableOpacity onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {/* Muscle Groups */}
            <Text style={styles.filterSectionTitle}>Muscle Groups</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedMuscle === 'all' && styles.filterChipActive]}
                onPress={() => setSelectedMuscle('all')}
              >
                <Text style={[styles.filterChipText, selectedMuscle === 'all' && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {MUSCLE_GROUPS.map((muscle) => (
                <TouchableOpacity
                  key={muscle}
                  style={[styles.filterChip, selectedMuscle === muscle && styles.filterChipActive]}
                  onPress={() => setSelectedMuscle(muscle)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedMuscle === muscle && styles.filterChipTextActive
                  ]}>
                    {muscle.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Equipment */}
            <Text style={styles.filterSectionTitle}>Equipment</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[styles.filterChip, selectedEquipment.includes('none') && styles.filterChipActive]}
                onPress={() => toggleEquipment('none')}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedEquipment.includes('none') && styles.filterChipTextActive
                ]}>
                  No Equipment
                </Text>
              </TouchableOpacity>
              {EQUIPMENT_LIST.map((equipment) => (
                <TouchableOpacity
                  key={equipment}
                  style={[styles.filterChip, selectedEquipment.includes(equipment) && styles.filterChipActive]}
                  onPress={() => toggleEquipment(equipment)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedEquipment.includes(equipment) && styles.filterChipTextActive
                  ]}>
                    {equipment.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Difficulty & Type */}
            <View style={styles.filterRow}>
              <View style={styles.filterColumn}>
                <Text style={styles.filterSectionTitle}>Difficulty</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[styles.filterChip, selectedDifficulty === difficulty && styles.filterChipActive]}
                      onPress={() => setSelectedDifficulty(difficulty)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedDifficulty === difficulty && styles.filterChipTextActive
                      ]}>
                        {difficulty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterColumn}>
                <Text style={styles.filterSectionTitle}>Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['all', ...EXERCISE_TYPES].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.filterChip, selectedType === type && styles.filterChipActive]}
                      onPress={() => setSelectedType(type)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedType === type && styles.filterChipTextActive
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        )}

        {/* Quick Access - Popular, Compound & Personal */}
        {!searchQuery && viewMode === 'popular' && !showFilters && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔥 Most Popular</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {popularExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.popularCard}
                    onPress={() => handleExercisePress(exercise)}
                  >
                    <LinearGradient colors={['#1f2937', '#111827']} style={styles.popularCardGradient}>
                      <Image source={{ uri: exercise.demo_image_url }} style={styles.popularImage} />
                      <View style={styles.popularOverlay}>
                        <View style={styles.popularBadge}>
                          <Star size={12} color="#FFD700" fill="#FFD700" />
                          <Text style={styles.popularScore}>{exercise.popularity_score}</Text>
                        </View>
                      </View>
                      <View style={styles.popularContent}>
                        <Text style={styles.popularName}>{exercise.name}</Text>
                        <View style={styles.popularMuscles}>
                          {exercise.muscle_groups.slice(0, 2).map((muscle, index) => (
                            <Text key={index} style={styles.popularMuscle}>
                              {muscle}
                            </Text>
                          ))}
                        </View>
                        {isAuthenticated && getDeviceStatsForExercise(exercise.id) && (
                          <View style={styles.personalStats}>
                            <Text style={styles.personalStatsText}>
                              Performed {getDeviceStatsForExercise(exercise.id)?.totalSessions} times
                            </Text>
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💪 Compound Movements</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {compoundExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.compoundCard}
                    onPress={() => handleExercisePress(exercise)}
                  >
                    <LinearGradient colors={['#1f2937', '#111827']} style={styles.compoundCardGradient}>
                      <View style={styles.compoundHeader}>
                        <Text style={styles.compoundName}>{exercise.name}</Text>
                        <View style={styles.compoundBadges}>
                          {getTypeIcon(exercise.exercise_type)}
                          <View style={[
                            styles.difficultyBadge,
                            { backgroundColor: getDifficultyColor(exercise.difficulty_level) + '20' }
                          ]}>
                            <Text style={[
                              styles.difficultyText,
                              { color: getDifficultyColor(exercise.difficulty_level) }
                            ]}>
                              {exercise.difficulty_level}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={styles.compoundDescription} numberOfLines={2}>
                        {exercise.description}
                      </Text>
                      <View style={styles.compoundStats}>
                        <View style={styles.compoundStat}>
                          <Flame size={14} color="#E74C3C" />
                          <Text style={styles.compoundStatText}>{exercise.calories_per_minute}/min</Text>
                        </View>
                        <View style={styles.compoundStat}>
                          <Shield size={14} color={getSafetyColor(exercise.safety_rating)} />
                          <Text style={styles.compoundStatText}>{exercise.safety_rating}/5</Text>
                        </View>
                      </View>
                      {isAuthenticated && getDeviceStatsForExercise(exercise.id) && (
                        <TouchableOpacity 
                          style={styles.progressButton}
                          onPress={() => handleViewProgress(exercise)}
                        >
                          <Text style={styles.progressButtonText}>View Progress</Text>
                        </TouchableOpacity>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Personal Exercises Section */}
            {isAuthenticated && personalExercises.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📱 Your Exercises</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {personalExercises.map((exercise) => {
                    const stats = getDeviceStatsForExercise(exercise.id);
                    return (
                      <TouchableOpacity
                        key={exercise.id}
                        style={styles.personalCard}
                        onPress={() => handleExercisePress(exercise)}
                      >
                        <LinearGradient colors={['#1f2937', '#111827']} style={styles.personalCardGradient}>
                          <View style={styles.personalHeader}>
                            <Text style={styles.personalName}>{exercise.name}</Text>
                            <Smartphone size={16} color="#FF6B35" />
                          </View>
                          {stats && (
                            <View style={styles.personalStatsContainer}>
                              <View style={styles.personalStatItem}>
                                <Text style={styles.personalStatValue}>{stats.totalSessions}</Text>
                                <Text style={styles.personalStatLabel}>Sessions</Text>
                              </View>
                              <View style={styles.personalStatItem}>
                                <Text style={styles.personalStatValue}>{stats.totalSets}</Text>
                                <Text style={styles.personalStatLabel}>Sets</Text>
                              </View>
                              {stats.maxWeight > 0 && (
                                <View style={styles.personalStatItem}>
                                  <Text style={styles.personalStatValue}>{stats.maxWeight}kg</Text>
                                  <Text style={styles.personalStatLabel}>Max</Text>
                                </View>
                              )}
                            </View>
                          )}
                          <TouchableOpacity 
                            style={styles.progressButton}
                            onPress={() => handleViewProgress(exercise)}
                          >
                            <Text style={styles.progressButtonText}>View Progress</Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {/* Exercise List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Search Results (${filteredExercises.length})` : 
               viewMode === 'popular' ? 'All Popular Exercises' :
               viewMode === 'compound' ? 'Compound Exercises' : 
               viewMode === 'personal' ? 'Your Exercises' : 'All Exercises'}
            </Text>
            {filteredExercises.length > 0 && (
              <Text style={styles.resultsCount}>{filteredExercises.length} exercises</Text>
            )}
          </View>

          {filteredExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient colors={['#1f2937', '#111827']} style={styles.emptyStateGradient}>
                <Search size={48} color="#666" />
                <Text style={styles.emptyStateTitle}>
                  {viewMode === 'personal' ? 'No exercises performed yet' : 'No exercises found'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {viewMode === 'personal' 
                    ? 'Start working out to see your personal exercise history'
                    : 'Try adjusting your search or filters'
                  }
                </Text>
                {viewMode !== 'personal' && (
                  <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                    <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          ) : (
            filteredExercises.map((exercise) => {
              const deviceStats = getDeviceStatsForExercise(exercise.id);
              return (
                <TouchableOpacity
                  key={exercise.id}
                  style={styles.exerciseCard}
                  onPress={() => handleExercisePress(exercise)}
                >
                  <LinearGradient colors={['#1f2937', '#111827']} style={styles.exerciseGradient}>
                    <Image source={{ uri: exercise.demo_image_url }} style={styles.exerciseImage} />
                    <View style={styles.exerciseContent}>
                      <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseTitleRow}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          <View style={styles.exerciseActions}>
                            {isAuthenticated && deviceStats && (
                              <TouchableOpacity 
                                style={styles.progressIconButton}
                                onPress={() => handleViewProgress(exercise)}
                              >
                                <Activity size={16} color="#FF6B35" />
                              </TouchableOpacity>
                            )}
                            <ChevronRight size={20} color="#666" />
                          </View>
                        </View>
                        <View style={styles.exerciseBadges}>
                          <View style={styles.typeBadge}>
                            {getTypeIcon(exercise.exercise_type)}
                            <Text style={styles.typeBadgeText}>{exercise.exercise_type}</Text>
                          </View>
                          <View style={[
                            styles.difficultyBadge,
                            { backgroundColor: getDifficultyColor(exercise.difficulty_level) + '20' }
                          ]}>
                            <Text style={[
                              styles.difficultyText,
                              { color: getDifficultyColor(exercise.difficulty_level) }
                            ]}>
                              {exercise.difficulty_level}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Text style={styles.exerciseDescription} numberOfLines={2}>
                        {exercise.description}
                      </Text>

                      {/* Device-specific stats */}
                      {isAuthenticated && deviceStats && (
                        <View style={styles.deviceStatsContainer}>
                          <View style={styles.deviceStatsHeader}>
                            <Smartphone size={12} color="#FF6B35" />
                            <Text style={styles.deviceStatsTitle}>Your Stats</Text>
                          </View>
                          <View style={styles.deviceStatsRow}>
                            <Text style={styles.deviceStatsText}>
                              {deviceStats.totalSessions} sessions • {deviceStats.totalSets} sets
                            </Text>
                            {deviceStats.maxWeight > 0 && (
                              <Text style={styles.deviceStatsText}>
                                Max: {deviceStats.maxWeight}kg
                              </Text>
                            )}
                          </View>
                        </View>
                      )}

                      <View style={styles.exerciseStats}>
                        <View style={styles.exerciseStat}>
                          <Target size={16} color="#999" />
                          <Text style={styles.exerciseStatText}>
                            {exercise.muscle_groups.slice(0, 2).join(', ')}
                            {exercise.muscle_groups.length > 2 && ` +${exercise.muscle_groups.length - 2}`}
                          </Text>
                        </View>
                        <View style={styles.exerciseStat}>
                          <Flame size={16} color="#E74C3C" />
                          <Text style={styles.exerciseStatText}>{exercise.calories_per_minute} cal/min</Text>
                        </View>
                        <View style={styles.exerciseStat}>
                          <Star size={16} color="#FFD700" />
                          <Text style={styles.exerciseStatText}>{exercise.popularity_score}</Text>
                        </View>
                        <View style={styles.exerciseStat}>
                          <Shield size={16} color={getSafetyColor(exercise.safety_rating)} />
                          <Text style={styles.exerciseStatText}>{exercise.safety_rating}/5</Text>
                        </View>
                      </View>

                      <View style={styles.exerciseTags}>
                        {exercise.tags.slice(0, 3).map((tag, index) => (
                          <View key={index} style={styles.exerciseTag}>
                            <Text style={styles.exerciseTagText}>#{tag}</Text>
                          </View>
                        ))}
                        {exercise.tags.length > 3 && (
                          <Text style={styles.moreTagsText}>+{exercise.tags.length - 3}</Text>
                        )}
                      </View>

                      {exercise.equipment.length > 0 && (
                        <View style={styles.equipmentContainer}>
                          <Text style={styles.equipmentLabel}>Equipment:</Text>
                          <Text style={styles.equipmentText} numberOfLines={1}>
                            {exercise.equipment.join(', ').replace(/_/g, ' ')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  createButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  deviceStatus: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  deviceStatusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  deviceStatusText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
    flex: 1,
  },
  activeIndicator: {
    marginLeft: 8,
  },
  activeIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    paddingVertical: 12,
  },
  filterButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B3520',
  },
  viewModeContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  viewModeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  viewModeTabActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  viewModeText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  viewModeTextActive: {
    color: '#fff',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
  },
  filterSectionTitle: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
    marginTop: 12,
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterColumn: {
    flex: 1,
    marginRight: 8,
  },
  filterChip: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  resultsCount: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  popularCard: {
    width: 160,
    marginRight: 16,
  },
  popularCardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  popularImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  popularOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularScore: {
    fontSize: 11,
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
    marginLeft: 3,
  },
  popularContent: {
    padding: 12,
  },
  popularName: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 6,
  },
  popularMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  popularMuscle: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginRight: 6,
    textTransform: 'capitalize',
  },
  personalStats: {
    marginTop: 4,
  },
  personalStatsText: {
    fontSize: 10,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
  },
  compoundCard: {
    width: 220,
    marginRight: 16,
  },
  compoundCardGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  compoundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  compoundName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 8,
  },
  compoundBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compoundDescription: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 16,
    marginBottom: 12,
  },
  compoundStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  compoundStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compoundStatText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  progressButton: {
    backgroundColor: '#FF6B3520',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  progressButtonText: {
    fontSize: 10,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
  },
  personalCard: {
    width: 200,
    marginRight: 16,
  },
  personalCardGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B3510',
  },
  personalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  personalName: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  personalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  personalStatItem: {
    alignItems: 'center',
  },
  personalStatValue: {
    fontSize: 16,
    color: '#FF6B35',
    fontFamily: 'Inter-Bold',
  },
  personalStatLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  exerciseCard: {
    marginBottom: 16,
  },
  exerciseGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  exerciseContent: {
    padding: 16,
  },
  exerciseHeader: {
    marginBottom: 12,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIconButton: {
    padding: 4,
    marginRight: 8,
  },
  exerciseBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B3520',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    lineHeight: 20,
  },
  deviceStatsContainer: {
    backgroundColor: '#FF6B3510',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FF6B3530',
  },
  deviceStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceStatsTitle: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 4,
  },
  deviceStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceStatsText: {
    fontSize: 11,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exerciseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseStatText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  exerciseTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseTag: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
  },
  exerciseTagText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Inter-Medium',
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginRight: 6,
  },
  equipmentText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    flex: 1,
    textTransform: 'capitalize',
  },
  emptyState: {
    marginBottom: 8,
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFiltersButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearFiltersButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  bottomSpacer: {
    height: 100,
  },
});
