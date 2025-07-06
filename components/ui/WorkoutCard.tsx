/**
 * WorkoutCard component with intelligent media caching
 * Integrates with MediaCacheManager for offline-first image loading
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Clock, 
  Target, 
  TrendingUp, 
  Play, 
  MoreHorizontal,
  Wifi,
  WifiOff,
  Download
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useMediaCache } from '@/hooks/useMediaCache';

const { width } = Dimensions.get('window');

export interface WorkoutData {
  id: number | string;
  name: string;
  date: string;
  duration: string;
  exercises: number;
  image: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  muscleGroups: string[];
  lastPerformed?: string;
  completionRate?: number;
  personalRecords?: number;
}

export interface WorkoutCardProps {
  workout: WorkoutData;
  onPress: () => void;
  onQuickAction?: () => void;
  variant?: 'default' | 'compact' | 'featured';
  style?: ViewStyle;
  showInsights?: boolean;
  syncStatus?: 'synced' | 'pending' | 'failed' | 'offline';
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  onPress,
  onQuickAction,
  variant = 'default',
  style,
  showInsights = false,
  syncStatus = 'synced',
}) => {
  const { 
    getMediaUrl, 
    isLoading: imageLoading, 
    error: imageError,
    downloadProgress 
  } = useMediaCache();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    loadImage();
  }, [workout.image]);

  const loadImage = async () => {
    try {
      setImageLoadError(false);
      const cachedUri = await getMediaUrl(workout.image, 2); // Medium priority
      setImageUri(cachedUri);
    } catch (error) {
      console.error('Failed to load workout image:', error);
      setImageLoadError(true);
    }
  };

  const getDifficultyColor = () => {
    switch (workout.difficulty) {
      case 'Beginner':
        return DesignTokens.colors.success[500];
      case 'Intermediate':
        return DesignTokens.colors.warning[500];
      case 'Advanced':
        return DesignTokens.colors.error[500];
      default:
        return DesignTokens.colors.primary[500];
    }
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'offline':
        return <WifiOff size={16} color={DesignTokens.colors.text.secondary} />;
      case 'failed':
        return <WifiOff size={16} color={DesignTokens.colors.error[500]} />;
      case 'pending':
        return <Download size={16} color={DesignTokens.colors.warning[500]} />;
      default:
        return <Wifi size={16} color={DesignTokens.colors.success[500]} />;
    }
  };

  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  const cardStyles = [
    styles.card,
    isCompact && styles.compactCard,
    isFeatured && styles.featuredCard,
    style,
  ];

  return (
    <TouchableOpacity
      style={cardStyles}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Image Section */}
      <View style={[styles.imageContainer, isCompact && styles.compactImageContainer]}>
        {imageLoading && downloadProgress && (
          <View style={styles.downloadProgress}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${downloadProgress.percentage}%` }
              ]} 
            />
          </View>
        )}
        
        {imageUri && !imageLoadError ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageLoadError(true)}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Target size={32} color={DesignTokens.colors.text.secondary} />
          </View>
        )}

        {/* Image Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />

        {/* Difficulty Badge */}
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
          <Text style={styles.difficultyText}>{workout.difficulty}</Text>
        </View>

        {/* Sync Status */}
        <View style={styles.syncStatus}>
          {getSyncStatusIcon()}
        </View>

        {/* Quick Action Button */}
        {onQuickAction && (
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={onQuickAction}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Play size={20} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content Section */}
      <View style={[styles.content, isCompact && styles.compactContent]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={isCompact ? 1 : 2}>
              {workout.name}
            </Text>
            <Text style={styles.date}>{workout.date}</Text>
          </View>
          
          <TouchableOpacity style={styles.moreButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MoreHorizontal size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Clock size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.statText}>{workout.duration}</Text>
          </View>
          
          <View style={styles.stat}>
            <Target size={16} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.statText}>{workout.exercises} exercises</Text>
          </View>

          {workout.personalRecords && workout.personalRecords > 0 && (
            <View style={styles.stat}>
              <TrendingUp size={16} color={DesignTokens.colors.success[500]} />
              <Text style={[styles.statText, { color: DesignTokens.colors.success[500] }]}>
                {workout.personalRecords} PR{workout.personalRecords > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Muscle Groups */}
        {!isCompact && (
          <View style={styles.muscleGroups}>
            {workout.muscleGroups.slice(0, 3).map((group, index) => (
              <View key={index} style={styles.muscleGroupTag}>
                <Text style={styles.muscleGroupText}>{group}</Text>
              </View>
            ))}
            {workout.muscleGroups.length > 3 && (
              <Text style={styles.moreGroups}>
                +{workout.muscleGroups.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Insights */}
        {showInsights && !isCompact && (
          <View style={styles.insights}>
            {workout.lastPerformed && (
              <Text style={styles.insightText}>
                Last performed: {workout.lastPerformed}
              </Text>
            )}
            {workout.completionRate && (
              <Text style={styles.insightText}>
                {workout.completionRate}% completion rate
              </Text>
            )}
          </View>
        )}

        {/* Offline Indicator */}
        {syncStatus === 'offline' && (
          <View style={styles.offlineIndicator}>
            <WifiOff size={12} color={DesignTokens.colors.warning[500]} />
            <Text style={styles.offlineText}>Offline</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.xl,
    marginBottom: DesignTokens.spacing[4],
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  compactCard: {
    flexDirection: 'row',
    marginBottom: DesignTokens.spacing[3],
  },
  featuredCard: {
    ...DesignTokens.shadow.xl,
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500],
  },

  imageContainer: {
    height: 200,
    position: 'relative',
  },
  compactImageContainer: {
    width: 120,
    height: 100,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: DesignTokens.colors.surface.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },

  downloadProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    zIndex: 2,
  },

  progressBar: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
  },

  difficultyBadge: {
    position: 'absolute',
    top: DesignTokens.spacing[3],
    left: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
  },

  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },

  syncStatus: {
    position: 'absolute',
    top: DesignTokens.spacing[3],
    right: DesignTokens.spacing[3],
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  quickActionButton: {
    position: 'absolute',
    bottom: DesignTokens.spacing[3],
    right: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.primary[500],
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...DesignTokens.shadow.md,
  },

  content: {
    padding: DesignTokens.spacing[4],
  },
  compactContent: {
    flex: 1,
    padding: DesignTokens.spacing[3],
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },

  titleContainer: {
    flex: 1,
    marginRight: DesignTokens.spacing[2],
  },

  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },

  date: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  moreButton: {
    padding: DesignTokens.spacing[1],
  },

  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  statText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[3],
  },

  muscleGroupTag: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  muscleGroupText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },

  moreGroups: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    alignSelf: 'center',
  },

  insights: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border.primary,
    paddingTop: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[1],
  },

  insightText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontStyle: 'italic',
  },

  offlineIndicator: {
    position: 'absolute',
    bottom: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    backgroundColor: DesignTokens.colors.warning[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  offlineText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.warning[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
});
