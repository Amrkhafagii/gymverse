import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play,
  Pause,
  Square,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { CircularTimer } from './CircularTimer';
import * as Haptics from 'expo-haptics';

interface IntervalTimerProps {
  intervals: Array<{
    name: string;
    duration: number;
    type: 'work' | 'rest';
    color: string;
  }>;
  rounds: number;
  onComplete?: () => void;
  onRoundComplete?: (round: number) => void;
}

export const IntervalTimer: React.FC<IntervalTimerProps> = ({
  intervals,
  rounds,
  onComplete,
  onRoundComplete,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentInterval, setCurrentInterval] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentIntervalData = intervals[currentInterval];
  const totalDuration = currentIntervalData?.duration || 0;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && elapsed < totalDuration) {
      interval = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 1;
          
          // Check if current interval is complete
          if (newElapsed >= totalDuration) {
            handleIntervalComplete();
            return 0;
          }
          
          return newElapsed;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, elapsed, totalDuration]);

  const handleIntervalComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Move to next interval
    if (currentInterval < intervals.length - 1) {
      setCurrentInterval(prev => prev + 1);
      setElapsed(0);
    } else {
      // Round complete
      if (currentRound < rounds) {
        setCurrentRound(prev => prev + 1);
        setCurrentInterval(0);
        setElapsed(0);
        onRoundComplete?.(currentRound);
      } else {
        // Workout complete
        setIsRunning(false);
        onComplete?.();
        Alert.alert('Workout Complete!', 'Great job finishing your interval training!');
      }
    }
  };

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRunning(false);
    setCurrentRound(1);
    setCurrentInterval(0);
    setElapsed(0);
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleIntervalComplete();
  };

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setElapsed(0);
  };

  const toggleSound = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSoundEnabled(!soundEnabled);
  };

  const getProgressColor = () => {
    return currentIntervalData?.type === 'work' ? '#10B981' : '#3B82F6';
  };

  const getTotalProgress = () => {
    const totalIntervals = intervals.length * rounds;
    const completedIntervals = (currentRound - 1) * intervals.length + currentInterval;
    const currentProgress = elapsed / totalDuration;
    return (completedIntervals + currentProgress) / totalIntervals;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.roundInfo}>
          <Text style={styles.roundText}>Round {currentRound} of {rounds}</Text>
          <Text style={styles.intervalText}>
            {currentIntervalData?.name} ({currentInterval + 1}/{intervals.length})
          </Text>
        </View>
        
        <TouchableOpacity onPress={toggleSound} style={styles.soundButton}>
          {soundEnabled ? (
            <Volume2 size={20} color={DesignTokens.colors.text.secondary} />
          ) : (
            <VolumeX size={20} color={DesignTokens.colors.text.secondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <CircularTimer
          duration={totalDuration}
          elapsed={elapsed}
          size={280}
          color={getProgressColor()}
          showTime={true}
        />
        
        <View style={styles.intervalTypeContainer}>
          <LinearGradient
            colors={currentIntervalData?.type === 'work' ? 
              ['#10B981', '#059669'] : 
              ['#3B82F6', '#2563EB']
            }
            style={styles.intervalTypeBadge}
          >
            <Text style={styles.intervalTypeText}>
              {currentIntervalData?.type.toUpperCase()}
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Overall Progress */}
      <View style={styles.overallProgress}>
        <Text style={styles.overallProgressLabel}>Overall Progress</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${getTotalProgress() * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(getTotalProgress() * 100)}% Complete
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleReset}
        >
          <RotateCcw size={24} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleSkip}
        >
          <SkipForward size={24} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.primaryButton]}
          onPress={handlePlayPause}
        >
          <LinearGradient
            colors={['#9E7FFF', '#7C3AED']}
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
          onPress={handleStop}
        >
          <Square size={24} color={DesignTokens.colors.error[500]} />
        </TouchableOpacity>

        <View style={styles.controlButton} />
      </View>

      {/* Next Interval Preview */}
      {currentInterval < intervals.length - 1 && (
        <View style={styles.nextInterval}>
          <Text style={styles.nextIntervalLabel}>Next:</Text>
          <Text style={styles.nextIntervalText}>
            {intervals[currentInterval + 1].name}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[6],
  },
  roundInfo: {
    flex: 1,
  },
  roundText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  intervalText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  soundButton: {
    padding: DesignTokens.spacing[2],
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[6],
    position: 'relative',
  },
  intervalTypeContainer: {
    position: 'absolute',
    bottom: -20,
  },
  intervalTypeBadge: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
  },
  intervalTypeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    letterSpacing: 1,
  },
  overallProgress: {
    marginBottom: DesignTokens.spacing[6],
  },
  overallProgressLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  progressBar: {
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  nextInterval: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
  },
  nextIntervalLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  nextIntervalText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
