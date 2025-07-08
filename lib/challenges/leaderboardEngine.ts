import { LeaderboardEntry, GlobalLeaderboardEntry } from './localLeaderboards';
import { Challenge, ChallengeParticipant } from '@/contexts/ChallengeContext';

export interface RankingAlgorithm {
  name: string;
  description: string;
  calculate: (entries: LeaderboardEntry[]) => LeaderboardEntry[];
}

export interface LeaderboardTier {
  name: string;
  minRank: number;
  maxRank: number;
  color: string;
  icon: string;
  benefits: string[];
}

export class LeaderboardEngine {
  private readonly RANKING_ALGORITHMS: Record<string, RankingAlgorithm> = {
    standard: {
      name: 'Standard Ranking',
      description: 'Rank by total score with ties sharing the same rank',
      calculate: this.standardRanking.bind(this),
    },
    modified: {
      name: 'Modified Ranking',
      description: 'Rank by score with no gaps in ranking sequence',
      calculate: this.modifiedRanking.bind(this),
    },
    dense: {
      name: 'Dense Ranking',
      description: 'Rank by score with consecutive ranks for ties',
      calculate: this.denseRanking.bind(this),
    },
    percentile: {
      name: 'Percentile Ranking',
      description: 'Rank based on percentile performance',
      calculate: this.percentileRanking.bind(this),
    },
  };

  private readonly LEADERBOARD_TIERS: LeaderboardTier[] = [
    {
      name: 'Legend',
      minRank: 1,
      maxRank: 1,
      color: '#FFD700',
      icon: '👑',
      benefits: ['Exclusive Legend badge', 'Priority support', 'Beta feature access'],
    },
    {
      name: 'Champion',
      minRank: 2,
      maxRank: 5,
      color: '#C0C0C0',
      icon: '🏆',
      benefits: ['Champion badge', 'Monthly rewards', 'Community recognition'],
    },
    {
      name: 'Elite',
      minRank: 6,
      maxRank: 20,
      color: '#CD7F32',
      icon: '⭐',
      benefits: ['Elite badge', 'Bonus XP', 'Special challenges'],
    },
    {
      name: 'Advanced',
      minRank: 21,
      maxRank: 100,
      color: '#9E7FFF',
      icon: '💪',
      benefits: ['Advanced badge', 'Progress insights'],
    },
    {
      name: 'Intermediate',
      minRank: 101,
      maxRank: 500,
      color: '#4A90E2',
      icon: '🎯',
      benefits: ['Intermediate badge', 'Goal tracking'],
    },
    {
      name: 'Beginner',
      minRank: 501,
      maxRank: Infinity,
      color: '#27AE60',
      icon: '🌱',
      benefits: ['Beginner badge', 'Learning resources'],
    },
  ];

  /**
   * Apply ranking algorithm to leaderboard entries
   */
  applyRanking(entries: LeaderboardEntry[], algorithm: string = 'standard'): LeaderboardEntry[] {
    const rankingAlgorithm = this.RANKING_ALGORITHMS[algorithm];
    if (!rankingAlgorithm) {
      throw new Error(`Unknown ranking algorithm: ${algorithm}`);
    }

    return rankingAlgorithm.calculate(entries);
  }

  /**
   * Get user's tier based on rank
   */
  getUserTier(rank: number): LeaderboardTier {
    return this.LEADERBOARD_TIERS.find(tier => 
      rank >= tier.minRank && rank <= tier.maxRank
    ) || this.LEADERBOARD_TIERS[this.LEADERBOARD_TIERS.length - 1];
  }

  /**
   * Calculate rank changes between two leaderboard snapshots
   */
  calculateRankChanges(
    previousLeaderboard: LeaderboardEntry[],
    currentLeaderboard: LeaderboardEntry[]
  ): Record<string, { previousRank: number; currentRank: number; change: number }> {
    const changes: Record<string, { previousRank: number; currentRank: number; change: number }> = {};

    const previousRanks = new Map(previousLeaderboard.map(entry => [entry.userId, entry.rank]));
    
    currentLeaderboard.forEach(entry => {
      const previousRank = previousRanks.get(entry.userId);
      if (previousRank !== undefined) {
        changes[entry.userId] = {
          previousRank,
          currentRank: entry.rank,
          change: previousRank - entry.rank, // Positive = rank improved
        };
      }
    });

    return changes;
  }

  /**
   * Generate leaderboard insights and trends
   */
  generateLeaderboardInsights(
    leaderboard: LeaderboardEntry[],
    challenge: Challenge
  ): {
    topPerformers: LeaderboardEntry[];
    fastestRisers: LeaderboardEntry[];
    consistentPerformers: LeaderboardEntry[];
    competitionLevel: 'low' | 'medium' | 'high';
    averageProgress: number;
    completionRate: number;
    insights: string[];
  } {
    const topPerformers = leaderboard.slice(0, 5);
    
    // For fastest risers, we'd need historical data - using mock logic
    const fastestRisers = leaderboard
      .filter(entry => entry.progress.percentage > 50)
      .slice(0, 3);

    // Consistent performers - those with steady progress
    const consistentPerformers = leaderboard
      .filter(entry => entry.progress.percentage > 25 && entry.progress.percentage < 90)
      .slice(0, 3);

    const averageProgress = leaderboard.reduce((sum, entry) => sum + entry.progress.percentage, 0) / leaderboard.length;
    const completionRate = (leaderboard.filter(entry => entry.completedAt).length / leaderboard.length) * 100;

    // Determine competition level
    let competitionLevel: 'low' | 'medium' | 'high' = 'medium';
    if (averageProgress > 70) competitionLevel = 'high';
    else if (averageProgress < 30) competitionLevel = 'low';

    // Generate insights
    const insights: string[] = [];
    
    if (completionRate > 80) {
      insights.push('High completion rate indicates strong participant engagement');
    } else if (completionRate < 30) {
      insights.push('Low completion rate suggests the challenge may be too difficult');
    }

    if (averageProgress > 80) {
      insights.push('Participants are performing exceptionally well');
    } else if (averageProgress < 20) {
      insights.push('Most participants are struggling with this challenge');
    }

    if (leaderboard.length > 100) {
      insights.push('High participation makes this a competitive challenge');
    }

    return {
      topPerformers,
      fastestRisers,
      consistentPerformers,
      competitionLevel,
      averageProgress,
      completionRate,
      insights,
    };
  }

  /**
   * Calculate predicted final rankings based on current progress
   */
  predictFinalRankings(
    leaderboard: LeaderboardEntry[],
    challenge: Challenge
  ): Array<LeaderboardEntry & { predictedRank: number; confidence: number }> {
    const daysRemaining = challenge.duration.daysLeft;
    const totalDuration = Math.ceil(
      (new Date(challenge.duration.end).getTime() - new Date(challenge.duration.start).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const progressRatio = (totalDuration - daysRemaining) / totalDuration;

    return leaderboard.map(entry => {
      // Simple prediction based on current progress rate
      const currentRate = entry.progress.percentage / progressRatio;
      const predictedFinalProgress = Math.min(currentRate, 100);
      
      // Calculate confidence based on consistency (simplified)
      const confidence = Math.min(entry.progress.percentage / 100 * 0.8 + 0.2, 1);

      return {
        ...entry,
        predictedRank: entry.rank, // Would be calculated based on predicted progress
        confidence: Math.round(confidence * 100),
      };
    });
  }

  /**
   * Standard ranking: 1, 2, 2, 4, 5
   */
  private standardRanking(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    const sorted = [...entries].sort((a, b) => b.score - a.score);
    let currentRank = 1;

    return sorted.map((entry, index) => {
      if (index > 0 && sorted[index - 1].score !== entry.score) {
        currentRank = index + 1;
      }
      return { ...entry, rank: currentRank };
    });
  }

  /**
   * Modified ranking: 1, 2, 2, 3, 4
   */
  private modifiedRanking(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    const sorted = [...entries].sort((a, b) => b.score - a.score);
    let currentRank = 1;

    return sorted.map((entry, index) => {
      if (index > 0 && sorted[index - 1].score !== entry.score) {
        currentRank++;
      }
      return { ...entry, rank: currentRank };
    });
  }

  /**
   * Dense ranking: 1, 2, 2, 3, 4
   */
  private denseRanking(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    const sorted = [...entries].sort((a, b) => b.score - a.score);
    const uniqueScores = [...new Set(sorted.map(entry => entry.score))].sort((a, b) => b - a);
    
    return sorted.map(entry => ({
      ...entry,
      rank: uniqueScores.indexOf(entry.score) + 1,
    }));
  }

  /**
   * Percentile ranking: Based on percentage of participants scored below
   */
  private percentileRanking(entries: LeaderboardEntry[]): LeaderboardEntry[] {
    const sorted = [...entries].sort((a, b) => b.score - a.score);
    
    return sorted.map((entry, index) => ({
      ...entry,
      rank: Math.round(((sorted.length - index) / sorted.length) * 100),
    }));
  }

  /**
   * Get available ranking algorithms
   */
  getAvailableAlgorithms(): RankingAlgorithm[] {
    return Object.values(this.RANKING_ALGORITHMS);
  }

  /**
   * Get leaderboard tiers
   */
  getLeaderboardTiers(): LeaderboardTier[] {
    return this.LEADERBOARD_TIERS;
  }
}

export const leaderboardEngine = new LeaderboardEngine();
