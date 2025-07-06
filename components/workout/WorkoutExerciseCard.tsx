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
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  Clock,
  Target,
  Info,
  Edit3,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface Exercise {
  id: string;
  name: string;
  description: string;
  exercise_type: 'strength' | 'cardio' | 'flexibility' | 'plyometric';
  muscle_groups: string[];
  equipment: string[];
}

interface WorkoutExercise {
  exercise: Exercise;
  order_index: number;
  target_sets: number;
  target_reps: number[];
  target_weight_kg?: number;
  target_duration_seconds?: number;
  rest_seconds: number;
  notes?: string;
}

interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise;
  index: number;
  onUpdate: (updates: Partial<WorkoutExercise>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function WorkoutExerciseCard({
  exercise,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WorkoutExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(exercise.notes || '');

  const handleSetsChange = async (change: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newSets = Math.max(1, Math.min(10, exercise.target_sets + change));
    
    // Adjust reps array to match new sets count
    let newReps = [...exercise.target_reps];
    if (newSets > newReps.length) {
      // Add new reps (use last rep count or default to 10)
      const lastRep = newReps[newReps.length - 1] || 10;
      while (newReps.length < newSets) {
        newReps.push(lastRep);
      }
    } else if (newSets < newReps.length) {
      // Remove excess reps
      newReps = newReps.slice(0, newSets);
    }
    
    onUpdate({ target_sets: newSets, target_reps: newReps });
  };

  const handleRepsChange = async (setIndex: number, reps: string) => {
    const repsNum = parseInt(reps) || 0;
    if (repsNum < 0 || repsNum > 1000) return;
    
    const newReps = [...exercise.target_reps];
    newReps[setIndex] = repsNum;
    onUpdate({ target_reps: newReps });
  };

  const handleWeightChange = async (weight: string) => {
    const weightNum = parseFloat(weight) || 0;
    if (weightNum < 0 || weightNum > 1000) return;
    
    onUpdate({ target_weight_kg: weightNum });
  };

  const handleDurationChange = async (duration: string) => {
    const durationNum = parseInt(duration) || 0;
    if (durationNum < 0 || durationNum > 86400) return;
    
    onUpdate({ target_duration_seconds: durationNum });
  };

  const handleRestChange = async (rest: string) => {
    const restNum = parseInt(rest) || 0;
    if (restNum < 0 || restNum > 3600) return;
    
    onUpdate({ rest_seconds: restNum });
  };

  const handleNotesUpdate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUpdate({ notes: notesText.trim() || undefined });
    setEditingNotes(false);
  };

  const handleRemove = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Remove Exercise',
      `Remove "${exercise.exercise.name}" from workout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: onRemove },
      ]
    );
  };

  const handleToggleExpanded = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded(!expanded);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const formatMuscleGroups = (muscles: string[]) => {
    return muscles.map(m => m.replace('_', ' ')).join(', ');
  };

  const isCardio = exercise.exercise.exercise_type === 'cardio';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1f2937', '#111827']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.orderBadge}>
              <Text style={styles.orderText}>{index + 1}</Text>
            </View>
            
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
              <Text style={styles.exerciseType}>
                {formatMuscleGroups(exercise.exercise.muscle_groups)}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            {onMoveUp && (
              <TouchableOpacity onPress={onMoveUp} style={styles.actionButton}>
                <ChevronUp size={16} color={DesignTokens.colors.text.secondary} />
              </TouchableOpacity>
            )}
            
            {onMoveDown && (
              <TouchableOpacity onPress={onMoveDown} style={styles.actionButton}>
                <ChevronDown size={16} color={DesignTokens.colors.text.secondary} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity onPress={handleToggleExpanded} style={styles.actionButton}>
              <Edit3 size={16} color={DesignTokens.colors.primary[500]} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleRemove} style={styles.actionButton}>
              <Trash2 size={16} color={DesignTokens.colors.error[500]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Target size={14} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.quickStatText}>
              {exercise.target_sets} set{exercise.target_sets !== 1 ? 's' : ''}
            </Text>
          </View>
          
          {!isCardio && exercise.target_reps.length > 0 && (
            <View style={styles.quickStat}>
              <Text style={styles.quickStatText}>
                {exercise.target_reps.join('-')} reps
              </Text>
            </View>
          )}
          
          {isCardio && exercise.target_duration_seconds && (
            <View style={styles.quickStat}>
              <Clock size={14} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.quickStatText}>
                {formatDuration(exercise.target_duration_seconds)}
              </Text>
            </View>
          )}
          
          {exercise.target_weight_kg && (
            <View style={styles.quickStat}>
              <Text style={styles.quickStatText}>
                {exercise.target_weight_kg}kg
              </Text>
            </View>
          )}
          
          <View style={styles.quickStat}>
            <Text style={styles.quickStatText}>
              {formatDuration(exercise.rest_seconds)} rest
            </Text>
          </View>
        </View>

        {/* Expanded Details */}
        {expanded && (
          <View style={styles.expandedContent}>
            {/* Sets Configuration */}
            <View style={styles.configSection}>
              <Text style={styles.configSectionTitle}>Sets & Reps</Text>
              
              <View style={styles.setsContainer}>
                <View style={styles.setsControl}>
                  <Text style={styles.controlLabel}>Sets</Text>
                  <View style={styles.numberControl}>
                    <TouchableOpacity 
                      onPress={() => handleSetsChange(-1)} 
                      style={styles.numberButton}
                    >
                      <Minus size={16} color={DesignTokens.colors.text.primary} />
                    </TouchableOpacity>
                    
                    <Text style={styles.numberValue}>{exercise.target_sets}</Text>
                    
                    <TouchableOpacity 
                      onPress={() => handleSetsChange(1)} 
                      style={styles.numberButton}
                    >
                      <Plus size={16} color={DesignTokens.colors.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {!isCardio && (
                  <View style={styles.repsGrid}>
                    {exercise.target_reps.map((reps, setIndex) => (
                      <View key={setIndex} style={styles.repInput}>
                        <Text style={styles.repLabel}>Set {setIndex + 1}</Text>
                        <TextInput
                          style={styles.repTextInput}
                          value={reps.toString()}
                          onChangeText={(text) => handleRepsChange(setIndex, text)}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor={DesignTokens.colors.text.tertiary}
                        />
                      </View>
                    ))}
                  </View>
                )}

                {!isCardio && (
                  <View style={styles.weightControl}>
                    <Text style={styles.controlLabel}>Weight (kg)</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={exercise.target_weight_kg?.toString() || ''}
                      onChangeText={handleWeightChange}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={DesignTokens.colors.text.tertiary}
                    />
                  </View>
                )}

                {isCardio && (
                  <View style={styles.durationControl}>
                    <Text style={styles.controlLabel}>Duration (seconds)</Text>
                    <TextInput
                      style={styles.durationInput}
                      value={exercise.target_duration_seconds?.toString() || ''}
                      onChangeText={handleDurationChange}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={DesignTokens.colors.text.tertiary}
                    />
                  </View>
                )}

                <View style={styles.restControl}>
                  <Text style={styles.controlLabel}>Rest (seconds)</Text>
                  <TextInput
                    style={styles.restInput}
                    value={exercise.rest_seconds.toString()}
                    onChangeText={handleRestChange}
                    keyboardType="numeric"
                    placeholder="60"
                    placeholderTextColor={DesignTokens.colors.text.tertiary}
                  />
                </View>
              </View>
            </View>

            {/* Exercise Info */}
            <View style={styles.configSection}>
              <Text style={styles.configSectionTitle}>Exercise Info</Text>
              
              <Text style={styles.exerciseDescription}>
                {exercise.exercise.description}
              </Text>
              
              {exercise.exercise.equipment.length > 0 && (
                <View style={styles.equipmentContainer}>
                  <Text style={styles.equipmentLabel}>Equipment: </Text>
                  <Text style={styles.equipmentText}>
                    {exercise.exercise.equipment.map(eq => eq.replace('_', ' ')).join(', ')}
                  </Text>
                </View>
              )}
            </View>

            {/* Notes */}
            <View style={styles.configSection}>
              <View style={styles.notesHeader}>
                <Text style={styles.configSectionTitle}>Notes</Text>
                <TouchableOpacity 
                  onPress={() => setEditingNotes(!editingNotes)} 
                  style={styles.editNotesButton}
                >
                  <Edit3 size={14} color={DesignTokens.colors.primary[500]} />
                </TouchableOpacity>
              </View>
              
              {editingNotes ? (
                <View style={styles.notesEditContainer}>
                  <TextInput
                    style={styles.notesInput}
                    value={notesText}
                    onChangeText={setNotesText}
                    placeholder="Add notes for this exercise..."
                    placeholderTextColor={DesignTokens.colors.text.tertiary}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <View style={styles.notesActions}>
                    <TouchableOpacity 
                      onPress={() => setEditingNotes(false)} 
                      style={styles.notesCancelButton}
                    >
                      <Text style={styles.notesCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={handleNotesUpdate} 
                      style={styles.notesSaveButton}
                    >
                      <Text style={styles.notesSaveText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text style={styles.notesDisplay}>
                  {exercise.notes || 'No notes added'}
                </Text>
              )}
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
  },
  gradient: {
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
    padding: DesignTokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderBadge: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  orderText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  exerciseType: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'capitalize',
  },
  headerActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[1],
  },
  actionButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.neutral[800],
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.neutral[800],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.md,
  },
  quickStatText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[1],
    fontFamily: 'SF Mono',
  },
  expandedContent: {
    marginTop: DesignTokens.spacing[4],
    paddingTop: DesignTokens.spacing[4],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  configSection: {
    marginBottom: DesignTokens.spacing[4],
  },
  configSectionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[3],
  },
  setsContainer: {
    gap: DesignTokens.spacing[3],
  },
  setsControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  numberControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.md,
  },
  numberButton: {
    padding: DesignTokens.spacing[2],
  },
  numberValue: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    paddingHorizontal: DesignTokens.spacing[3],
    fontFamily: 'SF Mono',
  },
  repsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
  },
  repInput: {
    alignItems: 'center',
    minWidth: 60,
  },
  repLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  repTextInput: {
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[2],
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
    width: 50,
    fontFamily: 'SF Mono',
  },
  weightControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightInput: {
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[2],
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
    width: 80,
    fontFamily: 'SF Mono',
  },
  durationControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationInput: {
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[2],
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
    width: 80,
    fontFamily: 'SF Mono',
  },
  restControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restInput: {
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[2],
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
    width: 80,
    fontFamily: 'SF Mono',
  },
  exerciseDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: DesignTokens.typography.fontSize.sm * 1.4,
    marginBottom: DesignTokens.spacing[2],
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  equipmentText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    flex: 1,
    textTransform: 'capitalize',
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  editNotesButton: {
    padding: DesignTokens.spacing[1],
  },
  notesEditContainer: {
    gap: DesignTokens.spacing[2],
  },
  notesInput: {
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: DesignTokens.spacing[2],
  },
  notesCancelButton: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.neutral[800],
  },
  notesCancelText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  notesSaveButton: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.primary[500],
  },
  notesSaveText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  notesDisplay: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontStyle: exercise => exercise.notes ? 'normal' : 'italic',
  },
});
