import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useMigrationStatus, useDataSummary } from '../../lib/migration';

interface MigrationStatusCardProps {
  onPress?: () => void;
}

const MigrationStatusCard: React.FC<MigrationStatusCardProps> = ({ onPress }) => {
  const { migrationStatus, isLoading: statusLoading } = useMigrationStatus();
  const { dataSummary, isLoading: summaryLoading } = useDataSummary();

  if (statusLoading || summaryLoading) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.loadingText}>Checking migration status...</Text>
      </View>
    );
  }

  if (!migrationStatus?.isRequired && migrationStatus?.isCompleted) {
    return (
      <View style={styles.completedCard}>
        <Text style={styles.completedTitle}>✅ Migration Complete</Text>
        <Text style={styles.completedSubtitle}>
          All data synced to cloud • {migrationStatus.completedAt ? new Date(migrationStatus.completedAt).toLocaleDateString() : 'Recently'}
        </Text>
      </View>
    );
  }

  if (migrationStatus?.isRequired) {
    const localDataCount = dataSummary ? Object.values(dataSummary.local).reduce((sum, count) => sum + count, 0) : 0;
    
    return (
      <TouchableOpacity style={styles.requiredCard} onPress={onPress}>
        <View style={styles.cardHeader}>
          <Text style={styles.requiredTitle}>⚠️ Migration Available</Text>
          <Text style={styles.itemCount}>{localDataCount} items</Text>
        </View>
        <Text style={styles.requiredSubtitle}>
          Tap to migrate your local data to the cloud for backup and sync
        </Text>
        <View style={styles.benefitsList}>
          <Text style={styles.benefit}>• Cloud backup & sync</Text>
          <Text style={styles.benefit}>• Enhanced analytics</Text>
          <Text style={styles.benefit}>• Social features</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  loadingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  loadingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#64748B',
  },
  completedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#15803D',
  },
  requiredCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requiredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  itemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredSubtitle: {
    fontSize: 14,
    color: '#A16207',
    marginBottom: 12,
    lineHeight: 20,
  },
  benefitsList: {
    marginTop: 8,
  },
  benefit: {
    fontSize: 12,
    color: '#A16207',
    marginBottom: 2,
  },
});

export default MigrationStatusCard;
