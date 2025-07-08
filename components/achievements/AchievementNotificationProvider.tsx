import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { AchievementNotification } from './AchievementNotification';
import { PRCelebrationNotification } from './PRCelebrationNotification';
import { useAchievements } from '@/contexts/AchievementContext';
import { usePersonalRecords } from '@/contexts/PersonalRecordContext';

export function AchievementNotificationProvider({ children }: { children: React.ReactNode }) {
  const { recentUnlocks, dismissNotification } = useAchievements();
  const { pendingCelebrations, celebratePR, dismissPRCelebration } = usePersonalRecords();
  
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [currentPR, setCurrentPR] = useState(null);

  useEffect(() => {
    // Show achievement notifications
    if (recentUnlocks.length > 0 && !currentAchievement && !currentPR) {
      setCurrentAchievement(recentUnlocks[0]);
    }
  }, [recentUnlocks, currentAchievement, currentPR]);

  useEffect(() => {
    // Show PR celebrations
    if (pendingCelebrations.length > 0 && !currentPR && !currentAchievement) {
      setCurrentPR(pendingCelebrations[0]);
    }
  }, [pendingCelebrations, currentPR, currentAchievement]);

  const handleAchievementDismiss = () => {
    if (currentAchievement) {
      dismissNotification(currentAchievement.id);
      setCurrentAchievement(null);
    }
  };

  const handlePRDismiss = () => {
    if (currentPR) {
      dismissPRCelebration(currentPR.id);
      setCurrentPR(null);
    }
  };

  const handlePRCelebrate = () => {
    if (currentPR) {
      celebratePR(currentPR.id);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      
      {currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          onDismiss={handleAchievementDismiss}
        />
      )}
      
      {currentPR && (
        <PRCelebrationNotification
          record={currentPR}
          onDismiss={handlePRDismiss}
          onCelebrate={handlePRCelebrate}
        />
      )}
    </View>
  );
}
