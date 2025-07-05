import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EXERCISE_DATABASE } from '@/lib/data/exerciseDatabase';
import ExerciseCard from '@/components/exercises/ExerciseCard';
import FormTipsModal from '@/components/ai/FormTipsModal';
import { useFormTips } from '@/hooks/useFormTips';

export default function ExercisesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'strength' | 'cardio' | 'flexibility'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [showFormTips, setShowFormTips] = useState(false);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const { formGuidance, loading, error, generateFormGuidance } = useFormTips();

  const filters = [
    { key: 'all', label: 'All', icon: 'fitness' },
    { key: 'strength', label: 'Strength', icon: 'barbell' },
    { key: 'cardio', label: 'Cardio', icon: 'heart' },
    { key: 'flexibility', label: 'Flexibility', icon: 'leaf' }
  ];

  const difficultyFilters = [
    { key: 'all', label: 'All Levels' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' }
  ];

  const filteredExercises = EXERCISE_DATABASE.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.muscle_groups.some(muscle => 
                           muscle.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesType = selectedFilter === 'all' || exercise.exercise_type === selectedFilter;
    const matchesDifficulty = selectedDifficulty === 'all' || exercise.difficulty_level === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesDifficulty;
  });

  const handleFormTips = async (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    await generateFormGuidance(exerciseId);
    setShowFormTips(true);
  };

  const selectedExercise = selectedExerciseId 
    ? EXERCISE_DATABASE.find(ex => ex.id === selectedExerciseId)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exercises</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#A3A3A3" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor="#A3A3A3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#A3A3A3" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Type Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(filter.key as any)}
            >
              <Ionicons 
                name={filter.icon as any} 
                size={16} 
                color={selectedFilter === filter.key ? '#FFFFFF' : '#A3A3A3'} 
              />
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && styles.activeFilterText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Difficulty Filters */}
      <View style={styles.difficultyContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {difficultyFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.difficultyButton,
                selectedDifficulty === filter.key && styles.activeDifficultyButton
              ]}
              onPress={() => setSelectedDifficulty(filter.key as any)}
            >
              <Text style={[
                styles.difficultyText,
                selectedDifficulty === filter.key && styles.activeDifficultyText
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.exerciseList} showsVerticalScrollIndicator={false}>
        {filteredExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onFormTips={() => handleFormTips(exercise.id)}
            showFormTips={true}
          />
        ))}
        
        {filteredExercises.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#A3A3A3" />
            <Text style={styles.emptyStateTitle}>No exercises found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or filters
            </Text>
          </View>
        )}
      </ScrollView>

      <FormTipsModal
        visible={showFormTips}
        onClose={() => setShowFormTips(false)}
        formGuidance={formGuidance}
        loading={loading}
        error={error}
        exerciseName={selectedExercise?.name}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  searchButton: {
    backgroundColor: '#9E7FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterButton: {
    backgroundColor: '#9E7FFF',
  },
  filterText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  difficultyContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  difficultyButton: {
    backgroundColor: '#1f2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeDifficultyButton: {
    backgroundColor: '#2F2F2F',
    borderWidth: 1,
    borderColor: '#9E7FFF',
  },
  difficultyText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  activeDifficultyText: {
    color: '#9E7FFF',
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
});
