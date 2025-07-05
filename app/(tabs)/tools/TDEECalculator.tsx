import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calculator, Info, User, Activity } from 'lucide-react-native';

export default function TDEECalculator() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activityLevel, setActivityLevel] = useState<string>('sedentary');
  const [bodyFat, setBodyFat] = useState('');
  const [results, setResults] = useState<{
    bmr: number;
    tdee: number;
    formulaUsed: 'standard' | 'hybrid';
  } | null>(null);

  const activityLevels = [
    { key: 'sedentary', label: 'Sedentary', multiplier: 1.2, description: 'Little to no exercise' },
    { key: 'light', label: 'Light Activity', multiplier: 1.375, description: 'Light exercise 1-3 days/week' },
    { key: 'moderate', label: 'Moderate Activity', multiplier: 1.55, description: 'Moderate exercise 3-5 days/week' },
    { key: 'active', label: 'Very Active', multiplier: 1.725, description: 'Hard exercise 6-7 days/week' },
    { key: 'extreme', label: 'Extremely Active', multiplier: 1.9, description: 'Very hard exercise, physical job' },
  ];

  const calculateBMR = (weightKg: number, heightCm: number, ageNum: number, isMale: boolean, bodyFatPercentage: number | null): { bmr: number, formulaUsed: 'standard' | 'hybrid' } => {
    // Sex constant: 5 for male, -161 for female
    const sexConstant = isMale ? 5 : -161;
    
    // Standard Harris-Benedict formula
    const standardBMR = 10 * weightKg + 6.25 * heightCm - 5 * ageNum + sexConstant;
    
    // If body fat percentage is available, use the hybrid formula
    if (bodyFatPercentage !== null) {
      // Calculate lean body mass
      const lbm = weightKg * (1 - bodyFatPercentage / 100);
      const lbmLbs = lbm * 2.20462; // Convert to lbs
      
      // Hybrid formula: [(Standard formula) + (14 × LBM in lbs)] / 2
      const hybridBMR = (standardBMR + (14 * lbmLbs)) / 2;
      
      return { bmr: hybridBMR, formulaUsed: 'hybrid' };
    }
    
    // Return standard BMR if no body fat data
    return { bmr: standardBMR, formulaUsed: 'standard' };
  };

  const calculateTDEE = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseFloat(age);
    const bodyFatNum = bodyFat ? parseFloat(bodyFat) : null;

    if (!weightNum || !heightNum || !ageNum) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (bodyFatNum !== null && (bodyFatNum < 3 || bodyFatNum > 50)) {
      Alert.alert('Error', 'Body fat percentage should be between 3% and 50%');
      return;
    }

    const selectedActivity = activityLevels.find(level => level.key === activityLevel);
    if (!selectedActivity) return;

    const { bmr, formulaUsed } = calculateBMR(weightNum, heightNum, ageNum, gender === 'male', bodyFatNum);
    const tdee = bmr * selectedActivity.multiplier;

    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      formulaUsed,
    });
  };

  const resetCalculator = () => {
    setWeight('');
    setHeight('');
    setAge('');
    setBodyFat('');
    setGender('male');
    setActivityLevel('sedentary');
    setResults(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Calculator size={24} color="#9E7FFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>TDEE Calculator</Text>
                <Text style={styles.headerSubtitle}>Total Daily Energy Expenditure</Text>
              </View>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.infoCardGradient}>
              <View style={styles.infoHeader}>
                <Info size={20} color="#9E7FFF" />
                <Text style={styles.infoTitle}>About TDEE</Text>
              </View>
              <Text style={styles.infoText}>
                TDEE represents the total calories you burn per day. It's calculated using your BMR (Basal Metabolic Rate) and activity level. 
                {'\n\n'}For more accurate results, include your body fat percentage to use our hybrid calculation formula.
              </Text>
            </LinearGradient>
          </View>

          {/* Input Form */}
          <View style={styles.formContainer}>
            <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.formGradient}>
              {/* Basic Info */}
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Weight (kg) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Enter your weight"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Height (cm) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Enter your height"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age *</Text>
                <TextInput
                  style={styles.textInput}
                  value={age}
                  onChangeText={setAge}
                  placeholder="Enter your age"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Body Fat % (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={bodyFat}
                  onChangeText={setBodyFat}
                  placeholder="Enter body fat percentage"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <Text style={styles.inputHint}>
                  Optional: Enables hybrid BMR calculation for better accuracy
                </Text>
              </View>

              {/* Gender Selection */}
              <Text style={styles.sectionTitle}>Gender</Text>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                  onPress={() => setGender('male')}
                >
                  <User size={20} color={gender === 'male' ? '#fff' : '#666'} />
                  <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                    Male
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                  onPress={() => setGender('female')}
                >
                  <User size={20} color={gender === 'female' ? '#fff' : '#666'} />
                  <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                    Female
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Activity Level */}
              <Text style={styles.sectionTitle}>Activity Level</Text>
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level.key}
                  style={[
                    styles.activityButton,
                    activityLevel === level.key && styles.activityButtonActive,
                  ]}
                  onPress={() => setActivityLevel(level.key)}
                >
                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <Activity size={16} color={activityLevel === level.key ? '#9E7FFF' : '#666'} />
                      <Text style={[
                        styles.activityLabel,
                        activityLevel === level.key && styles.activityLabelActive,
                      ]}>
                        {level.label}
                      </Text>
                      <Text style={styles.activityMultiplier}>×{level.multiplier}</Text>
                    </View>
                    <Text style={styles.activityDescription}>{level.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Calculate Button */}
              <TouchableOpacity style={styles.calculateButton} onPress={calculateTDEE}>
                <LinearGradient colors={['#9E7FFF', '#7C3AED']} style={styles.calculateButtonGradient}>
                  <Calculator size={20} color="#fff" />
                  <Text style={styles.calculateButtonText}>Calculate TDEE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Results */}
          {results && (
            <View style={styles.resultsContainer}>
              <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.resultsGradient}>
                <Text style={styles.resultsTitle}>Your Results</Text>
                
                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Basal Metabolic Rate (BMR)</Text>
                  <Text style={styles.resultValue}>{results.bmr} calories/day</Text>
                  <Text style={styles.resultFormula}>
                    Formula used: {results.formulaUsed === 'hybrid' ? 'Hybrid (with body fat)' : 'Standard Harris-Benedict'}
                  </Text>
                </View>

                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Total Daily Energy Expenditure (TDEE)</Text>
                  <Text style={styles.resultValue}>{results.tdee} calories/day</Text>
                  <Text style={styles.resultDescription}>
                    This is your estimated daily calorie needs including activity
                  </Text>
                </View>

                <View style={styles.calorieGoals}>
                  <Text style={styles.goalsTitle}>Calorie Goals</Text>
                  <View style={styles.goalRow}>
                    <Text style={styles.goalLabel}>Weight Loss (-0.5kg/week):</Text>
                    <Text style={styles.goalValue}>{results.tdee - 500} cal/day</Text>
                  </View>
                  <View style={styles.goalRow}>
                    <Text style={styles.goalLabel}>Maintenance:</Text>
                    <Text style={styles.goalValue}>{results.tdee} cal/day</Text>
                  </View>
                  <View style={styles.goalRow}>
                    <Text style={styles.goalLabel}>Weight Gain (+0.5kg/week):</Text>
                    <Text style={styles.goalValue}>{results.tdee + 500} cal/day</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.resetButton} onPress={resetCalculator}>
                  <Text style={styles.resetButtonText}>Calculate Again</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9E7FFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoCardGradient: {
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  formContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  formGradient: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#444',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  genderButtonActive: {
    backgroundColor: '#9E7FFF20',
    borderColor: '#9E7FFF',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  genderTextActive: {
    color: '#fff',
  },
  activityButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  activityButtonActive: {
    backgroundColor: '#9E7FFF20',
    borderColor: '#9E7FFF',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
    flex: 1,
  },
  activityLabelActive: {
    color: '#9E7FFF',
  },
  activityMultiplier: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  activityDescription: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 24,
  },
  calculateButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  calculateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  calculateButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  resultsContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultsGradient: {
    padding: 24,
  },
  resultsTitle: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  resultLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 24,
    color: '#9E7FFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  resultFormula: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  resultDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
  calorieGoals: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  goalsTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Regular',
  },
  goalValue: {
    fontSize: 14,
    color: '#9E7FFF',
    fontFamily: 'Inter-SemiBold',
  },
  resetButton: {
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
  },
});
