/**
 * RestTimerModal - Previously unused, now integrated into workout sessions
 * Full-screen rest timer with customizable duration and motivational features
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

export interface RestTimerModalProps {
  visible: boolean;
  onClose: () => void;
  initialDuration: number; // in seconds
  exerciseName: string;
  setNumber: number;
  onComplete: () => void;
  onSkip?: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  visible,
  onClose,
  initialDuration,
  exerciseName,
  setNumber,
  onComplete,
  onSkip,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(true);
  const [customDuration, setCustomDuration] = useState(initialDuration);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  // Start pulse animation
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      const pulse = Animated.loop(
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
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isRunning, timeRemaining]);

  // Progress animation
  useEffect(() => {
    const progress = (initialDuration - timeRemaining) / initialDuration;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [timeRemaining, initialDuration]);

  // Timer logic
  useEffect(() => {
    if (visible) {
      setTimeRemaining(initialDuration);
      setCustomDuration(initialDuration);
      setIsRunning(true);
    }
  }, [visible, initialDuration]);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          
          // Haptic feedback for last 3 seconds
          if (prev <= 3) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Vibration pattern for completion
    if (soundEnabled) {
      Vibration.vibrate([0, 500, 200, 500]);
    }
    
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    Alert.alert(
      'Rest Complete!',
      `Time to get back to ${exerciseName}`,
      [
        { text: 'Add 30s', onPress: () => addTime(30) },
        { text: 'Start Set', onPress: onComplete },
      ]
    );
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const resetTimer = () => {
    setTimeRemaining(customDuration);
    setIsRunning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const addTime = (seconds: number) => {
    setTimeRemaining(prev => prev + seconds);
    setCustomDuration(prev => prev + seconds);
    if (!isRunning) setIsRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const subtractTime = (seconds: number) => {
    setTimeRemaining(prev => Math.max(0, prev - seconds));
    setCustomDuration(prev => Math.max(30, prev - seconds));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string[] => {
    if (timeRemaining <= 10) return ['#EF4444', '#DC2626'];
    if (timeRemaining <= 30) return ['#F59E0B', '#D97706'];
    return ['#10B981', '#059669'];
  };

  const getMotivationalMessage = (): string => {
    const percentage = (timeRemaining / initialDuration) * 100;
    if (percentage > 75) return 'Take your time to recover';
    if (percentage > 50) return 'Halfway through your rest';
    if (percentage > 25) return 'Almost ready for the next set';
    return 'Get ready to crush it!';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarHidden
    >
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.exerciseName}>{exerciseName}</Text>
            <Text style={styles.setInfo}>Set {setNumber} • Rest Time</Text>
          </View>
          
          <TouchableOpacity 
            onPress={() => setSoundEnabled(!soundEnabled)} 
            style={styles.soundButton}
          >
            {soundEnabled ? (
              <Volume2 size={24} color="#FFFFFF" />
            ) : (
              <VolumeX size={24} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>

        {/* Progress Ring */}
        <View style={styles.progressContainer}>
          <View style={styles.progressRing}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  transform: [
                    {
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>

        {/* Timer Display */}
        <Animated.View 
          style={[
            styles.timerContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <LinearGradient colors={getTimerColor()} style={styles.timerGradient}>
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Motivational Message */}
        <Text style={styles.motivationalText}>
          {getMotivationalMessage()}
        </Text>

        {/* Time Adjustment Controls */}
        <View style={styles.timeControls}>
          <TouchableOpacity 
            style={styles.timeButton} 
            onPress={() => subtractTime(15)}
          >
            <Minus size={20} color="#FFFFFF" />
            <Text style={styles.timeButtonText}>15s</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timeButton} 
            onPress={() => subtractTime(30)}
          >
            <Minus size={20} color="#FFFFFF" />
            <Text style={styles.timeButtonText}>30s</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timeButton} 
            onPress={() => addTime(30)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.timeButtonText}>30s</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.timeButton} 
            onPress={() => addTime(60)}
          >
            <Plus size={20} color="#FFFFFF" />
            <Text style={styles.timeButtonText}>1m</Text>
          </TouchableOpacity>
        </View>

        {/* Main Controls */}
        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
            <RotateCcw size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.primaryButton]} 
            onPress={toggleTimer}
          >
            {isRunning ? (
              <Pause size={24} color="#FFFFFF" />
            ) : (
              <Play size={24} color="#FFFFFF" />
            )}
            <Text style={styles.controlButtonText}>
              {isRunning ? 'Pause' : 'Resume'}
            </Text>
          </TouchableOpacity>
          
          {onSkip && (
            <TouchableOpacity style={styles.controlButton} onPress={onSkip}>
              <Zap size={24} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={onComplete}
          >
            <Text style={styles.quickActionText}>Start Next Set</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: DesignTokens.spacing[6],
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[8],
  },

  closeButton: {
    padding: DesignTokens.spacing[2],
  },

  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },

  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },

  setInfo: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#9CA3AF',
    marginTop: DesignTokens.spacing[1],
  },

  soundButton: {
    padding: DesignTokens.spacing[2],
  },

  progressContainer: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[8],
  },

  progressRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },

  progressFill: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 208,
    height: 208,
    borderRadius: 104,
    borderWidth: 4,
    borderColor: '#10B981',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },

  timerContainer: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[6],
  },

  timerGradient: {
    paddingHorizontal: DesignTokens.spacing[8],
    paddingVertical: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
  },

  timerText: {
    fontSize: 64,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },

  motivationalText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[8],
    fontStyle: 'italic',
  },

  timeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[8],
  },

  timeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.lg,
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    minWidth: 60,
  },

  timeButtonText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[6],
  },

  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: DesignTokens.spacing[6],
    paddingVertical: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    minWidth: 100,
  },

  primaryButton: {
    backgroundColor: DesignTokens.colors.primary[500],
  },

  controlButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },

  quickActions: {
    alignItems: 'center',
  },

  quickActionButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: DesignTokens.spacing[8],
    paddingVertical: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
  },

  quickActionText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#10B981',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
});
