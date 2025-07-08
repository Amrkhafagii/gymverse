import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Filter,
  Calendar,
  Users,
  Trophy,
  Camera,
  Target,
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  RotateCcw,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialPost } from '@/contexts/SocialContext';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

export interface SocialFeedFilter {
  type: 'all' | 'workout_complete' | 'achievement' | 'progress_photo' | 'milestone' | 'personal_record' | 'text';
  timeRange: 'all' | 'today' | 'week' | 'month';
  users: 'all' | 'following' | 'friends';
  engagement: 'all' | 'popular' | 'recent';
  hasMedia: boolean | null;
}

export interface SocialFeedSort {
  by: 'timestamp' | 'likes' | 'comments' | 'engagement';
  order: 'asc' | 'desc';
}

interface SocialFeedFiltersProps {
  visible: boolean;
  onClose: () => void;
  currentFilter: SocialFeedFilter;
  currentSort: SocialFeedSort;
  onApplyFilter: (filter: SocialFeedFilter) => void;
  onApplySort: (sort: SocialFeedSort) => void;
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
  const [tempFilter, setTempFilter] = useState<SocialFeedFilter>(currentFilter);
  const [tempSort, setTempSort] = useState<SocialFeedSort>(currentSort);

  const handleApply = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApplyFilter(tempFilter);
    onApplySort(tempSort);
    onClose();
  };

  const handleClear = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const defaultFilter: SocialFeedFilter = {
      type: 'all',
      timeRange: 'all',
      users: 'all',
      engagement: 'all',
      hasMedia: null,
    };
    const defaultSort: SocialFeedSort = {
      by: 'timestamp',
      order: 'desc',
    };
    setTempFilter(defaultFilter);
    setTempSort(defaultSort);
    onClearFilters();
  };

  const postTypes = [
    { id: 'all', label: 'All Posts', icon: Filter },
    { id: 'workout_complete', label: 'Workouts', icon: Trophy },
    { id: 'achievement', label: 'Achievements', icon: Target },
    { id: 'progress_photo', label: 'Progress Photos', icon: Camera },
    { id: 'milestone', label: 'Milestones', icon: Target },
    { id: 'personal_record', label: 'Personal Records', icon: TrendingUp },
    { id: 'text', label: 'Text Posts', icon: MessageCircle },
  ];

  const timeRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const userFilters = [
    { id: 'all', label: 'Everyone' },
    { id: 'following', label: 'Following' },
    { id: 'friends', label: 'Friends Only' },
  ];

  const engagementFilters = [
    { id: 'all', label: 'All Posts' },
    { id: 'popular', label: 'Popular' },
    { id: 'recent', label: 'Recent' },
  ];

  const sortOptions = [
    { id: 'timestamp', label: 'Most Recent', icon: Clock },
    { id: 'likes', label: 'Most Liked', icon: Heart },
    { id: 'comments', label: 'Most Commented', icon: MessageCircle },
    { id: 'engagement', label: 'Most Engaging', icon: TrendingUp },
  ];

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterSectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const FilterOption = ({ 
    selected, 
    onPress, 
    children 
  }: { 
    selected: boolean; 
    onPress: () => void; 
    children: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.filterOption, selected && styles.filterOptionSelected]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );

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
            <RotateCcw size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Type Filter */}
          <FilterSection title="Post Type">
            <View style={styles.filterGrid}>
              {postTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <FilterOption
                    key={type.id}
                    selected={tempFilter.type === type.id}
                    onPress={() => setTempFilter({ ...tempFilter, type: type.id as any })}
                  >
                    <IconComponent 
                      size={16} 
                      color={tempFilter.type === type.id ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} 
                    />
                    <Text style={[
                      styles.filterOptionText,
                      tempFilter.type === type.id && styles.filterOptionTextSelected
                    ]}>
                      {type.label}
                    </Text>
                  </FilterOption>
                );
              })}
            </View>
          </FilterSection>

          {/* Time Range Filter */}
          <FilterSection title="Time Range">
            <View style={styles.filterRow}>
              {timeRanges.map((range) => (
                <FilterOption
                  key={range.id}
                  selected={tempFilter.timeRange === range.id}
                  onPress={() => setTempFilter({ ...tempFilter, timeRange: range.id as any })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    tempFilter.timeRange === range.id && styles.filterOptionTextSelected
                  ]}>
                    {range.label}
                  </Text>
                </FilterOption>
              ))}
            </View>
          </FilterSection>

          {/* User Filter */}
          <FilterSection title="Users">
            <View style={styles.filterRow}>
              {userFilters.map((user) => (
                <FilterOption
                  key={user.id}
                  selected={tempFilter.users === user.id}
                  onPress={() => setTempFilter({ ...tempFilter, users: user.id as any })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    tempFilter.users === user.id && styles.filterOptionTextSelected
                  ]}>
                    {user.label}
                  </Text>
                </FilterOption>
              ))}
            </View>
          </FilterSection>

          {/* Engagement Filter */}
          <FilterSection title="Engagement">
            <View style={styles.filterRow}>
              {engagementFilters.map((engagement) => (
                <FilterOption
                  key={engagement.id}
                  selected={tempFilter.engagement === engagement.id}
                  onPress={() => setTempFilter({ ...tempFilter, engagement: engagement.id as any })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    tempFilter.engagement === engagement.id && styles.filterOptionTextSelected
                  ]}>
                    {engagement.label}
                  </Text>
                </FilterOption>
              ))}
            </View>
          </FilterSection>

          {/* Media Filter */}
          <FilterSection title="Content">
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Posts with Media Only</Text>
              <Switch
                value={tempFilter.hasMedia === true}
                onValueChange={(value) => setTempFilter({ ...tempFilter, hasMedia: value ? true : null })}
                trackColor={{ false: DesignTokens.colors.neutral[700], true: DesignTokens.colors.primary[500] }}
                thumbColor="#FFFFFF"
              />
            </View>
          </FilterSection>

          {/* Sort Options */}
          <FilterSection title="Sort By">
            <View style={styles.filterGrid}>
              {sortOptions.map((sort) => {
                const IconComponent = sort.icon;
                return (
                  <FilterOption
                    key={sort.id}
                    selected={tempSort.by === sort.id}
                    onPress={() => setTempSort({ ...tempSort, by: sort.id as any })}
                  >
                    <IconComponent 
                      size={16} 
                      color={tempSort.by === sort.id ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} 
                    />
                    <Text style={[
                      styles.filterOptionText,
                      tempSort.by === sort.id && styles.filterOptionTextSelected
                    ]}>
                      {sort.label}
                    </Text>
                  </FilterOption>
                );
              })}
            </View>
          </FilterSection>

          {/* Sort Order */}
          <FilterSection title="Order">
            <View style={styles.filterRow}>
              <FilterOption
                selected={tempSort.order === 'desc'}
                onPress={() => setTempSort({ ...tempSort, order: 'desc' })}
              >
                <Text style={[
                  styles.filterOptionText,
                  tempSort.order === 'desc' && styles.filterOptionTextSelected
                ]}>
                  Descending
                </Text>
              </FilterOption>
              <FilterOption
                selected={tempSort.order === 'asc'}
                onPress={() => setTempSort({ ...tempSort, order: 'asc' })}
              >
                <Text style={[
                  styles.filterOptionText,
                  tempSort.order === 'asc' && styles.filterOptionTextSelected
                ]}>
                  Ascending
                </Text>
              </FilterOption>
            </View>
          </FilterSection>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Clear All"
            variant="secondary"
            size="medium"
            onPress={handleClear}
            style={styles.actionButton}
          />
          <Button
            title="Apply Filters"
            variant="primary"
            size="medium"
            onPress={handleApply}
            style={styles.actionButton}
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
  content: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  filterSection: {
    marginBottom: DesignTokens.spacing[6],
  },
  filterSectionTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[3],
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[2],
  },
  filterRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
    flexWrap: 'wrap',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterOptionSelected: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderColor: DesignTokens.colors.primary[400],
  },
  filterOptionText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  filterOptionTextSelected: {
    color: DesignTokens.colors.text.primary,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.md,
  },
  switchLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  actions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    padding: DesignTokens.spacing[5],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  actionButton: {
    flex: 1,
  },
});
