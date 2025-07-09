/**
 * Create Challenge Modal Component
 * Allows users to create custom challenges
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  Target, 
  Calendar, 
  Users, 
  Award,
  Plus,
  Minus,
  Check,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface ChallengeData {
  title: string;
  description: string;
  type: 'consistency' | 'volume' | 'frequency' | 'duration' | 'strength';
  duration: number;
  target: number;
  reward: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  rules: string[];
  isPublic: boolean;
}

interface CreateChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateChallenge: (challengeData: ChallengeData) => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  visible,
  onClose,
  onCreateChallenge,
}) => {
  const [formData, setFormData] = useState<ChallengeData>({
    title: '',
    description: '',
    type: 'consistency',
    duration: 30,
    target: 30,
    reward: 500,
    difficulty: 'intermediate',
    category: 'fitness',
    rules: [''],
    isPublic: true,
  });

  const challengeTypes = [
    { id: 'consistency', label: 'Consistency', description: 'Complete workouts regularly' },
    { id: 'volume', label: 'Volume', description: 'Increase total workout volume' },
    { id: 'frequency', label: 'Frequency', description: 'Workout a certain number of times' },
    { id: 'duration', label: 'Duration', description: 'Achieve total workout time' },
    { id: 'strength', label: 'Strength', description: 'Improve strength metrics' },
  ];

  const difficulties = [
    { id: 'beginner', label: 'Beginner', color: '#10B981' },
    { id: 'intermediate', label: 'Intermediate', color: '#F59E0B' },
    { id: 'advanced', label: 'Advanced', color: '#EF4444' },
  ];

  const categories = [
    'fitness', 'strength', 'endurance', 'flexibility', 'weight-loss', 'muscle-gain'
  ];

  const handleInputChange = (field: keyof ChallengeData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRule = () => {
    setFormData(prev => ({
      ...prev,
      rules: [...prev.rules, '']
    }));
  };

  const handleRemoveRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleRuleChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.map((rule, i) => i === index ? value : rule)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a challenge title');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a challenge description');
      return false;
    }
    if (formData.target <= 0) {
      Alert.alert('Error', 'Target must be greater than 0');
      return false;
    }
    if (formData.duration <= 0) {
      Alert.alert('Error', 'Duration must be greater than 0');
      return false;
    }
    if (formData.rules.filter(rule => rule.trim()).length === 0) {
      Alert.alert('Error', 'Please add at least one rule');
      return false;
    }
    return true;
  };

  const handleCreate = () => {
    if (!validateForm()) return;

    const cleanedData = {
      ...formData,
      rules: formData.rules.filter(rule => rule.trim()),
    };

    onCreateChallenge(cleanedData);
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      type: 'consistency',
      duration: 30,
      target: 30,
      reward: 500,
      difficulty: 'intermediate',
      category: 'fitness',
      rules: [''],
      isPublic: true,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <Target size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Create Challenge</Text>
            </View>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Form */}
        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Challenge Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter challenge title..."
                placeholderTextColor={DesignTokens.colors.text.secondary}
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                maxLength={50}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your challenge..."
                placeholderTextColor={DesignTokens.colors.text.secondary}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>

          {/* Challenge Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Challenge Type</Text>
            <View style={styles.typeGrid}>
              {challengeTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    formData.type === type.id && styles.typeOptionSelected
                  ]}
                  onPress={() => handleInputChange('type', type.id)}
                >
                  <Text style={[
                    styles.typeLabel,
                    formData.type === type.id && styles.typeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={[
                    styles.typeDescription,
                    formData.type === type.id && styles.typeDescriptionSelected
                  ]}>
                    {type.description}
                  </Text>
                  {formData.type === type.id && (
                    <View style={styles.typeCheck}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Challenge Settings</Text>
            
            <View style={styles.settingsGrid}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Duration (days)</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => handleInputChange('duration', Math.max(1, formData.duration - 1))}
                  >
                    <Minus size={16} color={DesignTokens.colors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{formData.duration}</Text>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => handleInputChange('duration', formData.duration + 1)}
                  >
                    <Plus size={16} color={DesignTokens.colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Target</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => handleInputChange('target', Math.max(1, formData.target - 1))}
                  >
                    <Minus size={16} color={DesignTokens.colors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{formData.target}</Text>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => handleInputChange('target', formData.target + 1)}
                  >
                    <Plus size={16} color={DesignTokens.colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>Reward (points)</Text>
                <View style={styles.numberInput}>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => handleInputChange('reward', Math.max(100, formData.reward - 100))}
                  >
                    <Minus size={16} color={DesignTokens.colors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.numberValue}>{formData.reward}</Text>
                  <TouchableOpacity
                    style={styles.numberButton}
                    onPress={() => handleInputChange('reward', formData.reward + 100)}
                  >
                    <Plus size={16} color={DesignTokens.colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Difficulty */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty Level</Text>
            <View style={styles.difficultyGrid}>
              {difficulties.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty.id}
                  style={[
                    styles.difficultyOption,
                    { borderColor: difficulty.color },
                    formData.difficulty === difficulty.id && { backgroundColor: difficulty.color }
                  ]}
                  onPress={() => handleInputChange('difficulty', difficulty.id)}
                >
                  <Text style={[
                    styles.difficultyLabel,
                    formData.difficulty === difficulty.id && styles.difficultyLabelSelected
                  ]}>
                    {difficulty.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    formData.category === category && styles.categoryOptionSelected
                  ]}
                  onPress={() => handleInputChange('category', category)}
                >
                  <Text style={[
                    styles.categoryLabel,
                    formData.category === category && styles.categoryLabelSelected
                  ]}>
                    {category.replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rules */}
          <View style={styles.section}>
            <View style={styles.rulesHeader}>
              <Text style={styles.sectionTitle}>Challenge Rules</Text>
              <TouchableOpacity style={styles.addRuleButton} onPress={handleAddRule}>
                <Plus size={16} color={DesignTokens.colors.primary[500]} />
                <Text style={styles.addRuleText}>Add Rule</Text>
              </TouchableOpacity>
            </View>
            
            {formData.rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <TextInput
                  style={styles.ruleInput}
                  placeholder={`Rule ${index + 1}...`}
                  placeholderTextColor={DesignTokens.colors.text.secondary}
                  value={rule}
                  onChangeText={(value) => handleRuleChange(index, value)}
                  maxLength={100}
                />
                {formData.rules.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeRuleButton}
                    onPress={() => handleRemoveRule(index)}
                  >
                    <Minus size={16} color={DesignTokens.colors.error[500]} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Visibility</Text>
            <View style={styles.visibilityOptions}>
              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  formData.isPublic && styles.visibilityOptionSelected
                ]}
                onPress={() => handleInputChange('isPublic', true)}
              >
                <Users size={20} color={formData.isPublic ? '#FFFFFF' : DesignTokens.colors.text.secondary} />
                <Text style={[
                  styles.visibilityLabel,
                  formData.isPublic && styles.visibilityLabelSelected
                ]}>
                  Public
                </Text>
                <Text style={[
                  styles.visibilityDescription,
                  formData.isPublic && styles.visibilityDescriptionSelected
                ]}>
                  Anyone can join
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  !formData.isPublic && styles.visibilityOptionSelected
                ]}
                onPress={() => handleInputChange('isPublic', false)}
              >
                <Target size={20} color={!formData.isPublic ? '#FFFFFF' : DesignTokens.colors.text.secondary} />
                <Text style={[
                  styles.visibilityLabel,
                  !formData.isPublic && styles.visibilityLabelSelected
                ]}>
                  Private
                </Text>
                <Text style={[
                  styles.visibilityDescription,
                  !formData.isPublic && styles.visibilityDescriptionSelected
                ]}>
                  Invite only
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.createButtonGradient}>
              <Text style={styles.createButtonText}>Create Challenge</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },

  header: {
    paddingTop: DesignTokens.spacing[6],
    paddingBottom: DesignTokens.spacing[4],
    paddingHorizontal: DesignTokens.spacing[5],
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },

  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },

  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },

  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
  },

  form: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },

  section: {
    marginBottom: DesignTokens.spacing[6],
  },

  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },

  inputGroup: {
    marginBottom: DesignTokens.spacing[4],
  },

  inputLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },

  textInput: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border.primary,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[3],
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
  },

  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  typeGrid: {
    gap: DesignTokens.spacing[3],
  },

  typeOption: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderWidth: 2,
    borderColor: DesignTokens.colors.border.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[4],
    position: 'relative',
  },

  typeOptionSelected: {
    borderColor: DesignTokens.colors.primary[500],
    backgroundColor: DesignTokens.colors.primary[500],
  },

  typeLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },

  typeLabelSelected: {
    color: '#FFFFFF',
  },

  typeDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },

  typeDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  typeCheck: {
    position: 'absolute',
    top: DesignTokens.spacing[2],
    right: DesignTokens.spacing[2],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: DesignTokens.spacing[1],
  },

  settingsGrid: {
    gap: DesignTokens.spacing[4],
  },

  settingItem: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[4],
  },

  settingLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },

  numberInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: DesignTokens.spacing[3],
  },

  numberButton: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  numberValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },

  difficultyGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },

  difficultyOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: DesignTokens.borderRadius.md,
    paddingVertical: DesignTokens.spacing[3],
    alignItems: 'center',
  },

  difficultyLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  difficultyLabelSelected: {
    color: '#FFFFFF',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
  },

  categoryOption: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  categoryOptionSelected: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderColor: DesignTokens.colors.primary[600],
  },

  categoryLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    textTransform: 'capitalize',
  },

  categoryLabelSelected: {
    color: '#FFFFFF',
  },

  rulesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },

  addRuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },

  addRuleText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[3],
  },

  ruleInput: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.border.primary,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[3],
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
  },

  removeRuleButton: {
    backgroundColor: DesignTokens.colors.error[100],
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
  },

  visibilityOptions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },

  visibilityOption: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
    borderWidth: 2,
    borderColor: DesignTokens.colors.border.primary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
  },

  visibilityOptionSelected: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderColor: DesignTokens.colors.primary[600],
  },

  visibilityLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[1],
  },

  visibilityLabelSelected: {
    color: '#FFFFFF',
  },

  visibilityDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },

  visibilityDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  footer: {
    flexDirection: 'row',
    padding: DesignTokens.spacing[5],
    gap: DesignTokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.border.primary,
  },

  resetButton: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingVertical: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.md,
    alignItems: 'center',
  },

  resetButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  createButton: {
    flex: 2,
    borderRadius: DesignTokens.borderRadius.md,
    overflow: 'hidden',
  },

  createButtonGradient: {
    paddingVertical: DesignTokens.spacing[4],
    alignItems: 'center',
  },

  createButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});
