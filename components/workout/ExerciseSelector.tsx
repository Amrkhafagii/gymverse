import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search,
  X,
  Plus,
  Filter,
  Target,
  Clock,
  Zap,
  Star,
  Play,
  Info,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  muscle_groups: string[];
  equipment: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  exercise_type: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  image_url?: string;
  video_url?: string;
  rating: number;
  popularity_score: number;
  estimated_duration_seconds?: number;
}

interface ExerciseSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  excludeExerciseIds?: string[];
  suggestedMuscleGroups?: string[];
  workoutType?: string;
}

// Mock exercise data - in real app, this would come from API/database
const EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    description: 'Classic compound chest exercise for building upper body strength and mass.',
    instructions: [
      'Lie flat on bench with feet firmly on ground',
      'Grip barbell slightly wider than shoulder width',
      'Lower bar to chest with control',
      'Press bar up explosively to starting position'
    ],
    muscle_groups: ['chest', 'shoulders', 'triceps'],
    equipment: ['barbell', 'bench'],
    difficulty_level: 'intermediate',
    exercise_type: 'strength',
    image_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
    rating: 4.8,
    popularity_score: 95,
  },
  {
    id: '2',
    name: 'Deadlift',
    description: 'The king of all exercises. Full-body compound movement for strength and power.',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip bar',
      'Keep chest up and back straight',
      'Drive through heels to stand up with bar'
    ],
    muscle_groups: ['back', 'legs', 'glutes', 'core'],
    equipment: ['barbell'],
    difficulty_level: 'advanced',
    exercise_type: 'strength',
    image_url: 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
    rating: 4.9,
    popularity_score: 92,
  },
  {
    id: '3',
    name: 'Push-ups',
    description: 'Bodyweight exercise for chest, shoulders, and triceps. Perfect for any fitness level.',
    instructions: [
      'Start in plank position with hands under shoulders',
      'Lower body until chest nearly touches ground',
      'Push back up to starting position',
      'Keep core tight throughout movement'
    ],
    muscle_groups: ['chest', 'shoulders', 'triceps', 'core'],
    equipment: [],
    difficulty_level: 'beginner',
    exercise_type: 'strength',
    image_url: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
    rating: 4.6,
    popularity_score: 88,
  },
  {
    id: '4',
    name: 'Squats',
    description: 'Fundamental lower body exercise targeting quads, glutes, and hamstrings.',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower body by bending knees and hips',
      'Keep chest up and knees tracking over toes',
      'Return to starting position by driving through heels'
    ],
    muscle_groups: ['legs', 'glutes', 'core'],
    equipment: [],
    difficulty_level: 'beginner',
    exercise_type: 'strength',
    image_url: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
    rating: 4.7,
    popularity_score: 90,
  },
  {
    id: '5',
    name: 'Burpees',
    description: 'High-intensity full-body exercise combining strength and cardio.',
    instructions: [
      'Start standing, then squat down and place hands on ground',
      'Jump feet back into plank position',
      'Perform push-up (optional)',
      'Jump feet back to squat, then jump up with arms overhead'
    ],
    muscle_groups: ['full_body'],
    equipment: [],
    difficulty_level: 'intermediate',
    exercise_type: 'plyometric',
    image_url: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
    rating: 4.3,
    popularity_score: 75,
    estimated_duration_seconds: 30,
  },
  {
    id: '6',
    name: 'Plank',
    description: 'Isometric core exercise for building stability and endurance.',
    instructions: [
      'Start in push-up position',
      'Lower to forearms, keeping body straight',
      'Hold position while breathing normally',
      'Keep core tight and avoid sagging hips'
    ],
    muscle_groups: ['core', 'shoulders'],
    equipment: [],
    difficulty_level: 'beginner',
    exercise_type: 'strength',
    image_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2',
    rating: 4.5,
    popularity_score: 82,
    estimated_duration_seconds: 60,
  },
];

export default function ExerciseSelector({
  visible,
  onClose,
  onSelectExercise,
  excludeExerciseIds = [],
  suggestedMuscleGroups = [],
  workoutType,
}: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'suggested' | 'popular' | 'all'>('suggested');

  const muscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'glutes', 'full_body'];
  const equipmentOptions = ['bodyweight', 'dumbbells', 'barbell', 'bench', 'cables', 'machines'];
  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

  const filteredExercises = useMemo(() => {
    let exercises = EXERCISES.filter(ex => !excludeExerciseIds.includes(ex.id));

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      exercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes(query) ||
        ex.description.toLowerCase().includes(query) ||
        ex.muscle_groups.some(mg => mg.toLowerCase().includes(query))
      );
    }

    // Apply muscle group filter
    if (selectedMuscleGroup) {
      exercises = exercises.filter(ex => 
        ex.muscle_groups.includes(selectedMuscleGroup) || 
        (selectedMuscleGroup === 'full_body' && ex.muscle_groups.includes('full_body'))
      );
    }

    // Apply equipment filter
    if (selectedEquipment) {
      if (selectedEquipment === 'bodyweight') {
        exercises = exercises.filter(ex => ex.equipment.length === 0);
      } else {
        exercises = exercises.filter(ex => ex.equipment.includes(selectedEquipment));
      }
    }

    // Apply difficulty filter
    if (selectedDifficulty) {
      exercises = exercises.filter(ex => ex.difficulty_level === selectedDifficulty);
    }

    // Apply workout type filter
    if (workoutType && workoutType !== 'mixed') {
      exercises = exercises.filter(ex => ex.exercise_type === workoutType);
    }

    // Sort based on view mode
    switch (viewMode) {
      case 'suggested':
        // Prioritize exercises targeting suggested muscle groups
        return exercises.sort((a, b) => {
          const aHasSuggested = a.muscle_groups.some(mg => suggestedMuscleGroups.includes(mg));
          const bHasSuggested = b.muscle_groups.some(mg => suggestedMuscleGroups.includes(mg));
          
          if (aHasSuggested && !bHasSuggested) return -1;
          if (!aHasSuggested && bHasSuggested) return 1;
          
          return b.rating - a.rating;
        });
      case 'popular':
        return exercises.sort((a, b) => b.popularity_score - a.popularity_score);
      case 'all':
      default:
        return exercises.sort((a, b) => b.rating - a.rating);
    }
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, workoutType, viewMode, excludeExerciseIds, suggestedMuscleGroups]);

  const handleExerciseSelect = async (exercise: Exercise) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectExercise(exercise);
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const clearFilters = () => {
    setSelectedMuscleGroup(null);
    setSelectedEquipment(null);
    setSelectedDifficulty(null);
    setSearchQuery('');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return DesignTokens.colors.success[500];
      case 'intermediate': return DesignTokens.colors.warning[500];
      case 'advanced': return DesignTokens.colors.error[500];
      default: return DesignTokens.colors.neutral[500];
    }
  };

  const formatMuscleGroup = (muscle: string) => {
    return muscle.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedMuscleGroup) count++;
    if (selectedEquipment) count++;
    if (selectedDifficulty) count++;
    return count;
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={DesignTokens.colors.text.primary} />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Add Exercise</Text>
            
            <TouchableOpacity 
              onPress={() => setShowFilters(!showFilters)} 
              style={[
                styles.filterButton,
                (showFilters || getActiveFilterCount() > 0) && styles.filterButtonActive
              ]}
            >
              <Filter size={20} color={DesignTokens.colors.text.primary} />
              {getActiveFilterCount() > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search size={20} color={DesignTokens.colors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={DesignTokens.colors.text.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                  <X size={16} color={DesignTokens.colors.text.secondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* View Mode Selector */}
          <View style={styles.viewModeContainer}>
            {[
              { key: 'suggested', label: 'Suggested', count: suggestedMuscleGroups.length > 0 ? filteredExercises.filter(ex => ex.muscle_groups.some(mg => suggestedMuscleGroups.includes(mg))).length : 0 },
              { key: 'popular', label: 'Popular', count: filteredExercises.length },
              { key: 'all', label: 'All', count: filteredExercises.length },
            ].map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.viewModeTab,
                  viewMode === mode.key && styles.viewModeTabActive
                ]}
                onPress={() => setViewMode(mode.key as any)}
              >
                <Text style={[
                  styles.viewModeText,
                  viewMode === mode.key && styles.viewModeTextActive
                ]}>
                  {mode.label}
                </Text>
                {mode.count > 0 && (
                  <Text style={[
                    styles.viewModeCount,
                    viewMode === mode.key && styles.viewModeCountActive
                  ]}>
                    {mode.count}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <LinearGradient colors={['#1f2937', '#111827']} style={styles.filtersGradient}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Muscle Groups</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      !selectedMuscleGroup && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedMuscleGroup(null)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      !selectedMuscleGroup && styles.filterChipTextActive
                    ]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {muscleGroups.map((muscle) => (
                    <TouchableOpacity
                      key={muscle}
                      style={[
                        styles.filterChip,
                        selectedMuscleGroup === muscle && styles.filterChipActive,
                        suggestedMuscleGroups.includes(muscle) && styles.filterChipSuggested
                      ]}
                      onPress={() => setSelectedMuscleGroup(selectedMuscleGroup === muscle ? null : muscle)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedMuscleGroup === muscle && styles.filterChipTextActive
                      ]}>
                        {formatMuscleGroup(muscle)}
                      </Text>
                      {suggestedMuscleGroups.includes(muscle) && (
                        <Star size={12} color={DesignTokens.colors.warning[500]} fill={DesignTokens.colors.warning[500]} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Equipment</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      !selectedEquipment && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedEquipment(null)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      !selectedEquipment && styles.filterChipTextActive
                    ]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {equipmentOptions.map((equipment) => (
                    <TouchableOpacity
                      key={equipment}
                      style={[
                        styles.filterChip,
                        selectedEquipment === equipment && styles.filterChipActive
                      ]}
                      onPress={() => setSelectedEquipment(selectedEquipment === equipment ? null : equipment)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedEquipment === equipment && styles.filterChipTextActive
                      ]}>
                        {formatMuscleGroup(equipment)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Difficulty</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      !selectedDifficulty && styles.filterChipActive
                    ]}
                    onPress={() => setSelectedDifficulty(null)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      !selectedDifficulty && styles.filterChipTextActive
                    ]}>
                      All
                    </Text>
                  </TouchableOpacity>
                  {difficultyLevels.map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.filterChip,
                        selectedDifficulty === difficulty && styles.filterChipActive
                      ]}
                      onPress={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
                    >
                      <Text style={[
                        styles.filterChipText,
                        selectedDifficulty === difficulty && styles.filterChipTextActive
                      ]}>
                        {formatMuscleGroup(difficulty)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {getActiveFilterCount() > 0 && (
                <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Exercise List */}
        <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
          {filteredExercises.length === 0 ? (
            <View style={styles.emptyState}>
              <Target size={48} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.emptyStateTitle}>No exercises found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters to find exercises
              </Text>
              {getActiveFilterCount() > 0 && (
                <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onSelect={() => handleExerciseSelect(exercise)}
                isSuggested={exercise.muscle_groups.some(mg => suggestedMuscleGroups.includes(mg))}
              />
            ))
          )}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect: () => void;
  isSuggested: boolean;
}

function ExerciseCard({ exercise, onSelect, isSuggested }: ExerciseCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return DesignTokens.colors.success[500];
      case 'intermediate': return DesignTokens.colors.warning[500];
      case 'advanced': return DesignTokens.colors.error[500];
      default: return DesignTokens.colors.neutral[500];
    }
  };

  const formatMuscleGroup = (muscle: string) => {
    return muscle.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <View style={[styles.exerciseCard, isSuggested && styles.exerciseCardSuggested]}>
      <LinearGradient 
        colors={isSuggested ? ['#9E7FFF20', '#7C3AED20'] : ['#1f2937', '#111827']} 
        style={styles.exerciseCardGradient}
      >
        {exercise.image_url && (
          <Image source={{ uri: exercise.image_url }} style={styles.exerciseImage} />
        )}
        
        <View style={styles.exerciseContent}>
          <View style={styles.exerciseHeader}>
            <View style={styles.exerciseHeaderLeft}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              {isSuggested && (
                <View style={styles.suggestedBadge}>
                  <Star size={12} color={DesignTokens.colors.warning[500]} fill={DesignTokens.colors.warning[500]} />
                  <Text style={styles.suggestedText}>Suggested</Text>
                </View>
              )}
            </View>
            
            <View style={styles.exerciseActions}>
              <TouchableOpacity 
                onPress={() => setShowDetails(!showDetails)} 
                style={styles.infoButton}
              >
                <Info size={16} color={DesignTokens.colors.text.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={onSelect} style={styles.addButton}>
                <Plus size={16} color={DesignTokens.colors.primary[500]} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {exercise.description}
          </Text>

          <View style={styles.exerciseMeta}>
            <View style={styles.exerciseMetaItem}>
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

            <View style={styles.exerciseMetaItem}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={styles.exerciseRating}>{exercise.rating.toFixed(1)}</Text>
            </View>

            {exercise.estimated_duration_seconds && (
              <View style={styles.exerciseMetaItem}>
                <Clock size={12} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.exerciseMetaText}>
                  {Math.round(exercise.estimated_duration_seconds / 60)}min
                </Text>
              </View>
            )}
          </View>

          <View style={styles.muscleGroups}>
            {exercise.muscle_groups.slice(0, 3).map((muscle, index) => (
              <View key={muscle} style={styles.muscleGroupTag}>
                <Text style={styles.muscleGroupText}>
                  {formatMuscleGroup(muscle)}
                </Text>
              </View>
            ))}
            {exercise.muscle_groups.length > 3 && (
              <Text style={styles.moreMusclesText}>+{exercise.muscle_groups.length - 3}</Text>
            )}
          </View>

          {exercise.equipment.length > 0 && (
            <View style={styles.equipmentContainer}>
              <Text style={styles.equipmentLabel}>Equipment: </Text>
              <Text style={styles.equipmentText}>
                {exercise.equipment.map(eq => formatMuscleGroup(eq)).join(', ')}
              </Text>
            </View>
          )}

          {showDetails && (
            <View style={styles.exerciseDetails}>
              <Text style={styles.exerciseDetailsTitle}>Instructions:</Text>
              {exercise.instructions.map((instruction, index) => (
                <Text key={index} style={styles.exerciseInstruction}>
                  {index + 1}. {instruction}
                </Text>
              ))}
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[12],
    paddingBottom: DesignTokens.spacing[4],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  closeButton: {
    padding: DesignTokens.spacing[2],
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  filterButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  searchContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  searchBar: {
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
  clearSearchButton: {
    padding: DesignTokens.spacing[1],
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[1],
  },
  viewModeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },
  viewModeTabActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  viewModeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  viewModeTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  viewModeCount: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    fontFamily: 'SF Mono',
  },
  viewModeCountActive: {
    color: DesignTokens.colors.text.primary,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  filtersGradient: {
    padding: DesignTokens.spacing[4],
  },
  filterSection: {
    marginBottom: DesignTokens.spacing[4],
  },
  filterSectionTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[2],
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.neutral[800],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    marginRight: DesignTokens.spacing[2],
  },
  filterChipActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  filterChipSuggested: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.warning[500],
  },
  filterChipText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginRight: DesignTokens.spacing[1],
  },
  filterChipTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  clearFiltersButton: {
    alignSelf: 'center',
    backgroundColor: DesignTokens.colors.error[500] + '20',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.error[500],
  },
  clearFiltersText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.error[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing[5],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  exerciseCard: {
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
  },
  exerciseCardSuggested: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500] + '50',
  },
  exerciseCardGradient: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  exerciseImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  exerciseContent: {
    padding: DesignTokens.spacing[4],
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  exerciseHeaderLeft: {
    flex: 1,
  },
  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  suggestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.warning[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
    alignSelf: 'flex-start',
  },
  suggestedText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.warning[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginLeft: DesignTokens.spacing[1],
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  infoButton: {
    padding: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.md,
  },
  addButton: {
    padding: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500],
  },
  exerciseDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: DesignTokens.typography.fontSize.sm * 1.4,
    marginBottom: DesignTokens.spacing[3],
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[3],
  },
  exerciseMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
  },
  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  exerciseRating: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    fontFamily: 'SF Mono',
  },
  exerciseMetaText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },
  muscleGroups: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
    flexWrap: 'wrap',
  },
  muscleGroupTag: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    marginRight: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[1],
  },
  muscleGroupText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  moreMusclesText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    fontStyle: 'italic',
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  equipmentLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  equipmentText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    flex: 1,
    textTransform: 'capitalize',
  },
  exerciseDetails: {
    backgroundColor: DesignTokens.colors.neutral[900],
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[3],
  },
  exerciseDetailsTitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[2],
  },
  exerciseInstruction: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: DesignTokens.typography.fontSize.sm * 1.4,
    marginBottom: DesignTokens.spacing[1],
  },
  bottomPadding: {
    height: 100,
  },
});
