import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Smartphone, 
  Wifi, 
  Battery, 
  Cpu,
  HardDrive,
  Monitor,
  Copy,
  CheckCircle,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { useDeviceAuth } from '@/contexts/DeviceAuthContext';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export const DeviceInfoCard: React.FC = () => {
  const { user } = useDeviceAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const deviceInfo = {
    platform: Platform.OS,
    version: Platform.Version,
    screenWidth: Math.round(width),
    screenHeight: Math.round(height),
    deviceId: user?.deviceId || 'Unknown',
    model: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
    memory: '4 GB', // Simulated
    storage: '128 GB', // Simulated
  };

  const copyToClipboard = async (text: string, field: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // In a real app, you would use Clipboard API
    // await Clipboard.setStringAsync(text);
    
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDeviceId = (id: string): string => {
    if (id.length > 12) {
      return `${id.substring(0, 8)}...${id.substring(id.length - 4)}`;
    }
    return id;
  };

  const getDeviceIcon = () => {
    switch (Platform.OS) {
      case 'ios':
        return <Smartphone size={24} color={DesignTokens.colors.primary[500]} />;
      case 'android':
        return <Monitor size={24} color={DesignTokens.colors.success[500]} />;
      default:
        return <Cpu size={24} color={DesignTokens.colors.warning[500]} />;
    }
  };

  const getStatusColor = () => {
    return DesignTokens.colors.success[500]; // Always online in this context
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
            {getDeviceIcon()}
            <View style={styles.headerText}>
              <Text style={styles.title}>Device Information</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Device Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Smartphone size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.detailLabel}>Platform</Text>
            </View>
            <Text style={styles.detailValue}>
              {deviceInfo.platform} {deviceInfo.version}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Monitor size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.detailLabel}>Screen Size</Text>
            </View>
            <Text style={styles.detailValue}>
              {deviceInfo.screenWidth} × {deviceInfo.screenHeight}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Cpu size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.detailLabel}>Memory</Text>
            </View>
            <Text style={styles.detailValue}>{deviceInfo.memory}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <HardDrive size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.detailLabel}>Storage</Text>
            </View>
            <Text style={styles.detailValue}>{deviceInfo.storage}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <Wifi size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.detailLabel}>Device ID</Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(deviceInfo.deviceId, 'deviceId')}
            >
              <Text style={styles.deviceIdText}>
                {formatDeviceId(deviceInfo.deviceId)}
              </Text>
              {copiedField === 'deviceId' ? (
                <CheckCircle size={16} color={DesignTokens.colors.success[500]} />
              ) : (
                <Copy size={16} color={DesignTokens.colors.text.tertiary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Indicators */}
        <View style={styles.performance}>
          <Text style={styles.performanceTitle}>Performance</Text>
          
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Battery size={20} color={DesignTokens.colors.success[500]} />
              <Text style={styles.performanceLabel}>Battery</Text>
              <Text style={styles.performanceValue}>85%</Text>
            </View>

            <View style={styles.performanceItem}>
              <Cpu size={20} color={DesignTokens.colors.warning[500]} />
              <Text style={styles.performanceLabel}>CPU</Text>
              <Text style={styles.performanceValue}>45%</Text>
            </View>

            <View style={styles.performanceItem}>
              <HardDrive size={20} color={DesignTokens.colors.primary[500]} />
              <Text style={styles.performanceLabel}>Memory</Text>
              <Text style={styles.performanceValue}>62%</Text>
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>App Information</Text>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Version</Text>
            <Text style={styles.appInfoValue}>1.0.0</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Build</Text>
            <Text style={styles.appInfoValue}>2024.1.1</Text>
          </View>
          <View style={styles.appInfoRow}>
            <Text style={styles.appInfoLabel}>Last Updated</Text>
            <Text style={styles.appInfoValue}>
              {new Date().toLocaleDateString()}
            </Text>
          </View>
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
  headerText: {
    marginLeft: DesignTokens.spacing[3],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: DesignTokens.spacing[1],
  },
  statusText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  details: {
    marginBottom: DesignTokens.spacing[4],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginLeft: DesignTokens.spacing[2],
  },
  detailValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.tertiary,
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
    gap: DesignTokens.spacing[1],
  },
  deviceIdText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontFamily: 'monospace',
  },
  performance: {
    marginBottom: DesignTokens.spacing[4],
  },
  performanceTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[3],
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[3],
    marginHorizontal: DesignTokens.spacing[1],
  },
  performanceLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
    marginBottom: DesignTokens.spacing[1],
  },
  performanceValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  appInfo: {
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
    paddingTop: DesignTokens.spacing[4],
  },
  appInfoTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[3],
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  appInfoLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  appInfoValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
});
