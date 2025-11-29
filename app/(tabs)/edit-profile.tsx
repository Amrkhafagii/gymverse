import React, { useState, useEffect } from 'react';
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
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Save,
  X,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Globe,
  Lock,
} from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/supabase';
import { useToast } from '@/components/ToastProvider';

const profileSchema = z.object({
  fullName: z.string().max(100, 'Full name must be less than 100 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(val)) return false;
      const date = new Date(val);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
      const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
      return date >= minDate && date <= maxDate;
    }, 'Please enter a valid birth date (13-120 years old)'),
  heightCm: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const height = parseFloat(val);
      return !Number.isNaN(height) && height >= 50 && height <= 300;
    }, 'Height must be between 50-300 cm'),
  weightKg: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const weight = parseFloat(val);
      return !Number.isNaN(weight) && weight >= 20 && weight <= 500;
    }, 'Weight must be between 20-500 kg'),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preferredUnits: z.enum(['metric', 'imperial']),
  isPublic: z.boolean(),
});

type FormData = z.infer<typeof profileSchema>;

export default function EditProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const { showToast } = useToast();

  const {
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      bio: '',
      dateOfBirth: '',
      heightCm: '',
      weightKg: '',
      fitnessLevel: 'beginner',
      preferredUnits: 'metric',
      isPublic: true,
    },
  });

  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      const initialData: FormData = {
        fullName: profile.full_name || '',
        bio: profile.bio || '',
        dateOfBirth: profile.date_of_birth || '',
        heightCm: profile.height_cm?.toString() || '',
        weightKg: profile.weight_kg?.toString() || '',
        fitnessLevel:
          (profile.fitness_level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
        preferredUnits: (profile.preferred_units as 'metric' | 'imperial') || 'metric',
        isPublic: profile.is_public ?? true,
      };
      reset(initialData);
      setHasChanges(false);
    }
  }, [profile, reset]);

  useEffect(() => {
    setHasChanges(isDirty);
  }, [isDirty]);

  const handleSave = async (values: FormData) => {
    if (!user) return;

    setError(null);

    setLoading(true);

    try {
      const updatedData: any = {
        full_name: values.fullName?.trim() || null,
        bio: values.bio?.trim() || null,
        date_of_birth: values.dateOfBirth || null,
        height_cm: values.heightCm ? parseFloat(values.heightCm) : null,
        weight_kg: values.weightKg ? parseFloat(values.weightKg) : null,
        fitness_level: values.fitnessLevel,
        preferred_units: values.preferredUnits,
        is_public: values.isPublic,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await updateProfile(user.id, updatedData);

      if (updateError) {
        throw updateError;
      }

      // Refresh the profile in the auth context
      await refreshProfile();
      setHasChanges(false);
      showToast('Profile updated', 'success');
      router.back();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert('Discard Changes', 'Are you sure you want to discard your changes?', [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const convertHeight = (cm: string) => {
    if (!cm || watch('preferredUnits') === 'metric') return cm;
    const inches = parseFloat(cm) / 2.54;
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}'${remainingInches}"`;
  };

  const convertWeight = (kg: string) => {
    if (!kg || watch('preferredUnits') === 'metric') return kg;
    const lbs = Math.round(parseFloat(kg) * 2.20462);
    return lbs.toString();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={[styles.headerButton, (!hasChanges || loading) && styles.disabledButton]}
            onPress={handleSubmit(handleSave)}
            disabled={!hasChanges || loading}
          >
            <Save size={24} color={hasChanges && !loading ? '#FF6B35' : '#666'} />
          </TouchableOpacity>
        </View>
        {hasChanges && <Text style={styles.changesIndicator}>You have unsaved changes</Text>}
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
            <Text style={styles.inputLabel}>Full Name</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value, onBlur } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    maxLength={100}
                  />
                  {errors.fullName && (
                    <Text style={styles.errorText}>{errors.fullName.message}</Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, value, onBlur } }) => (
                <>
                  <TextInput
                    style={[styles.input, styles.textArea, errors.bio && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Tell us about yourself..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <Text style={styles.characterCount}>{(value || '').length}/500</Text>
                  {errors.bio && <Text style={styles.errorText}>{errors.bio.message}</Text>}
                </>
              )}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelWithIcon}>
              <Calendar size={16} color="#FF6B35" />
              <Text style={styles.inputLabel}>Date of Birth</Text>
            </View>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  style={[styles.input, errors.dateOfBirth && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              )}
            />
            {watch('dateOfBirth') && (
              <Text style={styles.helperText}>
                {formatDateForDisplay(watch('dateOfBirth') || '')}
              </Text>
            )}
            {errors.dateOfBirth && (
              <Text style={styles.errorText}>{errors.dateOfBirth.message}</Text>
            )}
          </View>
        </View>

        {/* Physical Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Stats</Text>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.labelWithIcon}>
                <Ruler size={16} color="#4A90E2" />
                <Text style={styles.inputLabel}>
                  Height ({watch('preferredUnits') === 'metric' ? 'cm' : 'ft/in'})
                </Text>
              </View>
              <Controller
                control={control}
                name="heightCm"
                render={({ field: { onChange, value, onBlur } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.heightCm && styles.inputError]}
                      value={
                        watch('preferredUnits') === 'metric' ? value : convertHeight(value || '')
                      }
                      onChangeText={(text) => {
                        if (watch('preferredUnits') === 'metric') {
                          onChange(text);
                        } else {
                          const match = text.match(/(\d+)'(\d+)"/);
                          if (match) {
                            const feet = parseInt(match[1]);
                            const inches = parseInt(match[2]);
                            const totalInches = feet * 12 + inches;
                            const cm = (totalInches * 2.54).toFixed(0);
                            onChange(cm);
                          } else {
                            onChange('');
                          }
                        }
                      }}
                      onBlur={onBlur}
                      placeholder={watch('preferredUnits') === 'metric' ? '170' : '5\'8"'}
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                    {errors.heightCm && (
                      <Text style={styles.errorText}>{errors.heightCm.message}</Text>
                    )}
                  </>
                )}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <View style={styles.labelWithIcon}>
                <Weight size={16} color="#27AE60" />
                <Text style={styles.inputLabel}>
                  Weight ({watch('preferredUnits') === 'metric' ? 'kg' : 'lbs'})
                </Text>
              </View>
              <Controller
                control={control}
                name="weightKg"
                render={({ field: { onChange, value, onBlur } }) => (
                  <>
                    <TextInput
                      style={[styles.input, errors.weightKg && styles.inputError]}
                      value={
                        watch('preferredUnits') === 'metric' ? value : convertWeight(value || '')
                      }
                      onChangeText={(text) => {
                        if (watch('preferredUnits') === 'metric') {
                          onChange(text);
                        } else {
                          const lbs = parseFloat(text);
                          if (!isNaN(lbs)) {
                            const kg = (lbs / 2.20462).toFixed(1);
                            onChange(kg);
                          } else {
                            onChange('');
                          }
                        }
                      }}
                      onBlur={onBlur}
                      placeholder={watch('preferredUnits') === 'metric' ? '70' : '154'}
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                    />
                    {errors.weightKg && (
                      <Text style={styles.errorText}>{errors.weightKg.message}</Text>
                    )}
                  </>
                )}
              />
            </View>
          </View>
        </View>

        {/* Fitness Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fitness Information</Text>

          <View style={styles.inputContainer}>
            <View style={styles.labelWithIcon}>
              <Activity size={16} color="#9B59B6" />
              <Text style={styles.inputLabel}>Fitness Level</Text>
            </View>
            <Controller
              control={control}
              name="fitnessLevel"
              render={({ field: { value, onChange } }) => (
                <View style={styles.segmentedControl}>
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[styles.segmentButton, value === level && styles.segmentButtonActive]}
                      onPress={() => onChange(level)}
                    >
                      <Text
                        style={[
                          styles.segmentButtonText,
                          value === level && styles.segmentButtonTextActive,
                        ]}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Preferred Units</Text>
            <Controller
              control={control}
              name="preferredUnits"
              render={({ field: { value, onChange } }) => (
                <View style={styles.segmentedControl}>
                  {(['metric', 'imperial'] as const).map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[styles.segmentButton, value === unit && styles.segmentButtonActive]}
                      onPress={() => onChange(unit)}
                    >
                      <Text
                        style={[
                          styles.segmentButtonText,
                          value === unit && styles.segmentButtonTextActive,
                        ]}
                      >
                        {unit === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft/in)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>

          <Controller
            control={control}
            name="isPublic"
            render={({ field: { value, onChange } }) => (
              <View style={styles.switchContainer}>
                <View style={styles.switchInfo}>
                  <View style={styles.labelWithIcon}>
                    {value ? (
                      <Globe size={16} color="#27AE60" />
                    ) : (
                      <Lock size={16} color="#E74C3C" />
                    )}
                    <Text style={styles.switchLabel}>Public Profile</Text>
                  </View>
                  <Text style={styles.switchDescription}>
                    {value
                      ? 'Your profile is visible to other users. They can see your achievements and progress.'
                      : 'Your profile is private. Only you can see your data and achievements.'}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: '#333', true: '#FF6B35' }}
                  thumbColor={value ? '#fff' : '#999'}
                />
              </View>
            )}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, (!hasChanges || loading) && styles.disabledButton]}
          onPress={handleSubmit(handleSave)}
          disabled={!hasChanges || loading}
        >
          <LinearGradient
            colors={hasChanges && !loading ? ['#FF6B35', '#FF8C42'] : ['#333', '#333']}
            style={styles.saveButtonGradient}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  changesIndicator: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
    marginTop: 8,
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
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
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
  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
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
  inputError: {
    borderColor: '#E74C3C',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'right',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#4A90E2',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FF6B35',
  },
  segmentButtonText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  segmentButtonTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  switchDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
    lineHeight: 20,
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
