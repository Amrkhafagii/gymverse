import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useStreakTracking, useStreakUtils } from '@/hooks/useStreakTracking';

const { width } = Dimensions.get('window');

export function StreakCard() {
  const { streakData, useStreakRecovery, isLoading } = useStreakTracking();
  const { 
    getStreakColor, 
    getStreakEmoji, 
    formatStreakMessage, 
    getNextMilestone,
    getStreakProgress,
    isStreakAtRisk,
    getStreakHistory
  } = useStreakUtils();

  const [showHistory, setShowHistory] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  const nextMilestone = getNextMilestone();
  const progress = getStreakProgress();
  const streakHistory = getStreakHistory(14); // Last 14 days

  const handleRecoveryUse = async () => {
    setIsRecovering(true);
    try {
      const success = await useStreakRecovery();
      if (success) {
        // Show success feedback
      }
    } catch (error) {
      console.error('Recovery failed:', error);
    } finally {
      setIsRecovering(false);
    }
  };

  const renderStreakHistory = () => {
    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Last 14 Days</Text>
        <View style={styles.historyGrid}>
          {streakHistory.map((day, index) => (
            <View
              key={index}
              style={[
                styles.historyDay,
                {
                  backgroundColor: day.hasWorkout ? getStreakColor(streakData.currentStreak) : '#F3F4F6',
                }
              ]}
            >
              <Text style={[
                styles.historyDayText,
                { color: day.hasWorkout ? 'white' : '#6B7280' }
              ]}>
                {new Date(day.date).getDate()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRecoveryOption = () => {
    if (!streakData.streakRecovery.canRecover) return null;

    const hoursLeft = Math.floor(
      (new Date(streakData.streakRecovery.recoveryDeadline!).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    );

    return (
      <View style={styles.recoveryContainer}>
        <Text style={styles.recoveryTitle}>⚡ Streak Recovery Available</Text>
        <Text style={styles.recoveryText}>
          You have {hoursLeft} hours to recover your streak!
        </Text>
        <TouchableOpacity
          style={styles.recoveryButton}
          onPress={handleRecoveryUse}
          disabled={isRecovering}
        >
          <Text style={styles.recoveryButtonText}>
            {isRecovering ? 'Recovering...' : 'Use Recovery'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMilestones = () => {
    const recentMilestones = streakData.milestones
      .filter(m => m.achieved)
      .slice(-3);

    if (recentMilestones.length === 0) return null;

    return (
      <View style={styles.milestonesContainer}>
        <Text style={styles.milestonesTitle}>Recent Achievements</Text>
        <View style={styles.milestonesGrid}>
          {recentMilestones.map((milestone) => (
            <View key={milestone.id} style={styles.milestoneItem}>
              <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
              <Text style={styles.milestoneName}>{milestone.name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading streak data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Main Streak Display */}
      <View style={[styles.streakMain, { borderColor: getStreakColor(streakData.currentStreak) }]}>
        <View style={styles.streakHeader}>
          <Text style={styles.streakEmoji}>{getStreakEmoji(streakData.currentStreak)}</Text>
          <View style={styles.streakInfo}>
            <Text style={styles.streakNumber}>{streakData.currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
          {isStreakAtRisk() && (
            <View style={styles.riskBadge}>
              <Text style={styles.riskText}>⚠️</Text>
            </View>
          )}
        </View>

        <Text style={styles.streakMessage}>
          {formatStreakMessage(streakData.currentStreak)}
        </Text>

        {/* Progress to Next Milestone */}
        {nextMilestone && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Next: {nextMilestone.name}</Text>
              <Text style={styles.progressText}>
                {streakData.currentStreak}/{nextMilestone.target}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min(progress.progress, 100)}%`,
                    backgroundColor: getStreakColor(streakData.currentStreak)
                  }
                ]}
              />
            </View>
          </View>
        )}
      </View>

      {/* Motivation Message */}
      <View style={styles.motivationContainer}>
        <Text style={styles.motivationIcon}>{streakData.motivation.icon}</Text>
        <Text style={styles.motivationText}>{streakData.motivation.message}</Text>
      </View>

      {/* Recovery Option */}
      {renderRecoveryOption()}

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{streakData.longestStreak}</Text>
          <Text style={styles.statLabel}>Longest</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {streakData.monthlyStats[0]?.consistency || 0}%
          </Text>
          <Text style={styles.statLabel}>This Month</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {streakData.weeklyStreaks[streakData.weeklyStreaks.length - 1]?.workoutDays.length || 0}
          </Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Toggle History */}
      <TouchableOpacity
        style={styles.historyToggle}
        onPress={() => setShowHistory(!showHistory)}
      >
        <Text style={styles.historyToggleText}>
          {showHistory ? 'Hide History' : 'Show History'} {showHistory ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* History */}
      {showHistory && renderStreakHistory()}

      {/* Recent Milestones */}
      {renderMilestones()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
  },
  streakMain: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  streakLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: -4,
  },
  riskBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 16,
  },
  streakMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  motivationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  motivationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  recoveryContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  recoveryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  recoveryText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
  },
  recoveryButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  recoveryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  historyToggle: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  historyToggleText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  historyContainer: {
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  historyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  historyDay: {
    width: (width - 80) / 7 - 4,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyDayText: {
    fontSize: 12,
    fontWeight: '500',
  },
  milestonesContainer: {
    marginTop: 8,
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  milestonesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  milestoneItem: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  milestoneName: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
});
