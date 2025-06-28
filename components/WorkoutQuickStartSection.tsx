import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Dumbbell } from 'lucide-react-native';
import { router } from 'expo-router';

interface WorkoutCategory {
  name: string;
  exercises: number;
  duration: string;
  color: string;
}

interface WorkoutQuickStartSectionProps {
  workoutCategories: WorkoutCategory[];
  onCategoryPress: (category: WorkoutCategory) => void;
}

export default function WorkoutQuickStartSection({ 
  workoutCategories, 
  onCategoryPress 
}: WorkoutQuickStartSectionProps) {
  const handleCreateWorkout = () => {
    router.push('/(tabs)/create-workout');
  };

  return (
    <View style={styles.quickStartContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Start</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateWorkout}>
          <Plus size={20} color="#FF6B35" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
        {workoutCategories.map((category, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.categoryCard}
            onPress={() => onCategoryPress(category)}
          >
            <LinearGradient
              colors={[category.color, `${category.color}CC`]}
              style={styles.categoryGradient}
            >
              <Dumbbell size={32} color="#fff" />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryInfo}>{category.exercises} exercises</Text>
              <Text style={styles.categoryDuration}>{category.duration}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  quickStartContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  createButtonText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  categoriesScroll: {
    marginLeft: -20,
  },
  categoryCard: {
    marginLeft: 20,
    marginRight: 4,
  },
  categoryGradient: {
    width: 120,
    height: 140,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  categoryInfo: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    opacity: 0.8,
  },
  categoryDuration: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
    opacity: 0.9,
  },
});