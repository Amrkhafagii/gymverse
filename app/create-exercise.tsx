import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Save, Plus, X, Target, Dumbbell, Heart, Activity, Zap } from 'lucide-react-native';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import { MUSCLE_GROUPS, EQUIPMENT_LIST, EXERCISE_TYPES } from '@/lib/data/exerciseDatabase';

interface CustomExercise {
  name: string;
  description: string;
  instructions: string[];
  muscle_groups: string[];
  equipment: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  exercise_type: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'plyometric';
  tips: string[];
  common_mistakes: string[];
  variations: string[];
  alternative_names: string[];
  tags: string[];
}

export default function CreateExerciseScreen() {
  const { user, isAuthenticated, updateLastActive } = useDeviceAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [exercise, setExercise] = useState<CustomExercise>({
    name: '',
    description: '',
    instructions: [''],
    muscle_groups: [],
    equipment: [],
    difficulty_level: 'beginner',
    exercise_type: 'strength',
    tips: [''],
    common_mistakes: [''],
    variations: [''],
    alternative_names: [''],
    tags: [],
  });

  const [currentInstruction, setCurrentInstruction] = useState('');
  const [currentTip, setCurrentTip] = useState('');
  const [currentMistake, setCurrentMistake] = useState('');
  const [currentVariation, setCurrentVariation] = useState('');
  const [currentAlternativeName, setCurrentAlternativeName] = useState('');
  const [currentTag, setCurrentTag] = useState('');

  const validateForm = () => {
    if (!exercise.name.trim()) {
      setError('Exercise name is required');
      return false;
    }
    if (exercise.name.trim().length > 100) {
      setError('Exercise name must be less than 100 characters');
      return false;
    }
    if (!exercise.description.trim()) {
      setError('Exercise description is required');
      return false;
    }
    if (exercise.description.length > 500) {
      setError('Description must be less than 500 characters');
      return false;
    }
    if (exercise.instructions.filter(inst => inst.trim()).length === 0) {
      setError('At least one instruction is required');
      return false;
    }
    if (exercise.muscle_groups.length === 0) {
      setError('At least one muscle group must be selected');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!isAuthenticated || !user) {
      setError('Device authentication required to create exercises');
      return;
    }

    setError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Update last active timestamp
      await updateLastActive();

      // Clean up arrays by removing empty strings
      const cleanedExercise = {
        ...exercise,
        instructions: exercise.instructions.filter(inst => inst.trim()),
        tips: exercise.tips.filter(tip => tip.trim()),
        common_mistakes: exercise.common_mistakes.filter(mistake => mistake.trim()),
        variations: exercise.variations.filter(variation => variation.trim()),
        alternative_names: exercise.alternative_names.filter(name => name.trim()),
        created_by_device: user.deviceId,
        created_at: new Date().toISOString(),
      };

      // TODO: Save to database with device user association
      console.log('Saving custom exercise for device:', user.deviceId, cleanedExercise);

      Alert.alert(
        'Success',
        'Your custom exercise has been created successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error('Error creating exercise:', err);
      setError(err.message || 'Failed to create exercise. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasUnsavedChanges = exercise.name.trim() || exercise.description.trim() || 
                             exercise.instructions.some(inst => inst.trim()) ||
                             exercise.muscle_groups.length > 0;

    if (hasUnsavedChanges) {
      Alert.alert(
        'Discard Exercise',
        'Are you sure you want to discard this exercise?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const addInstruction = () => {
    if (currentInstruction.trim()) {
      setExercise(prev => ({
        ...prev,
        instructions: [...prev.instructions.filter(inst => inst.trim()), currentInstruction.trim(), '']
      }));
      setCurrentInstruction('');
    }
  };

  const removeInstruction = (index: number) => {
    setExercise(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const addTip = () => {
    if (currentTip.trim()) {
      setExercise(prev => ({
        ...prev,
        tips: [...prev.tips.filter(tip => tip.trim()), currentTip.trim(), '']
      }));
      setCurrentTip('');
    }
  };

  const removeTip = (index: number) => {
    setExercise(prev => ({
      ...prev,
      tips: prev.tips.filter((_, i) => i !== index)
    }));
  };

  const addMistake = () => {
    if (currentMistake.trim()) {
      setExercise(prev => ({
        ...prev,
        common_mistakes: [...prev.common_mistakes.filter(mistake => mistake.trim()), currentMistake.trim(), '']
      }));
      setCurrentMistake('');
    }
  };

  const removeMistake = (index: number) => {
    setExercise(prev => ({
      ...prev,
      common_mistakes: prev.common_mistakes.filter((_, i) => i !== index)
    }));
  };

  const addVariation = () => {
    if (currentVariation.trim()) {
      setExercise(prev => ({
        ...prev,
        variations: [...prev.variations.filter(variation => variation.trim()), currentVariation.trim(), '']
      }));
      setCurrentVariation('');
    }
  };

  const removeVariation = (index: number) => {
    setExercise(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const addAlternativeName = () => {
    if (currentAlternativeName.trim()) {
      setExercise(prev => ({
        ...prev,
        alternative_names: [...prev.alternative_names.filter(name => name.trim()), currentAlternativeName.trim(), '']
      }));
      setCurrentAlternativeName('');
    }
  };

  const removeAlternativeName = (index: number) => {
    setExercise(prev => ({
      ...prev,
      alternative_names: prev.alternative_names.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !exercise.tags.includes(currentTag.trim().toLowerCase())) {
      setExercise(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setExercise(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const toggleMuscleGroup = (muscle: string) => {
    setExercise(prev => ({
      ...prev,
      muscle_groups: prev.muscle_groups.includes(muscle)
        ? prev.muscle_groups.filter(m => m !== muscle)
        : [...prev.muscle_groups, muscle]
    }));
  };

  const toggleEquipment = (equipment: string) => {
    setExercise(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return <Dumbbell size={16} color="#FF6B35" />;
      case 'cardio': return <Heart size={16} color="#E74C3C" />;
      case 'flexibility': return <Zap size={16} color="#2ECC71" />;
      case 'balance': return <Target size={16} color="#9B59B6" />;
      case 'plyometric': return <Activity size={16} color="#3498DB" />;
      default: return <Target size={16} color="#95A5A6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#2ECC71';
      case 'intermediate': return '#F39C12';
      case 'advanced': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  // Show device info in header for transparency
  const deviceInfo = user ? `${user.platform} Device` : 'Device';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Create Exercise</Text>
              <Text style={styles.headerSubtitle}>{deviceInfo}</Text>
            </View>
            <TouchableOpacity
              style={[styles.headerButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Save size={24} color={loading ? "#666" : "#FF6B35"} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError(null)}>
                <X size={20} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          )}

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Exercise Name *</Text>
              <TextInput
                style={styles.input}
                value={exercise.name}
                onChangeText={(text) => setExercise(prev => ({ ...prev, name: text }))}
                placeholder="Enter exercise name"
                placeholderTextColor="#999"
                autoCapitalize="words"
                maxLength={100}
              />
              <Text style={styles.characterCount}>{exercise.name.length}/100</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={exercise.description}
                onChangeText={(text) => setExercise(prev => ({ ...prev, description: text }))}
                placeholder="Describe the exercise and its benefits..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>{exercise.description.length}/500</Text>
            </View>

            {/* Exercise Type and Difficulty */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Exercise Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {EXERCISE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        exercise.exercise_type === type && styles.typeChipActive
                      ]}
                      onPress={() => setExercise(prev => ({ ...prev, exercise_type: type as any }))}
                    >
                      {getTypeIcon(type)}
                      <Text style={[
                        styles.typeChipText,
                        exercise.exercise_type === type && styles.typeChipTextActive
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Difficulty</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.difficultyChip,
                        exercise.difficulty_level === difficulty && styles.difficultyChipActive,
                        exercise.difficulty_level === difficulty && {
                          backgroundColor: getDifficultyColor(difficulty) + '20',
                          borderColor: getDifficultyColor(difficulty)
                        }
                      ]}
                      onPress={() => setExercise(prev => ({ ...prev, difficulty_level: difficulty as any }))}
                    >
                      <Text style={[
                        styles.difficultyChipText,
                        exercise.difficulty_level === difficulty && {
                          color: getDifficultyColor(difficulty)
                        }
                      ]}>
                        {difficulty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Muscle Groups */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target Muscle Groups *</Text>
            <View style={styles.chipContainer}>
              {MUSCLE_GROUPS.map((muscle) => (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.chip,
                    exercise.muscle_groups.includes(muscle) && styles.chipActive
                  ]}
                  onPress={() => toggleMuscleGroup(muscle)}
                >
                  <Text style={[
                    styles.chipText,
                    exercise.muscle_groups.includes(muscle) && styles.chipTextActive
                  ]}>
                    {muscle.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment Needed</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  exercise.equipment.length === 0 && styles.chipActive
                ]}
                onPress={() => setExercise(prev => ({ ...prev, equipment: [] }))}
              >
                <Text style={[
                  styles.chipText,
                  exercise.equipment.length === 0 && styles.chipTextActive
                ]}>
                  No Equipment
                </Text>
              </TouchableOpacity>
              {EQUIPMENT_LIST.map((equipment) => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.chip,
                    exercise.equipment.includes(equipment) && styles.chipActive
                  ]}
                  onPress={() => toggleEquipment(equipment)}
                >
                  <Text style={[
                    styles.chipText,
                    exercise.equipment.includes(equipment) && styles.chipTextActive
                  ]}>
                    {equipment.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step-by-Step Instructions *</Text>
            {exercise.instructions.filter(inst => inst.trim()).map((instruction, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listItemNumber}>
                  <Text style={styles.listItemNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.listItemText}>{instruction}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeInstruction(index)}
                >
                  <X size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={currentInstruction}
                onChangeText={setCurrentInstruction}
                placeholder="Add instruction step..."
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity style={styles.addButton} onPress={addInstruction}>
                <Plus size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pro Tips</Text>
            {exercise.tips.filter(tip => tip.trim()).map((tip, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{tip}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeTip(index)}
                >
                  <X size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={currentTip}
                onChangeText={setCurrentTip}
                placeholder="Add a helpful tip..."
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity style={styles.addButton} onPress={addTip}>
                <Plus size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Common Mistakes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Mistakes</Text>
            {exercise.common_mistakes.filter(mistake => mistake.trim()).map((mistake, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{mistake}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeMistake(index)}
                >
                  <X size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={currentMistake}
                onChangeText={setCurrentMistake}
                placeholder="Add common mistake to avoid..."
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity style={styles.addButton} onPress={addMistake}>
                <Plus size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Variations */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercise Variations</Text>
            {exercise.variations.filter(variation => variation.trim()).map((variation, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{variation}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeVariation(index)}
                >
                  <X size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={currentVariation}
                onChangeText={setCurrentVariation}
                placeholder="Add exercise variation..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.addButton} onPress={addVariation}>
                <Plus size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Alternative Names */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alternative Names</Text>
            {exercise.alternative_names.filter(name => name.trim()).map((name, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{name}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeAlternativeName(index)}
                >
                  <X size={16} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={currentAlternativeName}
                onChangeText={setCurrentAlternativeName}
                placeholder="Add alternative name..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.addButton} onPress={addAlternativeName}>
                <Plus size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagContainer}>
              {exercise.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <X size={14} color="#999" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addItemContainer}>
              <TextInput
                style={styles.addItemInput}
                value={currentTag}
                onChangeText={setCurrentTag}
                placeholder="Add tag..."
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.addButton} onPress={addTag}>
                <Plus size={20} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#333', '#333'] : ['#FF6B35', '#FF8C42']}
              style={styles.saveButtonGradient}
            >
              <Save size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {loading ? 'Creating...' : 'Create Exercise'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorContainer: {
    backgroundColor: '#E74C3C20',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    flex: 1,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  typeChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  typeChipText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  difficultyChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  difficultyChipActive: {
    borderWidth: 1,
  },
  difficultyChipText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  listItemNumber: {
    backgroundColor: '#FF6B35',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemNumberText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  listItemText: {
    fontSize: 14,
    color: '#fff',
    fontFamily:'Inter-Regular',
    flex: 1,
    lineHeight: 20,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  addItemInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginRight: 12,
    minHeight: 20,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    padding: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  tagText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginRight: 6,
  },
  saveButton: {
    marginTop: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});
