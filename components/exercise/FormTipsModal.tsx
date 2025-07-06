import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  Brain,
  Lightbulb,
  Shield,
  TrendingUp,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Exercise } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

interface FormTipsModalProps {
  visible: boolean;
  onClose: () => void;
  exercise: Exercise;
}

interface FormTip {
  id: string;
  type: 'do' | 'dont' | 'focus' | 'safety' | 'progression';
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const FormTipsModal: React.FC<FormTipsModalProps> = ({
  visible,
  onClose,
  exercise,
}) => {
  const [activeTab, setActiveTab] = useState<'tips' | 'muscles' | 'variations'>('tips');

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleTabChange = async (tab: 'tips' | 'muscles' | 'variations') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  // Generate AI-powered form tips based on exercise
  const generateFormTips = (exercise: Exercise): FormTip[] => {
    const baseTips: FormTip[] = [
      {
        id: '1',
        type: 'do',
        title: 'Maintain Proper Posture',
        description: 'Keep your spine neutral and core engaged throughout the movement. This protects your back and ensures optimal muscle activation.',
        icon: <CheckCircle size={20} color={DesignTokens.colors.success[500]} />,
      },
      {
        id: '2',
        type: 'dont',
        title: 'Avoid Rushing the Movement',
        description: 'Control both the lifting and lowering phases. Quick, jerky movements reduce effectiveness and increase injury risk.',
        icon: <AlertTriangle size={20} color={DesignTokens.colors.warning[500]} />,
      },
      {
        id: '3',
        type: 'focus',
        title: 'Mind-Muscle Connection',
        description: 'Focus on feeling the target muscles working. Visualize the muscle contracting and lengthening with each rep.',
        icon: <Brain size={20} color={DesignTokens.colors.primary[500]} />,
      },
      {
        id: '4',
        type: 'safety',
        title: 'Warm Up Properly',
        description: 'Always perform dynamic warm-up exercises before starting. This prepares your muscles and joints for the workout.',
        icon: <Shield size={20} color={DesignTokens.colors.error[500]} />,
      },
      {
        id: '5',
        type: 'progression',
        title: 'Progressive Overload',
        description: 'Gradually increase weight, reps, or sets over time. This ensures continuous improvement and muscle growth.',
        icon: <TrendingUp size={20} color={DesignTokens.colors.info[500]} />,
      },
    ];

    // Add exercise-specific tips based on type and muscle groups
    const specificTips: FormTip[] = [];

    if (exercise.exercise_type === 'strength') {
      specificTips.push({
        id: 'strength-1',
        type: 'focus',
        title: 'Breathing Pattern',
        description: 'Exhale during the exertion phase (lifting) and inhale during the lowering phase. This helps maintain core stability.',
        icon: <Target size={20} color={DesignTokens.colors.primary[500]} />,
      });
    }

    if (exercise.primary_muscle_group === 'chest') {
      specificTips.push({
        id: 'chest-1',
        type: 'do',
        title: 'Retract Shoulder Blades',
        description: 'Pull your shoulder blades back and down to create a stable base and protect your shoulders during chest exercises.',
        icon: <CheckCircle size={20} color={DesignTokens.colors.success[500]} />,
      });
    }

    if (exercise.primary_muscle_group === 'legs') {
      specificTips.push({
        id: 'legs-1',
        type: 'safety',
        title: 'Knee Alignment',
        description: 'Keep your knees aligned with your toes. Avoid letting them cave inward, which can cause injury.',
        icon: <Shield size={20} color={DesignTokens.colors.error[500]} />,
      });
    }

    return [...baseTips, ...specificTips];
  };

  const formTips = generateFormTips(exercise);

  const getTipColor = (type: FormTip['type']) => {
    switch (type) {
      case 'do':
        return DesignTokens.colors.success[500];
      case 'dont':
        return DesignTokens.colors.warning[500];
      case 'focus':
        return DesignTokens.colors.primary[500];
      case 'safety':
        return DesignTokens.colors.error[500];
      case 'progression':
        return DesignTokens.colors.info[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const getTipBackgroundColor = (type: FormTip['type']) => {
    return getTipColor(type) + '20';
  };

  const renderTipsContent = () => (
    <View style={styles.tipsContent}>
      <Text style={styles.sectionTitle}>Form & Technique Tips</Text>
      <Text style={styles.sectionSubtitle}>
        AI-powered guidance for perfect form and maximum results
      </Text>
      
      {formTips.map((tip) => (
        <View 
          key={tip.id} 
          style={[
            styles.tipCard,
            { backgroundColor: getTipBackgroundColor(tip.type) }
          ]}
        >
          <View style={styles.tipHeader}>
            <View style={styles.tipIcon}>
              {tip.icon}
            </View>
            <View style={styles.tipTitleContainer}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <View style={[
                styles.tipTypeBadge,
                { backgroundColor: getTipColor(tip.type) }
              ]}>
                <Text style={styles.tipTypeText}>
                  {tip.type.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.tipDescription}>{tip.description}</Text>
        </View>
      ))}
    </View>
  );

  const renderMusclesContent = () => (
    <View style={styles.musclesContent}>
      <Text style={styles.sectionTitle}>Muscle Activation</Text>
      <Text style={styles.sectionSubtitle}>
        Understanding which muscles are working during this exercise
      </Text>

      <View style={styles.muscleSection}>
        <Text style={styles.muscleGroupTitle}>Primary Muscles</Text>
        <View style={styles.primaryMuscle}>
          <Text style={styles.primaryMuscleText}>
            {exercise.primary_muscle_group}
          </Text>
        </View>
      </View>

      {exercise.secondary_muscle_groups && exercise.secondary_muscle_groups.length > 0 && (
        <View style={styles.muscleSection}>
          <Text style={styles.muscleGroupTitle}>Secondary Muscles</Text>
          <View style={styles.secondaryMuscles}>
            {exercise.secondary_muscle_groups.map((muscle, index) => (
              <View key={index} style={styles.secondaryMuscle}>
                <Text style={styles.secondaryMuscleText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.activationTips}>
        <Lightbulb size={24} color={DesignTokens.colors.warning[500]} />
        <View style={styles.activationTipsContent}>
          <Text style={styles.activationTipsTitle}>Activation Tips</Text>
          <Text style={styles.activationTipsText}>
            Focus on squeezing and controlling the primary muscle group. 
            You should feel the burn in the {exercise.primary_muscle_group} muscles first.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderVariationsContent = () => (
    <View style={styles.variationsContent}>
      <Text style={styles.sectionTitle}>Exercise Variations</Text>
      <Text style={styles.sectionSubtitle}>
        Different ways to perform this exercise for progression or modification
      </Text>

      <View style={styles.variationCard}>
        <Text style={styles.variationTitle}>Beginner Modification</Text>
        <Text style={styles.variationDescription}>
          Reduce the range of motion or use lighter weight to master the basic movement pattern.
        </Text>
      </View>

      <View style={styles.variationCard}>
        <Text style={styles.variationTitle}>Advanced Progression</Text>
        <Text style={styles.variationDescription}>
          Add pause reps, increase time under tension, or incorporate unilateral movements.
        </Text>
      </View>

      <View style={styles.variationCard}>
        <Text style={styles.variationTitle}>Equipment Alternative</Text>
        <Text style={styles.variationDescription}>
          Bodyweight or resistance band variations when gym equipment isn't available.
        </Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={2}>
              {exercise.name}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={DesignTokens.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'tips' && styles.activeTab]}
              onPress={() => handleTabChange('tips')}
            >
              <Text style={[styles.tabText, activeTab === 'tips' && styles.activeTabText]}>
                Form Tips
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'muscles' && styles.activeTab]}
              onPress={() => handleTabChange('muscles')}
            >
              <Text style={[styles.tabText, activeTab === 'muscles' && styles.activeTabText]}>
                Muscles
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'variations' && styles.activeTab]}
              onPress={() => handleTabChange('variations')}
            >
              <Text style={[styles.tabText, activeTab === 'variations' && styles.activeTabText]}>
                Variations
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'tips' && renderTipsContent()}
          {activeTab === 'muscles' && renderMusclesContent()}
          {activeTab === 'variations' && renderVariationsContent()}
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[4],
  },
  title: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginRight: DesignTokens.spacing[4],
    lineHeight: 28,
  },
  closeButton: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[1],
  },
  tab: {
    flex: 1,
    paddingVertical: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  tabText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  activeTabText: {
    color: DesignTokens.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingBottom: DesignTokens.spacing[8],
  },
  tipsContent: {
    paddingTop: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  sectionSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 24,
    marginBottom: DesignTokens.spacing[6],
  },
  tipCard: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[3],
  },
  tipIcon: {
    marginRight: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[1],
  },
  tipTitleContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  tipTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  tipTypeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  tipDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 22,
  },
  musclesContent: {
    paddingTop: DesignTokens.spacing[6],
  },
  muscleSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  muscleGroupTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[3],
  },
  primaryMuscle: {
    backgroundColor: `${DesignTokens.colors.primary[500]}20`,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 2,
    borderColor: DesignTokens.colors.primary[500],
  },
  primaryMuscleText: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  secondaryMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
  },
  secondaryMuscle: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
  },
  secondaryMuscleText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textTransform: 'capitalize',
  },
  activationTips: {
    flexDirection: 'row',
    backgroundColor: `${DesignTokens.colors.warning[500]}10`,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: `${DesignTokens.colors.warning[500]}30`,
  },
  activationTipsContent: {
    flex: 1,
    marginLeft: DesignTokens.spacing[3],
  },
  activationTipsTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  activationTipsText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  variationsContent: {
    paddingTop: DesignTokens.spacing[6],
  },
  variationCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  variationTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[2],
  },
  variationDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 22,
  },
});
