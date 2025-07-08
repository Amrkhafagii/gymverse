import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Filter,
  X,
  Calendar,
  User,
  Hash,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  CheckCircle,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialPost } from '@/contexts/SocialContext';
import { FeedFilter, FeedSort } from '@/hooks/useSocialFeed';
import { Button } from '@/components/ui/Button';

interface SocialFeedFiltersProps {
  visible: boolean;
  onClose: () => void;
  currentFilter: FeedFilter;
  currentSort: FeedSort;
  onApplyFilter: (filter: FeedFilter) => void;
  onApplySort: (sort: FeedSort) => void;
  onClearFilters: () => void;
}

export function SocialFeedFilters({
  visible,
  onClose,
  currentFilter,
  currentSort,
  onApplyFilter,
  onApplySort,
  onClearFilters,
}: SocialFeedFiltersProps) {
  const [tempFilter, setTempFilter] = useState<FeedFilter>(currentFilter);
  const [tempSort, setTempSort] = useState<FeedSort>(currentSort);

  const postTypes: Array<{ value: SocialPost['type'] | 'all'; label: string; icon: string }> = [
    { value: 'all', label: 'All Posts', icon: '📱' },
    { value: 'workout_complete', label: 'Workouts', icon: '💪' },
    { value: 'achievement', label: 'Achievements', icon: '🏆' },
    { value: 'progress_photo', label: 'Progress', icon: '📸' },
    { value: 'milestone', label: 'Milestones', icon: '🎯' },
    { value: 'personal_record', label: 'Records', icon: '📈' },
    { value: 'text', label: 'Text Posts', icon: '💭' },
  ];

  const timeRanges: Array<{ value: FeedFilter['timeRange']; label: string }> = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  const sortOptions: Array<{ value: FeedSort['by']; label: string; icon: React.ComponentType<any> }> = [
    { value: 'timestamp', label: 'Recent', icon: Clock },
    { value: 'likes', label: 'Most Liked', icon: Heart },
    { value: 'comments', label: 'Most Discussed', icon: MessageCircle },
    { value: 'engagement', label: 'Most Engaging', icon: TrendingUp },
  ];

  const handleApply = () => {
    onApplyFilter(tempFilter);
    onApplySort(tempSort);
    onClose();
  };

  const handleClear = () => {
    const defaultFilter: FeedFilter = { type: 'all', timeRange: 'all' };
    const defaultSort: FeedSort = { by: 'timestamp', order: 'desc' };
    
    setTempFilter(defaultFilter);
    setTempSort(defaultSort);
    onClearFilters();
    onClose();
  };

  const hasActiveFilters = () => {
    return (
      tempFilter.type !== 'all' ||
      tempFilter.timeRange !== 'all' ||
      (tempFilter.users && tempFilter.users.length > 0) ||
      (tempFilter.tags && tempFilter.tags.length > 0)
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={DesignTokens.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter & Sort</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Type Filter */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Filter size={20} color={DesignTokens.colors.text.primary} />
              <Text style={styles.sectionTitle}>Post Type</Text>
            </View>
            <View style={styles.optionsGrid}>
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.option,
                    tempFilter.type === type.value && styles.optionActive
                  ]}
                  onPress={() => setTempFilter({ ...tempFilter, type: type.value })}
                >
                  <Text style={styles.optionIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.optionLabel,
                    tempFilter.type === type.value && styles.optionLabelActive
                  ]}>
                    {type.label}
                  </Text>
                  {tempFilter.type === type.value && (
                    <CheckCircle size={16} color={DesignTokens.colors.primary[500]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Range Filter */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={DesignTokens.colors.text.primary} />
              <Text style={styles.sectionTitle}>Time Range</Text>
            </View>
            <View style={styles.optionsGrid}>
              {timeRanges.map((range) => (
                <TouchableOpacity
                  key={range.value}
                  style={[
                    styles.option,
                    tempFilter.timeRange === range.value && styles.optionActive
                  ]}
                  onPress={() => setTempFilter({ ...tempFilter, timeRange: range.value })}
                >
                  <Text style={[
                    styles.optionLabel,
                    tempFilter.timeRange === range.value && styles.optionLabelActive
                  ]}>
                    {range.label}
                  </Text>
                  {tempFilter.timeRange === range.value && (
                    <CheckCircle size={16} color={DesignTokens.colors.primary[500]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={DesignTokens.colors.text.primary} />
              <Text style={styles.sectionTitle}>Sort By</Text>
            </View>
            <View style={styles.optionsGrid}>
              {sortOptions.map((sort) => {
                const IconComponent = sort.icon;
                return (
                  <TouchableOpacity
                    key={sort.value}
                    style={[
                      styles.option,
                      tempSort.by === sort.value && styles.optionActive
                    ]}
                    onPress={() => setTempSort({ ...tempSort, by: sort.value })}
                  >
                    <IconComponent 
                      size={16} 
                      color={tempSort.by === sort.value ? DesignTokens.colors.primary[500] : DesignTokens.colors.text.secondary} 
                    />
                    <Text style={[
                      styles.optionLabel,
                      tempSort.by === sort.value && styles.optionLabelActive
                    ]}>
                      {sort.label}
                    </Text>
                    {tempSort.by === sort.value && (
                      <CheckCircle size={16} color={DesignTokens.colors.primary[500]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Sort Order */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Order</Text>
            </View>
            <View style={styles.orderOptions}>
              <TouchableOpacity
                style={[
                  styles.orderOption,
                  tempSort.order === 'desc' && styles.orderOptionActive
                ]}
                onPress={() => setTempSort({ ...tempSort, order: 'desc' })}
              >
                <Text style={[
                  styles.orderOptionText,
                  tempSort.order === 'desc' && styles.orderOptionTextActive
                ]}>
                  Newest First
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.orderOption,
                  tempSort.order === 'asc' && styles.orderOptionActive
                ]}
                onPress={() => setTempSort({ ...tempSort, order: 'asc' })}
              >
                <Text style={[
                  styles.orderOptionText,
                  tempSort.order === 'asc' && styles.orderOptionTextActive
                ]}>
                  Oldest First
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Filters Summary */}
          {hasActiveFilters() && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Filters</Text>
              <View style={styles.activeFilters}>
                {tempFilter.type !== 'all' && (
                  <View style={styles.activeFilter}>
                    <Text style={styles.activeFilterText}>
                      Type: {postTypes.find(t => t.value === tempFilter.type)?.label}
                    </Text>
                  </View>
                )}
                {tempFilter.timeRange !== 'all' && (
                  <View style={styles.activeFilter}>
                    <Text style={styles.activeFilterText}>
                      Time: {timeRanges.find(t => t.value === tempFilter.timeRange)?.label}
                    </Text>
                  </View>
                )}
                <View style={styles.activeFilter}>
                  <Text style={styles.activeFilterText}>
                    Sort: {sortOptions.find(s => s.value === tempSort.by)?.label} ({tempSort.order === 'desc' ? 'Newest' : 'Oldest'})
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Apply Filters"
            onPress={handleApply}
            size="large"
            variant="primary"
          />
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  closeButton: {
    padding: DesignTokens.spacing[2],
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  clearButton: {
    padding: DesignTokens.spacing[2],
  },
  clearButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  section: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  optionsGrid: {
    gap: DesignTokens.spacing[2],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[3],
  },
  optionActive: {
    backgroundColor: DesignTokens.colors.primary[500] + '20',
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary[500],
  },
  optionIcon: {
    fontSize: 20,
  },
  optionLabel: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
  },
  optionLabelActive: {
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  orderOptions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  orderOption: {
    flex: 1,
    padding: DesignTokens.spacing[3],
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    alignItems: 'center',
  },
  orderOptionActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  orderOptionText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
  },
  orderOptionTextActive: {
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  activeFilters: {
    gap: DesignTokens.spacing[2],
  },
  activeFilter: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.sm,
    padding: DesignTokens.spacing[2],
  },
  activeFilterText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  footer: {
    padding: DesignTokens.spacing[5],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
});
