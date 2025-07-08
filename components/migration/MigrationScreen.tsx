import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform
} from 'react-native';
import { useMigrationManager, useDataSummary } from '../../lib/migration';
import { MigrationProgress } from '../../lib/migration/dataMigration';

interface MigrationScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

const MigrationScreen: React.FC<MigrationScreenProps> = ({ onComplete, onSkip }) => {
  const { systemStatus, performMigration, createBackup, isLoading } = useMigrationManager();
  const { dataSummary, refreshSummary } = useDataSummary();
  
  const [migrationInProgress, setMigrationInProgress] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [migrationComplete, setMigrationComplete] = useState(false);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  const handleStartMigration = async () => {
    try {
      setMigrationInProgress(true);
      
      // Create backup first
      await createBackup();
      
      // Perform migration
      const result = await performMigration();
      
      if (result.success) {
        setMigrationComplete(true);
        Alert.alert(
          'Migration Complete!',
          `Successfully migrated:\n• ${result.migratedData.workouts} workouts\n• ${result.migratedData.achievements} achievements\n• ${result.migratedData.measurements} measurements\n• ${result.migratedData.photos} photos\n• ${result.migratedData.social} social posts`,
          [{ text: 'Continue', onPress: onComplete }]
        );
      } else {
        Alert.alert(
          'Migration Issues',
          `Migration completed with some issues:\n${result.errors.join('\n')}`,
          [
            { text: 'Continue Anyway', onPress: onComplete },
            { text: 'Retry', onPress: handleStartMigration }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Migration Failed',
        `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [
          { text: 'Retry', onPress: handleStartMigration },
          { text: 'Skip', onPress: onSkip }
        ]
      );
    } finally {
      setMigrationInProgress(false);
    }
  };

  const handleSkipMigration = () => {
    Alert.alert(
      'Skip Migration?',
      'Your local data will not be transferred to the cloud. You can migrate later from Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: onSkip, style: 'destructive' }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Checking migration status...</Text>
      </View>
    );
  }

  const hasLocalData = dataSummary && Object.values(dataSummary.local).some(count => count > 0);

  if (!hasLocalData) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to GymVerse!</Text>
          <Text style={styles.subtitle}>
            No local data found. You're ready to start your fitness journey!
          </Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onComplete}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Data Migration</Text>
        <Text style={styles.subtitle}>
          We found local data that can be migrated to the cloud for better sync and backup.
        </Text>

        {/* Data Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Local Data Found:</Text>
          {dataSummary && Object.entries(dataSummary.local).map(([key, count]) => (
            count > 0 && (
              <View key={key} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{formatDataType(key)}</Text>
                <Text style={styles.summaryCount}>{count} items</Text>
              </View>
            )
          ))}
        </View>

        {/* Migration Progress */}
        {migrationInProgress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>
              {migrationProgress?.step || 'Preparing migration...'}
            </Text>
            {migrationProgress && (
              <>
                {Platform.OS === 'android' ? (
                  <ProgressBarAndroid
                    styleAttr="Horizontal"
                    indeterminate={false}
                    progress={migrationProgress.progress / migrationProgress.total}
                    color="#3B82F6"
                  />
                ) : (
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(migrationProgress.progress / migrationProgress.total) * 100}%` }
                      ]} 
                    />
                  </View>
                )}
                <Text style={styles.progressText}>
                  {migrationProgress.progress} of {migrationProgress.total} steps
                </Text>
              </>
            )}
          </View>
        )}

        {/* System Status */}
        {systemStatus && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>System Status</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Migration Required:</Text>
              <Text style={[
                styles.statusValue,
                { color: systemStatus.migration.isRequired ? '#EF4444' : '#10B981' }
              ]}>
                {systemStatus.migration.isRequired ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Online Status:</Text>
              <Text style={[
                styles.statusValue,
                { color: systemStatus.sync.isOnline ? '#10B981' : '#EF4444' }
              ]}>
                {systemStatus.sync.isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Pending Changes:</Text>
              <Text style={styles.statusValue}>{systemStatus.sync.pendingChanges}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, migrationInProgress && styles.disabledButton]}
            onPress={handleStartMigration}
            disabled={migrationInProgress}
          >
            {migrationInProgress ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Start Migration</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, migrationInProgress && styles.disabledButton]}
            onPress={handleSkipMigration}
            disabled={migrationInProgress}
          >
            <Text style={styles.secondaryButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Migration Benefits:</Text>
          <Text style={styles.benefitItem}>• Automatic cloud backup</Text>
          <Text style={styles.benefitItem}>• Cross-device synchronization</Text>
          <Text style={styles.benefitItem}>• Enhanced analytics and insights</Text>
          <Text style={styles.benefitItem}>• Social features and sharing</Text>
          <Text style={styles.benefitItem}>• Data security and recovery</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const formatDataType = (key: string): string => {
  const typeMap: Record<string, string> = {
    'workout_history': 'Workouts',
    'user_achievements': 'Achievements',
    'measurements': 'Measurements',
    'progress_photos': 'Progress Photos',
    'social_posts': 'Social Posts'
  };
  return typeMap[key] || key;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#475569',
  },
  summaryCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: 16,
    color: '#475569',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  benefitsContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  benefitItem: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 24,
  },
});

export default MigrationScreen;
