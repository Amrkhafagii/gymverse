import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { Dumbbell, Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ToastProvider';

const signUpSchema = z
  .object({
    username: z.string().min(3, 'Username is required'),
    fullName: z.string().max(100, 'Full name is too long').optional(),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSignUp = async (values: SignUpForm) => {
    const { email, password, username, fullName } = values;
    setLoading(true);
    try {
      const { error } = await signUp(email, password, username, fullName);
      if (error) {
        showToast(error.message || 'Unable to create account', 'error');
      } else {
        showToast('Account created! Check your email to verify.', 'success');
        router.replace('/(auth)/sign-in');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Dumbbell size={48} color="#FF6B35" />
            </View>
            <Text style={styles.title}>Join FitTracker</Text>
            <Text style={styles.subtitle}>Start your fitness journey today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color="#999" style={styles.inputIcon} />
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Username *"
                      placeholderTextColor="#999"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {errors.username && (
                      <Text style={styles.errorText}>{errors.username.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <User size={20} color="#999" style={styles.inputIcon} />
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#999"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                    {errors.fullName && (
                      <Text style={styles.errorText}>{errors.fullName.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#999" style={styles.inputIcon} />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Email *"
                      placeholderTextColor="#999"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                  </View>
                )}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#999" style={styles.inputIcon} />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Password *"
                      placeholderTextColor="#999"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {errors.password && (
                      <Text style={styles.errorText}>{errors.password.message}</Text>
                    )}
                  </View>
                )}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#999" style={styles.inputIcon} />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Confirm Password *"
                      placeholderTextColor="#999"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {errors.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                    )}
                  </View>
                )}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.disabledButton]}
              onPress={handleSubmit(handleSignUp)}
              disabled={loading}
            >
              <LinearGradient colors={['#FF6B35', '#FF8C42']} style={styles.buttonGradient}>
                <Text style={styles.signUpButtonText}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    paddingVertical: 16,
  },
  passwordInput: {
    paddingRight: 40,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  linkText: {
    fontSize: 14,
    color: '#FF6B35',
    fontFamily: 'Inter-SemiBold',
  },
});
