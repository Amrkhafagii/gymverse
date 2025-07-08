import { useLocalAchievements } from './useLocalAchievements';

// Main hook that provides achievement functionality
export function useAchievements() {
  return useLocalAchievements();
}

// Additional utility hooks for specific achievement operations
export function useAchievementUtils() {
  const { achievements } = useAchievements();

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return '#6B7280';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'strength': return '#EF4444';
      case 'endurance': return '#3B82F6';
      case 'consistency': return '#10B981';
      case 'milestone': return '#F59E0B';
      case 'special': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const formatProgress = (current: number, max: number): string => {
    const percentage = Math.round((current / max) * 100);
    return `${percentage}%`;
  };

  const getNextAchievement = (category?: string) => {
    let filteredAchievements = achievements.filter(a => !a.unlocked);
    
    if (category) {
      filteredAchievements = filteredAchievements.filter(a => a.category === category);
    }
    
    return filteredAchievements
      .sort((a, b) => b.progress - a.progress)[0];
  };

  return {
    getRarityColor,
    getCategoryColor,
    formatProgress,
    getNextAchievement,
  };
}
