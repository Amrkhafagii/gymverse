/**
 * OfflineIndicator component
 * Shows offline status and provides manual sync controls
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Settings, 
  X,
  Database,
  Image as ImageIcon,
  Zap
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useOffline } from '@/contexts/OfflineContext';
import { Button } from './Button';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  showDetails?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  showDetails = false,
}) => {
  const { 
    isOnline, 
    isInitialized, 
    forceSync, 
    clearCache, 
    getSystemHealth 
  } = useOffline();
  
  const [showModal, setShowModal] = useState(false);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (isOnline || !isInitialized) return null;

  const handleShowDetails = async () => {
    setShowModal(true);
    setIsLoadingHealth(true);
    
    try {
      const health = await getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to get system health:', error);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await forceSync();
    } catch (error) {
      console.error('Force sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      // Refresh health data
      const health = await getSystemHealth();
      setSystemHealth(health);
    } catch (error) {
      console.error('Clear cache failed:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Main Indicator */}
      <View style={[
        styles.indicator,
        position === 'top' ? styles.topPosition : styles.bottomPosition
      ]}>
        <WifiOff size={16} color={DesignTokens.colors.text.primary} />
        <Text style={styles.indicatorText}>You're offline</Text>
        
        {showDetails && (
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleShowDetails}
          >
            <Settings size={16} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Details Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Offline Status</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <X size={24} color={DesignTokens.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Connection Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connection</Text>
              <View style={styles.statusCard}>
                <WifiOff size={24} color={DesignTokens.colors.error[500]} />
                <View style={styles.statusText}>
                  <Text style={styles.statusTitle}>Offline</Text>
                  <Text style={styles.statusDescription}>
                    You're currently offline. Data will sync when connection is restored.
                  </Text>
                </View>
              </View>
            </View>

            {/* System Health */}
            {isLoadingHealth ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={DesignTokens.colors.primary[500]} />
                <Text style={styles.loadingText}>Loading system status...</Text>
              </View>
            ) : systemHealth && (
              <>
                {/* Storage Status */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Local Storage</Text>
                  <View style={styles.statusCard}>
                    <Database size={24} color={DesignTokens.colors.success[500]} />
                    <View style={styles.statusText}>
                      <Text style={styles.statusTitle}>
                        {systemHealth.systems.storage?.pendingSyncOperations || 0} items pending sync
                      </Text>
                      <Text style={styles.statusDescription}>
                        {systemHealth.systems.storage?.unresolvedConflicts || 0} conflicts to resolve
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Media Cache Status */}
                {systemHealth.systems.mediaCache && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Media Cache</Text>
                    <View style={styles.statusCard}>
                      <ImageIcon size={24} color={DesignTokens.colors.primary[500]} />
                      <View style={styles.statusText}>
                        <Text style={styles.statusTitle}>
                          {systemHealth.systems.mediaCache.totalFiles} cached files
                        </Text>
                        <Text style={styles.statusDescription}>
                          {systemHealth.systems.mediaCache.totalSizeMB} MB used • 
                          {Math.round(systemHealth.systems.mediaCache.hitRate * 100)}% hit rate
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Background Tasks Status */}
                {systemHealth.systems.backgroundTasks && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Background Tasks</Text>
                    <View style={styles.statusCard}>
                      <Zap size={24} color={DesignTokens.colors.warning[500]} />
                      <View style={styles.statusText}>
                        <Text style={styles.statusTitle}>
                          {systemHealth.systems.backgroundTasks.totalExecutions} total executions
                        </Text>
                        <Text style={styles.statusDescription}>
                          {Math.round(systemHealth.systems.backgroundTasks.successRate * 100)}% success rate
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </>
            )}

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              
              <Button
                title={isSyncing ? "Syncing..." : "Force Sync"}
                onPress={handleForceSync}
                disabled={isSyncing}
                loading={isSyncing}
                icon={<RefreshCw size={20} color="#FFFFFF" />}
                style={styles.actionButton}
              />
              
              <Button
                title="Clear Media Cache"
                onPress={handleClearCache}
                variant="outline"
                icon={<ImageIcon size={20} color={DesignTokens.colors.primary[500]} />}
                style={styles.actionButton}
              />
            </View>

            {/* Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Offline Tips</Text>
              <View style={styles.tipsContainer}>
                <Text style={styles.tipText}>
                  • Your data is safely stored locally and will sync automatically when you're back online
                </Text>
                <Text style={styles.tipText}>
                  • Cached images and videos are available offline
                </Text>
                <Text style={styles.tipText}>
                  • Background sync will resume when connection is restored
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    left: DesignTokens.spacing[4],
    right: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.warning[500],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    ...DesignTokens.shadow.lg,
    zIndex: 1000,
  },
  
  topPosition: {
    top: 60, // Below status bar
  },
  
  bottomPosition: {
    bottom: 100, // Above tab bar
  },

  indicatorText: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },

  detailsButton: {
    padding: DesignTokens.spacing[1],
  },

  modalContainer: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border.primary,
  },

  modalTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },

  closeButton: {
    padding: DesignTokens.spacing[2],
  },

  modalContent: {
    flex: 1,
    padding: DesignTokens.spacing[4],
  },

  section: {
    marginBottom: DesignTokens.spacing[6],
  },

  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[3],
  },

  statusCard: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },

  statusText: {
    flex: 1,
  },

  statusTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },

  statusDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },

  loadingContainer: {
    alignItems: 'center',
    padding: DesignTokens.spacing[8],
  },

  loadingText: {
    marginTop: DesignTokens.spacing[3],
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },

  actionButton: {
    marginBottom: DesignTokens.spacing[3],
  },

  tipsContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    gap: DesignTokens.spacing[2],
  },

  tipText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
});
