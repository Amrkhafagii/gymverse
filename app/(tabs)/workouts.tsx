import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase, Workout, getWorkoutTemplates, getUserWorkouts } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import WorkoutSearchBar from '@/components/WorkoutSearchBar';
import WorkoutQuickStartSection from '@/components/WorkoutQuickStartSection';
import WorkoutTemplatesSection from '@/components/WorkoutTemplatesSection';

export default function WorkoutsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutTemplates, setWorkoutTemplates] = useState<Workout[]>([]);
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const workoutCategories = [
    { name: 'Push', exercises: 12, duration: '45 min', color: '#FF6B35' },
    { name: 'Pull', exercises: 10, duration: '40 min', color: '#4A90E2' },
    { name: 'Legs', exercises: 8, duration: '50 min', color: '#27AE60' },
    { name: 'Full Body', exercises: 15, duration: '60 min', color: '#9B59B6' },
    { name: 'Cardio', exercises: 6, duration: '30 min', color: '#E74C3C' },
    { name: 'Core', exercises: 8, duration: '25 min', color: '#F39C12' },
  ];

  useEffect(() => {
    loadWorkouts();
  }, [user]);

  const loadWorkouts = async () => {
    try {
      const templates = await getWorkoutTemplates();
      setWorkoutTemplates(templates);

      if (user) {
        const userWorkoutData = await getUserWorkouts(user.id);
        setUserWorkouts(userWorkoutData);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
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

  const handleWorkoutPress = (workout: Workout) => {
    router.push({
      pathname: '/(tabs)/workout-detail',
      params: { workoutId: workout.id.toString() },
    });
  };

  const handleFilterPress = () => {
    console.log('Filter pressed');
  };

  const handleCategoryPress = (category: any) => {
    console.log('Category pressed:', category.name);
  };

  const filteredTemplates = workoutTemplates.filter(workout =>
    workout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workout.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <Text style={styles.headerTitle}>Workouts</Text>
        <Text style={styles.headerSubtitle}>Build your perfect routine</Text>
      </LinearGradient>

      <WorkoutSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={handleFilterPress}
      />

      <WorkoutQuickStartSection
        workoutCategories={workoutCategories}
        onCategoryPress={handleCategoryPress}
      />

      <WorkoutTemplatesSection
        loading={loading}
        workoutTemplates={filteredTemplates}
        onWorkoutPress={handleWorkoutPress}
        getDifficultyColor={getDifficultyColor}
        getWorkoutTypeColor={getWorkoutTypeColor}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
});