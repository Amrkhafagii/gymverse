import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getCategoryInfo, getTierInfo, AchievementTemplate } from '@/lib/achievements';

interface AchievementBadgeProps {
  achievement: AchievementTemplate;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
}

export default function AchievementBadge({ 
  achievement, 
  size = 'medium', 
  showDetails = false 
}: AchievementBadgeProps) {
  const category = getCategoryInfo(achievement.category);
  const tier = getTierInfo(achievement.tier);
  
  const sizeStyles = {
    small: {
      container: { width: 60, height: 60 },
      icon: { fontSize: 20 },
      badge: { width: 16, height: 16, right: -2, top: -2 }
    },
    medium: {
      container: { width: 80, height: 80 },
      icon: { fontSize: 28 },
      badge: { width: 20, height: 20, right: -4, top: -4 }
    },
    large: {
      container: { width: 120, height: 120 },
      icon: { fontSize: 40 },
      badge: { width: 24, height: 24, right: -6, top: -6 }
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return ['#9CA3AF', '#6B7280'];
      case 'uncommon':
        return ['#10B981', '#059669'];
      case 'rare':
        return ['#3B82F6', '#1D4ED8'];
      case 'epic':
        return ['#8B5CF6', '#7C3AED'];
      case 'legendary':
        return ['#F59E0B', '#D97706'];
      default:
        return ['#9CA3AF', '#6B7280'];
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getRarityGradient(achievement.rarity)}
        style={[styles.badge, sizeStyles[size].container]}
      >
        <Text style={[styles.icon, sizeStyles[size].icon]}>
          {achievement.icon}
        </Text>
        
        {/* Tier indicator */}
        <View 
          style={[
            styles.tierBadge, 
            sizeStyles[size].badge,
            { backgroundColor: tier?.color || '#CD7F32' }
          ]}
        />
      </LinearGradient>
      
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={2}>
            {achievement.name}
          </Text>
          <Text style={styles.points}>
            {achievement.points} pts
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  icon: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tierBadge: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  details: {
    marginTop: 8,
    alignItems: 'center',
    maxWidth: 100,
  },
  name: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    marginBottom: 2,
  },
  points: {
    fontSize: 10,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
  },
});
