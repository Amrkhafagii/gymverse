import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  CheckCircle, 
  XCircle, 
  Target, 
  Brain,
  AlertTriangle,
  Lightbulb,
  Play,
  BookOpen,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Exercise } from '@/lib/supabase';
import { FormVideoPlayer } from './FormVideoPlayer';
import * as Haptics from 'expo-haptics';

interface ExerciseFormSectionProps {
  exercise: Exercise;
}

interface FormPoint {
  id: string;
  type: 'correct' | 'incorrect' | 'tip' | 'focus';
  title: string;
  description: string;
}

export const ExerciseFormSection: React.FC<ExerciseFormSectionProps> = ({
  exercise,
}) => {
  const [activeSection, setActiveSection] = useState<'video' | 'form' | 'cues'>('video');

  const handleSectionChange = async (section: 'video' | 'form' | 'cues') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveSection(section);
  };

  // Generate form guidance based on exercise
  const generateFormPoints = (exercise: Exercise): FormPoint[] => {
    const basePoints: FormPoint[] = [
      {
        id: '1',
        type: 'correct',
        title: 'Controlled Movement',
        description: 'Move through the full range of motion with control, taking 2-3 seconds for each phase.',
      },
      {
        id: '2',
        type: 'correct',
        title: 'Proper Breathing',
        description: 'Exhale during the exertion phase and inhale during the return phase.',
      },
      {
        id: '3',
        type: 'incorrect',
        title: 'Rushing the Movement',
        description: 'Avoid using momentum or bouncing at the bottom of the movement.',
      },
      {
        id: '4',
        type: 'focus',
        title: 'Mind-Muscle Connection',
        description: `Focus on feeling the ${exercise.primary_muscle_group} muscles working throughout the movement.`,
      },
      {
        id: '5',
        type: 'tip',
        title: 'Progressive Overload',
        description: 'Gradually increase weight, reps, or sets to continue making progress.',
      },
    ];

    // Add exercise-specific points
    const specificPoints: FormPoint[] = [];

    if (exercise.primary_muscle_group === 'chest') {
      specificPoints.push({
        id: 'chest-1',
        type: 'correct',
        title: 'Shoulder Blade Position',
        description: 'Retract and depress your shoulder blades to create a stable base.',
      });
    }

    if (exercise.primary_muscle_group === 'legs') {
      specificPoints.push({
        id: 'legs-1',
        type: 'correct',
        title: 'Knee Tracking',
        description: 'Keep your knees aligned with your toes throughout the movement.',
      });
    }

    if (exercise.exercise_type === 'cardio') {
      specificPoints.push({
        id: 'cardio-1',
        type: 'tip',
        title: 'Heart Rate Zone',
        description: 'Maintain 70-85% of your maximum heart rate for optimal cardiovascular benefits.',
      });
    }

    return [...basePoints, ...specificPoints];
  };

  const formPoints = generateFormPoints(exercise);

  const getPointIcon = (type: FormPoint['type']) => {
    switch (type) {
      case 'correct':
        return <CheckCircle size={20} color={DesignTokens.colors.success[500]} />;
      case 'incorrect':
        return <XCircle size={20} color={DesignTokens.colors.error[500]} />;
      case 'tip':
        return <Lightbulb size={20} color={DesignTokens.colors.warning[500]} />;
      case 'focus':
        return <Target size={20} color={DesignTokens.colors.primary[500]} />;
      default:
        return <Brain size={20} color={DesignTokens.colors.text.secondary} />;
    }
  };

  const getPointColor = (type: FormPoint['type']) => {
    switch (type) {
      case 'correct':
        return DesignTokens.colors.success[500];
      case 'incorrect':
        return DesignTokens.colors.error[500];
      case 'tip':
        return DesignTokens.colors.warning[500];
      case 'focus':
        return DesignTokens.colors.primary[500];
      default:
        return DesignTokens.colors.text.secondary;
    }
  };

  const renderVideoSection = () => (
    <View style={styles.videoSection}>
      {exercise.video_url ? (
        <FormVideoPlayer 
          videoUrl={exercise.video_url}
          title={`${exercise.name} - Proper Form`}
        />
      ) : (
        <View style={styles.noVideoContainer}>
          <Play size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.noVideoTitle}>No Video Available</Text>
          <Text style={styles.noVideoText}>
            Form demonstration video coming soon
          </Text>
        </View>
      )}
      
      <View style={styles.videoInfo}>
        <Text style={styles.videoInfoTitle}>Form Demonstration</Text>
        <Text style={styles.videoInfoText}>
          Watch the proper form and technique for {exercise.name}. 
          Pay attention to the movement pattern, breathing, and muscle activation.
        </Text>
      </View>
    </View>
  );

  const renderFormSection = () => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>Form Guidelines</Text>
      <Text style={styles.formSubtitle}>
        Key points for proper execution and safety
      </Text>
      
      {formPoints.map((point) => (
        <View key={point.id} style={styles.formPoint}>
          <View style={styles.formPointHeader}>
            <View style={styles.formPointIcon}>
              {getPointIcon(point.type)}
            </View>
            <View style={styles.formPointContent}>
              <Text style={styles.formPointTitle}>{point.title}</Text>
              <View style={[
                styles.formPointTypeBadge,
                { backgroundColor: `${getPointColor(point.type)}20` }
              ]}>
                <Text style={[
                  styles.formPointTypeText,
                  { color: getPointColor(point.type) }
                ]}>
                  {point.type.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.formPointDescription}>{point.description}</Text>
        </View>
      ))}
    </View>
  );

  const renderCuesSection = () => (
    <View style={styles.cuesSection}>
      <Text style={styles.cuesTitle}>Coaching Cues</Text>
      <Text style={styles.cuesSubtitle}>
        Mental reminders to maintain perfect form
      </Text>
      
      <View style={styles.cuesList}>
        <View style={styles.cueItem}>
          <View style={styles.cueNumber}>
            <Text style={styles.cueNumberText}>1</Text>
          </View>
          <View style={styles.cueContent}>
            <Text style={styles.cueTitle}>Setup</Text>
            <Text style={styles.cueDescription}>
              Position yourself correctly and engage your core before starting
            </Text>
          </View>
        </View>

        <View style={styles.cueItem}>
          <View style={styles.cueNumber}>
            <Text style={styles.cueNumberText}>2</Text>
          </View>
          <View style={styles.cueContent}>
            <Text style={styles.cueTitle}>Initiate</Text>
            <Text style={styles.cueDescription}>
              Begin the movement from the target muscle, not momentum
            </Text>
          </View>
        </View>

        <View style={styles.cueItem}>
          <View style={styles.cueNumber}>
            <Text style={styles.cueNumberText}>3</Text>
          </View>
          <View style={styles.cueContent}>
            <Text style={styles.cueTitle}>Control</Text>
            <Text style={styles.cueDescription}>
              Maintain tension and control throughout the entire range of motion
            </Text>
          </View>
        </View>

        <View style={styles.cueItem}>
          <View style={styles.cueNumber}>
            <Text style={styles.cueNumberText}>4</Text>
          </View>
          <View style={styles.cueContent}>
            <Text style={styles.cueTitle}>Reset</Text>
            <Text style={styles.cueDescription}>
              Return to starting position with control, ready for the next rep
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.mentalCues}>
        <Brain size={24} color={DesignTokens.colors.primary[500]} />
        <View style={styles.mentalCuesContent}>
          <Text style={styles.mentalCuesTitle}>Mental Focus</Text>
          <Text style={styles.mentalCuesText}>
            Visualize the {exercise.primary_muscle_group} muscles contracting and lengthening. 
            Think "squeeze and control" rather than "lift and drop."
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Section Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeSection === 'video' && styles.activeTab]}
          onPress={() => handleSectionChange('video')}
        >
          <Play size={16} color={activeSection === 'video' ? '#FFFFFF' : DesignTokens.colors.text.secondary} />
          <Text style={[styles.tabText, activeSection === 'video' && styles.activeTabText]}>
            Video
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'form' && styles.activeTab]}
          onPress={() => handleSectionChange('form')}
        >
          <CheckCircle size={16} color={activeSection === 'form' ? '#FFFFFF' : DesignTokens.colors.text.secondary} />
          <Text style={[styles.tabText, activeSection === 'form' && styles.activeTabText]}>
            Form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSection === 'cues' && styles.activeTab]}
          onPress={() => handleSectionChange('cues')}
        >
          <BookOpen size={16} color={activeSection === 'cues' ? '#FFFFFF' : DesignTokens.colors.text.secondary} />
          <Text style={[styles.tabText, activeSection === 'cues' && styles.activeTabText]}>
            Cues
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeSection === 'video' && renderVideoSection()}
        {activeSection === 'form' && renderFormSection()}
        {activeSection === 'cues' && renderCuesSection()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[1],
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[1],
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
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: DesignTokens.spacing[8],
  },
  videoSection: {
    paddingHorizontal: DesignTokens.spacing[5],
  },
  noVideoContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[8],
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  noVideoTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginTop: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[1],
  },
  noVideoText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
  },
  videoInfo: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginTop: DesignTokens.spacing[4],
  },
  videoInfoTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[2],
  },
  videoInfoText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 22,
  },
  formSection: {
    paddingHorizontal: DesignTokens.spacing[5],
  },
  formTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  formSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 24,
    marginBottom: DesignTokens.spacing[6],
  },
  formPoint: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  formPointHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[2],
  },
  formPointIcon: {
    marginRight: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[1],
  },
  formPointContent: {
    flex: 1,
  },
  formPointTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  formPointTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  formPointTypeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  formPointDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
    marginLeft: DesignTokens.spacing[8],
  },
  cuesSection: {
    paddingHorizontal: DesignTokens.spacing[5],
  },
  cuesTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[2],
  },
  cuesSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 24,
    marginBottom: DesignTokens.spacing[6],
  },
  cuesList: {
    marginBottom: DesignTokens.spacing[6],
  },
  cueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[4],
  },
  cueNumber: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  cueNumberText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  cueContent: {
    flex: 1,
  },
  cueTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  cueDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  mentalCues: {
    flexDirection: 'row',
    backgroundColor: `${DesignTokens.colors.primary[500]}10`,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: `${DesignTokens.colors.primary[500]}30`,
  },
  mentalCuesContent: {
    flex: 1,
    marginLeft: DesignTokens.spacing[3],
  },
  mentalCuesTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  mentalCuesText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
});
