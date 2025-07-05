import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AchievementTemplate, ACHIEVEMENT_CATEGORIES } from '@/lib/achievements';
import AchievementBadge from './AchievementBadge';

interface AchievementGridProps {
  achievements: AchievementTemplate[];
  unlockedIds: string[];
  onAchievementPress?: (achievement: AchievementTemplate) => void;
  showCategories?: boolean;
}

export default function AchievementGrid({ 
  achievements, 
  unlockedIds, 
  onAchievementPress,
  showCategories = true 
}: AchievementGridProps) {
  const groupedAchievements = showCategories 
    ? ACHIEVEMENT_CATEGORIES.reduce((acc, category) => {
        acc[category.id] = achievements.filter(a => a.category === category.id);
        return acc;
      }, {} as Record<string, AchievementTemplate[]>)
    : { all: achievements };

  const renderAchievement = (achievement: AchievementTemplate) => {
    const isUnlocked = unlockedIds.includes(achievement.id);
    
    return (
      <TouchableOpacity
        key={achievement.id}
        style={[styles.achievementItem, !isUnlocked && styles.lockedAchievement]}
        onPress={() => onAchievementPress?.(achievement)}
        activeOpacity={0.7}
      >
        <AchievementBadge 
          achievement={achievement} 
          size="medium"
          showDetails
        />
        {!isUnlocked && (
          <View style={styles.lockOverlay}>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {Object.entries(groupedAchievements).map(([categoryId, categoryAchievements]) => {
        if (categoryAchievements.length === 0) return null;
        
        const category = ACHIEVEMENT_CATEGORIES.find(c => c.id === categoryId);
        
        return (
          <View key={categoryId} style={styles.categorySection}>
            {showCategories && category && (
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>{category.description}</Text>
                </View>
                <View style={styles.categoryProgress}>
                  <Text style={styles.progressText}>
                    {unlockedIds.filter(id => 
                      categoryAchievements.some(a => a.id === id)
                    ).length}/{categoryAchievements.length}
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.achievementGrid}>
              {categoryAchievements.map(renderAchievement)}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  categoryProgress: {
    backgroundColor: 'rgba(158, 127, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    color: '#9E7FFF',
    fontFamily: 'Inter-Bold',
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: '30%',
    marginBottom: 20,
    alignItems: 'center',
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
  },
  lockIcon: {
    fontSize: 20,
  },
});
