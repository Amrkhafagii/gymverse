import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { ProgressPhoto, PhotoComparison } from '@/types/progressPhoto';
import { DesignTokens } from '@/design-system/tokens';
import { 
  Calendar, 
  TrendingUp, 
  Weight, 
  Ruler, 
  MoreVertical,
  Share,
  Edit,
  Trash2,
  ArrowRight
} from 'lucide-react-native';

interface PhotoComparisonCardProps {
  beforePhoto: ProgressPhoto;
  afterPhoto: ProgressPhoto;
  comparison?: PhotoComparison;
  onCreateComparison?: (beforeId: string, afterId: string) => void;
  onShare?: (comparison: PhotoComparison) => void;
  onEdit?: (comparison: PhotoComparison) => void;
  onDelete?: (comparison: PhotoComparison) => void;
  showActions?: boolean;
}

export function PhotoComparisonCard({
  beforePhoto,
  afterPhoto,
  comparison,
  onCreateComparison,
  onShare,
  onEdit,
  onDelete,
  showActions = true,
}: PhotoComparisonCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateTimeDifference = () => {
    const beforeDate = new Date(beforePhoto.date);
    const afterDate = new Date(afterPhoto.date);
    const diffTime = Math.abs(afterDate.getTime() - beforeDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  const calculateWeightChange = () => {
    if (beforePhoto.weight && afterPhoto.weight) {
      const change = afterPhoto.weight - beforePhoto.weight;
      return {
        change,
        isPositive: change > 0,
        text: `${change > 0 ? '+' : ''}${change.toFixed(1)} lbs`
      };
    }
    return null;
  };

  const calculateMeasurementChanges = () => {
    if (!beforePhoto.measurements || !afterPhoto.measurements) return [];
    
    const changes: Array<{ name: string; change: number; text: string }> = [];
    
    Object.keys(beforePhoto.measurements).forEach(key => {
      const beforeValue = beforePhoto.measurements![key as keyof typeof beforePhoto.measurements];
      const afterValue = afterPhoto.measurements![key as keyof typeof afterPhoto.measurements];
      
      if (beforeValue && afterValue) {
        const change = afterValue - beforeValue;
        changes.push({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          change,
          text: `${change > 0 ? '+' : ''}${change.toFixed(1)}"`
        });
      }
    });
    
    return changes;
  };

  const handleMenuAction = (action: 'share' | 'edit' | 'delete') => {
    setShowMenu(false);
    
    if (!comparison) return;
    
    switch (action) {
      case 'share':
        onShare?.(comparison);
        break;
      case 'edit':
        onEdit?.(comparison);
        break;
      case 'delete':
        Alert.alert(
          'Delete Comparison',
          'Are you sure you want to delete this comparison?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(comparison) },
          ]
        );
        break;
    }
  };

  const handleCreateComparison = () => {
    if (onCreateComparison) {
      onCreateComparison(beforePhoto.id, afterPhoto.id);
    }
  };

  const weightChange = calculateWeightChange();
  const measurementChanges = calculateMeasurementChanges();
  const timeDifference = calculateTimeDifference();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {comparison?.title || 'Progress Comparison'}
          </Text>
          <View style={styles.timeContainer}>
            <Calendar size={14} color={DesignTokens.colors.text.secondary} />
            <Text style={styles.timeText}>{timeDifference} progress</Text>
          </View>
        </View>
        
        {showActions && (
          <View style={styles.actionsContainer}>
            {!comparison && onCreateComparison && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateComparison}
              >
                <Text style={styles.createButtonText}>Save Comparison</Text>
              </TouchableOpacity>
            )}
            
            {comparison && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowMenu(!showMenu)}
              >
                <MoreVertical size={20} color={DesignTokens.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Menu */}
      {showMenu && comparison && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuAction('share')}
          >
            <Share size={16} color={DesignTokens.colors.text.primary} />
            <Text style={styles.menuItemText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuAction('edit')}
          >
            <Edit size={16} color={DesignTokens.colors.text.primary} />
            <Text style={styles.menuItemText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleMenuAction('delete')}
          >
            <Trash2 size={16} color={DesignTokens.colors.error[500]} />
            <Text style={[styles.menuItemText, { color: DesignTokens.colors.error[500] }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Photos */}
      <View style={styles.photosContainer}>
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>Before</Text>
          <Image source={{ uri: beforePhoto.uri }} style={styles.photo} />
          <Text style={styles.photoDate}>{formatDate(beforePhoto.date)}</Text>
        </View>
        
        <View style={styles.arrowContainer}>
          <ArrowRight size={24} color={DesignTokens.colors.primary[500]} />
        </View>
        
        <View style={styles.photoSection}>
          <Text style={styles.photoLabel}>After</Text>
          <Image source={{ uri: afterPhoto.uri }} style={styles.photo} />
          <Text style={styles.photoDate}>{formatDate(afterPhoto.date)}</Text>
        </View>
      </View>

      {/* Stats */}
      {(weightChange || measurementChanges.length > 0) && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Changes</Text>
          
          {weightChange && (
            <View style={styles.statItem}>
              <Weight size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.statLabel}>Weight:</Text>
              <Text style={[
                styles.statValue,
                { color: weightChange.isPositive ? DesignTokens.colors.warning[500] : DesignTokens.colors.success[500] }
              ]}>
                {weightChange.text}
              </Text>
            </View>
          )}
          
          {measurementChanges.map((measurement, index) => (
            <View key={index} style={styles.statItem}>
              <Ruler size={16} color={DesignTokens.colors.text.secondary} />
              <Text style={styles.statLabel}>{measurement.name}:</Text>
              <Text style={[
                styles.statValue,
                { color: measurement.change > 0 ? DesignTokens.colors.warning[500] : DesignTokens.colors.success[500] }
              ]}>
                {measurement.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes */}
      {comparison?.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{comparison.notes}</Text>
        </View>
      )}

      {/* Progress Indicator */}
      <View style={styles.progressIndicator}>
        <TrendingUp size={16} color={DesignTokens.colors.success[500]} />
        <Text style={styles.progressText}>
          Keep up the great work! Consistency is key to achieving your goals.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[4],
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[1],
  },
  timeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  createButton: {
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.md,
  },
  createButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
  menuButton: {
    padding: DesignTokens.spacing[1],
  },
  menu: {
    position: 'absolute',
    top: 60,
    right: DesignTokens.spacing[4],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    minWidth: 120,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[3],
  },
  menuItemText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  photoSection: {
    flex: 1,
    alignItems: 'center',
  },
  photoLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[2],
  },
  photo: {
    width: 120,
    height: 160,
    borderRadius: DesignTokens.borderRadius.md,
    marginBottom: DesignTokens.spacing[2],
  },
  photoDate: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  arrowContainer: {
    paddingHorizontal: DesignTokens.spacing[3],
  },
  statsContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  statsTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[1],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    minWidth: 60,
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  notesContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  notesTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  notesText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.success[500] + '10',
    padding: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  progressText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
});
