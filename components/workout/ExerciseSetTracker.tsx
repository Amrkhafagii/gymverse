import React, { useState } from 'react';
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
  CheckCircle,
  Circle,
  Edit3,
  Clock,
  Weight,
  Target,
  TrendingUp,
  AlertCircle,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface ExerciseSet {
  set_number: number;
  target_reps: number;
  actual_reps?: number;
  target_weight_kg?: number;
  actual_weight_kg?: number;
  target_duration_seconds?: number;
  actual_duration_seconds?: number;
  is_completed: boolean;
  is_warmup?: boolean;
  notes?: string;
}

interface ExerciseSetTrackerProps {
  sets: ExerciseSet[];
  exerciseName: string;
  exerciseType: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  onUpdateSet: (setIndex: number, updates: Partial<ExerciseSet>) => void;
  onStartRest: (restSeconds: number) => void;
  restSeconds: number;
  previousBest?: {
    weight?: number;
    reps?: number;
    duration?: number;
  };
}

export default function ExerciseSetTracker({
  sets,
  exerciseName,
  exerciseType,
  onUpdateSet,
  onStartRest,
  restSeconds,
  previousBest,
}: ExerciseSetTrackerProps) {
  const [editingSet, setEditingSet] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    reps: string;
    weight: string;
    duration: string;
  }>({ reps: '', weight: '', duration: '' });

  const handleSetComplete = async (setIndex: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const set = sets[setIndex];
    const isCompleting = !set.is_completed;
    
    if (isCompleting) {
      // Auto-fill with target values if not already set
      const updates: Partial<ExerciseSet> = {
        is_completed: true,
      };
      
      if (!set.actual_reps && set.target_reps) {
        updates.actual_reps = set.target_reps;
      }
      
      if (!set.actual_weight_kg && set.target_weight_kg) {
        updates.actual_weight_kg = set.target_weight_kg;
      }
      
      if (!set.actual_duration_seconds && set.target_duration_seconds) {
        updates.actual_duration_seconds = set.target_duration_seconds;
      }
      
      onUpdateSet(setIndex, updates);
      
      // Start rest timer if not the last set
      if (setIndex < sets.length - 1 && restSeconds > 0) {
        onStartRest(restSeconds);
      }
    } else {
      onUpdateSet(setIndex, { is_completed: false });
    }
  };

  const handleEditSet = (setIndex: number) => {
    const set = sets[setIndex];
    setEditingSet(setIndex);
    setEditValues({
      reps: set.actual_reps?.toString() || set.target_reps.toString(),
      weight: set.actual_weight_kg?.toString() || set.target_weight_kg?.toString() || '',
      duration: set.actual_duration_seconds?.toString() || set.target_duration_seconds?.toString() || '',
    });
  };

  const handleSaveEdit = async () => {
    if (editingSet === null) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const updates: Partial<ExerciseSet> = {};
    
    if (editValues.reps) {
      const reps = parseInt(editValues.reps);
      if (!isNaN(reps) && reps > 0) {
        updates.actual_reps = reps;
      }
    }
    
    if (editValues.weight) {
      const weight = parseFloat(editValues.weight);
      if (!isNaN(weight) && weight > 0) {
        updates.actual_weight_kg = weight;
      }
    }
    
    if (editValues.duration) {
      const duration = parseInt(editValues.duration);
      if (!isNaN(duration) && duration > 0) {
        updates.actual_duration_seconds = duration;
      }
    }
    
    onUpdateSet(editingSet, updates);
    setEditingSet(null);
  };

  const handleCancelEdit = () => {
    setEditingSet(null);
    setEditValues({ reps: '', weight: '', duration: '' });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const getSetStatus = (set: ExerciseSet) => {
    if (set.is_completed) return 'completed';
    
    // Check if this is a personal best
    if (previousBest) {
      const actualWeight = set.actual_weight_kg || 0;
      const actualReps = set.actual_reps || 0;
      const actualDuration = set.actual_duration_seconds || 0;
      
      if (
        (previousBest.weight && actualWeight > previousBest.weight) ||
        (previousBest.reps && actualReps > previousBest.reps) ||
        (previousBest.duration && actualDuration > previousBest.duration)
      ) {
        return 'personal_best';
      }
    }
    
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return DesignTokens.colors.success[500];
      case 'personal_best': return DesignTokens.colors.warning[500];
      default: return DesignTokens.colors.text.secondary;
    }
  };

  const completedSets = sets.filter(set => set.is_completed).length;
  const totalSets = sets.length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.exerciseName}>{exerciseName}</Text>
            <View style={styles.progressIndicator}>
              <Text style={styles.progressText}>
                {completedSets}/{totalSets} sets completed
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${(completedSets / totalSets) * 100}%` }
                  ]} 
                />
              </View>
            </View>
          </View>
          
          {previousBest && (
            <View style={styles.previousBest}>
              <TrendingUp size={14} color={DesignTokens.colors.warning[500]} />
              <Text style={styles.previousBestText}>
                Best: {previousBest.weight ? `${previousBest.weight}kg` : ''} 
                {previousBest.reps ? ` ${previousBest.reps} reps` : ''}
                {previousBest.duration ? ` ${formatDuration(previousBest.duration)}` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Sets List */}
        <View style={styles.setsList}>
          {sets.map((set, index) => {
            const status = getSetStatus(set);
            const isEditing = editingSet === index;
            
            return (
              <View key={index} style={[styles.setCard, set.is_completed && styles.setCardCompleted]}>
                <View style={styles.setHeader}>
                  <View style={styles.setNumber}>
                    <Text style={styles.setNumberText}>
                      {set.is_warmup ? 'W' : set.set_number}
                    </Text>
                  </View>
                  
                  <View style={styles.setInfo}>
                    {exerciseType !== 'cardio' && (
                      <View style={styles.setDetail}>
                        <Target size={12} color={DesignTokens.colors.text.secondary} />
                        <Text style={styles.setDetailText}>
                          {isEditing ? (
                            <TextInput
                              style={styles.editInput}
                              value={editValues.reps}
                              onChangeText={(text) => setEditValues(prev => ({ ...prev, reps: text }))}
                              keyboardType="numeric"
                              placeholder={set.target_reps.toString()}
                            />
                          ) : (
                            `${set.actual_reps || set.target_reps} reps`
                          )}
                        </Text>
                      </View>
                    )}
                    
                    {set.target_weight_kg && (
                      <View style={styles.setDetail}>
                        <Weight size={12} color={DesignTokens.colors.text.secondary} />
                        <Text style={styles.setDetailText}>
                          {isEditing ? (
                            <TextInput
                              style={styles.editInput}
                              value={editValues.weight}
                              onChangeText={(text) => setEditValues(prev => ({ ...prev, weight: text }))}
                              keyboardType="numeric"
                              placeholder={set.target_weight_kg.toString()}
                            />
                          ) : (
                            `${set.actual_weight_kg || set.target_weight_kg}kg`
                          )}
                        </Text>
                      </View>
                    )}
                    
                    {set.target_duration_seconds && (
                      <View style={styles.setDetail}>
                        <Clock size={12} color={DesignTokens.colors.text.secondary} />
                        <Text style={styles.setDetailText}>
                          {isEditing ? (
                            <TextInput
                              style={styles.editInput}
                              value={editValues.duration}
                              onChangeText={(text) => setEditValues(prev => ({ ...prev, duration: text }))}
                              keyboardType="numeric"
                              placeholder={set.target_duration_seconds.toString()}
                            />
                          ) : (
                            formatDuration(set.actual_duration_seconds || set.target_duration_seconds)
                          )}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.setActions}>
                    {isEditing ? (
                      <View style={styles.editActions}>
                        <TouchableOpacity onPress={handleCancelEdit} style={styles.editButton}>
                          <Text style={styles.editButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSaveEdit} style={[styles.editButton, styles.saveButton]}>
                          <Text style={[styles.editButtonText, styles.saveButtonText]}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <TouchableOpacity 
                          onPress={() => handleEditSet(index)} 
                          style={styles.editSetButton}
                        >
                          <Edit3 size={16} color={DesignTokens.colors.text.secondary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          onPress={() => handleSetComplete(index)} 
                          style={styles.completeButton}
                        >
                          {set.is_completed ? (
                            <CheckCircle size={24} color={getStatusColor(status)} />
                          ) : (
                            <Circle size={24} color={DesignTokens.colors.text.secondary} />
                          )}
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
                
                {status === 'personal_best' && (
                  <View style={styles.personalBestBadge}>
                    <TrendingUp size={12} color={DesignTokens.colors.warning[500]} />
                    <Text style={styles.personalBestText}>Personal Best!</Text>
                  </View>
                )}
                
                {set.notes && (
                  <Text style={styles.setNotes}>{set.notes}</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Rest Timer Suggestion */}
        {completedSets < totalSets && completedSets > 0 && (
          <TouchableOpacity 
            style={styles.restSuggestion}
            onPress={() => onStartRest(restSeconds)}
          >
            <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.restSuggestionGradient}>
              <Clock size={16} color={DesignTokens.colors.text.primary} />
              <Text style={styles.restSuggestionText}>
                Start {formatDuration(restSeconds)} rest
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
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
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  header: {
    marginBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    marginBottom: DesignTokens.spacing[2],
  },
  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  progressIndicator: {
    marginBottom: DesignTokens.spacing[2],
  },
  progressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  progressBar: {
    height: 4,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.success[500],
    borderRadius: 2,
  },
  previousBest: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.warning[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
    alignSelf: 'flex-start',
  },
  previousBestText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.warning[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginLeft: DesignTokens.spacing[1],
  },
  setsList: {
    gap: DesignTokens.spacing[3],
  },
  setCard: {
    backgroundColor: DesignTokens.colors.neutral[850],
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  setCardCompleted: {
    borderColor: DesignTokens.colors.success[500],
    backgroundColor: DesignTokens.colors.success[500] + '10',
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  setNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  setNumberText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  setInfo: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
  },
  setDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.neutral[800],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  setDetailText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    fontFamily: 'SF Mono',
  },
  editInput: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    backgroundColor: DesignTokens.colors.neutral[700],
    paddingHorizontal: DesignTokens.spacing[1],
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 40,
    textAlign: 'center',
    fontFamily: 'SF Mono',
  },
  setActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  editActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[1],
  },
  editButton: {
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    backgroundColor: DesignTokens.colors.neutral[700],
  },
  saveButton: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  editButtonText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  saveButtonText: {
    color: DesignTokens.colors.text.primary,
  },
  editSetButton: {
    padding: DesignTokens.spacing[1],
  },
  completeButton: {
    padding: DesignTokens.spacing[1],
  },
  personalBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.warning[500] + '20',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: DesignTokens.spacing[2],
  },
  personalBestText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.warning[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginLeft: DesignTokens.spacing[1],
  },
  setNotes: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: DesignTokens.spacing[2],
  },
  restSuggestion: {
    marginTop: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  restSuggestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[4],
  },
  restSuggestionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginLeft: DesignTokens.spacing[2],
  },
});
