import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseData } from '@/lib/data/exerciseDatabase';

interface ExerciseCardProps {
  exercise: ExerciseData;
  onPress?: () => void;
  onFormTips?: () => void;
  showFormTips?: boolean;
}

export default function ExerciseCard({ 
  exercise, 
  onPress, 
  onFormTips, 
  showFormTips = true 
}: ExerciseCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getExerciseTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return 'barbell';
      case 'cardio': return 'heart';
      case 'flexibility': return 'leaf';
      default: return 'fitness';
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={['#1f2937', '#111827']}
        style={styles.gradient}
      >
        {exercise.image_url && (
          <Image source={{ uri: exercise.image_url }} style={styles.exerciseImage} />
        )}
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.badges}>
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty_level) }]}>
                  <Text style={styles.difficultyText}>{exercise.difficulty_level}</Text>
                </View>
                {exercise.is_compound && (
                  <View style={styles.compoundBadge}>
                    <Text style={styles.compoundText}>COMPOUND</Text>
                  </View>
                )}
              </View>
            </View>
            
            {showFormTips && onFormTips && (
              <TouchableOpacity 
                style={styles.formTipsButton}
                onPress={onFormTips}
              >
                <Ionicons name="information-circle" size={20} color="#9E7FFF" />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.description}>{exercise.description}</Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name={getExerciseTypeIcon(exercise.exercise_type) as any} size={16} color="#A3A3A3" />
              <Text style={styles.statText}>{exercise.exercise_type}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="flame" size={16} color="#A3A3A3" />
              <Text style={styles.statText}>{exercise.calories_per_minute} cal/min</Text>
            </View>
            {exercise.equipment.length > 0 && (
              <View style={styles.stat}>
                <Ionicons name="build" size={16} color="#A3A3A3" />
                <Text style={styles.statText}>{exercise.equipment[0]}</Text>
              </View>
            )}
          </View>

          <View style={styles.muscleGroups}>
            <Text style={styles.muscleGroupsLabel}>Target Muscles:</Text>
            <View style={styles.muscleGroupTags}>
              {exercise.muscle_groups.slice(0, 3).map((muscle, index) => (
                <View key={index} style={styles.muscleGroupTag}>
                  <Text style={styles.muscleGroupTagText}>{muscle}</Text>
                </View>
              ))}
              {exercise.muscle_groups.length > 3 && (
                <View style={styles.muscleGroupTag}>
                  <Text style={styles.muscleGroupTagText}>+{exercise.muscle_groups.length - 3}</Text>
                </View>
              )}
            </View>
          </View>

          {exercise.tips.length > 0 && (
            <View style={styles.quickTip}>
              <Ionicons name="bulb" size={14} color="#f59e0b" />
              <Text style={styles.quickTipText}>{exercise.tips[0]}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  gradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    overflow: 'hidden',
  },
  exerciseImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  compoundBadge: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  compoundText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  formTipsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  muscleGroups: {
    marginBottom: 12,
  },
  muscleGroupsLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  muscleGroupTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleGroupTag: {
    backgroundColor: '#2F2F2F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  muscleGroupTagText: {
    fontSize: 11,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  quickTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  quickTipText: {
    fontSize: 12,
    color: '#f59e0b',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
});
