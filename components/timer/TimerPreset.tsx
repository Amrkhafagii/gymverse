import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Clock,
  Zap,
  Target,
  Dumbbell,
  Heart,
  Timer,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface TimerPresetProps {
  preset: {
    id: string;
    name: string;
    duration: number; // in seconds
    type: 'rest' | 'work' | 'warmup' | 'cooldown' | 'interval' | 'custom';
    description?: string;
    color: string[];
  };
  onPress?: () => void;
  isSelected?: boolean;
}

export const TimerPreset: React.FC<TimerPresetProps> = ({
  preset,
  onPress,
  isSelected = false,
}) => {
  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  const getIcon = () => {
    switch (preset.type) {
      case 'rest':
        return <Clock size={24} color="#FFFFFF" />;
      case 'work':
        return <Zap size={24} color="#FFFFFF" />;
      case 'warmup':
        return <Heart size={24} color="#FFFFFF" />;
      case 'cooldown':
        return <Target size={24} color="#FFFFFF" />;
      case 'interval':
        return <Timer size={24} color="#FFFFFF" />;
      default:
        return <Dumbbell size={24} color="#FFFFFF" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={preset.color}
        style={[
          styles.gradient,
          isSelected && styles.selectedGradient,
        ]}
      >
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.name}>{preset.name}</Text>
          <Text style={styles.duration}>{formatDuration(preset.duration)}</Text>
          {preset.description && (
            <Text style={styles.description}>{preset.description}</Text>
          )}
        </View>

        {isSelected && (
          <View style={styles.selectedIndicator}>
            <View style={styles.selectedDot} />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    minWidth: 140,
  },
  selectedContainer: {
    transform: [{ scale: 1.02 }],
    ...DesignTokens.shadow.lg,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  selectedGradient: {
    borderWidth: 2,
    borderColor: DesignTokens.colors.primary[400],
  },
  iconContainer: {
    marginBottom: DesignTokens.spacing[2],
  },
  content: {
    alignItems: 'center',
  },
  name: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  duration: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    fontFamily: 'SF Mono',
    marginBottom: DesignTokens.spacing[1],
  },
  description: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    opacity: 0.8,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
  },
  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DesignTokens.colors.text.primary,
  },
});
