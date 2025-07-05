import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Heart,
  Share,
  BookOpen,
  Target,
  Timer,
  TrendingUp,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Exercise, ExerciseProgress } from '@/lib/supabase';
import FormVideoPlayer from '@/components/exercise/FormVideoPlayer';
import FormTipsModal from '@/components/exercise/FormTipsModal';
import ExerciseFormSection from '@/components/exercise/ExerciseFormSection';

const { width } = Dimensions.get('window');

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [progress, setProgress] = useState<ExerciseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'form' | 'progress'>('overview');

  useEffect(() => {
    if (id) {
      loadExerciseDetails();
    }
  }, [id]);

  const loadExerciseDetails = async () => {
    try {
      setLoading(true);

      // Load exercise details
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();

      if (exerciseError) throw exerciseError;
      setExercise(exerciseData);

      if (user) {
        // Check if exercise is favorited
        const { data: favoriteData } = await supabase
          .from('user_favorite_exercises')
          .select('id')
          .eq('user_id', user.id)
          .eq('exercise_id', id)
          .single();

        setIsFavorite(!!favoriteData);

        // Load progress data
        const { data: progressData, error: progressError } = await supabase
          .from('exercise_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('exercise_id', id)
          .order('recorded_at', { ascending: false })
          .limit(10);

        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Error loading progress:', progressError);
        } else {
          setProgress(progressData || []);
        }
      }
    } catch (error) {
      console.error('Error loading exercise details:', error);
      Alert.alert('Error', 'Failed to load exercise details');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !exercise) return;

    try {
      if (isFavorite) {
        await supabase
          .from('user_favorite_exercises')
          .delete()
          .eq('user_id', user.id)
          .eq('exercise_id', exercise.id);
      } else {
        await supabase
          .from('user_favorite_exercises')
          .insert({
            user_id: user.id,
            exercise_id: exercise.id,
          });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const handleShare = async () => {
    if (!exercise) return;
    
    try {
      // In a real app, you would use the Share API
      Alert.alert('Share Exercise', `Share "${exercise.name}" with friends!`);
    } catch (error) {
      console.error('Error sharing exercise:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getMuscleGroupColor = (muscleGroup: string) => {
    const colors: { [key: string]: string } = {
      chest: '#E91E63',
      back: '#3F51B5',
      shoulders: '#FF5722',
      arms: '#9C27B0',
      legs: '#4CAF50',
      core: '#FF9800',
      cardio: '#2196F3',
      full_body: '#795548',
    };
    return colors[muscleGroup] || '#999';
  };

  const renderTabContent = () => {
    if (!exercise) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            {/* Exercise Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: getDifficultyColor(exercise.difficulty_level) + '20' }]}>
                  <Target size={20} color={getDifficultyColor(exercise.difficulty_level)} />
                </View>
                <Text style={styles.statLabel}>Difficulty</Text>
                <Text style={styles.statValue}>{exercise.difficulty_level}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: getMuscleGroupColor(exercise.primary_muscle_group) + '20' }]}>
                  <TrendingUp size={20} color={getMuscleGroupColor(exercise.primary_muscle_group)} />
                </View>
                <Text style={styles.statLabel}>Primary</Text>
                <Text style={styles.statValue}>{exercise.primary_muscle_group}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#4A90E220' }]}>
                  <Timer size={20} color="#4A90E2" />
                </View>
                <Text style={styles.statLabel}>Type</Text>
                <Text style={styles.statValue}>{exercise.exercise_type}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {exercise.description || 'No description available for this exercise.'}
              </Text>
            </View>

            {/* Instructions */}
            {exercise.instructions && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Instructions</Text>
                {exercise.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Equipment */}
            {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Equipment Needed</Text>
                <View style={styles.equipmentList}>
                  {exercise.equipment_needed.map((equipment, index) => (
                    <View key={index} style={styles.equipmentTag}>
                      <Text style={styles.equipmentText}>{equipment}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Muscle Groups */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Muscle Groups</Text>
              <View style={styles.muscleGroups}>
                <View style={[styles.muscleTag, styles.primaryMuscle]}>
                  <Text style={styles.muscleTagText}>
                    {exercise.primary_muscle_group} (Primary)
                  </Text>
                </View>
                {exercise.secondary_muscle_groups?.map((muscle, index) => (
                  <View key={index} style={[styles.muscleTag, styles.secondaryMuscle]}>
                    <Text style={styles.muscleTagText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );

      case 'form':
        return <ExerciseFormSection exercise={exercise} />;

      case 'progress':
        return (
          <View style={styles.tabContent}>
            {progress.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Recent Progress</Text>
                {progress.map((record, index) => (
                  <View key={record.id} style={styles.progressItem}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressDate}>
                        {new Date(record.recorded_at).toLocaleDateString()}
                      </Text>
                      <Text style={styles.progressTime}>
                        {new Date(record.recorded_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <View style={styles.progressStats}>
                      {record.weight_kg && (
                        <Text style={styles.progressStat}>
                          Weight: {record.weight_kg}kg
                        </Text>
                      )}
                      {record.reps && (
                        <Text style={styles.progressStat}>
                          Reps: {record.reps}
                        </Text>
                      )}
                      {record.duration_seconds && (
                        <Text style={styles.progressStat}>
                          Duration: {Math.floor(record.duration_seconds / 60)}:{(record.duration_seconds % 60).toString().padStart(2, '0')}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <TrendingUp size={48} color="#666" />
                <Text style={styles.emptyTitle}>No Progress Yet</Text>
                <Text style={styles.emptyText}>
                  Start tracking this exercise to see your progress here
                </Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Exercise not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={toggleFavorite}>
              <Heart 
                size={24} 
                color={isFavorite ? "#FF6B35" : "#fff"} 
                fill={isFavorite ? "#FF6B35" : "transparent"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Share size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Exercise Image/Video */}
      {exercise.video_url ? (
        <FormVideoPlayer videoUrl={exercise.video_url} />
      ) : exercise.image_url ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: exercise.image_url }} style={styles.exerciseImage} />
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Play size={48} color="#666" />
          <Text style={styles.placeholderText}>No media available</Text>
        </View>
      )}

      {/* Exercise Info */}
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <View style={styles.exerciseMeta}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(exercise.difficulty_level) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(exercise.difficulty_level) }]}>
              {exercise.difficulty_level}
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <Text style={styles.muscleGroup}>{exercise.primary_muscle_group}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Info size={20} color={activeTab === 'overview' ? '#FF6B35' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'form' && styles.activeTab]}
          onPress={() => setActiveTab('form')}
        >
          <BookOpen size={20} color={activeTab === 'form' ? '#FF6B35' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'form' && styles.activeTabText]}>
            Form Guide
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <TrendingUp size={20} color={activeTab === 'progress' ? '#FF6B35' : '#999'} />
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Form Tips Modal */}
      <FormTipsModal
        visible={showTips}
        onClose={() => setShowTips(false)}
        exercise={exercise}
      />

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowTips(true)}>
          <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.actionButtonGradient}>
            <BookOpen size={20} color="#fff" />
            <Text style={styles.actionButtonText}>View Form Tips</Text>
            <ChevronRight size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#1a1a1a',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    height: 200,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
  exerciseInfo: {
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  exerciseName: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  metaDivider: {
    width: 4,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  muscleGroup: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B3520',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FF6B35',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  equipmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipmentTag: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  equipmentText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  primaryMuscle: {
    backgroundColor: '#FF6B3520',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  secondaryMuscle: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  muscleTagText: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  progressItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDate: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  progressTime: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  progressStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  progressStat: {
    fontSize: 12,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginRight: 16,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  actionContainer: {
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginHorizontal: 8,
  },
});
