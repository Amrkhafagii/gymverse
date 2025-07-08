import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Pause, 
  Check, 
  Timer, 
  Weight,
  RotateCcw,
  Edit3,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { WorkoutSet } from '@/contexts/WorkoutSessionContext';
import * as Haptics from 'expo-haptics';

interface SetTimerCardProps {
  set: WorkoutSet;
  exerciseName: string;
  exerciseType: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  onUpdateSet: (updates: Partial<WorkoutSet>) => void;
  onStartRest: (duration: number) => void;
  restSeconds: number;
  previousBest?: {
    weight?: number;
    reps?: number;
    duration?: number;
  };
  isActive?: boolean;
}

export function SetTimerCard({
  set,
  exerciseName,
  exerciseType,
  onUpdateSet,
  onStartRest,
  restSeconds,
  previousBest,
  isActive = false,
}: SetTimerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    weight: set.actual_weight_kg?.toString() || set.target_weight_kg?.toString() || '',
    reps: set.actual_reps?.toString() || set.target_reps.toString(),
    duration: set.actual_duration_seconds?.toString() || set.target_duration_seconds?.toString() || '',
  });
  const [setTimer, setSetTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSetTimer(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTimerRunning(true);
    setSetTimer(0);
  };

  const handlePauseTimer = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsTimerRunning(false);
  };

  const handleCompleteSet = async () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    }

    const updates: Partial<WorkoutSet> = {
      is_completed: true,
      completed_at: new Date().toISOString(),
    };

    // Add actual values based on exercise type
    if (exerciseType === 'strength') {
      updates.actual_weight_kg = parseFloat(editValues.weight) || set.target_weight_kg;
      updates.actual_reps = parseInt(editValues.reps) || set.target_reps;
    } else if (exerciseType === 'cardio') {
      updates.actual_duration_seconds = parseInt(editValues.duration) || set.target_duration_seconds;
    }

    if (setTimer > 0) {
      updates.actual_duration_seconds = setTimer;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onUpdateSet(updates);

    // Start rest timer if not the last set
    if (restSeconds > 0) {
      setTimeout(() => {
        onStartRest(restSeconds);
      }, 500);
    }

    setIsEditing(false);
  };

  const handleResetSet = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Reset Set',
      'Are you sure you want to reset this set?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setIsTimerRunning(false);
            setSetTimer(0);
            onUpdateSet({
              is_completed: false,
              actual_reps: undefined,
              actual_weight_kg: undefined,
              actual_duration_seconds: undefined,
              completed_at: undefined,
            });
            setEditValues({
              weight: set.target_weight_kg?.toString() || '',
              reps: set.target_reps.toString(),
              duration: set.target_duration_seconds?.toString() || '',
            });
          },
        },
      ]
    );
  };

  const handleSaveEdit = () => {
    setIsEditing(false);
    // Values will be saved when set is completed
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSetTypeColor = () => {
    if (set.is_warmup) return ['#f59e0b', '#d97706'];
    if (set.is_completed) return ['#10b981', '#059669'];
    if (isActive) return ['#3b82f6', '#2563eb'];
    return ['#6b7280', '#4b5563'];
  };

  const isPR = () => {
    if (!previousBest || !set.is_completed) return false;
    
    if (exerciseType === 'strength') {
      const currentWeight = set.actual_weight_kg || 0;
      const currentReps = set.actual_reps || 0;
      return currentWeight > (previousBest.weight || 0) || 
             (currentWeight === previousBest.weight && currentReps > (previousBest.reps || 0));
    }
    
    return false;
  };

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      <LinearGradient
        colors={getSetTypeColor()}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Set Header */}
          <View style={styles.header}>
            <View style={styles.setInfo}>
              <Text style={styles.setNumber}>Set {set.set_number}</Text>
              {set.is_warmup && <Text style={styles.warmupLabel}>Warmup</Text>}
              {isPR() && <Text style={styles.prLabel}>PR!</Text>}
            </View>
            
            <View style={styles.timerDisplay}>
              <Timer size={16} color="#fff" />
              <Text style={styles.timerText}>{formatTime(setTimer)}</Text>
            </View>
          </View>

          {/* Set Values */}
          <View style={styles.values}>
            {exerciseType === 'strength' && (
              <>
                <View style={styles.valueGroup}>
                  <Weight size={16} color="#fff" />
                  <Text style={styles.valueLabel}>Weight</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.valueInput}
                      value={editValues.weight}
                      onChangeText={(text) => setEditValues(prev => ({ ...prev, weight: text }))}
                      keyboardType="numeric"
                      placeholder={set.target_weight_kg?.toString() || '0'}
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                  ) : (
                    <Text style={styles.valueText}>
                      {set.actual_weight_kg || set.target_weight_kg || 0} kg
                    </Text>
                  )}
                </View>

                <View style={styles.valueGroup}>
                  <Text style={styles.valueLabel}>Reps</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.valueInput}
                      value={editValues.reps}
                      onChangeText={(text) => setEditValues(prev => ({ ...prev, reps: text }))}
                      keyboardType="numeric"
                      placeholder={set.target_reps.toString()}
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    />
                  ) : (
                    <Text style={styles.valueText}>
                      {set.actual_reps || set.target_reps} reps
                    </Text>
                  )}
                </View>
              </>
            )}

            {exerciseType === 'cardio' && (
              <View style={styles.valueGroup}>
                <Timer size={16} color="#fff" />
                <Text style={styles.valueLabel}>Duration</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.valueInput}
                    value={editValues.duration}
                    onChangeText={(text) => setEditValues(prev => ({ ...prev, duration: text }))}
                    keyboardType="numeric"
                    placeholder={set.target_duration_seconds?.toString() || '0'}
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />
                ) : (
                  <Text style={styles.valueText}>
                    {formatTime(set.actual_duration_seconds || set.target_duration_seconds || 0)}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {!set.is_completed ? (
              <>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={() => setIsEditing(!isEditing)}
                >
                  <Edit3 size={16} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={isTimerRunning ? handlePauseTimer : handleStartTimer}
                >
                  {isTimerRunning ? (
                    <Pause size={16} color="#fff" />
                  ) : (
                    <Play size={16} color="#fff" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlButton, styles.completeButton]}
                  onPress={handleCompleteSet}
                >
                  <Check size={16} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleResetSet}
              >
                <RotateCcw size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Previous Best Comparison */}
          {previousBest && exerciseType === 'strength' && (
            <View style={styles.previousBest}>
              <Text style={styles.previousBestText}>
                Previous: {previousBest.weight}kg × {previousBest.reps}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  activeContainer: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradient: {
    padding: DesignTokens.spacing[4],
  },
  content: {
    gap: DesignTokens.spacing[3],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  setNumber: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#fff',
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  warmupLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  prLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#fff',
    backgroundColor: '#ef4444',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  timerDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  timerText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#fff',
    fontFamily: 'SF Mono',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  values: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
  },
  valueGroup: {
    flex: 1,
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  valueLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  valueText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#fff',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  valueInput: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#fff',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    textAlign: 'center',
    minWidth: 60,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DesignTokens.spacing[3],
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
  },
  previousBest: {
    alignItems: 'center',
    paddingTop: DesignTokens.spacing[2],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  previousBestText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
