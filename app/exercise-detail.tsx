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
  Bookmark, 
  Share2, 
  Play, 
  Plus,
  Target, 
  Zap, 
  Star,
  Flame,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Dumbbell,
  Heart,
  Activity
} from 'lucide-react-native';
import { getExerciseById, ExerciseData } from '@/lib/data/exerciseDatabase';
import { useAuth } from '@/contexts/AuthContext';

export default function ExerciseDetailScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'instructions' | 'variations'>('overview');

  const exercise = getExerciseById(exerciseId);

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
      case 'strength': return <Dumbbell size={20} color="#FF6B35" />;
      case 'cardio': return <Heart size={20} color="#E74C3C" />;
      case 'flexibility': return <Zap size={20} color="#2ECC71" />;
      case 'balance': return <Target size={20} color="#9B59B6" />;
      case 'plyometric': return <Activity size={20} color="#3498DB" />;
      default: return <Target size={20} color="#95A5A6" />;
    }
  };

  const getSafetyColor = (rating: number) => {
    if (rating >= 4) return '#2ECC71';
    if (rating >= 3) return '#F39C12';
    return '#E74C3C';
  };

  const handleBookmark = () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to bookmark exercises.');
      return;
    }
    
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality with backend
  };

  const handleShare = () => {
    Alert.alert(
      'Share Exercise',
      `Share "${exercise.name}" with friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => {
          // TODO: Implement share functionality
          console.log('Sharing exercise:', exercise.name);
        }}
      ]
    );
  };

  const handleAddToWorkout = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to add exercises to workouts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/sign-in') }
        ]
      );
      return;
    }

    Alert.alert(
      'Add to Workout',
      'Choose how to add this exercise:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create New Workout', 
          onPress: () => router.push({
            pathname: '/(tabs)/create-workout',
            params: { preselectedExercise: exercise.id }
          })
        },
        { 
          text: 'Add to Existing', 
          onPress: () => {
            // TODO: Show workout selection modal
            Alert.alert('Feature Coming Soon', 'Adding to existing workouts will be available soon!');
          }
        }
      ]
    );
  };

  const handleStartQuickWorkout = () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to start workouts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/auth/sign-in') }
        ]
      );
      return;
    }

    Alert.alert(
      'Quick Workout',
      `Start a quick workout with ${exercise.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => {
            // TODO: Create quick workout session with this exercise
            Alert.alert('Feature Coming Soon', 'Quick workouts will be available soon!');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: exercise.demo_image_url }} style={styles.headerImage} />
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

          {/* Exercise Info Overlay */}
          <View style={styles.exerciseInfo}>
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
              <View style={styles.popularityBadge}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.popularityText}>{exercise.popularity_score}</Text>
              </View>
            </View>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient colors={['#1f2937', '#111827']} style={styles.statsGradient}>
            <View style={styles.statItem}>
              <Flame size={24} color="#E74C3C" />
              <Text style={styles.statValue}>{exercise.calories_per_minute}</Text>
              <Text style={styles.statLabel}>Cal/Min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Shield size={24} color={getSafetyColor(exercise.safety_rating)} />
              <Text style={styles.statValue}>{exercise.safety_rating}/5</Text>
              <Text style={styles.statLabel}>Safety</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Target size={24} color="#9B59B6" />
              <Text style={styles.statValue}>{exercise.muscle_groups.length}</Text>
              <Text style={styles.statLabel}>Muscles</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleStartQuickWorkout}>
            <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.primaryButtonGradient}>
              <Play size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Quick Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleAddToWorkout}>
            <Plus size={20} color="#FF6B35" />
            <Text style={styles.secondaryButtonText}>Add to Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {[
            { key: 'overview', label: 'Overview', icon: <Info size={16} color="#fff" /> },
            { key: 'instructions', label: 'Instructions', icon: <CheckCircle size={16} color="#fff" /> },
            { key: 'variations', label: 'Variations', icon: <Zap size={16} color="#fff" /> },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
              onPress={() => setSelectedTab(tab.key as any)}
            >
              {tab.icon}
              <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {selectedTab === 'overview' && (
            <View>
              {/* Target Muscles */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Target Muscles</Text>
                <View style={styles.muscleGroups}>
                  {exercise.muscle_groups.map((muscle, index) => (
                    <View key={index} style={styles.muscleGroup}>
                      <Text style={styles.muscleGroupText}>
                        {muscle.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Equipment */}
              {exercise.equipment.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Equipment Needed</Text>
                  <View style={styles.equipmentList}>
                    {exercise.equipment.map((equipment, index) => (
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

              {/* Exercise Properties */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Exercise Properties</Text>
                <View style={styles.propertiesGrid}>
                  <View style={styles.propertyItem}>
                    <View style={styles.propertyIcon}>
                      <Target size={20} color="#FF6B35" />
                    </View>
                    <Text style={styles.propertyLabel}>Type</Text>
                    <Text style={styles.propertyValue}>{exercise.is_compound ? 'Compound' : 'Isolation'}</Text>
                  </View>
                  <View style={styles.propertyItem}>
                    <View style={styles.propertyIcon}>
                      <Zap size={20} color="#9B59B6" />
                    </View>
                    <Text style={styles.propertyLabel}>Movement</Text>
                    <Text style={styles.propertyValue}>{exercise.is_unilateral ? 'Unilateral' : 'Bilateral'}</Text>
                  </View>
                </View>
              </View>

              {/* Tips */}
              {exercise.tips.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
                  <View style={styles.tipsList}>
                    {exercise.tips.map((tip, index) => (
                      <View key={index} style={styles.tipItem}>
                        <View style={styles.tipBullet} />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Common Mistakes */}
              {exercise.common_mistakes.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>⚠️ Common Mistakes</Text>
                  <View style={styles.mistakesList}>
                    {exercise.common_mistakes.map((mistake, index) => (
                      <View key={index} style={styles.mistakeItem}>
                        <AlertTriangle size={16} color="#E74C3C" />
                        <Text style={styles.mistakeText}>{mistake}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {selectedTab === 'instructions' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Step-by-Step Instructions</Text>
              <View style={styles.instructionsList}>
                {exercise.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <View style={styles.instructionNumber}>
                      <Text style={styles.instructionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.instructionText}>{instruction}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {selectedTab === 'variations' && (
            <View>
              {exercise.variations.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Exercise Variations</Text>
                  <View style={styles.variationsList}>
                    {exercise.variations.map((variation, index) => (
                      <View key={index} style={styles.variationItem}>
                        <LinearGradient colors={['#1f2937', '#111827']} style={styles.variationGradient}>
                          <View style={styles.variationHeader}>
                            <Text style={styles.variationName}>{variation}</Text>
                            <ChevronRight size={16} color="#666" />
                          </View>
                        </LinearGradient>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.emptyVariations}>
                  <Text style={styles.emptyVariationsText}>No variations available for this exercise</Text>
                </View>
              )}

              {/* Alternative Names */}
              {exercise.alternative_names.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Also Known As</Text>
                  <View style={styles.alternativeNames}>
                    {exercise.alternative_names.map((name, index) => (
                      <View key={index} style={styles.alternativeName}>
                        <Text style={styles.alternativeNameText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Tags */}
        {exercise.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tags}>
              {exercise.tags.map((tag, index) => (
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
  exerciseInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  exerciseBadges: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  typeBadgeText: {
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
  exerciseName: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  exerciseDescription: {
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
  primaryButton: {
    flex: 2,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    flexDirection: 'row',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  tabActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
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
  propertiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propertyItem: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  propertyIcon: {
    marginBottom: 8,
  },
  propertyLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  propertyValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  tipsList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2ECC71',
    marginTop: 6,
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    flex: 1,
  },
  mistakesList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mistakeText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    flex: 1,
    marginLeft: 12,
  },
  instructionsList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionNumber: {
    backgroundColor: '#FF6B35',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  instructionText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    flex: 1,
  },
  variationsList: {
    gap: 8,
  },
  variationItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  variationGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  variationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  variationName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
  },
  emptyVariations: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyVariationsText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  alternativeNames: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  alternativeName: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  alternativeNameText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
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
