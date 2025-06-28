import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Star, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Achievement } from '@/lib/supabase';
import { AchievementProgress } from '@/lib/achievements';

interface AchievementProgressCardProps {
  achievement: Achievement;
  progress: AchievementProgress;
}

export default function AchievementProgressCard({ achievement, progress }: AchievementProgressCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'workout':
        return '#FF6B35';
      case 'strength':
        return '#E74C3C';
      case 'consistency':
        return '#27AE60';
      case 'endurance':
        return '#4A90E2';
      case 'social':
        return '#9B59B6';
      default:
        return '#FF6B35';
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'trophy':
        return Trophy;
      case 'star':
        return Star;
      default:
        return Trophy;
    }
  };

  const IconComponent = getIconComponent(achievement.icon || 'trophy');
  const categoryColor = getCategoryColor(achievement.category);

  return (
    <View style={[styles.container, progress.unlocked && styles.unlockedContainer]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
          <IconComponent size={24} color={progress.unlocked ? categoryColor : '#666'} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, progress.unlocked && styles.unlockedTitle]}>
            {achievement.name}
          </Text>
          <Text style={styles.description}>{achievement.description}</Text>
        </View>
        {progress.unlocked && (
          <CheckCircle size={24} color={categoryColor} />
        )}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress.percentage}%`,
                backgroundColor: progress.unlocked ? categoryColor : '#666',
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progress.current_value} / {progress.target_value}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.categoryTag}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {achievement.category}
          </Text>
        </View>
        <View style={styles.pointsContainer}>
          <Star size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{achievement.points} pts</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  unlockedContainer: {
    borderColor: '#27AE60',
    backgroundColor: '#27AE6010',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#ccc',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  unlockedTitle: {
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
});