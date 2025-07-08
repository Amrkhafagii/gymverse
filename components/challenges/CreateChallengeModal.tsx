import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Trophy,
  Users,
  Target,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  Plus,
  Minus,
} from 'lucide-react-native';
import { Challenge } from '@/contexts/ChallengeContext';
import { useChallenges } from '@/hooks/useChallenges';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface CreateChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onChallengeCreated?: (challenge: Challenge) => void;
}

type ChallengeType = 'individual' | 'team' | 'community';
type ChallengeCategory = 'strength' | 'cardio' | 'consistency' | 'distance' | 'time' | 'social';
type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';

interface CreateChallengeForm {
  title: string;
  description: string;
  type: ChallengeType;
  category: ChallengeCategory;
  difficulty: ChallengeDifficulty;
  duration: {
    days: number;
  };
  target: {
    value: number;
    unit: string;
  };
  reward: {
    points: number;
    badge?: string;
  };
  maxParticipants?: number;
}

export function CreateChallengeModal({
  visible,
  onClose,
  onChallengeCreated,
}: CreateChallengeModalProps) {
  const { createChallenge } = useChallenges();

  const [form, setForm] = useState<CreateChallengeForm>({
    title: '',
    description: '',
    type: 'individual',
    category: 'strength',
    difficulty: 'beginner',
    duration: { days: 30 },
    target: { value: 20, unit: 'workouts' },
    reward: { points: 500 },
    maxParticipants: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const challengeTypes: Array<{ key: ChallengeType; label: string; description: string; icon: any }> = [
    {
      key: 'individual',
      label: 'Individual',
      description: 'Personal challenge for self-improvement',
      icon: Target,
    },
    {
      key: 'team',
      label: 'Team',
      description: 'Collaborate with others to reach goals',
      icon: Users,
    },
    {
      key: 'community',
      label: 'Community',
      description: 'Open challenge for everyone to join',
      icon: Trophy,
    },
  ];

  const challengeCategories: Array<{ key: ChallengeCategory; label: string; icon: any; color: string }> = [
    { key: 'strength', label: 'Strength', icon: Trophy, color: '#FF6B35' },
    { key: 'cardio', label: 'Cardio', icon: TrendingUp, color: '#4A90E2' },
    { key: 'consistency', label: 'Consistency', icon: Target, color: '#27AE60' },
    { key: 'distance', label: 'Distance', icon: Calendar, color: '#9B59B6' },
    { key: 'time', label: 'Time', icon: Clock, color: '#F39C12' },
    { key: 'social', label: 'Social', icon: Users, color: '#E74C3C' },
  ];

  const challengeDifficulties: Array<{ key: ChallengeDifficulty; label: string; color: string; multiplier: number }> = [
    { key: 'beginner', label: 'Beginner', color: '#27AE60', multiplier: 1 },
    { key: 'intermediate', label: 'Intermediate', color: '#F39C12', multiplier: 1.5 },
    { key: 'advanced', label: 'Advanced', color: '#E74C3C', multiplier: 2 },
  ];

  const targetUnits = [
    'workouts', 'exercises', 'sets', 'reps', 'minutes', 'hours', 
    'miles', 'kilometers', 'steps', 'calories', 'days', 'sessions'
  ];

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + form.duration.days);

      const difficultyMultiplier = challengeDifficulties.find(d => d.key === form.difficulty)?.multiplier || 1;
      const basePoints = form.reward.points;
      const adjustedPoints = Math.round(basePoints * difficultyMultiplier);

      const newChallenge: Omit<Challenge, 'id' | 'participants' | 'isJoined' | 'isCompleted' | 'createdAt' | 'updatedAt'> = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        category: form.category,
        difficulty: form.difficulty,
        duration: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          daysLeft: form.duration.days,
        },
        progress: {
          current: 0,
          target: form.target.value,
          unit: form.target.unit,
        },
        reward: {
          points: adjustedPoints,
          badge: form.reward.badge,
        },
        maxParticipants: form.maxParticipants,
      };

      const createdChallenge = await createChallenge(newChallenge);
      
      Alert.alert(
        'Challenge Created!',
        `Your ${form.type} challenge "${form.title}" has been created successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onChallengeCreated?.(createdChallenge);
              onClose();
            },
          },
        ]
      );

      // Reset form
      setForm({
        title: '',
        description: '',
        type: 'individual',
        category: 'strength',
        difficulty: 'beginner',
        duration: { days: 30 },
        target: { value: 20, unit: 'workouts' },
        reward: { points: 500 },
        maxParticipants: undefined,
      });

    } catch (error) {
      Alert.alert('Error', 'Failed to create challenge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a challenge title.');
      return false;
    }

    if (!form.description.trim()) {
      Alert.alert('Validation Error', 'Please enter a challenge description.');
      return false;
    }

    if (form.duration.days < 1 || form.duration.days > 365) {
      Alert.alert('Validation Error', 'Duration must be between 1 and 365 days.');
      return false;
    }

    if (form.target.value < 1) {
      Alert.alert('Validation Error', 'Target value must be at least 1.');
      return false;
    }

    if (form.reward.points < 1) {
      Alert.alert('Validation Error', 'Reward points must be at least 1.');
      return false;
    }

    if (form.maxParticipants && form.maxParticipants < 1) {
      Alert.alert('Validation Error', 'Max participants must be at least 1.');
      return false;
    }

    return true;
  };

  const updateForm = (updates: Partial<CreateChallengeForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const adjustNumber = (field: string, delta: number, min: number = 1, max: number = 999999) => {
    const keys = field.split('.');
    const currentValue = keys.reduce((obj, key) => obj[key], form as any);
    const newValue = Math.max(min, Math.min(max, currentValue + delta));
    
    if (keys.length === 2) {
      updateForm({
        [keys[0]]: {
          ...(form as any)[keys[0]],
          [keys[1]]: newValue,
        },
      });
    } else {
      updateForm({ [field]: newValue });
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.optionGrid}>
      {challengeTypes.map(({ key, label, description, icon: Icon }) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.optionCard,
            form.type === key && styles.optionCardSelected
          ]}
          onPress={() => updateForm({ type: key })}
        >
          <Icon size={24} color={form.type === key ? '#FFFFFF' : '#666'} />
          <Text style={[
            styles.optionLabel,
            form.type === key && styles.optionLabelSelected
          ]}>
            {label}
          </Text>
          <Text style={[
            styles.optionDescription,
            form.type === key && styles.optionDescriptionSelected
          ]}>
            {description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCategorySelector = () => (
    <View style={styles.optionGrid}>
      {challengeCategories.map(({ key, label, icon: Icon, color }) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.optionCard,
            form.category === key && { backgroundColor: color }
          ]}
          onPress={() => updateForm({ category: key })}
        >
          <Icon size={24} color={form.category === key ? '#FFFFFF' : color} />
          <Text style={[
            styles.optionLabel,
            form.category === key && styles.optionLabelSelected
          ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDifficultySelector = () => (
    <View style={styles.difficultyContainer}>
      {challengeDifficulties.map(({ key, label, color, multiplier }) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.difficultyOption,
            form.difficulty === key && { backgroundColor: color }
          ]}
          onPress={() => updateForm({ difficulty: key })}
        >
          <Text style={[
            styles.difficultyLabel,
            form.difficulty === key && styles.difficultyLabelSelected
          ]}>
            {label}
          </Text>
          <Text style={[
            styles.difficultyMultiplier,
            form.difficulty === key && styles.difficultyMultiplierSelected
          ]}>
            {multiplier}x points
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderNumberInput = (
    label: string,
    value: number,
    field: string,
    min: number = 1,
    max: number = 999999,
    suffix?: string
  ) => (
    <View style={styles.numberInput}>
      <Text style={styles.numberInputLabel}>{label}</Text>
      <View style={styles.numberInputContainer}>
        <TouchableOpacity
          style={styles.numberInputButton}
          onPress={() => adjustNumber(field, -1, min, max)}
        >
          <Minus size={16} color="#666" />
        </TouchableOpacity>
        <Text style={styles.numberInputValue}>
          {value}{suffix && ` ${suffix}`}
        </Text>
        <TouchableOpacity
          style={styles.numberInputButton}
          onPress={() => adjustNumber(field, 1, min, max)}
        >
          <Plus size={16} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Challenge</Text>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderSection('Basic Information', (
            <>
              <TextInput
                style={styles.textInput}
                placeholder="Challenge title"
                placeholderTextColor="#999"
                value={form.title}
                onChangeText={(title) => updateForm({ title })}
                maxLength={50}
              />
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                placeholder="Describe your challenge..."
                placeholderTextColor="#999"
                value={form.description}
                onChangeText={(description) => updateForm({ description })}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </>
          ))}

          {renderSection('Challenge Type', renderTypeSelector())}

          {renderSection('Category', renderCategorySelector())}

          {renderSection('Difficulty', renderDifficultySelector())}

          {renderSection('Duration & Target', (
            <>
              {renderNumberInput('Duration', form.duration.days, 'duration.days', 1, 365, 'days')}
              {renderNumberInput('Target Value', form.target.value, 'target.value', 1, 10000)}
              
              <View style={styles.unitSelector}>
                <Text style={styles.unitSelectorLabel}>Target Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.unitOptions}>
                    {targetUnits.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitOption,
                          form.target.unit === unit && styles.unitOptionSelected
                        ]}
                        onPress={() => updateForm({ 
                          target: { ...form.target, unit } 
                        })}
                      >
                        <Text style={[
                          styles.unitOptionText,
                          form.target.unit === unit && styles.unitOptionTextSelected
                        ]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </>
          ))}

          {renderSection('Rewards', (
            <>
              {renderNumberInput('Points Reward', form.reward.points, 'reward.points', 1, 10000)}
              <TextInput
                style={styles.textInput}
                placeholder="Badge name (optional)"
                placeholderTextColor="#999"
                value={form.reward.badge || ''}
                onChangeText={(badge) => updateForm({ 
                  reward: { ...form.reward, badge: badge || undefined } 
                })}
                maxLength={30}
              />
            </>
          ))}

          {form.type !== 'individual' && renderSection('Participants', (
            <>
              {renderNumberInput(
                'Max Participants', 
                form.maxParticipants || 100, 
                'maxParticipants', 
                1, 
                10000
              )}
              <Text style={styles.helperText}>
                Leave empty for unlimited participants
              </Text>
            </>
          ))}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  optionCardSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  optionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  difficultyLabelSelected: {
    color: '#FFFFFF',
  },
  difficultyMultiplier: {
    fontSize: 12,
    color: '#6B7280',
  },
  difficultyMultiplierSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  numberInput: {
    marginBottom: 16,
  },
  numberInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  numberInputButton: {
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  numberInputValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  unitSelector: {
    marginTop: 16,
  },
  unitSelectorLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  unitOptions: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  unitOption: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unitOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  unitOptionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  unitOptionTextSelected: {
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 100,
  },
});
