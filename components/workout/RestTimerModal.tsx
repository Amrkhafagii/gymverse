import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Timer, 
  Play, 
  Pause, 
  SkipForward, 
  Plus, 
  Minus,
  Coffee,
  Zap
} from 'lucide-react-native';

interface RestTimerModalProps {
  visible: boolean;
  timeRemaining: number;
  isPaused: boolean;
  onSkip: () => void;
  onAddTime: (seconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
  nextExercise?: string;
}

const { width } = Dimensions.get('window');

export default function RestTimerModal({
  visible,
  timeRemaining,
  isPaused,
  onSkip,
  onAddTime,
  onPause,
  onResume,
  onClose,
  nextExercise,
}: RestTimerModalProps) {
  const progressAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    if (visible && timeRemaining > 0) {
      // Animate progress circle
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: timeRemaining * 1000,
        useNativeDriver: false,
      }).start();

      // Pulse animation for last 10 seconds
      if (timeRemaining <= 10) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }
  }, [visible, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRestPhaseMessage = () => {
    if (timeRemaining > 60) return "Take your time to recover";
    if (timeRemaining > 30) return "Halfway through your rest";
    if (timeRemaining > 10) return "Get ready to go again";
    return "Almost time to continue!";
  };

  const getRestPhaseIcon = () => {
    if (timeRemaining > 60) return <Coffee size={32} color="#4A90E2" />;
    if (timeRemaining > 10) return <Timer size={32} color="#FF6B35" />;
    return <Zap size={32} color="#E74C3C" />;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                {getRestPhaseIcon()}
              </View>
              <Text style={styles.title}>Rest Time</Text>
              <Text style={styles.subtitle}>{getRestPhaseMessage()}</Text>
            </View>

            {/* Timer Display */}
            <Animated.View 
              style={[
                styles.timerContainer,
                { transform: [{ scale: scaleAnim }] }
              ]}
            >
              <View style={styles.timerCircle}>
                <Animated.View
                  style={[
                    styles.progressRing,
                    {
                      transform: [{
                        rotate: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      }],
                    },
                  ]}
                />
                <View style={styles.timerInner}>
                  <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
                  <Text style={styles.timerLabel}>remaining</Text>
                </View>
              </View>
            </Animated.View>

            {/* Next Exercise Preview */}
            {nextExercise && (
              <View style={styles.nextExerciseContainer}>
                <Text style={styles.nextExerciseLabel}>Up Next:</Text>
                <Text style={styles.nextExerciseName}>{nextExercise}</Text>
              </View>
            )}

            {/* Time Adjustment Controls */}
            <View style={styles.timeControls}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => onAddTime(-15)}
                disabled={timeRemaining <= 15}
              >
                <Minus size={20} color={timeRemaining <= 15 ? "#666" : "#fff"} />
                <Text style={[
                  styles.timeButtonText,
                  timeRemaining <= 15 && styles.disabledText
                ]}>
                  -15s
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pauseButton}
                onPress={isPaused ? onResume : onPause}
              >
                {isPaused ? (
                  <Play size={24} color="#fff" />
                ) : (
                  <Pause size={24} color="#fff" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => onAddTime(30)}
              >
                <Plus size={20} color="#fff" />
                <Text style={styles.timeButtonText}>+30s</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
                <LinearGradient
                  colors={['#FF6B35', '#FF8C42']}
                  style={styles.skipButtonGradient}
                >
                  <SkipForward size={20} color="#fff" />
                  <Text style={styles.skipButtonText}>Skip Rest</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['100%', '0%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
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
  modal: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 32,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  timerContainer: {
    marginBottom: 32,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 6,
    borderColor: '#FF6B35',
    borderTopColor: 'transparent',
  },
  timerInner: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  timerLabel: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  nextExerciseContainer: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  nextExerciseLabel: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  nextExerciseName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  timeButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  timeButtonText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  disabledText: {
    color: '#666',
  },
  pauseButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    width: '100%',
    marginBottom: 16,
  },
  skipButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  skipButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
});
