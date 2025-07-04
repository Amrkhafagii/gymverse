import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '@/contexts/DataContext';
import { pickImageFromLibrary, takePhotoWithCamera, saveProfilePicture } from '@/lib/storage/fileStorage';
import TDEECalculator from '@/components/TDEECalculator';

export default function ProfileScreen() {
  const { profile, settings, loading, updateProfile } = useData();
  const [uploading, setUploading] = useState(false);
  const [showTDEECalculator, setShowTDEECalculator] = useState(false);

  const handleProfilePictureChange = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: handleTakePhoto },
        { text: 'Photo Library', onPress: handlePickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      setUploading(true);
      const imageUri = await takePhotoWithCamera();
      if (imageUri) {
        const savedPath = await saveProfilePicture(imageUri);
        await updateProfile({ avatar_url: savedPath });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setUploading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      setUploading(true);
      const imageUri = await pickImageFromLibrary();
      if (imageUri) {
        const savedPath = await saveProfilePicture(imageUri);
        await updateProfile({ avatar_url: savedPath });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#9E7FFF', '#7C3AED']}
              style={styles.profileGradient}
            >
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={handleProfilePictureChange}
                disabled={uploading}
              >
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#FFFFFF" />
                  </View>
                )}
                <View style={styles.avatarOverlay}>
                  <Ionicons 
                    name={uploading ? "hourglass" : "camera"} 
                    size={16} 
                    color="#FFFFFF" 
                  />
                </View>
              </TouchableOpacity>
              
              <Text style={styles.profileName}>
                {profile?.full_name || profile?.username || 'GymVerse User'}
              </Text>
              
              {profile?.bio && (
                <Text style={styles.profileBio}>{profile.bio}</Text>
              )}
              
              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>
                    {profile?.fitness_level || 'Beginner'}
                  </Text>
                  <Text style={styles.profileStatLabel}>Level</Text>
                </View>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatValue}>
                    {new Date(profile?.created_at || Date.now()).getFullYear()}
                  </Text>
                  <Text style={styles.profileStatLabel}>Since</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* TDEE Calculator Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Calculator</Text>
          <TouchableOpacity 
            style={styles.tdeeCard}
            onPress={() => setShowTDEECalculator(true)}
          >
            <LinearGradient
              colors={['#FF6B35', '#FF8C42']}
              style={styles.tdeeGradient}
            >
              <View style={styles.tdeeIcon}>
                <Ionicons name="calculator" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.tdeeContent}>
                <Text style={styles.tdeeTitle}>TDEE Calculator</Text>
                <Text style={styles.tdeeSubtitle}>
                  Calculate your daily calorie needs and macro targets using the Leangains protocol
                </Text>
                <View style={styles.tdeeFeatures}>
                  <View style={styles.tdeeFeature}>
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.tdeeFeatureText}>Katch-McArdle BMR</Text>
                  </View>
                  <View style={styles.tdeeFeature}>
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.tdeeFeatureText}>Training/Rest Day Macros</Text>
                  </View>
                  <View style={styles.tdeeFeature}>
                    <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                    <Text style={styles.tdeeFeatureText}>Cut/Bulk/Maintain Goals</Text>
                  </View>
                </View>
              </View>
              <View style={styles.tdeeArrow}>
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#1f2937', '#111827']}
                style={styles.statGradient}
              >
                <Ionicons name="scale" size={24} color="#9E7FFF" />
                <Text style={styles.statValue}>
                  {profile?.weight_kg ? `${profile.weight_kg} kg` : '--'}
                </Text>
                <Text style={styles.statLabel}>Weight</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#1f2937', '#111827']}
                style={styles.statGradient}
              >
                <Ionicons name="resize" size={24} color="#f472b6" />
                <Text style={styles.statValue}>
                  {profile?.height_cm ? `${profile.height_cm} cm` : '--'}
                </Text>
                <Text style={styles.statLabel}>Height</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.menuGradient}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="person-circle" size={24} color="#9E7FFF" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Edit Profile</Text>
                <Text style={styles.menuSubtitle}>Update your information</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.menuGradient}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="notifications" size={24} color="#f472b6" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuSubtitle}>
                  {settings?.notifications.workout_reminders ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.menuGradient}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="bar-chart" size={24} color="#38bdf8" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Units</Text>
                <Text style={styles.menuSubtitle}>
                  {settings?.units === 'metric' ? 'Metric (kg, cm)' : 'Imperial (lbs, ft)'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.menuGradient}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="download" size={24} color="#10b981" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Export Data</Text>
                <Text style={styles.menuSubtitle}>Backup your workout data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.menuGradient}
            >
              <View style={styles.menuIcon}>
                <Ionicons name="help-circle" size={24} color="#f59e0b" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Help & Support</Text>
                <Text style={styles.menuSubtitle}>Get help and contact us</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>GymVerse v1.0.0</Text>
            <Text style={styles.appInfoText}>Made with ❤️ for fitness enthusiasts</Text>
          </View>
        </View>
      </ScrollView>

      {/* TDEE Calculator Modal */}
      <TDEECalculator
        visible={showTDEECalculator}
        onClose={() => setShowTDEECalculator(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter-Medium',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  settingsButton: {
    backgroundColor: '#262626',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 16,
  },
  profileCard: {
    marginBottom: 8,
  },
  profileGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    opacity: 0.8,
    marginTop: 4,
  },
  // TDEE Calculator Styles
  tdeeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tdeeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 120,
  },
  tdeeIcon: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tdeeContent: {
    flex: 1,
    marginRight: 12,
  },
  tdeeTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 6,
  },
  tdeeSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter-Regular',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 12,
  },
  tdeeFeatures: {
    gap: 6,
  },
  tdeeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tdeeFeatureText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    opacity: 0.9,
  },
  tdeeArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  statValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  menuItem: {
    marginBottom: 12,
  },
  menuGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(158, 127, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
});
