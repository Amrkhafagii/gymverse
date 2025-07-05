import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PersonalizedFormGuidance, FormTip } from '@/lib/services/aiService';

interface FormTipsModalProps {
  visible: boolean;
  onClose: () => void;
  formGuidance: PersonalizedFormGuidance | null;
  loading: boolean;
  error: string | null;
  exerciseName?: string;
}

export default function FormTipsModal({
  visible,
  onClose,
  formGuidance,
  loading,
  error,
  exerciseName
}: FormTipsModalProps) {
  const [activeTab, setActiveTab] = useState<'tips' | 'breathing' | 'tempo' | 'checkpoints'>('tips');

  const getPriorityColor = (priority: FormTip['priority']) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'important': return '#f59e0b';
      case 'helpful': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTipTypeIcon = (type: FormTip['tip_type']) => {
    switch (type) {
      case 'setup': return 'settings';
      case 'execution': return 'play';
      case 'breathing': return 'leaf';
      case 'common_mistake': return 'warning';
      case 'progression': return 'trending-up';
      case 'safety': return 'shield-checkmark';
      default: return 'information-circle';
    }
  };

  const renderTipCard = (tip: FormTip) => (
    <View key={tip.id} style={styles.tipCard}>
      <LinearGradient
        colors={['#1f2937', '#111827']}
        style={styles.tipGradient}
      >
        <View style={styles.tipHeader}>
          <View style={styles.tipIconContainer}>
            <Ionicons 
              name={getTipTypeIcon(tip.tip_type) as any} 
              size={20} 
              color={getPriorityColor(tip.priority)} 
            />
          </View>
          <View style={styles.tipTitleContainer}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(tip.priority) }]}>
              <Text style={styles.priorityText}>{tip.priority.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.tipDescription}>{tip.description}</Text>
        {tip.visual_cue && (
          <View style={styles.visualCue}>
            <Ionicons name="eye" size={16} color="#9E7FFF" />
            <Text style={styles.visualCueText}>{tip.visual_cue}</Text>
          </View>
        )}
        {tip.body_part_focus && tip.body_part_focus.length > 0 && (
          <View style={styles.bodyPartFocus}>
            <Text style={styles.bodyPartLabel}>Focus Areas:</Text>
            <View style={styles.bodyPartTags}>
              {tip.body_part_focus.map((part, index) => (
                <View key={index} style={styles.bodyPartTag}>
                  <Text style={styles.bodyPartTagText}>{part}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );

  const renderTipsTab = () => {
    if (!formGuidance) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Primary Tips */}
        <View style={styles.tipSection}>
          <Text style={styles.sectionTitle}>Essential Form Tips</Text>
          {formGuidance.primary_tips.map(renderTipCard)}
        </View>

        {/* Common Mistakes */}
        {formGuidance.common_mistakes.length > 0 && (
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitle}>Common Mistakes to Avoid</Text>
            {formGuidance.common_mistakes.map(renderTipCard)}
          </View>
        )}

        {/* Progression Tips */}
        {formGuidance.progression_tips.length > 0 && (
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitle}>Progression Guidance</Text>
            {formGuidance.progression_tips.map(renderTipCard)}
          </View>
        )}

        {/* Safety Reminders */}
        {formGuidance.safety_reminders.length > 0 && (
          <View style={styles.tipSection}>
            <Text style={styles.sectionTitle}>Safety Reminders</Text>
            {formGuidance.safety_reminders.map(renderTipCard)}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderBreathingTab = () => {
    if (!formGuidance) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.breathingSection}>
          <LinearGradient
            colors={['#1f2937', '#111827']}
            style={styles.breathingCard}
          >
            <View style={styles.breathingHeader}>
              <Ionicons name="leaf" size={24} color="#10b981" />
              <Text style={styles.breathingTitle}>Breathing Pattern</Text>
            </View>

            <View style={styles.breathingPhase}>
              <Text style={styles.breathingPhaseTitle}>Inhale Phase</Text>
              <Text style={styles.breathingPhaseText}>{formGuidance.breathing_pattern.inhale_phase}</Text>
            </View>

            <View style={styles.breathingPhase}>
              <Text style={styles.breathingPhaseTitle}>Exhale Phase</Text>
              <Text style={styles.breathingPhaseText}>{formGuidance.breathing_pattern.exhale_phase}</Text>
            </View>

            {formGuidance.breathing_pattern.hold_points && formGuidance.breathing_pattern.hold_points.length > 0 && (
              <View style={styles.breathingPhase}>
                <Text style={styles.breathingPhaseTitle}>Key Points</Text>
                {formGuidance.breathing_pattern.hold_points.map((point, index) => (
                  <Text key={index} style={styles.breathingPoint}>• {point}</Text>
                ))}
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Muscle Activation Cues */}
        <View style={styles.activationSection}>
          <Text style={styles.sectionTitle}>Muscle Activation</Text>
          <LinearGradient
            colors={['#1f2937', '#111827']}
            style={styles.activationCard}
          >
            <View style={styles.activationGroup}>
              <Text style={styles.activationGroupTitle}>Primary Muscles</Text>
              <View style={styles.muscleTags}>
                {formGuidance.muscle_activation_cues.primary_muscles.map((muscle, index) => (
                  <View key={index} style={styles.muscleTag}>
                    <Text style={styles.muscleTagText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.activationGroup}>
              <Text style={styles.activationGroupTitle}>Activation Tips</Text>
              {formGuidance.muscle_activation_cues.activation_tips.map((tip, index) => (
                <Text key={index} style={styles.activationTip}>• {tip}</Text>
              ))}
            </View>

            <View style={styles.activationGroup}>
              <Text style={styles.activationGroupTitle}>Mind-Muscle Connection</Text>
              {formGuidance.muscle_activation_cues.mind_muscle_connection.map((tip, index) => (
                <Text key={index} style={styles.activationTip}>• {tip}</Text>
              ))}
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    );
  };

  const renderTempoTab = () => {
    if (!formGuidance) return null;

    const { tempo_guidance } = formGuidance;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tempoSection}>
          <LinearGradient
            colors={['#1f2937', '#111827']}
            style={styles.tempoCard}
          >
            <View style={styles.tempoHeader}>
              <Ionicons name="timer" size={24} color="#f59e0b" />
              <Text style={styles.tempoTitle}>Movement Tempo</Text>
            </View>

            {tempo_guidance.eccentric_seconds > 0 && (
              <View style={styles.tempoPhase}>
                <View style={styles.tempoPhaseHeader}>
                  <Text style={styles.tempoPhaseTitle}>Eccentric (Lowering)</Text>
                  <Text style={styles.tempoTime}>{tempo_guidance.eccentric_seconds}s</Text>
                </View>
                <Text style={styles.tempoDescription}>
                  Control the weight during the lowering phase. This builds strength and prevents injury.
                </Text>
              </View>
            )}

            {tempo_guidance.pause_seconds > 0 && (
              <View style={styles.tempoPhase}>
                <View style={styles.tempoPhaseHeader}>
                  <Text style={styles.tempoPhaseTitle}>Pause (Bottom)</Text>
                  <Text style={styles.tempoTime}>{tempo_guidance.pause_seconds}s</Text>
                </View>
                <Text style={styles.tempoDescription}>
                  Brief pause at the bottom position to eliminate momentum and increase difficulty.
                </Text>
              </View>
            )}

            {tempo_guidance.concentric_seconds > 0 && (
              <View style={styles.tempoPhase}>
                <View style={styles.tempoPhaseHeader}>
                  <Text style={styles.tempoPhaseTitle}>Concentric (Lifting)</Text>
                  <Text style={styles.tempoTime}>{tempo_guidance.concentric_seconds}s</Text>
                </View>
                <Text style={styles.tempoDescription}>
                  Explosive or controlled lifting phase. Focus on power and proper form.
                </Text>
              </View>
            )}

            {tempo_guidance.rest_seconds > 0 && (
              <View style={styles.tempoPhase}>
                <View style={styles.tempoPhaseHeader}>
                  <Text style={styles.tempoPhaseTitle}>Rest (Top)</Text>
                  <Text style={styles.tempoTime}>{tempo_guidance.rest_seconds}s</Text>
                </View>
                <Text style={styles.tempoDescription}>
                  Brief rest at the top position before starting the next repetition.
                </Text>
              </View>
            )}

            {tempo_guidance.eccentric_seconds === 0 && tempo_guidance.concentric_seconds === 0 && (
              <View style={styles.tempoPhase}>
                <Text style={styles.tempoDescription}>
                  This exercise focuses on continuous movement rather than specific tempo phases.
                  Maintain steady, controlled motion throughout.
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
      </ScrollView>
    );
  };

  const renderCheckpointsTab = () => {
    if (!formGuidance) return null;

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.checkpointsSection}>
          <View style={styles.checkpointGroup}>
            <Text style={styles.checkpointGroupTitle}>Setup Checklist</Text>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.checkpointCard}
            >
              {formGuidance.form_checkpoints.setup.map((checkpoint, index) => (
                <View key={index} style={styles.checkpointItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.checkpointText}>{checkpoint}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          <View style={styles.checkpointGroup}>
            <Text style={styles.checkpointGroupTitle}>During Movement</Text>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.checkpointCard}
            >
              {formGuidance.form_checkpoints.during_movement.map((checkpoint, index) => (
                <View key={index} style={styles.checkpointItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#f59e0b" />
                  <Text style={styles.checkpointText}>{checkpoint}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          <View style={styles.checkpointGroup}>
            <Text style={styles.checkpointGroupTitle}>Completion</Text>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.checkpointCard}
            >
              {formGuidance.form_checkpoints.completion.map((checkpoint, index) => (
                <View key={index} style={styles.checkpointItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#9E7FFF" />
                  <Text style={styles.checkpointText}>{checkpoint}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    );
  };

  const tabs = [
    { key: 'tips', label: 'Tips', icon: 'bulb' },
    { key: 'breathing', label: 'Breathing', icon: 'leaf' },
    { key: 'tempo', label: 'Tempo', icon: 'timer' },
    { key: 'checkpoints', label: 'Checklist', icon: 'checkmark-done' }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Form Guide</Text>
            {exerciseName && (
              <Text style={styles.exerciseName}>{exerciseName}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Generating personalized form guidance...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : formGuidance ? (
          <>
            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {tabs.map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.tab,
                      activeTab === tab.key && styles.activeTab
                    ]}
                    onPress={() => setActiveTab(tab.key as any)}
                  >
                    <Ionicons 
                      name={tab.icon as any} 
                      size={20} 
                      color={activeTab === tab.key ? '#FFFFFF' : '#A3A3A3'} 
                    />
                    <Text style={[
                      styles.tabText,
                      activeTab === tab.key && styles.activeTabText
                    ]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Tab Content */}
            <View style={styles.content}>
              {activeTab === 'tips' && renderTipsTab()}
              {activeTab === 'breathing' && renderBreathingTab()}
              {activeTab === 'tempo' && renderTempoTab()}
              {activeTab === 'checkpoints' && renderCheckpointsTab()}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No form guidance available</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F2F',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  exerciseName: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabNavigation: {
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F2F',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#9E7FFF',
  },
  tabText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  tipSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  tipCard: {
    marginBottom: 12,
  },
  tipGradient: {
    borderRadius: 12,
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2F2F2F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  tipDescription: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  visualCue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  visualCueText: {
    fontSize: 13,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  bodyPartFocus: {
    marginTop: 8,
  },
  bodyPartLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginBottom: 6,
  },
  bodyPartTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bodyPartTag: {
    backgroundColor: '#2F2F2F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  bodyPartTagText: {
    fontSize: 11,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
  breathingSection: {
    marginBottom: 24,
  },
  breathingCard: {
    borderRadius: 12,
    padding: 20,
  },
  breathingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  breathingTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  breathingPhase: {
    marginBottom: 16,
  },
  breathingPhaseTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  breathingPhaseText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  breathingPoint: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 4,
  },
  activationSection: {
    marginBottom: 24,
  },
  activationCard: {
    borderRadius: 12,
    padding: 20,
  },
  activationGroup: {
    marginBottom: 20,
  },
  activationGroupTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  muscleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleTag: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  muscleTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
  },
  activationTip: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
    marginBottom: 6,
  },
  tempoSection: {
    marginBottom: 24,
  },
  tempoCard: {
    borderRadius: 12,
    padding: 20,
  },
  tempoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  tempoTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  tempoPhase: {
    marginBottom: 16,
  },
  tempoPhaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tempoPhaseTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
  },
  tempoTime: {
    fontSize: 16,
    color: '#f59e0b',
    fontFamily: 'Inter-Bold',
  },
  tempoDescription: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  checkpointsSection: {
    marginBottom: 24,
  },
  checkpointGroup: {
    marginBottom: 24,
  },
  checkpointGroupTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 12,
  },
  checkpointCard: {
    borderRadius: 12,
    padding: 16,
  },
  checkpointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkpointText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});
