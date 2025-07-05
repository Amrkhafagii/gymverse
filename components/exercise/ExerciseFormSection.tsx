import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Eye, 
  BookOpen, 
  Target,
  Lightbulb,
  Video
} from 'lucide-react-native';
import FormVideoPlayer from './FormVideoPlayer';
import FormAnimationGuide from './FormAnimationGuide';
import FormTipsModal from './FormTipsModal';
import { useFormTips } from '@/hooks/useFormTips';
import { ExerciseData } from '@/lib/data/exerciseDatabase';

interface ExerciseFormSectionProps {
  exercise: ExerciseData;
  showVideoByDefault?: boolean;
  compact?: boolean;
}

export default function ExerciseFormSection({
  exercise,
  showVideoByDefault = false,
  compact = false,
}: ExerciseFormSectionProps) {
  const [activeView, setActiveView] = useState<'video' | 'animation' | 'none'>(
    showVideoByDefault ? 'video' : 'none'
  );
  const [showFormTips, setShowFormTips] = useState(false);
  
  const { formGuidance, loading, error, generateFormGuidance } = useFormTips();

  const handleShowFormTips = async () => {
    await generateFormGuidance(exercise.id);
    setShowFormTips(true);
  };

  const handleVideoPlayback = (timestamp?: number) => {
    if (activeView !== 'video') {
      setActiveView('video');
    }
    // Video player will handle timestamp seeking
  };

  // Generate form steps for animation guide
  const generateFormSteps = () => {
    const baseSteps = [
      {
        id: 'setup',
        title: 'Setup Position',
        description: 'Get into the starting position with proper alignment',
        duration: 3,
        keyPoints: exercise.tips?.slice(0, 2) || ['Maintain proper posture', 'Engage core muscles'],
        commonMistakes: exercise.common_mistakes?.slice(0, 2) || ['Poor starting position'],
        muscleActivation: {
          primary: exercise.muscle_groups.slice(0, 2),
          secondary: exercise.muscle_groups.slice(2, 4),
        },
      },
      {
        id: 'execution',
        title: 'Execute Movement',
        description: 'Perform the main movement with control',
        duration: 4,
        keyPoints: exercise.tips?.slice(2, 4) || ['Control the movement', 'Focus on target muscles'],
        commonMistakes: exercise.common_mistakes?.slice(2, 4) || ['Moving too fast'],
        muscleActivation: {
          primary: exercise.muscle_groups.slice(0, 3),
          secondary: exercise.muscle_groups.slice(3, 5),
        },
      },
      {
        id: 'return',
        title: 'Return to Start',
        description: 'Return to starting position with control',
        duration: 3,
        keyPoints: ['Controlled return', 'Maintain tension'],
        commonMistakes: ['Dropping weight too quickly'],
        muscleActivation: {
          primary: exercise.muscle_groups.slice(0, 2),
          secondary: exercise.muscle_groups.slice(2, 4),
        },
      },
    ];

    return baseSteps;
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Target size={16} color="#FF6B35" />
          <Text style={styles.compactTitle}>Form Guide</Text>
        </View>
        
        <View style={styles.compactActions}>
          <TouchableOpacity
            style={styles.compactButton}
            onPress={() => setActiveView(activeView === 'video' ? 'none' : 'video')}
          >
            <Video size={14} color="#4A90E2" />
            <Text style={styles.compactButtonText}>Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.compactButton}
            onPress={() => setActiveView(activeView === 'animation' ? 'none' : 'animation')}
          >
            <Play size={14} color="#2ECC71" />
            <Text style={styles.compactButtonText}>Guide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.compactButton}
            onPress={handleShowFormTips}
          >
            <Lightbulb size={14} color="#F39C12" />
            <Text style={styles.compactButtonText}>Tips</Text>
          </TouchableOpacity>
        </View>

        {activeView === 'video' && (
          <FormVideoPlayer
            videoUrl={exercise.demo_image_url} // Using demo_image_url as video URL
            exerciseName={exercise.name}
            compact={true}
            autoPlay={false}
            loopVideo={true}
          />
        )}

        {activeView === 'animation' && (
          <FormAnimationGuide
            exerciseName={exercise.name}
            steps={generateFormSteps()}
            autoPlay={false}
            showMuscleActivation={false}
          />
        )}

        <FormTipsModal
          visible={showFormTips}
          onClose={() => setShowFormTips(false)}
          formGuidance={formGuidance}
          loading={loading}
          error={error}
          exerciseName={exercise.name}
          onPlayVideo={handleVideoPlayback}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Target size={24} color="#FF6B35" />
            <Text style={styles.title}>Exercise Form Guide</Text>
          </View>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeView === 'video' && styles.toggleButtonActive
            ]}
            onPress={() => setActiveView(activeView === 'video' ? 'none' : 'video')}
          >
            <Video size={18} color={activeView === 'video' ? "#fff" : "#999"} />
            <Text style={[
              styles.toggleButtonText,
              activeView === 'video' && styles.toggleButtonTextActive
            ]}>
              Video Demo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              activeView === 'animation' && styles.toggleButtonActive
            ]}
            onPress={() => setActiveView(activeView === 'animation' ? 'none' : 'animation')}
          >
            <Play size={18} color={activeView === 'animation' ? "#fff" : "#999"} />
            <Text style={[
              styles.toggleButtonText,
              activeView === 'animation' && styles.toggleButtonTextActive
            ]}>
              Step Guide
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tipsButton}
            onPress={handleShowFormTips}
          >
            <Lightbulb size={18} color="#F39C12" />
            <Text style={styles.tipsButtonText}>Form Tips</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeView === 'video' && (
          <FormVideoPlayer
            videoUrl={exercise.demo_image_url} // Using demo_image_url as video URL
            exerciseName={exercise.name}
            autoPlay={false}
            loopVideo={true}
            showControls={true}
          />
        )}

        {activeView === 'animation' && (
          <FormAnimationGuide
            exerciseName={exercise.name}
            steps={generateFormSteps()}
            autoPlay={false}
            showMuscleActivation={true}
          />
        )}

        {activeView === 'none' && (
          <View style={styles.placeholderContainer}>
            <Eye size={48} color="#666" />
            <Text style={styles.placeholderTitle}>Visual Form Guide</Text>
            <Text style={styles.placeholderText}>
              Choose video demo or step-by-step animation guide to learn proper form for {exercise.name}
            </Text>
            
            <View style={styles.placeholderActions}>
              <TouchableOpacity
                style={styles.placeholderButton}
                onPress={() => setActiveView('video')}
              >
                <LinearGradient
                  colors={['#4A90E2', '#357ABD']}
                  style={styles.placeholderButtonGradient}
                >
                  <Video size={20} color="#fff" />
                  <Text style={styles.placeholderButtonText}>Watch Video</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.placeholderButton}
                onPress={() => setActiveView('animation')}
              >
                <LinearGradient
                  colors={['#2ECC71', '#27AE60']}
                  style={styles.placeholderButtonGradient}
                >
                  <Play size={20} color="#fff" />
                  <Text style={styles.placeholderButtonText}>Step Guide</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={[
              styles.statValue,
              { color: exercise.difficulty_level === 'beginner' ? '#2ECC71' : 
                       exercise.difficulty_level === 'intermediate' ? '#F39C12' : '#E74C3C' }
            ]}>
              {exercise.difficulty_level}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Safety</Text>
            <Text style={[
              styles.statValue,
              { color: exercise.safety_rating >= 4 ? '#2ECC71' : 
                       exercise.safety_rating >= 3 ? '#F39C12' : '#E74C3C' }
            ]}>
              {exercise.safety_rating}/5
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Type</Text>
            <Text style={styles.statValue}>
              {exercise.is_compound ? 'Compound' : 'Isolation'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <FormTipsModal
        visible={showFormTips}
        onClose={() => setShowFormTips(false)}
        formGuidance={formGuidance}
        loading={loading}
        error={error}
        exerciseName={exercise.name}
        onPlayVideo={handleVideoPlayback}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
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
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#FF6B35',
  },
  toggleButtonText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
  tipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F39C1220',
    borderRadius: 8,
    marginLeft: 8,
  },
  tipsButtonText: {
    fontSize: 14,
    color: '#F39C12',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  placeholderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  placeholderButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeholderButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  placeholderButtonText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    textTransform: 'capitalize',
  },
  // Compact styles
  compactContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginVertical: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  compactActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  compactButtonText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
});
