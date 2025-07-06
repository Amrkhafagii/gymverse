import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play,
  Pause,
  RotateCcw,
  Clock,
  Zap,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface WorkoutSessionTimerProps {
  isActive: boolean;
  onToggle: () => void;
  onReset: () => void;
  totalDuration: number;
  restDuration?: number;
  isResting: boolean;
  onRestComplete?: () => void;
}

export default function WorkoutSessionTimer({
  isActive,
  onToggle,
  onReset,
  totalDuration,
  restDuration = 0,
  isResting,
  onRestComplete,
}: WorkoutSessionTimerProps) {
  const [currentRestTime, setCurrentRestTime] = useState(0);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isResting && restDuration > 0) {
      setCurrentRestTime(restDuration);
      
      // Start rest timer
      restIntervalRef.current = setInterval(() => {
        setCurrentRestTime(prev => {
          if (prev <= 1) {
            onRestComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Animate progress
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: restDuration * 1000,
        useNativeDriver: false,
      }).start();
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
      progressAnim.setValue(0);
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [isResting, restDuration, onRestComplete]);

  useEffect(() => {
    if (isActive) {
      // Pulse animation when active
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isActive) pulse();
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  const handleToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggle();
  };

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onReset();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getRestProgress = () => {
    if (!isResting || restDuration === 0) return 0;
    return ((restDuration - currentRestTime) / restDuration) * 100;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isResting ? ['#ef4444', '#dc2626'] : isActive ? ['#10b981', '#059669'] : ['#1f2937', '#111827']}
        style={styles.gradient}
      >
        {/* Main Timer Display */}
        <View style={styles.timerSection}>
          <View style={styles.timerHeader}>
            <Clock size={16} color={DesignTokens.colors.text.primary} />
            <Text style={styles.timerLabel}>
              {isResting ? 'Rest Time' : 'Workout Time'}
            </Text>
          </View>
          
          <Animated.View style={[styles.timerDisplay, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.timerText}>
              {isResting ? formatTime(currentRestTime) : formatTime(totalDuration)}
            </Text>
          </Animated.View>

          {isResting && (
            <View style={styles.restProgress}>
              <View style={styles.restProgressTrack}>
                <Animated.View
                  style={[
                    styles.restProgressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.restProgressText}>
                {Math.round(getRestProgress())}% complete
              </Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={handleReset}
          >
            <RotateCcw size={20} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.playButton,
              isActive && styles.playButtonActive,
            ]}
            onPress={handleToggle}
          >
            {isActive ? (
              <Pause size={24} color={DesignTokens.colors.text.primary} />
            ) : (
              <Play size={24} color={DesignTokens.colors.text.primary} />
            )}
          </TouchableOpacity>

          <View style={styles.controlButton}>
            <Zap size={20} color={isActive ? DesignTokens.colors.success[500] : DesignTokens.colors.text.secondary} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{Math.floor(totalDuration / 60)}</Text>
            <Text style={styles.quickStatLabel}>Minutes</Text>
          </View>
          
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>
              {isResting ? Math.ceil(currentRestTime / 60) : '0'}
            </Text>
            <Text style={styles.quickStatLabel}>Rest Left</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
  },
  gradient: {
    padding: DesignTokens.spacing[5],
    alignItems: 'center',
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[5],
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  timerLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginLeft: DesignTokens.spacing[2],
    opacity: 0.9,
  },
  timerDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  timerText: {
    fontSize: 48,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
    textAlign: 'center',
  },
  restProgress: {
    alignItems: 'center',
    width: '100%',
  },
  restProgressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[2],
  },
  restProgressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.text.primary,
    borderRadius: 2,
  },
  restProgressText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    opacity: 0.8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[4],
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resetButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  quickStatLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    opacity: 0.8,
    marginTop: DesignTokens.spacing[1],
  },
});
