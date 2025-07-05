import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Clock, 
  Play, 
  Pause, 
  Square,
  Timer,
  Target,
  Zap
} from 'lucide-react-native';
import { TimerState } from '@/hooks/useWorkoutTimer';

interface WorkoutTimerDisplayProps {
  timerState: TimerState;
  onPlayPause: () => void;
  onStop: () => void;
  compact?: boolean;
}

export default function WorkoutTimerDisplay({
  timerState,
  onPlayPause,
  onStop,
  compact = false,
}: WorkoutTimerDisplayProps) {
  const pulseAnim = new Animated.Value(1);

  React.useEffect(() => {
    if (timerState.currentPhase === 'rest' && timerState.restTimeRemaining <= 10 && timerState.restTimeRemaining > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [timerState.currentPhase, timerState.restTimeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseColor = () => {
    switch (timerState.currentPhase) {
      case 'rest': return '#4A90E2';
      case 'preparation': return '#F39C12';
      default: return '#FF6B35';
    }
  };

  const getPhaseIcon = () => {
    switch (timerState.currentPhase) {
      case 'rest': return <Timer size={compact ? 16 : 20} color={getPhaseColor()} />;
      case 'preparation': return <Target size={compact ? 16 : 20} color={getPhaseColor()} />;
      default: return <Zap size={compact ? 16 : 20} color={getPhaseColor()} />;
    }
  };

  const getPhaseLabel = () => {
    switch (timerState.currentPhase) {
      case 'rest': return 'Rest';
      case 'preparation': return 'Prep';
      default: return 'Workout';
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <LinearGradient
          colors={['#1a1a1a', '#2a2a2a']}
          style={styles.compactGradient}
        >
          <View style={styles.compactTimer}>
            <Clock size={16} color="#fff" />
            <Text style={styles.compactTime}>{formatTime(timerState.elapsedTime)}</Text>
          </View>
          
          {timerState.currentPhase === 'rest' && timerState.restTimeRemaining > 0 && (
            <Animated.View 
              style={[
                styles.compactRest,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              {getPhaseIcon()}
              <Text style={styles.compactRestTime}>
                {formatTime(timerState.restTimeRemaining)}
              </Text>
            </Animated.View>
          )}

          <View style={styles.compactControls}>
            <TouchableOpacity
              style={styles.compactButton}
              onPress={onPlayPause}
            >
              {timerState.isPaused ? (
                <Play size={16} color="#fff" />
              ) : (
                <Pause size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        {/* Main Timer */}
        <View style={styles.mainTimer}>
          <View style={styles.timerHeader}>
            <Clock size={24} color="#fff" />
            <Text style={styles.timerLabel}>Workout Time</Text>
          </View>
          <Text style={styles.mainTime}>{formatTime(timerState.elapsedTime)}</Text>
        </View>

        {/* Phase Indicator */}
        <Animated.View 
          style={[
            styles.phaseContainer,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <View style={[styles.phaseIndicator, { backgroundColor: getPhaseColor() + '20' }]}>
            {getPhaseIcon()}
            <Text style={[styles.phaseLabel, { color: getPhaseColor() }]}>
              {getPhaseLabel()}
            </Text>
          </View>
        </Animated.View>

        {/* Rest Timer */}
        {timerState.currentPhase === 'rest' && timerState.restTimeRemaining > 0 && (
          <View style={styles.restTimer}>
            <Text style={styles.restLabel}>Rest Time</Text>
            <Text style={styles.restTime}>{formatTime(timerState.restTimeRemaining)}</Text>
          </View>
        )}

        {/* Set Timer */}
        {timerState.setTimeRemaining > 0 && (
          <View style={styles.setTimer}>
            <Text style={styles.setLabel}>
              Set {timerState.currentSet}/{timerState.totalSets}
            </Text>
            <Text style={styles.setState}>{formatTime(timerState.setTimeRemaining)}</Text>
          </View>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onPlayPause}
          >
            <LinearGradient
              colors={timerState.isPaused ? ['#2ECC71', '#27AE60'] : ['#E74C3C', '#C0392B']}
              style={styles.controlButtonGradient}
            >
              {timerState.isPaused ? (
                <Play size={20} color="#fff" />
              ) : (
                <Pause size={20} color="#fff" />
              )}
              <Text style={styles.controlButtonText}>
                {timerState.isPaused ? 'Resume' : 'Pause'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stopButton}
            onPress={onStop}
          >
            <Square size={20} color="#E74C3C" />
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  mainTimer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerLabel: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  mainTime: {
    fontSize: 36,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  phaseContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  phaseLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  restTimer: {
    alignItems: 'center',
    backgroundColor: '#4A90E220',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  restLabel: {
    fontSize: 12,
    color: '#4A90E2',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  restTime: {
    fontSize: 24,
    color: '#4A90E2',
    fontFamily: 'Inter-Bold',
  },
  setTimer: {
    alignItems: 'center',
    backgroundColor: '#F39C1220',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F39C12',
  },
  setLabel: {
    fontSize: 12,
    color: '#F39C12',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  setState: {
    fontSize: 20,
    color: '#F39C12',
    fontFamily: 'Inter-Bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    flex: 1,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  controlButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  controlButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  stopButtonText: {
    fontSize: 14,
    color: '#E74C3C',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  // Compact styles
  compactContainer: {
    marginVertical: 8,
  },
  compactGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  compactTimer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactTime: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginLeft: 8,
  },
  compactRest: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E220',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compactRestTime: {
    fontSize: 14,
    color: '#4A90E2',
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  compactControls: {
    flexDirection: 'row',
  },
  compactButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 8,
  },
});
