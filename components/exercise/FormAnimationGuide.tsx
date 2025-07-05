import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  Target,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react-native';

interface FormStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  keyPoints: string[];
  commonMistakes: string[];
  muscleActivation: {
    primary: string[];
    secondary: string[];
  };
}

interface FormAnimationGuideProps {
  exerciseName: string;
  steps: FormStep[];
  onStepComplete?: (stepId: string) => void;
  autoPlay?: boolean;
  showMuscleActivation?: boolean;
}

const { width } = Dimensions.get('window');

export default function FormAnimationGuide({
  exerciseName,
  steps,
  onStepComplete,
  autoPlay = false,
  showMuscleActivation = true,
}: FormAnimationGuideProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const animationValue = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (isPlaying) {
      startStepAnimation();
    } else {
      stopAnimation();
    }
  }, [isPlaying, currentStepIndex]);

  useEffect(() => {
    // Pulse animation for active muscles
    if (showMuscleActivation) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentStepIndex, showMuscleActivation]);

  const startStepAnimation = () => {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    animationValue.setValue(0);
    
    Animated.timing(animationValue, {
      toValue: 1,
      duration: currentStep.duration * 1000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        onStepComplete?.(currentStep.id);
        
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
        } else {
          // Loop back to first step
          setCurrentStepIndex(0);
        }
      }
    });
  };

  const stopAnimation = () => {
    animationValue.stopAnimation();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setCurrentStepIndex(0);
    setProgress(0);
    animationValue.setValue(0);
    setIsPlaying(false);
  };

  const goToStep = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
      setProgress(0);
      animationValue.setValue(0);
    }
  };

  const nextStep = () => {
    goToStep(currentStepIndex + 1);
  };

  const previousStep = () => {
    goToStep(currentStepIndex - 1);
  };

  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;

  // Update progress based on animation value
  animationValue.addListener(({ value }) => {
    setProgress(value);
  });

  const renderStickFigureAnimation = () => {
    // Simplified stick figure animation based on exercise type
    const animatedY = animationValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, -20, 0],
    });

    const animatedRotation = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={styles.animationContainer}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          {/* Body */}
          <G>
            {/* Head */}
            <Circle
              cx="100"
              cy="30"
              r="15"
              stroke="#FF6B35"
              strokeWidth="3"
              fill="none"
            />
            
            {/* Body line */}
            <Path
              d="M100 45 L100 120"
              stroke="#FF6B35"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Arms */}
            <Animated.View style={{ transform: [{ translateY: animatedY }] }}>
              <Path
                d="M100 70 L70 90 M100 70 L130 90"
                stroke="#4A90E2"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </Animated.View>
            
            {/* Legs */}
            <Path
              d="M100 120 L80 160 M100 120 L120 160"
              stroke="#FF6B35"
              strokeWidth="3"
              strokeLinecap="round"
            />
            
            {/* Movement indicators */}
            <Circle
              cx="100"
              cy="70"
              r="5"
              fill="#2ECC71"
              opacity={progress}
            />
          </G>
        </Svg>

        {/* Movement arrows */}
        <View style={styles.movementIndicators}>
          <Animated.View 
            style={[
              styles.movementArrow,
              { 
                opacity: progress,
                transform: [{ translateY: animatedY }]
              }
            ]}
          >
            <Target size={16} color="#2ECC71" />
          </Animated.View>
        </View>
      </View>
    );
  };

  const renderMuscleActivation = () => {
    if (!showMuscleActivation) return null;

    return (
      <View style={styles.muscleActivationContainer}>
        <Text style={styles.muscleActivationTitle}>Muscle Activation</Text>
        
        <View style={styles.muscleGroups}>
          <View style={styles.muscleGroup}>
            <Text style={styles.muscleGroupLabel}>Primary</Text>
            {currentStep.muscleActivation.primary.map((muscle, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.muscleItem,
                  styles.primaryMuscle,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <Text style={styles.primaryMuscleText}>{muscle}</Text>
              </Animated.View>
            ))}
          </View>

          <View style={styles.muscleGroup}>
            <Text style={styles.muscleGroupLabel}>Secondary</Text>
            {currentStep.muscleActivation.secondary.map((muscle, index) => (
              <View key={index} style={[styles.muscleItem, styles.secondaryMuscle]}>
                <Text style={styles.secondaryMuscleText}>{muscle}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.exerciseTitle}>{exerciseName}</Text>
          <Text style={styles.stepCounter}>
            Step {currentStepIndex + 1} of {steps.length}
          </Text>
        </View>

        {/* Animation Area */}
        <View style={styles.animationArea}>
          {renderStickFigureAnimation()}
          
          {/* Step Info Overlay */}
          <View style={styles.stepInfoOverlay}>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <Text style={styles.stepDescription}>{currentStep.description}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: animationValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={previousStep}
            disabled={currentStepIndex === 0}
          >
            <ChevronLeft 
              size={20} 
              color={currentStepIndex === 0 ? "#666" : "#fff"} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
            <LinearGradient
              colors={['#FF6B35', '#FF8C42']}
              style={styles.playButtonGradient}
            >
              {isPlaying ? (
                <Pause size={24} color="#fff" />
              ) : (
                <Play size={24} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={nextStep}
            disabled={currentStepIndex === steps.length - 1}
          >
            <ChevronRight 
              size={20} 
              color={currentStepIndex === steps.length - 1 ? "#666" : "#fff"} 
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton} onPress={resetAnimation}>
            <RotateCcw size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={() => setShowDetails(!showDetails)}
          >
            <Eye size={20} color={showDetails ? "#FF6B35" : "#fff"} />
          </TouchableOpacity>
        </View>

        {/* Step Navigation */}
        <View style={styles.stepNavigation}>
          {steps.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepDot,
                index === currentStepIndex && styles.activeStepDot,
                index < currentStepIndex && styles.completedStepDot,
              ]}
              onPress={() => goToStep(index)}
            >
              {index < currentStepIndex ? (
                <CheckCircle size={12} color="#2ECC71" />
              ) : (
                <Text style={[
                  styles.stepDotText,
                  index === currentStepIndex && styles.activeStepDotText
                ]}>
                  {index + 1}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Detailed Information */}
        {showDetails && (
          <View style={styles.detailsContainer}>
            {/* Key Points */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Key Points</Text>
              {currentStep.keyPoints.map((point, index) => (
                <View key={index} style={styles.detailItem}>
                  <CheckCircle size={14} color="#2ECC71" />
                  <Text style={styles.detailItemText}>{point}</Text>
                </View>
              ))}
            </View>

            {/* Common Mistakes */}
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>Avoid These Mistakes</Text>
              {currentStep.commonMistakes.map((mistake, index) => (
                <View key={index} style={styles.detailItem}>
                  <AlertTriangle size={14} color="#E74C3C" />
                  <Text style={styles.detailItemText}>{mistake}</Text>
                </View>
              ))}
            </View>

            {/* Muscle Activation */}
            {renderMuscleActivation()}
          </View>
        )}
      </LinearGradient>
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
    marginBottom: 20,
  },
  exerciseTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  stepCounter: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
  },
  animationArea: {
    height: 250,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    marginBottom: 16,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    position: 'relative',
  },
  movementIndicators: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  movementArrow: {
    position: 'absolute',
    top: 60,
    left: 90,
  },
  stepInfoOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
  },
  stepTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    minWidth: 40,
    textAlign: 'right',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 8,
  },
  playButton: {
    borderRadius: 28,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  playButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeStepDot: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  completedStepDot: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  stepDotText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-SemiBold',
  },
  activeStepDotText: {
    color: '#fff',
  },
  detailsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailItemText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  muscleActivationContainer: {
    marginTop: 8,
  },
  muscleActivationTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
  },
  muscleGroups: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  muscleGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  muscleGroupLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
    textAlign: 'center',
  },
  muscleItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    alignItems: 'center',
  },
  primaryMuscle: {
    backgroundColor: '#FF6B3520',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  secondaryMuscle: {
    backgroundColor: '#4A90E220',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  primaryMuscleText: {
    fontSize: 11,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  secondaryMuscleText: {
    fontSize: 11,
    color: '#4A90E2',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
});
