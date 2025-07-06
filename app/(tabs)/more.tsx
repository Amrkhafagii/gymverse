import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  User,
  Calendar,
  Trophy,
  Target,
  BookOpen,
  Settings,
  Crown,
  FileText,
  BarChart3,
  Dumbbell,
  Edit,
} from 'lucide-react-native';

interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  route: string;
  color: string;
}

const actionItems: ActionItem[] = [
  {
    id: 'profile',
    title: 'Profile',
    subtitle: 'View and edit your profile',
    icon: User,
    route: '/(tabs)/profile',
    color: '#9E7FFF',
  },
  {
    id: 'schedule',
    title: 'Schedule',
    subtitle: 'Plan your workout sessions',
    icon: Calendar,
    route: '/schedule',
    color: '#FF6B6B',
  },
  {
    id: 'edit-profile',
    title: 'Edit Profile',
    subtitle: 'Update your information',
    icon: Edit,
    route: '/edit-profile',
    color: '#4ECDC4',
  },
  {
    id: 'leaderboards',
    title: 'Leaderboards',
    subtitle: 'See how you rank',
    icon: Crown,
    route: '/leaderboards',
    color: '#FFD93D',
  },
  {
    id: 'workout-detail',
    title: 'Workout Details',
    subtitle: 'View detailed workout info',
    icon: FileText,
    route: '/workout-detail',
    color: '#6BCF7F',
  },
  {
    id: 'exercise-progress',
    title: 'Exercise Progress',
    subtitle: 'Track individual exercises',
    icon: BarChart3,
    route: '/exercise-progress',
    color: '#FF8A65',
  },
  {
    id: 'workout-templates',
    title: 'Workout Templates',
    subtitle: 'Pre-built workout plans',
    icon: Dumbbell,
    route: '/workout-templates',
    color: '#BA68C8',
  },
  {
    id: 'achievements',
    title: 'Achievements',
    subtitle: 'Your fitness milestones',
    icon: Trophy,
    route: '/achievements',
    color: '#FFB74D',
  },
  {
    id: 'education',
    title: 'Education',
    subtitle: 'Learn about fitness',
    icon: BookOpen,
    route: '/education',
    color: '#81C784',
  },
];

export default function MoreScreen() {
  // Navigation helper with error handling
  const handleActionPress = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'This feature is coming soon!');
    }
  };

  const handleSettingsPress = () => {
    // Handle settings navigation or show settings modal
    Alert.alert('Settings', 'Settings feature coming soon!');
  };

  const renderActionItem = (item: ActionItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.actionItem}
      onPress={() => handleActionPress(item.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
        <item.icon size={24} color={item.color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{item.title}</Text>
        <Text style={styles.actionSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>More Actions</Text>
            <Text style={styles.subtitle}>
              Access additional features and settings
            </Text>
          </View>

          {/* Action Items Grid */}
          <View style={styles.actionsContainer}>
            {actionItems.map(renderActionItem)}
          </View>

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <TouchableOpacity 
              style={styles.settingsItem} 
              activeOpacity={0.7}
              onPress={handleSettingsPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#64748B20' }]}>
                <Settings size={24} color="#64748B" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Settings</Text>
                <Text style={styles.actionSubtitle}>App preferences and configuration</Text>
              </View>
              <View style={styles.chevron}>
                <Text style={styles.chevronText}>›</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 22,
  },
  actionsContainer: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#888',
    lineHeight: 18,
  },
  chevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '300',
  },
  settingsSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomSpacing: {
    height: 120,
  },
});
