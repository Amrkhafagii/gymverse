/**
 * SyncStatusIndicator component
 * Shows current sync status with visual feedback
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Clock
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface SyncStatusIndicatorProps {
  variant?: 'compact' | 'detailed';
  showLastSync?: boolean;
  onPress?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  variant = 'compact',
  showLastSync = true,
  onPress,
}) => {
  const { syncStatus, forceSync } = useOfflineSync();

  const getStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <ActivityIndicator size="small" color={DesignTokens.colors.primary[500]} />;
    }

    if (!syncStatus.isOnline) {
      return <WifiOff size={16} color={DesignTokens.colors.error[500]} />;
    }

    if (syncStatus.error) {
      return <AlertCircle size={16} color={DesignTokens.colors.error[500]} />;
    }

    if (syncStatus.pendingOperations > 0) {
      return <Clock size={16} color={DesignTokens.colors.warning[500]} />;
    }

    return <CheckCircle size={16} color={DesignTokens.colors.success[500]} />;
  };

  const getStatusText = () => {
    if (syncStatus.isSyncing) {
      return syncStatus.currentOperation || 'Syncing...';
    }

    if (!syncStatus.isOnline) {
      return 'Offline';
    }

    if (syncStatus.error) {
      return 'Sync Error';
    }

    if (syncStatus.pendingOperations > 0) {
      return `${syncStatus.pendingOperations} pending`;
    }

    return 'Up to date';
  };

  const getStatusColor = () => {
    if (syncStatus.isSyncing) {
      return DesignTokens.colors.primary[500];
    }

    if (!syncStatus.isOnline || syncStatus.error) {
      return DesignTokens.colors.error[500];
    }

    if (syncStatus.pendingOperations > 0) {
      return DesignTokens.colors.warning[500];
    }

    return DesignTokens.colors.success[500];
  };

  const getLastSyncText = () => {
    if (!syncStatus.lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const diffMs = now.getTime() - syncStatus.lastSyncTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return syncStatus.lastSyncTime.toLocaleDateString();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (!syncStatus.isSyncing) {
      forceSync();
    }
  };

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={handlePress}
        disabled={syncStatus.isSyncing}
      >
        {getStatusIcon()}
        <Text style={[styles.compactText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.detailedContainer}
      onPress={handlePress}
      disabled={syncStatus.isSyncing}
    >
      <View style={styles.statusRow}>
        {getStatusIcon()}
        <View style={styles.statusTextContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          {showLastSync && (
            <Text style={styles.lastSyncText}>
              Last sync: {getLastSyncText()}
            </Text>
          )}
        </View>
        {!syncStatus.isSyncing && (
          <RefreshCw size={16} color={DesignTokens.colors.text.secondary} />
        )}
      </View>

      {/* Progress bar for syncing */}
      {syncStatus.isSyncing && syncStatus.syncProgress > 0 && (
        <View style={styles.progressContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${syncStatus.syncProgress}%` }
            ]} 
          />
        </View>
      )}

      {/* Error details */}
      {syncStatus.error && (
        <Text style={styles.errorText} numberOfLines={2}>
          {syncStatus.error}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
  },

  compactText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  detailedContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    ...DesignTokens.shadow.sm,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },

  statusTextContainer: {
    flex: 1,
  },

  statusText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },

  lastSyncText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },

  progressContainer: {
    marginTop: DesignTokens.spacing[3],
    height: 4,
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 2,
  },

  errorText: {
    marginTop: DesignTokens.spacing[2],
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.error[500],
    fontStyle: 'italic',
  },
});
