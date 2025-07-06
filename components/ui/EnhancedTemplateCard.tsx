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
  Clock, 
  Target, 
  Play, 
  Bookmark, 
  BookmarkCheck,
  Eye,
  TrendingUp 
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface WorkoutTemplate {
  id: number;
  name: string;
  description: string;
  duration: string;
  exercises: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  muscleGroups: string[];
  popularity?: number;
  isBookmarked?: boolean;
  completionRate?: number;
}

interface EnhancedTemplateCardProps {
  template: WorkoutTemplate;
  onPreview: () => void;
  onStart: () => void;
  onBookmark: () => void;
  variant?: 'grid' | 'list';
}

export const EnhancedTemplateCard: React.FC<EnhancedTemplateCardProps> = ({
  template,
  onPreview,
  onStart,
  onBookmark,
  variant = 'grid',
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return DesignTokens.colors.success[500];
      case 'Intermediate': return DesignTokens.colors.warning[500];
      case 'Advanced': return DesignTokens.colors.error[500];
      default: return DesignTokens.colors.text.secondary;
    }
  };

  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPreview} activeOpacity={0.8}>
        <Image source={{ uri: template.image }} style={styles.listImage} />
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.listName} numberOfLines={1}>
              {template.name}
            </Text>
            <TouchableOpacity onPress={onBookmark} style={styles.bookmarkButton}>
              {template.isBookmarked ? (
                <BookmarkCheck size={18} color={DesignTokens.colors.primary[500]} />
              ) : (
                <Bookmark size={18} color={DesignTokens.colors.text.tertiary} />
              )}
            </TouchableOpacity>
          </View>
          
          <Text style={styles.listDescription} numberOfLines={2}>
            {template.description}
          </Text>
          
          <View style={styles.listMeta}>
            <View style={styles.metaItem}>
              <Clock size={12} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.listMetaText}>{template.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Target size={12} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.listMetaText}>{template.exercises} exercises</Text>
            </View>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(template.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>{template.difficulty}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.listStartButton} onPress={onStart}>
          <Play size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPreview} activeOpacity={0.8}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.cardGradient}
      >
        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: template.image }} style={styles.gridImage} />
          
          {/* Overlay Actions */}
          <View style={styles.imageOverlay}>
            <TouchableOpacity onPress={onBookmark} style={styles.overlayButton}>
              {template.isBookmarked ? (
                <BookmarkCheck size={16} color={DesignTokens.colors.primary[500]} />
              ) : (
                <Bookmark size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onPreview} style={styles.overlayButton}>
              <Eye size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          {/* Popularity Indicator */}
          {template.popularity && template.popularity > 80 && (
            <View style={styles.popularityBadge}>
              <TrendingUp size={12} color="#FFFFFF" />
              <Text style={styles.popularityText}>Popular</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.gridContent}>
          <Text style={styles.gridName} numberOfLines={2}>
            {template.name}
          </Text>
          
          <Text style={styles.gridDescription} numberOfLines={2}>
            {template.description}
          </Text>

          {/* Meta Information */}
          <View style={styles.gridMeta}>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Clock size={14} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.gridMetaText}>{template.duration}</Text>
              </View>
              <View style={styles.metaItem}>
                <Target size={14} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.gridMetaText}>{template.exercises}</Text>
              </View>
            </View>
            
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(template.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>{template.difficulty}</Text>
            </View>
          </View>

          {/* Muscle Groups */}
          <View style={styles.muscleGroups}>
            {template.muscleGroups.slice(0, 2).map((group, index) => (
              <View key={index} style={styles.muscleTag}>
                <Text style={styles.muscleTagText}>{group}</Text>
              </View>
            ))}
            {template.muscleGroups.length > 2 && (
              <Text style={styles.moreText}>+{template.muscleGroups.length - 2}</Text>
            )}
          </View>

          {/* Completion Rate */}
          {template.completionRate && (
            <View style={styles.completionRate}>
              <View style={styles.completionBar}>
                <View 
                  style={[
                    styles.completionFill,
                    { width: `${template.completionRate}%` }
                  ]} 
                />
              </View>
              <Text style={styles.completionText}>{template.completionRate}% completion</Text>
            </View>
          )}

          {/* Start Button */}
          <TouchableOpacity style={styles.gridStartButton} onPress={onStart}>
            <Play size={16} color="#FFFFFF" />
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Card Styles
  gridCard: {
    flex: 1,
    margin: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  cardGradient: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  overlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  popularityBadge: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    left: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    gap: DesignTokens.spacing[1],
  },
  popularityText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  gridContent: {
    padding: DesignTokens.spacing[3],
  },
  gridName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  gridDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[3],
    lineHeight: 18,
  },
  gridMeta: {
    marginBottom: DesignTokens.spacing[3],
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[2],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  gridMetaText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  difficultyText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
  muscleGroups: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[3],
  },
  muscleTag: {
    backgroundColor: DesignTokens.colors.neutral[800],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  muscleTagText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  moreText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  completionRate: {
    marginBottom: DesignTokens.spacing[3],
  },
  completionBar: {
    height: 4,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 2,
    marginBottom: DesignTokens.spacing[1],
  },
  completionFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.success[500],
    borderRadius: 2,
  },
  completionText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  gridStartButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[1],
  },
  startButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },

  // List Card Styles
  listCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[2],
    ...DesignTokens.shadow.base,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: DesignTokens.borderRadius.md,
    marginRight: DesignTokens.spacing[3],
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  listName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  bookmarkButton: {
    padding: DesignTokens.spacing[1],
  },
  listDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[2],
    lineHeight: 18,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  listMetaText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  listStartButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    marginLeft: DesignTokens.spacing[3],
  },
});
