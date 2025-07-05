import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { addBodyMeasurement, BodyMeasurement } from '@/lib/supabase/measurements';

interface AddMeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (measurement: BodyMeasurement) => void;
}

interface MeasurementField {
  key: keyof Omit<BodyMeasurement, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'measurement_date' | 'notes'>;
  label: string;
  unit: string;
  icon: string;
  category: 'body' | 'measurements';
}

const measurementFields: MeasurementField[] = [
  { key: 'weight', label: 'Weight', unit: 'kg', icon: 'scale', category: 'body' },
  { key: 'body_fat_percentage', label: 'Body Fat', unit: '%', icon: 'fitness', category: 'body' },
  { key: 'muscle_mass', label: 'Muscle Mass', unit: 'kg', icon: 'body', category: 'body' },
  { key: 'chest', label: 'Chest', unit: 'cm', icon: 'resize', category: 'measurements' },
  { key: 'waist', label: 'Waist', unit: 'cm', icon: 'resize', category: 'measurements' },
  { key: 'hips', label: 'Hips', unit: 'cm', icon: 'resize', category: 'measurements' },
  { key: 'bicep_left', label: 'Left Bicep', unit: 'cm', icon: 'fitness', category: 'measurements' },
  { key: 'bicep_right', label: 'Right Bicep', unit: 'cm', icon: 'fitness', category: 'measurements' },
  { key: 'thigh_left', label: 'Left Thigh', unit: 'cm', icon: 'resize', category: 'measurements' },
  { key: 'thigh_right', label: 'Right Thigh', unit: 'cm', icon: 'resize', category: 'measurements' },
  { key: 'neck', label: 'Neck', unit: 'cm', icon: 'resize', category: 'measurements' },
  { key: 'forearm_left', label: 'Left Forearm', unit: 'cm', icon: 'fitness', category: 'measurements' },
  { key: 'forearm_right', label: 'Right Forearm', unit: 'cm', icon: 'fitness', category: 'measurements' },
  { key: 'calf_left', label: 'Left Calf', unit: 'cm', icon: 'resize', category: 'measurements' },
  { key: 'calf_right', label: 'Right Calf', unit: 'cm', icon: 'resize', category: 'measurements' },
];

export default function AddMeasurementModal({ visible, onClose, onSuccess }: AddMeasurementModalProps) {
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      // Convert string values to numbers and filter out empty values
      const numericMeasurements: any = {};
      let hasValidMeasurement = false;

      for (const [key, value] of Object.entries(measurements)) {
        if (value.trim()) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue) && numValue > 0) {
            numericMeasurements[key] = numValue;
            hasValidMeasurement = true;
          }
        }
      }

      if (!hasValidMeasurement) {
        Alert.alert('Error', 'Please enter at least one valid measurement');
        return;
      }

      const measurement = await addBodyMeasurement({
        ...numericMeasurements,
        measurement_date: measurementDate,
        notes: notes.trim() || undefined,
      });

      onSuccess(measurement);
      handleClose();
    } catch (error) {
      console.error('Error saving measurement:', error);
      Alert.alert('Error', 'Failed to save measurement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMeasurements({});
    setNotes('');
    setMeasurementDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const updateMeasurement = (key: string, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const bodyFields = measurementFields.filter(f => f.category === 'body');
  const measurementFieldsList = measurementFields.filter(f => f.category === 'measurements');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.title}>Add Measurements</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date</Text>
              <View style={styles.dateContainer}>
                <LinearGradient colors={['#1f2937', '#111827']} style={styles.dateGradient}>
                  <Ionicons name="calendar" size={20} color="#9E7FFF" />
                  <TextInput
                    style={styles.dateInput}
                    value={measurementDate}
                    onChangeText={setMeasurementDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#A3A3A3"
                  />
                </LinearGradient>
              </View>
            </View>

            {/* Body Composition */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Body Composition</Text>
              <View style={styles.fieldsGrid}>
                {bodyFields.map((field) => (
                  <View key={field.key} style={styles.fieldContainer}>
                    <LinearGradient colors={['#1f2937', '#111827']} style={styles.fieldGradient}>
                      <View style={styles.fieldHeader}>
                        <Ionicons name={field.icon as any} size={16} color="#9E7FFF" />
                        <Text style={styles.fieldLabel}>{field.label}</Text>
                      </View>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          value={measurements[field.key] || ''}
                          onChangeText={(value) => updateMeasurement(field.key, value)}
                          placeholder="0"
                          placeholderTextColor="#A3A3A3"
                          keyboardType="decimal-pad"
                        />
                        <Text style={styles.unit}>{field.unit}</Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            </View>

            {/* Body Measurements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Body Measurements</Text>
              <View style={styles.fieldsGrid}>
                {measurementFieldsList.map((field) => (
                  <View key={field.key} style={styles.fieldContainer}>
                    <LinearGradient colors={['#1f2937', '#111827']} style={styles.fieldGradient}>
                      <View style={styles.fieldHeader}>
                        <Ionicons name={field.icon as any} size={16} color="#f472b6" />
                        <Text style={styles.fieldLabel}>{field.label}</Text>
                      </View>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          value={measurements[field.key] || ''}
                          onChangeText={(value) => updateMeasurement(field.key, value)}
                          placeholder="0"
                          placeholderTextColor="#A3A3A3"
                          keyboardType="decimal-pad"
                        />
                        <Text style={styles.unit}>{field.unit}</Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes (Optional)</Text>
              <LinearGradient colors={['#1f2937', '#111827']} style={styles.notesGradient}>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about your measurements..."
                  placeholderTextColor="#A3A3A3"
                  multiline
                  numberOfLines={3}
                />
              </LinearGradient>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2F2F2F',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  saveButton: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  dateContainer: {
    marginBottom: 8,
  },
  dateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  dateInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 12,
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  fieldContainer: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  fieldGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  unit: {
    color: '#A3A3A3',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
  notesGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  notesInput: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlignVertical: 'top',
    minHeight: 80,
  },
});
