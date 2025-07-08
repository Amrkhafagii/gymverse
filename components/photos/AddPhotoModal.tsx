import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { PhotoCategory, ProgressPhoto } from '@/types/progressPhoto';
import { DesignTokens } from '@/design-system/tokens';
import { 
  X, 
  Camera, 
  Image as ImageIcon, 
  Save, 
  User, 
  RotateCcw, 
  ArrowLeft,
  Weight,
  Ruler,
  Tag
} from 'lucide-react-native';

interface AddPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (
    imageUri: string,
    category: PhotoCategory,
    notes?: string,
    weight?: number,
    measurements?: ProgressPhoto['measurements'],
    tags?: string[]
  ) => Promise<void>;
  initialCategory?: PhotoCategory;
}

const PHOTO_CATEGORIES: Array<{ value: PhotoCategory; label: string; icon: React.ReactNode }> = [
  { value: 'front', label: 'Front View', icon: <User size={20} /> },
  { value: 'side', label: 'Side View', icon: <RotateCcw size={20} /> },
  { value: 'back', label: 'Back View', icon: <ArrowLeft size={20} /> },
  { value: 'progress', label: 'Progress', icon: <ImageIcon size={20} /> },
  { value: 'workout', label: 'Workout', icon: <Weight size={20} /> },
  { value: 'custom', label: 'Custom', icon: <Tag size={20} /> },
];

export function AddPhotoModal({ visible, onClose, onSave, initialCategory = 'front' }: AddPhotoModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [category, setCategory] = useState<PhotoCategory>(initialCategory);
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState('');
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
  });
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setSelectedImage(null);
    setCategory(initialCategory);
    setNotes('');
    setWeight('');
    setMeasurements({
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: '',
    });
    setTags('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to add progress photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImageFromLibrary = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add your progress photo',
      [
        { text: 'Take Photo', onPress: pickImageFromCamera },
        { text: 'Choose from Library', onPress: pickImageFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select a photo first.');
      return;
    }

    try {
      setIsLoading(true);

      const parsedWeight = weight ? parseFloat(weight) : undefined;
      const parsedMeasurements = {
        chest: measurements.chest ? parseFloat(measurements.chest) : undefined,
        waist: measurements.waist ? parseFloat(measurements.waist) : undefined,
        hips: measurements.hips ? parseFloat(measurements.hips) : undefined,
        arms: measurements.arms ? parseFloat(measurements.arms) : undefined,
        thighs: measurements.thighs ? parseFloat(measurements.thighs) : undefined,
      };

      // Only include measurements that have values
      const finalMeasurements = Object.entries(parsedMeasurements).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key as keyof typeof parsedMeasurements] = value;
        }
        return acc;
      }, {} as ProgressPhoto['measurements']);

      const parsedTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await onSave(
        selectedImage,
        category,
        notes || undefined,
        parsedWeight,
        Object.keys(finalMeasurements).length > 0 ? finalMeasurements : undefined,
        parsedTags.length > 0 ? parsedTags : undefined
      );

      handleClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Progress Photo</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, (!selectedImage || isLoading) && styles.saveButtonDisabled]}
            disabled={!selectedImage || isLoading}
          >
            <Save size={20} color={DesignTokens.colors.text.primary} />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo</Text>
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={showImagePickerOptions}
                >
                  <Text style={styles.changeImageText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.imagePicker}
                onPress={showImagePickerOptions}
              >
                <Camera size={48} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.imagePickerText}>Tap to add photo</Text>
                <Text style={styles.imagePickerSubtext}>Camera or Photo Library</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {PHOTO_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    category === cat.value && styles.categoryButtonActive
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  {cat.icon}
                  <Text style={[
                    styles.categoryButtonText,
                    category === cat.value && styles.categoryButtonTextActive
                  ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about your progress, workout, or how you're feeling..."
              placeholderTextColor={DesignTokens.colors.text.tertiary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Weight */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weight (Optional)</Text>
            <View style={styles.inputContainer}>
              <Weight size={20} color={DesignTokens.colors.text.secondary} />
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter weight in lbs"
                placeholderTextColor={DesignTokens.colors.text.tertiary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Measurements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Measurements (Optional)</Text>
            <View style={styles.measurementsGrid}>
              {Object.entries(measurements).map(([key, value]) => (
                <View key={key} style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                  <View style={styles.inputContainer}>
                    <Ruler size={16} color={DesignTokens.colors.text.secondary} />
                    <TextInput
                      style={[styles.input, styles.measurementInput]}
                      value={value}
                      onChangeText={(text) => setMeasurements(prev => ({ ...prev, [key]: text }))}
                      placeholder="inches"
                      placeholderTextColor={DesignTokens.colors.text.tertiary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags (Optional)</Text>
            <View style={styles.inputContainer}>
              <Tag size={20} color={DesignTokens.colors.text.secondary} />
              <TextInput
                style={styles.input}
                value={tags}
                onChangeText={setTags}
                placeholder="Enter tags separated by commas"
                placeholderTextColor={DesignTokens.colors.text.tertiary}
              />
            </View>
            <Text style={styles.helperText}>
              Example: bulking, chest day, morning, gym selfie
            </Text>
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
  },
  closeButton: {
    padding: DesignTokens.spacing[2],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.md,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
  content: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  section: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 2,
    borderColor: DesignTokens.colors.neutral[700],
    borderStyle: 'dashed',
    paddingVertical: DesignTokens.spacing[8],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  imagePickerText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[3],
  },
  imagePickerSubtext: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 267,
    borderRadius: DesignTokens.borderRadius.lg,
    marginBottom: DesignTokens.spacing[3],
  },
  changeImageButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
  },
  changeImageText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  categoryButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderColor: DesignTokens.colors.primary[500],
  },
  categoryButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  textArea: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[2],
  },
  input: {
    flex: 1,
    paddingVertical: DesignTokens.spacing[3],
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
  },
  measurementsGrid: {
    gap: DesignTokens.spacing[3],
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  measurementLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    width: 60,
  },
  measurementInput: {
    fontSize: DesignTokens.typography.fontSize.sm,
  },
  helperText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    marginTop: DesignTokens.spacing[1],
  },
});
