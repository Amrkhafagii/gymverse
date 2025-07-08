import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  Calendar, 
  Ruler, 
  Save,
  Plus,
  Minus,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { MeasurementType } from '@/types/measurement';
import { MEASUREMENT_TYPES, getMeasurementTypeById } from '@/lib/measurements/measurementTypes';
import { MeasurementCalculations } from '@/lib/measurements/measurementCalculations';

interface AddMeasurementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (measurements: { type: string; value: number; unit: string; date: string; notes?: string }[]) => Promise<void>;
  selectedTypes?: string[];
  initialDate?: string;
}

interface MeasurementInput {
  type: string;
  value: string;
  notes: string;
}

export function AddMeasurementModal({
  visible,
  onClose,
  onSave,
  selectedTypes = [],
  initialDate,
}: AddMeasurementModalProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [measurements, setMeasurements] = useState<MeasurementInput[]>([]);
  const [availableTypes, setAvailableTypes] = useState<MeasurementType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'weight' | 'body' | 'performance'>('weight');

  useEffect(() => {
    if (visible) {
      initializeMeasurements();
    }
  }, [visible, selectedTypes]);

  const initializeMeasurements = () => {
    if (selectedTypes.length > 0) {
      const initialMeasurements = selectedTypes.map(type => ({
        type,
        value: '',
        notes: '',
      }));
      setMeasurements(initialMeasurements);
      setAvailableTypes(MEASUREMENT_TYPES.filter(t => selectedTypes.includes(t.id)));
    } else {
      setMeasurements([]);
      setAvailableTypes(MEASUREMENT_TYPES);
    }
  };

  const addMeasurementType = (type: MeasurementType) => {
    if (!measurements.find(m => m.type === type.id)) {
      setMeasurements(prev => [...prev, {
        type: type.id,
        value: '',
        notes: '',
      }]);
    }
  };

  const removeMeasurementType = (typeId: string) => {
    setMeasurements(prev => prev.filter(m => m.type !== typeId));
  };

  const updateMeasurement = (typeId: string, field: 'value' | 'notes', value: string) => {
    setMeasurements(prev => prev.map(m =>
      m.type === typeId ? { ...m, [field]: value } : m
    ));
  };

  const adjustValue = (typeId: string, delta: number) => {
    const measurement = measurements.find(m => m.type === typeId);
    if (measurement) {
      const currentValue = parseFloat(measurement.value) || 0;
      const newValue = Math.max(0, currentValue + delta);
      updateMeasurement(typeId, 'value', newValue.toString());
    }
  };

  const validateMeasurements = (): boolean => {
    if (measurements.length === 0) {
      Alert.alert('Error', 'Please add at least one measurement');
      return false;
    }

    for (const measurement of measurements) {
      const value = parseFloat(measurement.value);
      const type = getMeasurementTypeById(measurement.type);
      
      if (!type) continue;
      
      if (isNaN(value) || value <= 0) {
        Alert.alert('Error', `Please enter a valid value for ${type.name}`);
        return false;
      }

      if (type.minValue && value < type.minValue) {
        Alert.alert('Error', `${type.name} value must be at least ${type.minValue} ${type.unit}`);
        return false;
      }

      if (type.maxValue && value > type.maxValue) {
        Alert.alert('Error', `${type.name} value must not exceed ${type.maxValue} ${type.unit}`);
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateMeasurements()) return;

    try {
      setIsLoading(true);
      
      const measurementData = measurements.map(m => {
        const type = getMeasurementTypeById(m.type)!;
        return {
          type: m.type,
          value: parseFloat(m.value),
          unit: type.unit,
          date: selectedDate,
          notes: m.notes.trim() || undefined,
        };
      });

      await onSave(measurementData);
      onClose();
    } catch (error) {
      console.error('Error saving measurements:', error);
      Alert.alert('Error', 'Failed to save measurements. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMeasurementInput = (measurement: MeasurementInput) => {
    const type = getMeasurementTypeById(measurement.type);
    if (!type) return null;

    const value = parseFloat(measurement.value) || 0;

    return (
      <View key={measurement.type} style={styles.measurementCard}>
        <View style={styles.measurementHeader}>
          <View style={styles.measurementInfo}>
            <Text style={styles.measurementIcon}>{type.icon}</Text>
            <View>
              <Text style={styles.measurementName}>{type.name}</Text>
              <Text style={styles.measurementUnit}>{type.unit}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeMeasurementType(measurement.type)}
          >
            <X size={16} color={DesignTokens.colors.error[500]} />
          </TouchableOpacity>
        </View>

        <View style={styles.valueInputContainer}>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => adjustValue(measurement.type, -0.1)}
          >
            <Minus size={16} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.valueInput}
            value={measurement.value}
            onChangeText={(text) => updateMeasurement(measurement.type, 'value', text)}
            placeholder="0"
            keyboardType="numeric"
            selectTextOnFocus
          />
          
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => adjustValue(measurement.type, 0.1)}
          >
            <Plus size={16} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.notesInput}
          value={measurement.notes}
          onChangeText={(text) => updateMeasurement(measurement.type, 'notes', text)}
          placeholder="Notes (optional)"
          multiline
          numberOfLines={2}
        />
      </View>
    );
  };

  const renderTypeSelector = () => {
    const categories = ['weight', 'body', 'performance'] as const;
    const filteredTypes = availableTypes.filter(type => 
      type.category === activeTab && !measurements.find(m => m.type === type.id)
    );

    return (
      <View style={styles.typeSelector}>
        <View style={styles.tabContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.tab,
                activeTab === category && styles.activeTab
              ]}
              onPress={() => setActiveTab(category)}
            >
              <Text style={[
                styles.tabText,
                activeTab === category && styles.activeTabText
              ]}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeList}>
          {filteredTypes.map(type => (
            <TouchableOpacity
              key={type.id}
              style={styles.typeCard}
              onPress={() => addMeasurementType(type)}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={styles.typeName}>{type.name}</Text>
              <Text style={styles.typeUnit}>{type.unit}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Add Measurements</Text>
          
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Save size={20} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <View style={styles.dateContainer}>
          <Calendar size={20} color={DesignTokens.colors.primary[500]} />
          <Text style={styles.dateLabel}>Date:</Text>
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Current Measurements */}
          {measurements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Measurements</Text>
              {measurements.map(renderMeasurementInput)}
            </View>
          )}

          {/* Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add More Measurements</Text>
            {renderTypeSelector()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  closeButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: DesignTokens.colors.surface.tertiary,
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.lg,
    backgroundColor: DesignTokens.colors.primary[500],
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  dateLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  dateInput: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[700],
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[4],
  },
  measurementCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[3],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  measurementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: DesignTokens.spacing[3],
  },
  measurementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  measurementIcon: {
    fontSize: 24,
  },
  measurementName: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  measurementUnit: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  removeButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: DesignTokens.colors.surface.tertiary,
  },
  valueInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[3],
  },
  adjustButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[700],
  },
  valueInput: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    textAlign: 'center',
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[700],
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  notesInput: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[700],
    minHeight: 60,
    textAlignVertical: 'top',
  },
  typeSelector: {
    gap: DesignTokens.spacing[4],
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[1],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
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
  typeList: {
    flexDirection: 'row',
  },
  typeCard: {
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    marginRight: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
    minWidth: 80,
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: DesignTokens.spacing[2],
  },
  typeName: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  typeUnit: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
});
