import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, Square, Plus, Minus } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface RestTimerModalProps {
  visible: boolean;
  onClose: () => void;
  initialDuration: number; // in seconds
  exerciseName: string;
  setNumber: number;
  onComplete?: () => void;
}

const { width } = Dimensions.get('window');
const TIMER_SIZE = width * 0.7;

export function RestTimerModal({
  visible,
  onClose,
  initialDuration,
  exerciseName,
  setNumber,
  onComplete,
}: RestTimerModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(true);
  const [totalDuration, setTotalDuration] = useState(initialDuration);

  useEffect(() => {
    if (visible) {
      setTimeRemaining(initialDuration);
      setTotalDuration(initialDuration);
      setIsRunning(true);
    }
  }, [visible, initialDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete?.();
  };

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRunning(false);
    onClose();
  };

  const handleAddTime = async (seconds: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeRemaining(prev => prev + seconds);
    setTotalDuration(prev => prev + seconds);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (totalDuration - timeRemaining) / totalDuration : 0;
  const circumference = 2 * Math.PI * (TIMER_SIZE / 2 - 20);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.content}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.exerciseName}>{exerciseName}</Text>
              <Text style={styles.setInfo}>Set {setNumber} • Rest Time</Text>
            </View>

            {/* Timer Circle */}
            <View style={styles.timerContainer}>
              <View style={[styles.timerCircle, { width: TIMER_SIZE, height: TIMER_SIZE }]}>
                <svg
                  width={TIMER_SIZE}
                  height={TIMER_SIZE}
                  style={styles.timerSvg}
                >
                  {/* Background circle */}
                  <circle
                    cx={TIMER_SIZE / 2}
                    cy={TIMER_SIZE / 2}
                    r={TIMER_SIZE / 2 - 20}
                    stroke={DesignTokens.colors.surface.tertiary}
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress circle */}
                  <circle
                    cx={TIMER_SIZE / 2}
                    cy={TIMER_SIZE / 2}
                    r={TIMER_SIZE / 2 - 20}
                    stroke={timeRemaining <= 10 ? '#ef4444' : '#3b82f6'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${TIMER_SIZE / 2} ${TIMER_SIZE / 2})`}
                  />
                </svg>
                
                <View style={styles.timerContent}>
                  <Text style={[
                    styles.timerText,
                    timeRemaining <= 10 && styles.timerTextWarning
                  ]}>
                    {formatTime(timeRemaining)}
                  </Text>
                  <Text style={styles.timerLabel}>
                    {timeRemaining === 0 ? 'Time\'s up!' : 'remaining'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Time Adjustment */}
            <View style={styles.timeAdjustment}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleAddTime(-15)}
                disabled={timeRemaining <= 15}
              >
                <Minus size={20} color={
                  timeRemaining <= 15 
                    ? DesignTokens.colors.text.tertiary 
                    : DesignTokens.colors.text.secondary
                } />
                <Text style={[
                  styles.adjustButtonText,
                  timeRemaining <= 15 && styles.adjustButtonTextDisabled
                ]}>
                  -15s
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleAddTime(15)}
              >
                <Plus size={20} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.adjustButtonText}>+15s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => handleAddTime(30)}
              >
                <Plus size={20} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.adjustButtonText}>+30s</Text>
              </TouchableOpacity>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleStop}
              >
                <Square size={24} color={DesignTokens.colors.error[500]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton]}
                onPress={handlePlayPause}
              >
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.primaryButtonGradient}
                >
                  {isRunning ? (
                    <Pause size={32} color="#FFFFFF" />
                  ) : (
                    <Play size={32} color="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={onClose}
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>

            {/* Status */}
            {timeRemaining === 0 && (
              <View style={styles.completedStatus}>
                <Text style={styles.completedText}>Rest Complete!</Text>
                <Text style={styles.completedSubtext}>Ready for your next set</Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
  },
  content: {
    padding: DesignTokens.spacing[6],
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[6],
  },
  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  setInfo: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[6],
  },
  timerCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerSvg: {
    position: 'absolute',
  },
  timerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: DesignTokens.typography.fontSize['4xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  timerTextWarning: {
    color: DesignTokens.colors.error[500],
  },
  timerLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  timeAdjustment: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[6],
  },
  adjustButton: {
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingVertical: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    minWidth: 60,
  },
  adjustButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginTop: DesignTokens.spacing[1],
  },
  adjustButtonTextDisabled: {
    color: DesignTokens.colors.text.tertiary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginBottom: DesignTokens.spacing[4],
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DesignTokens.colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  completedStatus: {
    alignItems: 'center',
    marginTop: DesignTokens.spacing[4],
  },
  completedText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.success[500],
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  completedSubtext: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
});
