import React, { useState } from 'react';
import { AchievementNotificationManager } from './AchievementNotificationManager';
import { AchievementCelebration } from './AchievementCelebration';
import { AchievementToast } from './AchievementToast';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';

export function AchievementNotificationProvider({ children }: { children: React.ReactNode }) {
  const {
    currentNotification,
    markNotificationShown,
    dismissNotification,
  } = useAchievementNotifications();

  const [showCelebration, setShowCelebration] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);

  React.useEffect(() => {
    if (currentNotification) {
      switch (currentNotification.type) {
        case 'celebration':
          setShowCelebration(true);
          break;
        case 'toast':
          setShowToast(true);
          break;
        case 'modal':
          setShowModal(true);
          break;
      }
    }
  }, [currentNotification]);

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    if (currentNotification) {
      markNotificationShown(currentNotification.id);
    }
  };

  const handleToastDismiss = () => {
    setShowToast(false);
    if (currentNotification) {
      markNotificationShown(currentNotification.id);
    }
  };

  const handleToastPress = () => {
    setShowToast(false);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (currentNotification) {
      markNotificationShown(currentNotification.id);
    }
  };

  return (
    <>
      {children}
      
      {/* Notification Manager - handles the queue and basic notifications */}
      <AchievementNotificationManager />
      
      {/* Full-screen celebration for legendary achievements */}
      {currentNotification && showCelebration && (
        <AchievementCelebration
          achievement={currentNotification.achievement}
          visible={showCelebration}
          onComplete={handleCelebrationComplete}
        />
      )}
      
      {/* Toast notification for common/rare achievements */}
      {currentNotification && showToast && (
        <AchievementToast
          achievement={currentNotification.achievement}
          visible={showToast}
          onPress={handleToastPress}
          onDismiss={handleToastDismiss}
          duration={4000}
        />
      )}
    </>
  );
}
