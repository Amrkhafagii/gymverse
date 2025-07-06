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
  Users,
  Play,
  Bookmark,
  BookmarkCheck,
  Download,
  Share,
  Award,
  TrendingUp,
  User,
  Crown,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  creator: {
    name: string;
    avatar_url?: string;
    is_verified?: boolean;
    is_premium?: boolean;
  };
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  workout_type: string;
  estimated_duration_minutes: number;
  exercise_count: number;
  equipment_needed: string[];
  target_muscle_groups: string[];
  rating: number;
  total_ratings: number;
  downloads: number;
  is_premium: boolean;
  is_featured: boolean;
  tags: string[];
  preview_image_url?: string;
  created_at: string;
}

interface WorkoutTemplateCardProps {
  template: WorkoutTemplate;
  isBookmarked?: boolean;
  isDownloaded?: boolean;
  personalStats?: {
    timesUsed: number;
    lastUsed: string;
    averageRating: number;
  };
  onPress: () => void;
  onBookmark?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onQuickStart?: () => void;
  variant?: 'default' | 'compact' | 'featured' | 'minimal';
}

export const WorkoutTemplateCard: React.FC<WorkoutTemplateCardProps> = ({
  template,
  isBookmarked = false,
  isDownloaded = false,
  personalStats,
  onPress,
  onBookmark,
  onDownload,
  onShare,
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleBookmark = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBookmark?.();
  };

  const handleDownload = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDownload?.();
  };

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare?.();
  };

  const handleQuickStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onQuickStart?.();
  };

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (variant === 'minimal') {
    return (
      <TouchableOpacity style={styles.minimalCard} onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient colors={['#1f2937', '#111827']} style={styles.minimalGradient}>
          <View style={styles.minimalHeader}>
            <Text style={styles.minimalName} numberOfLines={1}>{template.name}</Text>
            <View style={styles.minimalRating}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={styles.minimalRatingText}>{template.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <View style={styles.minimalStats}>
            <View style={styles.minimalStat}>
              <Clock size={12} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.minimalStatText}>{formatDuration(template.estimated_duration_minutes)}</Text>
            </View>
            <View style={styles.minimalStat}>
              <Target size={12} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.minimalStatText}>{template.exercise_count} exercises</Text>
            </View>
          </View>
          
          <View style={[
            styles.minimalDifficulty,
            { backgroundColor: getDifficultyColor(template.difficulty_level) + '20' }
          ]}>
            <Text style={[
              styles.minimalDifficultyText,
              { color: getDifficultyColor(template.difficulty_level) }
            ]}>
              {template.difficulty_level.charAt(0).toUpperCase()}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handlePress} activeOpacity={0.8}>
        <LinearGradient colors={['#1f2937', '#111827']} style={styles.compactGradient}>
          {template.preview_image_url && (
            <Image source={{ uri: template.preview_image_url }} style={styles.compactImage} />
          )}
          
          <View style={styles.compactContent}>
            <View style={styles.compactHeader}>
              <Text style={styles.compactName} numberOfLines={2}>{template.name}</Text>
              {template.is_premium && (
                <Crown size={14} color="#FFD700" />
              )}
            </View>
            
            <View style={styles.compactCreator}>
              <User size={12} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.compactCreatorText} numberOfLines={1}>
                {template.creator.name}
              </Text>
              {template.creator.is_verified && (
                <Award size={10} color={DesignTokens.colors.primary[500]} />
              )}
            </View>
            
            <View style={styles.compactStats}>
              <View style={styles.compactStat}>
                <Star size={12} color="#FFD700" fill="#FFD700" />
                <Text style={styles.compactStatText}>{template.rating.toFixed(1)}</Text>
              </View>
              <View style={styles.compactStat}>
                <Clock size={12} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.compactStatText}>{formatDuration(template.estimated_duration_minutes)}</Text>
              </View>
            </View>
            
            <View style={[
              styles.compactDifficulty,
              { backgroundColor: getDifficultyColor(template.difficulty_level) + '20' }
            ]}>
              <Text style={[
                styles.compactDifficultyText,
                { color: getDifficultyColor(template.difficulty_level) }
              ]}>
                {template.difficulty_level}
              </Text>
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
            <View style={styles.featuredBadges}>
              <View style={styles.featuredBadge}>
                <Star size={16} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
              {template.is_premium && (
                <View style={styles.premiumBadge}>
                  <Crown size={14} color="#FFD700" />
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton}>
              {isBookmarked ? (
                <BookmarkCheck size={20} color="#FFFFFF" />
              ) : (
                <Bookmark size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
          
          {template.preview_image_url && (
            <Image source={{ uri: template.preview_image_url }} style={styles.featuredImage} />
          )}
          
          <View style={styles.featuredContent}>
            <Text style={styles.featuredName}>{template.name}</Text>
            <Text style={styles.featuredDescription} numberOfLines={2}>
              {template.description}
            </Text>
            
            <View style={styles.featuredCreator}>
              <View style={styles.featuredCreatorInfo}>
                <User size={16} color="#FFFFFF" />
                <Text style={styles.featuredCreatorName}>{template.creator.name}</Text>
                {template.creator.is_verified && (
                  <Award size={14} color="#FFFFFF" />
                )}
              </View>
            </View>
            
            <View style={styles.featuredStats}>
              <View style={styles.featuredStat}>
                <Star size={16} color="#FFFFFF" />
                <Text style={styles.featuredStatText}>{template.rating.toFixed(1)} ({formatNumber(template.total_ratings)})</Text>
              </View>
              <View style={styles.featuredStat}>
                <Download size={16} color="#FFFFFF" />
                <Text style={styles.featuredStatText}>{formatNumber(template.downloads)}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.quickStartButton} onPress={handleQuickStart}>
              <Play size={16} color="#9E7FFF" />
              <Text style={styles.quickStartText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.defaultCard} onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.defaultGradient}>
        {template.preview_image_url && (
          <Image source={{ uri: template.preview_image_url }} style={styles.defaultImage} />
        )}
        
        <View style={styles.defaultContent}>
          <View style={styles.defaultHeader}>
            <View style={styles.defaultTitleRow}>
              <Text style={styles.defaultName}>{template.name}</Text>
              <View style={styles.defaultHeaderActions}>
                {template.is_premium && (
                  <Crown size={16} color="#FFD700" />
                )}
                <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton}>
                  {isBookmarked ? (
                    <BookmarkCheck size={18} color={DesignTokens.colors.primary[500]} />
                  ) : (
                    <Bookmark size={18} color={DesignTokens.colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.defaultBadges}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{template.workout_type}</Text>
              </View>
              <View style={[
                styles.difficultyBadge,
                { backgroundColor: getDifficultyColor(template.difficulty_level) + '20' }
              ]}>
                <Text style={[
                  styles.difficultyText,
                  { color: getDifficultyColor(template.difficulty_level) }
                ]}>
                  {template.difficulty_level}
                </Text>
              </View>
              {template.is_featured && (
                <View style={styles.featuredSmallBadge}>
                  <Text style={styles.featuredSmallBadgeText}>Featured</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.defaultDescription} numberOfLines={2}>
            {template.description}
          </Text>

          <View style={styles.creatorSection}>
            <View style={styles.creatorInfo}>
              {template.creator.avatar_url ? (
                <Image source={{ uri: template.creator.avatar_url }} style={styles.creatorAvatar} />
              ) : (
                <View style={styles.creatorAvatarPlaceholder}>
                  <User size={16} color={DesignTokens.colors.text.secondary} />
                </View>
              )}
              <View style={styles.creatorDetails}>
                <View style={styles.creatorNameRow}>
                  <Text style={styles.creatorName}>{template.creator.name}</Text>
                  {template.creator.is_verified && (
                    <Award size={12} color={DesignTokens.colors.primary[500]} />
                  )}
                  {template.creator.is_premium && (
                    <Crown size={12} color="#FFD700" />
                  )}
                </View>
                <Text style={styles.creatorDate}>
                  Created {new Date(template.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {personalStats && (
            <View style={styles.personalStatsContainer}>
              <View style={styles.personalStatsHeader}>
                <TrendingUp size={14} color={DesignTokens.colors.primary[500]} />
                <Text style={styles.personalStatsTitle}>Your Usage</Text>
              </View>
              <View style={styles.personalStatsRow}>
                <Text style={styles.personalStatsText}>
                  Used {personalStats.timesUsed} times
                </Text>
                <Text style={styles.personalStatsText}>
                  Avg: {personalStats.averageRating.toFixed(1)}★
                </Text>
              </View>
            </View>
          )}

          <View style={styles.defaultStats}>
            <View style={styles.defaultStat}>
              <Star size={14} color="#FFD700" />
              <Text style={styles.defaultStatText}>
                {template.rating.toFixed(1)} ({formatNumber(template.total_ratings)})
              </Text>
            </View>
            <View style={styles.defaultStat}>
              <Clock size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.defaultStatText}>{formatDuration(template.estimated_duration_minutes)}</Text>
            </View>
            <View style={styles.defaultStat}>
              <Target size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.defaultStatText}>{template.exercise_count} exercises</Text>
            </View>
            <View style={styles.defaultStat}>
              <Download size={14} color={DesignTokens.colors.success[500]} />
              <Text style={styles.defaultStatText}>{formatNumber(template.downloads)}</Text>
            </View>
          </View>

          <View style={styles.muscleGroups}>
            <Text style={styles.muscleGroupsLabel}>Target:</Text>
            <View style={styles.muscleGroupsList}>
              {template.target_muscle_groups.slice(0, 3).map((muscle, index) => (
                <Text key={index} style={styles.muscleGroupText}>
                  {muscle.replace('_', ' ')}
                  {index < Math.min(template.target_muscle_groups.length, 3) - 1 && ', '}
                </Text>
              ))}
              {template.target_muscle_groups.length > 3 && (
                <Text style={styles.moreMusclesText}>+{template.target_muscle_groups.length - 3}</Text>
              )}
            </View>
          </View>

          {template.equipment_needed.length > 0 && (
            <View style={styles.equipmentContainer}>
              <Text style={styles.equipmentLabel}>Equipment:</Text>
              <Text style={styles.equipmentText} numberOfLines={1}>
                {template.equipment_needed.length === 0 ? 'Bodyweight' : 
                 template.equipment_needed.join(', ').replace(/_/g, ' ')}
              </Text>
            </View>
          )}

          <View style={styles.defaultTags}>
            {template.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.defaultTag}>
                <Text style={styles.defaultTagText}>#{tag}</Text>
              </View>
            ))}
            {template.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{template.tags.length - 3}</Text>
            )}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.quickStartButton} onPress={handleQuickStart}>
              <Play size={14} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.quickStartText}>Start Now</Text>
            </TouchableOpacity>
            
            <View style={styles.actionButtons}>
              {!isDownloaded && (
                <TouchableOpacity onPress={handleDownload} style={styles.actionButton}>
                  <Download size={16} color={DesignTokens.colors.text.secondary} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Share size={16} color={DesignTokens.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {isDownloaded && (
            <View style={styles.downloadedIndicator}>
              <Download size={12} color={DesignTokens.colors.success[500]} />
              <Text style={styles.downloadedText}>Downloaded</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Minimal variant styles
  minimalCard: {
    width: 140,
    marginRight: DesignTokens.spacing[3],
  },
  minimalGradient: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
    position: 'relative',
  },
  minimalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  minimalName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    flex: 1,
    marginRight: DesignTokens.spacing[1],
  },
  minimalRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimalRatingText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    fontFamily: 'SF Mono',
  },
  minimalStats: {
    marginBottom: DesignTokens.spacing[2],
  },
  minimalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  minimalStatText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
  },
  minimalDifficulty: {
    position: 'absolute',
    bottom: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalDifficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },

  // Compact variant styles
  compactCard: {
    width: 200,
    marginRight: DesignTokens.spacing[4],
  },
  compactGradient: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  compactImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  compactContent: {
    padding: DesignTokens.spacing[4],
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  compactName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    flex: 1,
    marginRight: DesignTokens.spacing[2],
    lineHeight: DesignTokens.typography.fontSize.base * 1.2,
  },
  compactCreator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  compactCreatorText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    marginRight: DesignTokens.spacing[1],
    flex: 1,
  },
  compactStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[2],
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
    alignSelf: 'flex-start',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
  },
  compactDifficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
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
  featuredBadges: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
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
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
  },
  premiumBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFD700',
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
  featuredCreator: {
    marginBottom: DesignTokens.spacing[3],
  },
  featuredCreatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredCreatorName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginLeft: DesignTokens.spacing[1],
    marginRight: DesignTokens.spacing[1],
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
    fontFamily: 'SF Mono',
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
  defaultHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  defaultBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    flexWrap: 'wrap',
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
  featuredSmallBadge: {
    backgroundColor: DesignTokens.colors.warning[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
  },
  featuredSmallBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.warning[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  defaultDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: DesignTokens.typography.fontSize.sm * 1.4,
    marginBottom: DesignTokens.spacing[3],
  },
  creatorSection: {
    marginBottom: DesignTokens.spacing[3],
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: DesignTokens.spacing[3],
  },
  creatorAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.neutral[800],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  creatorDetails: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  creatorName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  creatorDate: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
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
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
  },
  defaultStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  defaultStatText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    fontFamily: 'SF Mono',
  },
  muscleGroups: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  muscleGroupsLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginRight: DesignTokens.spacing[1],
  },
  muscleGroupsList: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  muscleGroupText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'capitalize',
  },
  moreMusclesText: {
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
  defaultTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  actionButton: {
    padding: DesignTokens.spacing[2],
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
  downloadedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
  },
  downloadedText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.success[500],
    marginLeft: DesignTokens.spacing[1],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
