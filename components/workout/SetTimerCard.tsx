import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw,
  Clock,
  Target,
  CheckCircle,
  Settings
} from 'lucide-react-native';

interface SetTimerCardProps {
  setNumber: number;
  totalSets: number;
  isActive: boolean;
  timeRemaining: number;
  targetDuration?: number;
  onStart: (duration: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onComplete: () => void;
  completed: boolean;
}

export default function SetTimerCard({
  setNumber,
  totalSets,
  isActive,
  timeRemaining,
  targetDuration = 60,
  onStart,
  onPause,
  onResume,
  onReset,
  onComplete,
  completed,
}: SetTimerCardProps) {
  const [customDuration, setCustomDuration] = useState(targetDuration.toString());
  const [showCustomInput, setShowCustomInput] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    const duration = showCustomInput ? parseInt(customDuration) || targetDuration : targetDuration;
    if (duration > 0 && duration <= 3600) { // Max 1 hour
      onStart(duration);
    } else {
      Alert.alert('Invalid Duration', 'Please enter a duration between 1 second and 1 hour.');
    }
  };

  const handleCustomDurationChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setCustomDuration(numericText);
  };

  const getProgressPercentage = () => {
    if (!isActive || targetDuration === 0) return 0;
    return ((targetDuration - timeRemaining) / targetDuration) * 100;
  };

  return (
    <View style={[styles.container, completed && styles.completedContainer]}>
      <LinearGradient
        colors={completed ? ['#27AE6020', '#2ECC7120'] : ['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.setInfo}>
            <Target size={20} color={completed ? "#2ECC71" : "#FF6B35"} />
            <Text style={[styles.setTitle, completed && styles.completedText]}>
              Set {setNumber} of {totalSets}
            </Text>
          </View>
          
          {completed && (
            <View style={styles.completedBadge}>
              <CheckCircle size={16} color="#2ECC71" />
              <Text style={styles.completedBadgeText}>Complete</Text>
            </View>
          )}
        </View>

        {/* Timer Display */}
        <View style={styles.timerDisplay}>
          <View style={styles.timerCircle}>
            {/* Progress Ring */}
            <View style={styles.progressRing}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    transform: [{ 
                      rotate: `${(getProgressPercentage() * 3.6)}deg` 
                    }] 
                  }
                ]} 
              />
            </View>
            
            <View style={styles.timerContent}>
              <Timer size={24} color={isActive ? "#FF6B35" : "#666"} />
              <Text style={[styles.timerText, isActive && styles.activeTimerText]}>
                {formatTime(timeRemaining)}
              </Text>
              <Text style={styles.timerLabel}>
                {isActive ? 'remaining' : 'target'}
              </Text>
            </View>
          </View>
        </View>

        {/* Duration Settings */}
        <View style={styles.durationSettings}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => setShowCustomInput(!showCustomInput)}
          >
            <Settings size={16} color="#999" />
            <Text style={styles.settingsText}>
              {showCustomInput ? 'Use Default' : 'Custom Time'}
            </Text>
          </TouchableOpacity>

          {showCustomInput && (
            <View style={styles.customInput}>
              <TextInput
                style={styles.durationInput}
                value={customDuration}
                onChangeText={handleCustomDurationChange}
                placeholder="60"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.durationUnit}>seconds</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!isActive && !completed && (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <LinearGradient
                colors={['#2ECC71', '#27AE60']}
                style={styles.startButtonGradient}
              >
                <Play size={20} color="#fff" />
                <Text style={styles.startButtonText}>Start Set</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isActive && (
            <>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={timeRemaining > 0 ? onPause : onResume}
              >
                {timeRemaining > 0 ? (
                  <Pause size={20} color="#E74C3C" />
                ) : (
                  <Play size={20} color="#2ECC71" />
                )}
                <Text style={styles.controlButtonText}>
                  {timeRemaining > 0 ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={onReset}>
                <RotateCcw size={20} color="#F39C12" />
                <Text style={styles.controlButtonText}>Reset</Text>
              </TouchableOpacity>
            </>
          )}

          {(timeRemaining === 0 || completed) && !completed && (
            <TouchableOpacity style={styles.completeButton} onPress={onComplete}>
              <LinearGradient
                colors={['#FF6B35', '#FF8C42']}
                style={styles.completeButtonGradient}
              >
                <CheckCircle size={20} color="#fff" />
                <Text style={styles.completeButtonText}>Complete Set</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressBarFill,
              { width: `${getProgressPercentage()}%` }
            ]} 
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  completedContainer: {
    opacity: 0.8,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  completedText: {
    color: '#2ECC71',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ECC7120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 12,
    color: '#2ECC71',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  progressFill: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FF6B35',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    color: '#666',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  activeTimerText: {
    color: '#fff',
  },
  timerLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginTop: 2,
  },
  durationSettings: {
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  settingsText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  customInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  durationInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    minWidth: 60,
    borderWidth: 1,
    borderColor: '#333',
  },
  durationUnit: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  startButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  startButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  controlButtonText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  completeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  completeButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
});
