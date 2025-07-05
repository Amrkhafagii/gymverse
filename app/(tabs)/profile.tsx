import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Settings,
  Trophy,
  Target,
  Calendar,
  Bell,
  Shield,
  HelpCircle,
  Star,
  ChevronRight,
  Edit3,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(true);

  // Mock user data
  const userData = {
    name: 'Fitness Enthusiast',
    username: '@fitnesslover',
    email: 'user@example.com',
    joinDate: 'January 2024',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    stats: {
      workoutsCompleted: 127,
      totalMinutes: 3420,
      achievements: 23,
      streak: 15,
    },
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: Edit3, title: 'Edit Profile', subtitle: 'Update your information' },
        { icon: Target, title: 'Goals & Preferences', subtitle: 'Set your fitness goals' },
        { icon: Trophy, title: 'Achievements', subtitle: 'View your progress' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { 
          icon: Bell, 
          title: 'Notifications', 
          subtitle: 'Workout reminders',
          hasSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: setNotificationsEnabled,
        },
        { 
          icon: Shield, 
          title: 'Dark Mode', 
          subtitle: 'App appearance',
          hasSwitch: true,
          switchValue: darkModeEnabled,
          onSwitchChange: setDarkModeEnabled,
        },
        { icon: Calendar, title: 'Workout Schedule', subtitle: 'Manage your routine' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, title: 'Help & Support', subtitle: 'Get assistance' },
        { icon: Star, title: 'Rate App', subtitle: 'Share your feedback' },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.settingsButton}>
              <Settings size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#1a1a1a', '#2a2a2a']}
              style={styles.profileCardGradient}
            >
              <View style={styles.profileHeader}>
                <Image source={{ uri: userData.avatar }} style={styles.avatar} />
                <View style={styles.profileInfo}>
                  <Text style={styles.name}>{userData.name}</Text>
                  <Text style={styles.username}>{userData.username}</Text>
                  <Text style={styles.joinDate}>Member since {userData.joinDate}</Text>
                </View>
                <TouchableOpacity style={styles.editButton}>
                  <Edit3 size={20} color="#9E7FFF" />
                </TouchableOpacity>
              </View>

              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userData.stats.workoutsCompleted}</Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{Math.floor(userData.stats.totalMinutes / 60)}h</Text>
                  <Text style={styles.statLabel}>Total Time</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userData.stats.achievements}</Text>
                  <Text style={styles.statLabel}>Achievements</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{userData.stats.streak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Menu Sections */}
          {menuSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.menuSection}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.menuItems}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.menuItem,
                      itemIndex === section.items.length - 1 && styles.lastMenuItem,
                    ]}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.menuItemIcon}>
                        <item.icon size={20} color="#9E7FFF" />
                      </View>
                      <View style={styles.menuItemContent}>
                        <Text style={styles.menuItemTitle}>{item.title}</Text>
                        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                      </View>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.hasSwitch ? (
                        <Switch
                          value={item.switchValue}
                          onValueChange={item.onSwitchChange}
                          trackColor={{ false: '#333', true: '#9E7FFF40' }}
                          thumbColor={item.switchValue ? '#9E7FFF' : '#666'}
                        />
                      ) : (
                        <ChevronRight size={20} color="#666" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>GymVerse v1.0.0</Text>
          </View>
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
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileCardGradient: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#333',
  },
  menuSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  menuItems: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9E7FFF20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  menuItemRight: {
    marginLeft: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Inter-Regular',
  },
});
