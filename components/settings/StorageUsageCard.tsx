import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  HardDrive, 
  Trash2, 
  RefreshCw,
  Database,
  Image as ImageIcon,
  Video,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface StorageData {
  total: number;
  used: number;
  workouts: number;
  progress: number;
  media: number;
  cache: number;
}

interface StorageUsageCardProps {
  onClearCache?: () => Promise<void>;
  onClearData?: () => Promise<void>;
}

export const StorageUsageCard: React.FC<StorageUsageCardProps> = ({
  onClearCache,
  onClearData,
}) => {
  const [storageData, setStorageData] = useState<StorageData>({
    total: 1000, // MB
    used: 245,
    workouts: 120,
    progress: 85,
    media: 30,
    cache: 10,
  });
  const [loading, setLoading] = useState(false);

  const formatSize = (sizeInMB: number): string => {
    if (sizeInMB >= 1000) {
      return `${(sizeInMB / 1000).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  const getUsagePercentage = (): number => {
    return (storageData.used / storageData.total) * 100;
  };

  const getUsageColor = (): string => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return DesignTokens.colors.error[500];
    if (percentage >= 70) return DesignTokens.colors.warning[500];
    return DesignTokens.colors.primary[500];
  };

  const handleClearCache = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Clear Cache',
      'This will clear temporary files and cached data. Your workouts and progress will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'default',
          onPress: async () => {
            try {
              setLoading(true);
              await onClearCache?.();
              // Simulate cache clearing
              setStorageData(prev => ({
                ...prev,
                used: prev.used - prev.cache,
                cache: 0,
              }));
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAllData = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your workouts, progress, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await onClearData?.();
              setStorageData({
                total: 1000,
                used: 0,
                workouts: 0,
                progress: 0,
                media: 0,
                cache: 0,
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const refreshStorageData = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1f2937', '#111827']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <HardDrive size={24} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.title}>Storage Usage</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshStorageData}
            disabled={loading}
          >
            <RefreshCw 
              size={20} 
              color={DesignTokens.colors.text.secondary}
              style={loading ? { transform: [{ rotate: '180deg' }] } : undefined}
            />
          </TouchableOpacity>
        </View>

        {/* Usage Overview */}
        <View style={styles.usageOverview}>
          <View style={styles.usageStats}>
            <Text style={styles.usageText}>
              {formatSize(storageData.used)} of {formatSize(storageData.total)} used
            </Text>
            <Text style={styles.usagePercentage}>
              {getUsagePercentage().toFixed(1)}% full
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                {
                  width: `${getUsagePercentage()}%`,
                  backgroundColor: getUsageColor(),
                }
              ]}
            />
          </View>
        </View>

        {/* Storage Breakdown */}
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Storage Breakdown</Text>
          
          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <Database size={16} color={DesignTokens.colors.success[500]} />
              <Text style={styles.breakdownLabel}>Workouts & Templates</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatSize(storageData.workouts)}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <TrendingUp size={16} color={DesignTokens.colors.warning[500]} />
              <Text style={styles.breakdownLabel}>Progress Data</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatSize(storageData.progress)}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <ImageIcon size={16} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.breakdownLabel}>Photos & Media</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatSize(storageData.media)}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <Video size={16} color={DesignTokens.colors.error[500]} />
              <Text style={styles.breakdownLabel}>Cache & Temp Files</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatSize(storageData.cache)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.clearCacheButton]}
            onPress={handleClearCache}
            disabled={loading || storageData.cache === 0}
          >
            <RefreshCw size={16} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.clearCacheText}>Clear Cache</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.clearDataButton]}
            onPress={handleClearAllData}
            disabled={loading}
          >
            <Trash2 size={16} color={DesignTokens.colors.error[500]} />
            <Text style={styles.clearDataText}>Clear All Data</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  gradient: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginLeft: DesignTokens.spacing[2],
  },
  refreshButton: {
    padding: DesignTokens.spacing[2],
  },
  usageOverview: {
    marginBottom: DesignTokens.spacing[4],
  },
  usageStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  usageText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  usagePercentage: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: DesignTokens.colors.neutral[800],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdown: {
    marginBottom: DesignTokens.spacing[4],
  },
  breakdownTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[3],
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[2],
  },
  breakdownValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[2],
  },
  clearCacheButton: {
    backgroundColor: `${DesignTokens.colors.primary[500]}20`,
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500],
  },
  clearCacheText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  clearDataButton: {
    backgroundColor: `${DesignTokens.colors.error[500]}20`,
    borderWidth: 1,
    borderColor: DesignTokens.colors.error[500],
  },
  clearDataText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.error[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
