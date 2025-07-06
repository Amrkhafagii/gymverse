import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Star,
  Clock,
  Target,
  Zap,
  Shield,
  TrendingUp,
  Play,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    description: string;
    muscle_groups: string[];
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    exercise_type: string;
    equipment: string[];
    demo_image_url: string;
    calories_per_minute: number;
    safety_rating: number;
    popularity_score: number;
    tags: string[];
  };
  isBookmarked?: boolean;
  personalStats?: {
    totalSessions: number;
    maxWeight: number;
    lastPerformed: string;
  };
  onPress: () => void;
  onBookmark?: () => void;
  onQuickStart?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  isBookmarked = false,
  personalStats,
  onPress,
  onBookmark,
  onQuickStart,
  variant = 'default',
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return DesignTokens.colors.success[500];
      case 'intermediate': return DesignTokens.colors.warning[500];
      case 'advanced': return DesignTokens.colors.error[500];
      default: return DesignTokens.colors.neutral[500];
    }
  };

  const getSafetyColor = (rating: number) => {
    if (rating >= 4) return DesignTokens.colors.success[500];
    if (rating >= 3) return DesignTokens.colors.warning[500];
    return DesignTokens.colors.error[500];
  };

  const handleBookmark = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmark?.();
  };

  const handleQuickStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onQuickStart?.();
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient colors={['#1f2937', '#111827']} style={styles.compactGradient}>
          <Image source={{ uri: exercise.demo_image_url }} style={styles.compactImage} />
          <View style={styles.compactContent}>
            <Text style={styles.compactName} numberOfLines={2}>{exercise.name}</Text>
            <View style={styles.compactMuscles}>
              {exercise.muscle_groups.slice(0, 2).map((muscle, index) => (
                <Text key={index} style={styles.compactMuscle}>
                  {muscle.replace('_', ' ')}
                </Text>
              ))}
            </View>
            <View style={styles.compactStats}>
              <View style={styles.compactStat}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.compactStatText}>{exercise.popularity_score}</Text>
              </View>
              <View style={[
                styles.compactDifficulty,
                { backgroundColor: getDifficultyColor(exercise.difficulty_level) + '20' }
              ]}>
                <Text style={[
                  styles.compactDifficultyText,
                  { color: getDifficultyColor(exercise.difficulty_level) }
                ]}>
                  {exercise.difficulty_level.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient colors={['#9E7FFF', '#7C3AED']} style={styles.featuredGradient}>
          <View style={styles.featuredHeader}>
            <View style={styles.featuredBadge}>
              <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
            <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton}>
              {isBookmarked ? (
                <BookmarkCheck size={20} color="#FFFFFF" />
              ) : (
                <Bookmark size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          
          <Image source={{ uri: exercise.demo_image_url }} style={styles.featuredImage} />
          
          <View style={styles.featuredContent}>
            <Text style={styles.featuredName}>{exercise.name}</Text>
            <Text style={styles.featuredDescription} numberOfLines={2}>
              {exercise.description}
            </Text>
            
            <View style={styles.featuredStats}>
              <View style={styles.featuredStat}>
                <Target size={16} color="#FFFFFF" />
                <Text style={styles.featuredStatText}>
                  {exercise.muscle_groups.slice(0, 2).join(', ')}
                </Text>
              </View>
              <View style={styles.featuredStat}>
                <Zap size={16} color="#FFFFFF" />
                <Text style={styles.featuredStatText}>{exercise.calories_per_minute} cal/min</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.quickStartButton} onPress={handleQuickStart}>
              <Play size={16} color="#9E7FFF" />
              <Text style={styles.quickStartText}>Quick Start</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.defaultCard} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.defaultGradient}>
        <Image source={{ uri: exercise.demo_image_url }} style={styles.defaultImage} />
        
        <View style={styles.defaultContent}>
          <View style={styles.defaultHeader}>
            <View style={styles.defaultTitleRow}>
              <Text style={styles.defaultName}>{exercise.name}</Text>
              <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton}>
                {isBookmarked ? (
                  <BookmarkCheck size={18} color={DesignTokens.colors.primary[500]} />
                ) : (
                  <Bookmark size={18} color={DesignTokens.colors.text.secondary} />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.defaultBadges}>
              <View style={styles.typeBadge}>
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

          <Text style={styles.defaultDescription} numberOfLines={2}>
            {exercise.description}
          </Text>

          {personalStats && (
            <View style={styles.personalStatsContainer}>
              <View style={styles.personalStatsHeader}>
                <TrendingUp size={14} color={DesignTokens.colors.primary[500]} />
                <Text style={styles.personalStatsTitle}>Your Progress</Text>
              </View>
              <View style={styles.personalStatsRow}>
                <Text style={styles.personalStatsText}>
                  {personalStats.totalSessions} sessions
                </Text>
                {personalStats.maxWeight > 0 && (
                  <Text style={styles.personalStatsText}>
                    Max: {personalStats.maxWeight}kg
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.defaultStats}>
            <View style={styles.defaultStat}>
              <Target size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.defaultStatText}>
                {exercise.muscle_groups.slice(0, 2).join(', ')}
                {exercise.muscle_groups.length > 2 && ` +${exercise.muscle_groups.length - 2}`}
              </Text>
            </View>
            <View style={styles.defaultStat}>
              <Zap size={14} color={DesignTokens.colors.warning[500]} />
              <Text style={styles.defaultStatText}>{exercise.calories_per_minute} cal/min</Text>
            </View>
            <View style={styles.defaultStat}>
              <Star size={14} color="#FFD700" />
              <Text style={styles.defaultStatText}>{exercise.popularity_score}</Text>
            </View>
            <View style={styles.defaultStat}>
              <Shield size={14} color={getSafetyColor(exercise.safety_rating)} />
              <Text style={styles.defaultStatText}>{exercise.safety_rating}/5</Text>
            </View>
          </View>

          <View style={styles.defaultTags}>
            {exercise.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.defaultTag}>
                <Text style={styles.defaultTagText}>#{tag}</Text>
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

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.quickStartButton} onPress={handleQuickStart}>
              <Play size={14} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.quickStartText}>Quick Start</Text>
            </TouchableOpacity>
            
            <View style={styles.ratingContainer}>
              <Clock size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.ratingText}>~{Math.ceil(exercise.calories_per_minute / 5)} min</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Compact variant styles
  compactCard: {
    width: 160,
    marginRight: DesignTokens.spacing[3],
  },
  compactGradient: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  compactImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  compactContent: {
    padding: DesignTokens.spacing[3],
  },
  compactName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
    lineHeight: DesignTokens.typography.fontSize.sm * 1.2,
  },
  compactMuscles: {
    marginBottom: DesignTokens.spacing[2],
  },
  compactMuscle: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'capitalize',
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactStatText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    fontFamily: 'SF Mono',
  },
  compactDifficulty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactDifficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },

  // Featured variant styles
  featuredCard: {
    marginBottom: DesignTokens.spacing[4],
  },
  featuredGradient: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    padding: DesignTokens.spacing[4],
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
  },
  featuredBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginLeft: DesignTokens.spacing[1],
  },
  featuredImage: {
    width: '100%',
    height: 120,
    borderRadius: DesignTokens.borderRadius.lg,
    marginBottom: DesignTokens.spacing[3],
    resizeMode: 'cover',
  },
  featuredContent: {
    alignItems: 'center',
  },
  featuredName: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  featuredDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[3],
    lineHeight: DesignTokens.typography.fontSize.sm * 1.4,
  },
  featuredStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
  },
  featuredStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredStatText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    marginLeft: DesignTokens.spacing[1],
    textTransform: 'capitalize',
  },

  // Default variant styles
  defaultCard: {
    marginBottom: DesignTokens.spacing[4],
  },
  defaultGradient: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  defaultImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  defaultContent: {
    padding: DesignTokens.spacing[4],
  },
  defaultHeader: {
    marginBottom: DesignTokens.spacing[3],
  },
  defaultTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  defaultName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    flex: 1,
    marginRight: DesignTokens.spacing[2],
  },
  defaultBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  typeBadge: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
  },
  typeBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
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
  defaultDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: DesignTokens.typography.fontSize.sm * 1.4,
    marginBottom: DesignTokens.spacing[3],
  },
  personalStatsContainer: {
    backgroundColor: DesignTokens.colors.primary[500] + '10',
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[3],
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500] + '30',
  },
  personalStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  personalStatsTitle: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginLeft: DesignTokens.spacing[1],
  },
  personalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  personalStatsText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontFamily: 'SF Mono',
  },
  defaultStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[3],
  },
  defaultStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  defaultStatText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    textTransform: 'capitalize',
  },
  defaultTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
    flexWrap: 'wrap',
  },
  defaultTag: {
    backgroundColor: DesignTokens.colors.neutral[800],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    marginRight: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[1],
  },
  defaultTagText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  moreTagsText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    fontStyle: 'italic',
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  equipmentLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginRight: DesignTokens.spacing[1],
  },
  equipmentText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    flex: 1,
    textTransform: 'capitalize',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookmarkButton: {
    padding: DesignTokens.spacing[1],
  },
  quickStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500],
  },
  quickStartText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginLeft: DesignTokens.spacing[1],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    fontFamily: 'SF Mono',
  },
});
