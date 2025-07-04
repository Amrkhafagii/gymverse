import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Play, 
  Bookmark, 
  Share2, 
  Clock, 
  Target, 
  Zap, 
  Users, 
  Star,
  Flame,
  Dumbbell,
  Heart,
  Info,
  CheckCircle
} from 'lucide-react-native';
import { WORKOUT_TEMPLATES, WorkoutTemplate, TemplateExercise } from '@/lib/data/workoutTemplates';
import { useAuth } from '@/contexts/AuthContext';

export default function TemplatePreviewScreen() {
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<TemplateExercise | null>(null);

  const template = WORKOUT_TEMPLATES.find(t => t.id === templateId);

  if (!template) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Template not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'strength': return <Dumbbell size={20} color="#FF6B35" />;
      case 'weight_loss': return <Flame size={20} color="#E74C3C" />;
      case 'muscle_building': return <Target size={20} color="#9B59B6" />;
      case 'endurance': return <Heart size={20} color="#3498DB" />;
      case 'flexibility': return <Zap size={20} color="#2ECC71" />;
      case 'general_fitness': return <Star size={20} color="#F39C12" />;
      default: return <Target size={20} color="#95A5A6" />;
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

  const handleStartWorkout = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to start a workout.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/sign-in') }
        ]
      );
      return;
    }

    Alert.alert(
      'Start Workout',
      `Ready to start "${template.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            // Navigate to workout session with template data
            router.push({
              pathname: '/workout-session',
              params: { 
                templateId: template.id,
                workoutName: template.name 
              }
            });
          }
        }
      ]
    );
  };

  const handleCustomizeWorkout = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to customize workouts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/sign-in') }
        ]
      );
      return;
    }

    // Navigate to create workout with template pre-filled
    router.push({
      pathname: '/(tabs)/create-workout',
      params: { templateId: template.id }
    });
  };

  const handleBookmark = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to bookmark templates.');
      return;
    }
    
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality with backend
  };

  const handleShare = () => {
    Alert.alert(
      'Share Template',
      `Share "${template.name}" with friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => {
          // TODO: Implement share functionality
          console.log('Sharing template:', template.name);
        }}
      ]
    );
  };

  const formatReps = (reps: number[]) => {
    if (reps.length === 0) return '';
    if (reps.length === 1) return `${reps[0]} reps`;
    return `${Math.min(...reps)}-${Math.max(...reps)} reps`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: template.image_url }} style={styles.headerImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.imageOverlay}
          />
          
          {/* Header Controls */}
          <View style={styles.headerControls}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.headerButton, isBookmarked && styles.bookmarkedButton]} 
                onPress={handleBookmark}
              >
                <Bookmark size={24} color={isBookmarked ? "#FF6B35" : "#fff"} fill={isBookmarked ? "#FF6B35" : "none"} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Share2 size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Template Info Overlay */}
          <View style={styles.templateInfo}>
            <View style={styles.templateBadges}>
              <View style={styles.goalBadge}>
                {getGoalIcon(template.goal)}
                <Text style={styles.goalBadgeText}>
                  {template.goal.replace('_', ' ')}
                </Text>
              </View>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(template.difficulty) + '20' }
              ]}>
                <Text style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(template.difficulty) }
                ]}>
                  {template.difficulty}
                </Text>
              </View>
              <View style={styles.popularityBadge}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.popularityText}>{template.popularity_score}</Text>
              </View>
            </View>
            <Text style={styles.templateName}>{template.name}</Text>
            <Text style={styles.templateDescription}>{template.description}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient colors={['#1f2937', '#111827']} style={styles.statsGradient}>
            <View style={styles.statItem}>
              <Clock size={24} color="#FF6B35" />
              <Text style={styles.statValue}>{template.duration_minutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Target size={24} color="#9B59B6" />
              <Text style={styles.statValue}>{template.exercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Flame size={24} color="#E74C3C" />
              <Text style={styles.statValue}>{template.estimated_calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
            <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.startButtonGradient}>
              <Play size={20} color="#fff" />
              <Text style={styles.startButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.customizeButton} onPress={handleCustomizeWorkout}>
            <Text style={styles.customizeButtonText}>Customize</Text>
          </TouchableOpacity>
        </View>

        {/* Equipment Needed */}
        {template.equipment_needed.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment Needed</Text>
            <View style={styles.equipmentList}>
              {template.equipment_needed.map((equipment, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <CheckCircle size={16} color="#2ECC71" />
                  <Text style={styles.equipmentText}>
                    {equipment.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Muscle Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Muscle Groups</Text>
          <View style={styles.muscleGroups}>
            {template.muscle_groups.map((muscle, index) => (
              <View key={index} style={styles.muscleGroup}>
                <Text style={styles.muscleGroupText}>
                  {muscle.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Exercise List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises ({template.exercises.length})</Text>
          {template.exercises.map((exercise, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exerciseCard}
              onPress={() => setSelectedExercise(selectedExercise?.exercise_name === exercise.exercise_name ? null : exercise)}
            >
              <LinearGradient colors={['#1f2937', '#111827']} style={styles.exerciseGradient}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                    <View style={styles.exerciseDetails}>
                      <Text style={styles.exerciseDetailText}>
                        {exercise.sets} sets
                      </Text>
                      {exercise.reps && exercise.reps.length > 0 && (
                        <>
                          <Text style={styles.exerciseDetailSeparator}>•</Text>
                          <Text style={styles.exerciseDetailText}>
                            {formatReps(exercise.reps)}
                          </Text>
                        </>
                      )}
                      {exercise.duration_seconds && (
                        <>
                          <Text style={styles.exerciseDetailSeparator}>•</Text>
                          <Text style={styles.exerciseDetailText}>
                            {formatDuration(exercise.duration_seconds)}
                          </Text>
                        </>
                      )}
                      <Text style={styles.exerciseDetailSeparator}>•</Text>
                      <Text style={styles.exerciseDetailText}>
                        {formatDuration(exercise.rest_seconds)} rest
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.infoButton}>
                    <Info size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {selectedExercise?.exercise_name === exercise.exercise_name && (
                  <View style={styles.exerciseExpanded}>
                    <View style={styles.exerciseMuscles}>
                      <Text style={styles.exerciseMusclesLabel}>Target Muscles:</Text>
                      <Text style={styles.exerciseMusclesText}>
                        {exercise.muscle_groups.join(', ').replace(/_/g, ' ')}
                      </Text>
                    </View>
                    
                    <View style={styles.exerciseInstructions}>
                      <Text style={styles.exerciseInstructionsLabel}>Instructions:</Text>
                      <Text style={styles.exerciseInstructionsText}>
                        {exercise.instructions}
                      </Text>
                    </View>

                    {exercise.tips && (
                      <View style={styles.exerciseTips}>
                        <Text style={styles.exerciseTipsLabel}>💡 Tips:</Text>
                        <Text style={styles.exerciseTipsText}>{exercise.tips}</Text>
                      </View>
                    )}

                    {exercise.weight_suggestion && (
                      <View style={styles.weightSuggestion}>
                        <Text style={styles.weightSuggestionLabel}>Weight Suggestion:</Text>
                        <Text style={styles.weightSuggestionText}>
                          {exercise.weight_suggestion.replace('_', ' ')}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tags */}
        {template.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {template.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag.replace(/_/g, '')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerControls: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  bookmarkedButton: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  headerActions: {
    flexDirection: 'row',
  },
  templateInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  templateBadges: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  goalBadgeText: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  popularityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  popularityText: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  templateName: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  statsContainer: {
    margin: 20,
  },
  statsGradient: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  startButton: {
    flex: 2,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  startButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  customizeButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  customizeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  equipmentList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleGroup: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  muscleGroupText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
  },
  exerciseCard: {
    marginBottom: 12,
  },
  exerciseGradient: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseNumber: {
    backgroundColor: '#FF6B35',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseDetailText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  exerciseDetailSeparator: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 6,
  },
  infoButton: {
    padding: 4,
  },
  exerciseExpanded: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  exerciseMuscles: {
    marginBottom: 12,
  },
  exerciseMusclesLabel: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  exerciseMusclesText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textTransform: 'capitalize',
  },
  exerciseInstructions: {
    marginBottom: 12,
  },
  exerciseInstructionsLabel: {
    fontSize: 12,
    color: '#9B59B6',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  exerciseInstructionsText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  exerciseTips: {
    marginBottom: 12,
  },
  exerciseTipsLabel: {
    fontSize: 12,
    color: '#2ECC71',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  exerciseTipsText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  weightSuggestion: {
    backgroundColor: '#FF6B3510',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B3530',
  },
  weightSuggestionLabel: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  weightSuggestionText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  tagText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  bottomSpacer: {
    height: 100,
  },
});
