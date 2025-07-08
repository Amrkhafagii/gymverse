import { useChallenges as useChallengeContext } from '@/contexts/ChallengeContext';
import { useState, useEffect, useCallback } from 'react';
import { Challenge, ChallengeParticipant } from '@/contexts/ChallengeContext';
import * as Haptics from 'expo-haptics';

export interface ChallengeFilters {
  category: 'all' | Challenge['category'];
  difficulty: 'all' | Challenge['difficulty'];
  type: 'all' | Challenge['type'];
  status: 'all' | 'available' | 'joined' | 'completed';
  timeframe: 'all' | 'ending_soon' | 'just_started';
}

export interface ChallengeSort {
  by: 'popularity' | 'difficulty' | 'ending_soon' | 'newest' | 'points';
  order: 'asc' | 'desc';
}

export function useChallenges() {
  const context = useChallengeContext();
  const [filters, setFilters] = useState<ChallengeFilters>({
    category: 'all',
    difficulty: 'all',
    type: 'all',
    status: 'all',
    timeframe: 'all',
  });
  const [sort, setSort] = useState<ChallengeSort>({
    by: 'popularity',
    order: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort challenges
  const filteredChallenges = useCallback(() => {
    let filtered = [...context.challenges];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(query) ||
        challenge.description.toLowerCase().includes(query) ||
        challenge.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(challenge => challenge.category === filters.category);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === filters.difficulty);
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(challenge => challenge.type === filters.type);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      switch (filters.status) {
        case 'available':
          filtered = filtered.filter(challenge => !challenge.isJoined && !challenge.isCompleted);
          break;
        case 'joined':
          filtered = filtered.filter(challenge => challenge.isJoined && !challenge.isCompleted);
          break;
        case 'completed':
          filtered = filtered.filter(challenge => challenge.isCompleted);
          break;
      }
    }

    // Apply timeframe filter
    if (filters.timeframe !== 'all') {
      switch (filters.timeframe) {
        case 'ending_soon':
          filtered = filtered.filter(challenge => challenge.duration.daysLeft <= 7 && challenge.duration.daysLeft > 0);
          break;
        case 'just_started':
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(challenge => new Date(challenge.duration.start) >= sevenDaysAgo);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sort.by) {
        case 'popularity':
          comparison = a.participants - b.participants;
          break;
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        case 'ending_soon':
          comparison = a.duration.daysLeft - b.duration.daysLeft;
          break;
        case 'newest':
          comparison = new Date(a.duration.start).getTime() - new Date(b.duration.start).getTime();
          break;
        case 'points':
          comparison = a.reward.points - b.reward.points;
          break;
      }

      return sort.order === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [context.challenges, filters, sort, searchQuery]);

  // Challenge actions with haptic feedback
  const joinChallengeWithFeedback = useCallback(async (challengeId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    return await context.joinChallenge(challengeId);
  }, [context.joinChallenge]);

  const leaveChallengeWithFeedback = useCallback(async (challengeId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    return await context.leaveChallenge(challengeId);
  }, [context.leaveChallenge]);

  const updateProgressWithFeedback = useCallback(async (challengeId: string, progress: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await context.updateChallengeProgress(challengeId, progress);
  }, [context.updateChallengeProgress]);

  // Filter utilities
  const clearFilters = useCallback(() => {
    setFilters({
      category: 'all',
      difficulty: 'all',
      type: 'all',
      status: 'all',
      timeframe: 'all',
    });
    setSearchQuery('');
  }, []);

  const hasActiveFilters = useCallback(() => {
    return (
      filters.category !== 'all' ||
      filters.difficulty !== 'all' ||
      filters.type !== 'all' ||
      filters.status !== 'all' ||
      filters.timeframe !== 'all' ||
      searchQuery.trim() !== ''
    );
  }, [filters, searchQuery]);

  // Analytics
  const getChallengeAnalytics = useCallback(() => {
    const filtered = filteredChallenges();
    const total = context.challenges.length;
    
    return {
      total,
      filtered: filtered.length,
      categories: {
        strength: context.challenges.filter(c => c.category === 'strength').length,
        cardio: context.challenges.filter(c => c.category === 'cardio').length,
        consistency: context.challenges.filter(c => c.category === 'consistency').length,
        distance: context.challenges.filter(c => c.category === 'distance').length,
        time: context.challenges.filter(c => c.category === 'time').length,
        social: context.challenges.filter(c => c.category === 'social').length,
      },
      difficulties: {
        beginner: context.challenges.filter(c => c.difficulty === 'beginner').length,
        intermediate: context.challenges.filter(c => c.difficulty === 'intermediate').length,
        advanced: context.challenges.filter(c => c.difficulty === 'advanced').length,
      },
      userStats: {
        joined: context.challenges.filter(c => c.isJoined).length,
        completed: context.challenges.filter(c => c.isCompleted).length,
        available: context.challenges.filter(c => !c.isJoined && !c.isCompleted).length,
      },
    };
  }, [context.challenges, filteredChallenges]);

  return {
    // Core context
    ...context,
    
    // Filtered data
    filteredChallenges: filteredChallenges(),
    
    // Filters and search
    filters,
    setFilters,
    sort,
    setSort,
    searchQuery,
    setSearchQuery,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    
    // Enhanced actions
    joinChallenge: joinChallengeWithFeedback,
    leaveChallenge: leaveChallengeWithFeedback,
    updateChallengeProgress: updateProgressWithFeedback,
    
    // Analytics
    analytics: getChallengeAnalytics(),
  };
}

export default useChallenges;
