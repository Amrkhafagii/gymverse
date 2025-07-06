import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  Smartphone,
  Shield,
  Zap,
  User,
  Target,
  Settings,
  Lock,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Skip,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { Button } from '@/components/ui/Button';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import { DeviceProfile } from '@/lib/auth/deviceAuth';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface OnboardingStepProps {
  data: Partial<DeviceProfile>;
  onUpdate: (updates: Partial<DeviceProfile>) => void;
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

// Step 1: Welcome
function WelcomeStep({ onNext }: Pick<OnboardingStepProps, 'onNext'>) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#9E7FFF', '#7C3AED']}
            style={styles.iconGradient}
          >
            <Smartphone size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        
        <Text style={styles.stepTitle}>Welcome to GymVerse</Text>
        <Text style={styles.stepSubtitle}>
          Your personal fitness journey starts here
        </Text>
        
        <View style={styles.featuresList}>
          <FeatureItem 
            icon={<Shield size={24} color="#10B981" />}
            title="Complete Privacy" 
            description="No accounts, no emails, just you and your goals"
          />
          <FeatureItem 
            icon={<Zap size={24} color="#F59E0B" />}
            title="Works Offline" 
            description="Track workouts anywhere, sync when you want"
          />
          <FeatureItem 
            icon={<Target size={24} color="#EF4444" />}
            title="Start Immediately" 
            description="No setup required, begin your first workout now"
          />
        </View>
      </View>

      <View style={styles.stepActions}>
        <Button
          title="Let's Get Started"
          variant="gradient"
          size="large"
          onPress={onNext}
          icon={<ArrowRight size={20} color="#FFFFFF" />}
        />
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.skipText}>Skip setup, start tracking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Step 2: Basic Info
function BasicInfoStep({ data, onUpdate, onNext, onBack }: OnboardingStepProps) {
  const [name, setName] = useState(data.fullName || '');
  const [bio, setBio] = useState(data.bio || '');

  const handleNext = () => {
    onUpdate({ fullName: name, bio: bio });
    onNext();
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.iconGradient}
          >
            <User size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        
        <Text style={styles.stepTitle}>Tell us about yourself</Text>
        <Text style={styles.stepSubtitle}>
          This helps us personalize your experience (optional)
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your Name</Text>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={DesignTokens.colors.text.tertiary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Bio (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about your fitness journey..."
            placeholderTextColor={DesignTokens.colors.text.tertiary}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.stepActions}>
        <Button
          title="Continue"
          variant="gradient"
          size="large"
          onPress={handleNext}
          icon={<ArrowRight size={20} color="#FFFFFF" />}
        />
        <View style={styles.navigationRow}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={20} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipButton} onPress={onNext}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Step 3: Fitness Level
function FitnessLevelStep({ data, onUpdate, onNext, onBack }: OnboardingStepProps) {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    data.fitnessLevel || 'beginner'
  );

  const fitnessLevels = [
    {
      id: 'beginner' as const,
      title: 'Beginner',
      description: 'New to fitness or getting back into it',
      icon: '🌱',
    },
    {
      id: 'intermediate' as const,
      title: 'Intermediate',
      description: 'Regular workouts, some experience',
      icon: '💪',
    },
    {
      id: 'advanced' as const,
      title: 'Advanced',
      description: 'Experienced athlete or trainer',
      icon: '🏆',
    },
  ];

  const handleNext = () => {
    onUpdate({ fitnessLevel: selectedLevel });
    onNext();
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.iconGradient}
          >
            <Target size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        
        <Text style={styles.stepTitle}>What's your fitness level?</Text>
        <Text style={styles.stepSubtitle}>
          This helps us recommend appropriate workouts
        </Text>
        
        <View style={styles.optionsContainer}>
          {fitnessLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                selectedLevel === level.id && styles.optionCardSelected
              ]}
              onPress={() => {
                setSelectedLevel(level.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={styles.optionIcon}>{level.icon}</Text>
              <Text style={[
                styles.optionTitle,
                selectedLevel === level.id && styles.optionTitleSelected
              ]}>
                {level.title}
              </Text>
              <Text style={[
                styles.optionDescription,
                selectedLevel === level.id && styles.optionDescriptionSelected
              ]}>
                {level.description}
              </Text>
              {selectedLevel === level.id && (
                <CheckCircle size={24} color={DesignTokens.colors.primary[500]} style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.stepActions}>
        <Button
          title="Continue"
          variant="gradient"
          size="large"
          onPress={handleNext}
          icon={<ArrowRight size={20} color="#FFFFFF" />}
        />
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Step 4: Preferences
function PreferencesStep({ data, onUpdate, onNext, onBack }: OnboardingStepProps) {
  const [units, setUnits] = useState<'metric' | 'imperial'>(data.preferredUnits || 'metric');

  const handleNext = () => {
    onUpdate({ preferredUnits: units });
    onNext();
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.iconGradient}
          >
            <Settings size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        
        <Text style={styles.stepTitle}>Set your preferences</Text>
        <Text style={styles.stepSubtitle}>
          Choose your preferred units for measurements
        </Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              units === 'metric' && styles.optionCardSelected
            ]}
            onPress={() => {
              setUnits('metric');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.optionIcon}>📏</Text>
            <Text style={[
              styles.optionTitle,
              units === 'metric' && styles.optionTitleSelected
            ]}>
              Metric
            </Text>
            <Text style={[
              styles.optionDescription,
              units === 'metric' && styles.optionDescriptionSelected
            ]}>
              Kilograms, centimeters, kilometers
            </Text>
            {units === 'metric' && (
              <CheckCircle size={24} color={DesignTokens.colors.primary[500]} style={styles.checkIcon} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              units === 'imperial' && styles.optionCardSelected
            ]}
            onPress={() => {
              setUnits('imperial');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text style={styles.optionIcon}>📐</Text>
            <Text style={[
              styles.optionTitle,
              units === 'imperial' && styles.optionTitleSelected
            ]}>
              Imperial
            </Text>
            <Text style={[
              styles.optionDescription,
              units === 'imperial' && styles.optionDescriptionSelected
            ]}>
              Pounds, feet/inches, miles
            </Text>
            {units === 'imperial' && (
              <CheckCircle size={24} color={DesignTokens.colors.primary[500]} style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stepActions}>
        <Button
          title="Continue"
          variant="gradient"
          size="large"
          onPress={handleNext}
          icon={<ArrowRight size={20} color="#FFFFFF" />}
        />
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Step 5: Privacy
function PrivacyStep({ data, onUpdate, onNext, onBack }: OnboardingStepProps) {
  const [isPublic, setIsPublic] = useState(data.isPublic || false);
  const [allowSharing, setAllowSharing] = useState(data.allowAnonymousSharing || false);

  const handleNext = () => {
    onUpdate({ 
      isPublic,
      allowAnonymousSharing: allowSharing 
    });
    onNext();
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            style={styles.iconGradient}
          >
            <Lock size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        
        <Text style={styles.stepTitle}>Privacy Settings</Text>
        <Text style={styles.stepSubtitle}>
          Control how your data is shared (you can change this later)
        </Text>
        
        <View style={styles.privacyOptions}>
          <TouchableOpacity
            style={[
              styles.privacyOption,
              isPublic && styles.privacyOptionSelected
            ]}
            onPress={() => {
              setIsPublic(!isPublic);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={styles.privacyOptionContent}>
              <Text style={styles.privacyOptionTitle}>Public Profile</Text>
              <Text style={styles.privacyOptionDescription}>
                Allow others to see your profile and achievements
              </Text>
            </View>
            <View style={[
              styles.toggle,
              isPublic && styles.toggleActive
            ]}>
              {isPublic && <CheckCircle size={20} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.privacyOption,
              allowSharing && styles.privacyOptionSelected
            ]}
            onPress={() => {
              setAllowSharing(!allowSharing);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={styles.privacyOptionContent}>
              <Text style={styles.privacyOptionTitle}>Anonymous Sharing</Text>
              <Text style={styles.privacyOptionDescription}>
                Share workouts anonymously with the community
              </Text>
            </View>
            <View style={[
              styles.toggle,
              allowSharing && styles.toggleActive
            ]}>
              {allowSharing && <CheckCircle size={20} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyNote}>
          <Shield size={20} color={DesignTokens.colors.success[500]} />
          <Text style={styles.privacyNoteText}>
            Your data stays on your device by default. Cloud backup is optional and encrypted.
          </Text>
        </View>
      </View>

      <View style={styles.stepActions}>
        <Button
          title="Continue"
          variant="gradient"
          size="large"
          onPress={handleNext}
          icon={<ArrowRight size={20} color="#FFFFFF" />}
        />
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color={DesignTokens.colors.text.secondary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Step 6: Complete
function CompleteStep({ onNext }: Pick<OnboardingStepProps, 'onNext'>) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.iconGradient}
          >
            <CheckCircle size={48} color="#FFFFFF" />
          </LinearGradient>
        </View>
        
        <Text style={styles.stepTitle}>You're all set!</Text>
        <Text style={styles.stepSubtitle}>
          Welcome to GymVerse. Let's start your fitness journey!
        </Text>
        
        <View style={styles.completionFeatures}>
          <CompletionItem 
            icon="🎯"
            title="Track Workouts"
            description="Log exercises, sets, and reps"
          />
          <CompletionItem 
            icon="📊"
            title="Monitor Progress"
            description="See your improvements over time"
          />
          <CompletionItem 
            icon="🏆"
            title="Earn Achievements"
            description="Unlock badges as you reach milestones"
          />
        </View>
      </View>

      <View style={styles.stepActions}>
        <Button
          title="Start Your Journey"
          variant="gradient"
          size="large"
          onPress={onNext}
          icon={<Zap size={20} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
}

// Helper Components
function FeatureItem({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function CompletionItem({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.completionItem}>
      <Text style={styles.completionIcon}>{icon}</Text>
      <View style={styles.completionContent}>
        <Text style={styles.completionTitle}>{title}</Text>
        <Text style={styles.completionDescription}>{description}</Text>
      </View>
    </View>
  );
}

// Main Component
export default function DeviceSetupScreen() {
  const { updateProfile, completeOnboarding } = useDeviceAuth();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<DeviceProfile>>({});

  const steps = [
    { title: 'Welcome', component: WelcomeStep },
    { title: 'Basic Info', component: BasicInfoStep },
    { title: 'Fitness Level', component: FitnessLevelStep },
    { title: 'Preferences', component: PreferencesStep },
    { title: 'Privacy', component: PrivacyStep },
    { title: 'Complete', component: CompleteStep },
  ];

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      try {
        await updateProfile(profileData);
        await completeOnboarding();
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Onboarding completion failed:', error);
        Alert.alert('Setup Error', 'Failed to complete setup. Please try again.');
      }
    }
  };

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < steps.length) {
      setStep(step + 1);
    }
  };

  const CurrentStepComponent = steps[step - 1].component;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        {/* Progress Header */}
        <View style={styles.header}>
          <Text style={styles.stepIndicator}>{step} of {steps.length}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(step / steps.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Step Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CurrentStepComponent
            data={profileData}
            onUpdate={(updates) => setProfileData(prev => ({ ...prev, ...updates }))}
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={step > 1 ? handleBack : undefined}
          />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[4],
    paddingBottom: DesignTokens.spacing[6],
  },
  stepIndicator: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  progressBar: {
    height: 4,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing[5],
    justifyContent: 'space-between',
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
    paddingTop: DesignTokens.spacing[8],
  },
  iconContainer: {
    marginBottom: DesignTokens.spacing[6],
  },
  iconGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadow.lg,
  },
  stepTitle: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  stepSubtitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[8],
    lineHeight: 24,
  },
  stepActions: {
    paddingBottom: DesignTokens.spacing[8],
  },
  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: DesignTokens.spacing[4],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[3],
  },
  backText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[2],
  },
  skipButton: {
    padding: DesignTokens.spacing[3],
  },
  skipText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    textAlign: 'center',
  },
  // Feature list styles
  featuresList: {
    width: '100%',
    gap: DesignTokens.spacing[4],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
  },
  featureIcon: {
    marginRight: DesignTokens.spacing[4],
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  featureDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  // Input styles
  inputContainer: {
    width: '100%',
    marginBottom: DesignTokens.spacing[4],
  },
  inputLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[2],
  },
  textInput: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[700],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Options styles
  optionsContainer: {
    width: '100%',
    gap: DesignTokens.spacing[3],
  },
  optionCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[5],
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: DesignTokens.colors.primary[500],
    backgroundColor: `${DesignTokens.colors.primary[500]}10`,
  },
  optionIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  optionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  optionTitleSelected: {
    color: DesignTokens.colors.primary[500],
  },
  optionDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionDescriptionSelected: {
    color: DesignTokens.colors.text.primary,
  },
  checkIcon: {
    position: 'absolute',
    top: DesignTokens.spacing[3],
    right: DesignTokens.spacing[3],
  },
  // Privacy styles
  privacyOptions: {
    width: '100%',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[6],
  },
  privacyOption: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyOptionSelected: {
    borderColor: DesignTokens.colors.primary[500],
    backgroundColor: `${DesignTokens.colors.primary[500]}10`,
  },
  privacyOptionContent: {
    flex: 1,
  },
  privacyOptionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  privacyOptionDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  toggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: DesignTokens.colors.neutral[700],
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${DesignTokens.colors.success[500]}15`,
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: `${DesignTokens.colors.success[500]}30`,
  },
  privacyNoteText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[3],
    flex: 1,
    lineHeight: 18,
  },
  // Completion styles
  completionFeatures: {
    width: '100%',
    gap: DesignTokens.spacing[4],
  },
  completionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
  },
  completionIcon: {
    fontSize: 24,
    marginRight: DesignTokens.spacing[4],
  },
  completionContent: {
    flex: 1,
  },
  completionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  completionDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
});
