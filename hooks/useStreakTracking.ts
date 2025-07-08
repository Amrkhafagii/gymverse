import { useContext } from 'react';
import { StreakContext } from '@/contexts/StreakContext';

export function useStreakTracking() {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreakTracking must be used within a StreakProvider');
  }
  return context;
}

// Additional hook for streak-specific utilities
export function useStreakUtils() {
  const { streakData, getStreakHistory } = useStreakTracking();

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return '#DC2626'; // Red for legendary
    if (streak >= 14) return '#F59E0B'; // Orange for great
    if (streak >= 7) return '#8B5CF6';  // Purple for good
    if (streak >= 3) return '#3B82F6';  // Blue for starting
    return '#6B7280'; // Gray for none
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 100) return '🏆';
    if (streak >= 30) return '👑';
    if (streak >= 14) return '🏅';
    if (streak >= 7) return '⚡';
    if (streak >= 3) return '🎯';
    return '💪';
  };

  const formatStreakMessage = (streak: number): string => {
    if (streak === 0) return 'Start your streak today!';
    if (streak === 1) return 'Great start! Keep it going!';
    return `${streak} days strong!`;
  };

  const getNextMilestone = () => {
    const unachievedMilestones = streakData.milestones.filter(m => !m.achieved);
    return unachievedMilestones.sort((a, b) => a.target - b.target)[0];
  };

  const getStreakProgress = () => {
    const nextMilestone = getNextMilestone();
    if (!nextMilestone) return { progress: 100, target: streakData.currentStreak };
    
    return {
      progress: (streakData.currentStreak / nextMilestone.target) * 100,
      target: nextMilestone.target,
    };
  };

  const isStreakAtRisk = (): boolean => {
    if (!streakData.lastWorkoutDate) return false;
    
    const lastWorkout = new Date(streakData.lastWorkoutDate);
    const now = new Date();
    const hoursSince = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);
    
    return hoursSince > 20 && hoursSince < 48; // At risk if 20-48 hours since last workout
  };

  return {
    getStreakColor,
    getStreakEmoji,
    formatStreakMessage,
    getNextMilestone,
    getStreakProgress,
    isStreakAtRisk,
    getStreakHistory,
  };
}
