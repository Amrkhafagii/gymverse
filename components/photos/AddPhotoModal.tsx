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
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadProgressPhoto, ProgressPhoto } from '@/lib/supabase/progressPhotos';

interface AddPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (photo: ProgressPhoto) => void;
}

const photoTypes = [
  { value: 'front', label: 'Front View', icon: 'person' },
  { value: 'side', label: 'Side View', icon: 'person' },
  { value: 'back', label: 'Back View', icon: 'person' },
  { value: 'custom', label: 'Custom', icon: 'camera' },
];

const categories = [
  { value: 'progress', label: 'Progress', icon: 'trending-up' },
  { value: 'before', label: 'Before', icon: 'play-back' },
  { value: 'after', label: 'After', icon: 'play-forward' },
  { value: 'milestone', label: 'Milestone', icon: 'trophy' },
];

export default function AddPhotoModal({ visible, onClose, onSuccess }: AddPhotoModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<'front' | 'side' | 'back' | 'custom'>('front');
  const [category, setCategory] = useState<'progress' | 'before' | 'after' | 'milestone'>('progress');
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select or take a photo');
      return;
    }

    try {
      setLoading(true);

      const photoData = {
        photo_date: photoDate,
        photo_type: photoType,
        category,
        weight_at_time: weight ? parseFloat(weight) : undefined,
        body_fat_at_time: bodyFat ? parseFloat(bodyFat) : undefined,
        notes: notes.trim() || undefined,
        is_public: isPublic,
      };

      const photo = await uploadProgressPhoto(selectedImage, photoData);
      onSuccess(photo);
      handleClose();
    } catch (error) {
      console.error('Error saving photo:', error);
      Alert.alert('Error', 'Failed to save photo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setPhotoType('front');
    setCategory('progress');
    setPhotoDate(new Date().toISOString().split('T')[0]);
    setWeight('');
    setBodyFat('');
    setNotes('');
    setIsPublic(false);
    onClose();
  };

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
            <Text style={styles.title}>Add Progress Photo</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              disabled={loading || !selectedImage}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Photo Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photo</Text>
              {selectedImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
                    <Ionicons name="pencil" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.photoActionButton} onPress={takePhoto}>
                    <LinearGradient colors={['#9E7FFF', '#7C3AED']} style={styles.photoActionGradient}>
                      <Ionicons name="camera" size={24} color="#FFFFFF" />
                      <Text style={styles.photoActionText}>Take Photo</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.photoActionButton} onPress={pickImage}>
                    <LinearGradient colors={['#f472b6', '#ec4899']} style={styles.photoActionGradient}>
                      <Ionicons name="images" size={24} color="#FFFFFF" />
                      <Text style={styles.photoActionText}>Choose from Gallery</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Photo Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photo Type</Text>
              <View style={styles.optionsGrid}>
                {photoTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionButton,
                      photoType === type.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setPhotoType(type.value as any)}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={20} 
                      color={photoType === type.value ? '#FFFFFF' : '#A3A3A3'} 
                    />
                    <Text style={[
                      styles.optionText,
                      photoType === type.value && styles.optionTextSelected,
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.optionsGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.optionButton,
                      category === cat.value && styles.optionButtonSelected,
                    ]}
                    onPress={() => setCategory(cat.value as any)}
                  >
                    <Ionicons 
                      name={cat.icon as any} 
                      size={20} 
                      color={category === cat.value ? '#FFFFFF' : '#A3A3A3'} 
                    />
                    <Text style={[
                      styles.optionText,
                      category === cat.value && styles.optionTextSelected,
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date and Measurements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <LinearGradient colors={['#1f2937', '#111827']} style={styles.detailGradient}>
                    <TextInput
                      style={styles.detailInput}
                      value={photoDate}
                      onChangeText={setPhotoDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#A3A3A3"
                    />
                  </LinearGradient>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Weight (kg)</Text>
                  <LinearGradient colors={['#1f2937', '#111827']} style={styles.detailGradient}>
                    <TextInput
                      style={styles.detailInput}
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="Optional"
                      placeholderTextColor="#A3A3A3"
                      keyboardType="decimal-pad"
                    />
                  </LinearGradient>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Body Fat (%)</Text>
                  <LinearGradient colors={['#1f2937', '#111827']} style={styles.detailGradient}>
                    <TextInput
                      style={styles.detailInput}
                      value={bodyFat}
                      onChangeText={setBodyFat}
                      placeholder="Optional"
                      placeholderTextColor="#A3A3A3"
                      keyboardType="decimal-pad"
                    />
                  </LinearGradient>
                </View>
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
                  placeholder="Add notes about this photo..."
                  placeholderTextColor="#A3A3A3"
                  multiline
                  numberOfLines={3}
                />
              </LinearGradient>
            </View>

            {/* Privacy */}
            <View style={styles.section}>
              <TouchableOpacity 
                style={styles.privacyToggle} 
                onPress={() => setIsPublic(!isPublic)}
              >
                <View style={styles.privacyInfo}>
                  <Ionicons 
                    name={isPublic ? "globe" : "lock-closed"} 
                    size={20} 
                    color={isPublic ? "#10b981" : "#A3A3A3"} 
                  />
                  <View style={styles.privacyText}>
                    <Text style={styles.privacyTitle}>
                      {isPublic ? "Public" : "Private"}
                    </Text>
                    <Text style={styles.privacyDescription}>
                      {isPublic 
                        ? "Visible to other users in the community" 
                        : "Only visible to you"
                      }
                    </Text>
                  </View>
                </View>
                <View style={[styles.toggle, isPublic && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, isPublic && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
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
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 267,
    borderRadius: 16,
    backgroundColor: '#262626',
  },
  changePhotoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoActions: {
    gap: 12,
  },
  photoActionButton: {
    borderRadius: 16,
  },
  photoActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  photoActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F2F2F',
    gap: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#9E7FFF',
    borderColor: '#9E7FFF',
  },
  optionText: {
    color: '#A3A3A3',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    gap: 8,
  },
  detailLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  detailGradient: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  detailInput: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
  privacyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#262626',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  privacyDescription: {
    color: '#A3A3A3',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  toggle: {
    width: 50,
    height: 30,
    backgroundColor: '#2F2F2F',
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#10b981',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
