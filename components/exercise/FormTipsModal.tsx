import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  Eye,
  Play,
  BookOpen,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react-native';

interface FormTip {
  id: string;
  type: 'technique' | 'safety' | 'common_mistake' | 'progression';
  title: string;
  description: string;
  importance: 'low' | 'medium' | 'high' | 'critical';
  videoTimestamp?: number;
}

interface FormGuidance {
  exerciseId: string;
  exerciseName: string;
  tips: FormTip[];
  keyMuscles: string[];
  safetyNotes: string[];
  progressionTips: string[];
  commonMistakes: string[];
}

interface FormTipsModalProps {
  visible: boolean;
  onClose: () => void;
  formGuidance: FormGuidance | null;
  loading: boolean;
  error: string | null;
  exerciseName?: string;
  onPlayVideo?: (timestamp?: number) => void;
}

const { width, height } = Dimensions.get('window');

export default function FormTipsModal({
  visible,
  onClose,
  formGuidance,
  loading,
  error,
  exerciseName,
  onPlayVideo,
}: FormTipsModalProps) {
  const [selectedTab, setSelectedTab] = useState<'tips' | 'safety' | 'mistakes' | 'progression'>('tips');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(height);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return '#E74C3C';
      case 'high': return '#F39C12';
      case 'medium': return '#3498DB';
      case 'low': return '#95A5A6';
      default: return '#95A5A6';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technique': return <Target size={16} color="#3498DB" />;
      case 'safety': return <Shield size={16} color="#E74C3C" />;
      case 'common_mistake': return <AlertTriangle size={16} color="#F39C12" />;
      case 'progression': return <Zap size={16} color="#2ECC71" />;
      default: return <Lightbulb size={16} color="#95A5A6" />;
    }
  };

  const renderTipCard = (tip: FormTip) => {
    const isExpanded = expandedTip === tip.id;
    
    return (
      <TouchableOpacity
        key={tip.id}
        style={styles.tipCard}
        onPress={() => setExpandedTip(isExpanded ? null : tip.id)}
      >
        <LinearGradient
          colors={['#1a1a1a', '#2a2a2a']}
          style={styles.tipCardGradient}
        >
          <View style={styles.tipHeader}>
            <View style={styles.tipTypeContainer}>
              {getTypeIcon(tip.type)}
              <Text style={styles.tipType}>{tip.type.replace('_', ' ')}</Text>
            </View>
            <View style={[
              styles.importanceBadge,
              { backgroundColor: getImportanceColor(tip.importance) + '20' }
            ]}>
              <Text style={[
                styles.importanceText,
                { color: getImportanceColor(tip.importance) }
              ]}>
                {tip.importance}
              </Text>
            </View>
          </View>

          <Text style={styles.tipTitle}>{tip.title}</Text>
          
          {isExpanded && (
            <View style={styles.tipContent}>
              <Text style={styles.tipDescription}>{tip.description}</Text>
              
              {tip.videoTimestamp && onPlayVideo && (
                <TouchableOpacity
                  style={styles.videoButton}
                  onPress={() => onPlayVideo(tip.videoTimestamp)}
                >
                  <Play size={16} color="#FF6B35" />
                  <Text style={styles.videoButtonText}>
                    Watch at {Math.floor(tip.videoTimestamp / 60)}:{(tip.videoTimestamp % 60).toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating form guidance...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <AlertTriangle size={48} color="#E74C3C" />
          <Text style={styles.errorTitle}>Unable to load form guidance</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!formGuidance) {
      return (
        <View style={styles.emptyContainer}>
          <BookOpen size={48} color="#666" />
          <Text style={styles.emptyTitle}>No form guidance available</Text>
          <Text style={styles.emptyText}>
            Form tips for {exerciseName || 'this exercise'} are not available at the moment.
          </Text>
        </View>
      );
    }

    switch (selectedTab) {
      case 'tips':
        const techniqueTips = formGuidance.tips.filter(tip => tip.type === 'technique');
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {techniqueTips.length > 0 ? (
              techniqueTips.map(renderTipCard)
            ) : (
              <Text style={styles.noContentText}>No technique tips available</Text>
            )}
          </ScrollView>
        );

      case 'safety':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {formGuidance.safetyNotes.map((note, index) => (
              <View key={index} style={styles.safetyItem}>
                <Shield size={16} color="#E74C3C" />
                <Text style={styles.safetyText}>{note}</Text>
              </View>
            ))}
            
            {formGuidance.tips.filter(tip => tip.type === 'safety').map(renderTipCard)}
          </ScrollView>
        );

      case 'mistakes':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {formGuidance.commonMistakes.map((mistake, index) => (
              <View key={index} style={styles.mistakeItem}>
                <AlertTriangle size={16} color="#F39C12" />
                <Text style={styles.mistakeText}>{mistake}</Text>
              </View>
            ))}
            
            {formGuidance.tips.filter(tip => tip.type === 'common_mistake').map(renderTipCard)}
          </ScrollView>
        );

      case 'progression':
        return (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            {formGuidance.progressionTips.map((tip, index) => (
              <View key={index} style={styles.progressionItem}>
                <Zap size={16} color="#2ECC71" />
                <Text style={styles.progressionText}>{tip}</Text>
              </View>
            ))}
            
            {formGuidance.tips.filter(tip => tip.type === 'progression').map(renderTipCard)}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.modal,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <LinearGradient
            colors={['#0a0a0a', '#1a1a1a']}
            style={styles.modalGradient}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Eye size={24} color="#FF6B35" />
                <Text style={styles.headerTitle}>Form Guide</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {formGuidance && (
              <Text style={styles.exerciseTitle}>{formGuidance.exerciseName}</Text>
            )}

            {/* Tabs */}
            <View style={styles.tabContainer}>
              {[
                { key: 'tips', label: 'Technique', icon: <Target size={16} color="#fff" /> },
                { key: 'safety', label: 'Safety', icon: <Shield size={16} color="#fff" /> },
                { key: 'mistakes', label: 'Mistakes', icon: <AlertTriangle size={16} color="#fff" /> },
                { key: 'progression', label: 'Progress', icon: <Zap size={16} color="#fff" /> },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.tab,
                    selectedTab === tab.key && styles.tabActive
                  ]}
                  onPress={() => setSelectedTab(tab.key as any)}
                >
                  {tab.icon}
                  <Text style={[
                    styles.tabText,
                    selectedTab === tab.key && styles.tabTextActive
                  ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {renderTabContent()}
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modal: {
    height: height * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginLeft: 12,
  },
  closeButton: {
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 8,
  },
  exerciseTitle: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  tabActive: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },
  tipCard: {
    marginBottom: 12,
  },
  tipCardGradient: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipType: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  importanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  importanceText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
  },
  tipTitle: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  tipContent: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tipDescription: {
    fontSize: 13,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    marginBottom: 8,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B3520',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  videoButtonText: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  safetyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E74C3C10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },
  safetyText: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F39C1210',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F39C12',
  },
  mistakeText: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  progressionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2ECC7110',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2ECC71',
  },
  progressionText: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  noContentText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    paddingVertical: 40,
  },
});
