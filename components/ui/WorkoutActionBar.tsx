import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Heart, 
  Share2, 
  Bookmark,
  Edit3,
  Copy,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface WorkoutActionBarProps {
  onStartWorkout: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  onSave: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  isFavorited: boolean;
  isSaved: boolean;
  canEdit?: boolean;
  disabled?: boolean;
}

export const WorkoutActionBar: React.FC<WorkoutActionBarProps> = ({
  onStartWorkout,
  onToggleFavorite,
  onShare,
  onSave,
  onEdit,
  onDuplicate,
  isFavorited,
  isSaved,
  canEdit = false,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Secondary Actions */}
      <View style={styles.secondaryActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onToggleFavorite}
        >
          <Heart 
            size={20} 
            color={isFavorited ? '#EF4444' : DesignTokens.colors.text.secondary}
            fill={isFavorited ? '#EF4444' : 'none'}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onSave}
        >
          <Bookmark 
            size={20} 
            color={isSaved ? DesignTokens.colors.primary[500] : DesignTokens.colors.text.secondary}
            fill={isSaved ? DesignTokens.colors.primary[500] : 'none'}
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onShare}
        >
          <Share2 size={20} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>

        {canEdit && onEdit && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onEdit}
          >
            <Edit3 size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        )}

        {onDuplicate && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onDuplicate}
          >
            <Copy size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Primary Action */}
      <TouchableOpacity 
        style={[styles.startButton, disabled && styles.disabledButton]}
        onPress={onStartWorkout}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={disabled ? ['#404040', '#262626'] : ['#9E7FFF', '#7C3AED']}
          style={styles.startButtonGradient}
        >
          <Play size={24} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start Workout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    backdropFilter: 'blur(20px)',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[4],
    paddingBottom: DesignTokens.spacing[8],
    borderTopLeftRadius: DesignTokens.borderRadius.xl,
    borderTopRightRadius: DesignTokens.borderRadius.xl,
    ...DesignTokens.shadow.xl,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[4],
  },
  actionButton: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadow.base,
  },
  startButton: {
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[4],
    paddingHorizontal: DesignTokens.spacing[6],
    gap: DesignTokens.spacing[2],
  },
  startButtonText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
});
