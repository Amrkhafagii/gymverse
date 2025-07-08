/**
 * SetTimerCard - Previously unused, now integrated into workout sessions
 * Individual set tracking with timer, weight/reps input, and rest management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Check, 
  Clock, 
  TrendingUp, 
  Target,
  Timer,
  Zap,
  Award,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

export interface WorkoutSet {
  id: string;
  set_number: number;
  target_weight_kg?: number;
  target_reps: number[];
  actual_weight_kg?: number;
  actual_reps?: number;
  is_completed: boolean;
  completed_at?: string;
  rest_duration_seconds?: number;
  notes?: string;
}

export interface SetTimerCardProps {
  set: WorkoutSet;
  exerciseName: string;
  exerciseType: 'strength' | 'cardio' | 'bodyweight' | 'time';
  onUpdateSet: (updates: Partial<WorkoutSet>) => void;
  onStartRest: (duration: number) => void;
  restSeconds: number;
  previousBest?: {
    weight?: number;
    reps?: number;
  };
  isActive?: boolean;
}

export const SetTimerCard: React.FC<SetTimerCardProps> = ({
  set,
  exerciseName,
  exerciseType,
  onUpdateSet,
  onStartRest,
  restSeconds,
  previousBest,
  isActive = false,
}) => {
  const [weight, setWeight] = useState(set.actual_weight_kg?.toString() || set.target_weight_kg?.toString() || '');
  const [reps, setReps] = useState(set.actual_reps?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);
  const [showPersonalBest, setShowPersonalBest] = useState(false);

  useEffect(() => {
    // Check for personal best
    if (set.actual_weight_kg && previousBest?.weight && set.actual_weight_kg > previousBest.weight) {
      setShowPersonalBest(true);
    } else if (set.actual_reps && previousBest?.reps && set.actual_reps > previousBest.reps) {
      setShowPersonalBest(true);
    }
  }, [set.actual_weight_kg, set.actual_reps, previousBest]);

  const handleCompleteSet = () => {
    const weightValue = parseFloat(weight) || 0;
    const repsValue = parseInt(reps) || 0;

    if (exerciseType === 'strength' && (!weightValue || !repsValue)) {
      Alert.alert('Missing Data', 'Please enter both weight and reps to complete the set.');
      return;
    }

    if (exerciseType === 'bodyweight' && !repsValue) {
      Alert.alert('Missing Data', 'Please enter the number of reps to complete the set.');
      return;
    }

    // Haptic feedback for completion
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const updates: Partial<WorkoutSet> = {
      actual_weight_kg: weightValue || undefined,
      actual_reps: repsValue || undefined,
      is_completed: true,
      completed_at: new Date().toISOString(),
    };

    onUpdateSet(updates);
    setIsEditing(false);

    // Auto-start rest timer
    setTimeout(() => {
      onStartRest(restSeconds);
    }, 500);
  };

  const handleUncompleteSet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    onUpdateSet({
      is_completed: false,
      completed_at: undefined,
    });
  };

  const getTargetRepsDisplay = (): string => {
    if (set.target_reps.length === 1) {
      return set.target_reps[0].toString();
    }
    return `${Math.min(...set.target_reps)}-${Math.max(...set.target_reps)}`;
  };

  const getSetStatusColor = (): string[] => {
    if (set.is_completed) {
      if (showPersonalBest) return ['#FFD700', '#FFA500']; // Gold for PR
      return ['#10B981', '#059669']; // Green for completed
    }
    if (isActive) return ['#3B82F6', '#2563EB']; // Blue for active
    return ['#374151', '#1F2937']; // Gray for pending
  };

  const getSetStatusIcon = () => {
    if (set.is_completed) {
      if (showPersonalBest) return <Award size={16} color="#FFFFFF" />;
      return <Check size={16} color="#FFFFFF" />;
    }
    if (isActive) return <Zap size={16} color="#FFFFFF" />;
    return <Target size={16} color="#9CA3AF" />;
  };

  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      <LinearGradient colors={getSetStatusColor()} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.setInfo}>
            <View style={styles.setNumber}>
              {getSetStatusIcon()}
              <Text style={styles.setNumberText}>Set {set.set_number}</Text>
            </View>
            {showPersonalBest && (
              <View style={styles.prBadge}>
                <Text style={styles.prText}>PR!</Text>
              </View>
            )}
          </View>
          
          {set.is_completed && (
            <TouchableOpacity onPress={handleUncompleteSet} style={styles.undoButton}>
              <Text style={styles.undoText}>Undo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Target vs Actual */}
        <View style={styles.dataSection}>
          {exerciseType === 'strength' && (
            <View style={styles.dataRow}>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Weight</Text>
                <View style={styles.dataValue}>
                  <Text style={styles.targetText}>
                    Target: {set.target_weight_kg || 0}kg
                  </Text>
                  {set.is_completed ? (
                    <Text style={styles.actualText}>
                      Actual: {set.actual_weight_kg || 0}kg
                    </Text>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      editable={!set.is_completed}
                    />
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={styles.dataRow}>
            <View style={styles.dataItem}>
              <Text style={styles.dataLabel}>Reps</Text>
              <View style={styles.dataValue}>
                <Text style={styles.targetText}>
                  Target: {getTargetRepsDisplay()}
                </Text>
                {set.is_completed ? (
                  <Text style={styles.actualText}>
                    Actual: {set.actual_reps || 0}
                  </Text>
                ) : (
                  <TextInput
                    style={styles.input}
                    value={reps}
                    onChangeText={setReps}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    editable={!set.is_completed}
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Previous Best Comparison */}
        {previousBest && (
          <View style={styles.comparisonSection}>
            <TrendingUp size={14} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.comparisonText}>
              Previous best: {previousBest.weight ? `${previousBest.weight}kg × ` : ''}{previousBest.reps || 0} reps
            </Text>
          </View>
        )}

        {/* Action Button */}
        {!set.is_completed && (
          <TouchableOpacity 
            style={styles.completeButton} 
            onPress={handleCompleteSet}
            disabled={!weight && !reps}
          >
            <Check size={16} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>Complete Set</Text>
          </TouchableOpacity>
        )}

        {/* Rest Timer Info */}
        {set.is_completed && (
          <View style={styles.restInfo}>
            <Clock size={14} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.restText}>
              Rest: {Math.floor(restSeconds / 60)}:{(restSeconds % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        {/* Set Duration */}
        {set.completed_at && (
          <View style={styles.completionInfo}>
            <Timer size={12} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.completionText}>
              Completed at {new Date(set.completed_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.sm,
  },

  activeContainer: {
    ...DesignTokens.shadow.md,
    transform: [{ scale: 1.02 }],
  },

  gradient: {
    padding: DesignTokens.spacing[4],
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },

  setInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },

  setNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },

  setNumberText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },

  prBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
    borderWidth: 1,
    borderColor: '#FFD700',
  },

  prText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFD700',
  },

  undoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
  },

  undoText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  dataSection: {
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },

  dataRow: {
    flexDirection: 'row',
  },

  dataItem: {
    flex: 1,
  },

  dataLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: DesignTokens.spacing[1],
  },

  dataValue: {
    gap: DesignTokens.spacing[1],
  },

  targetText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  actualText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },

  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },

  comparisonSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[3],
  },

  comparisonText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  completeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    marginTop: DesignTokens.spacing[2],
  },

  completeButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: '#FFFFFF',
  },

  restInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginTop: DesignTokens.spacing[2],
  },

  restText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },

  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    marginTop: DesignTokens.spacing[1],
  },

  completionText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
