/**
 * Challenge List Component
 * Displays a list of challenges in various layouts
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Target, Filter, SortAsc } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { ChallengeCard } from './ChallengeCard';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'consistency' | 'volume' | 'frequency' | 'duration' | 'strength';
  duration: number;
  participants: number;
  progress?: number;
  target?: number;
  reward: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isParticipating?: boolean;
  createdBy: string;
  rules: string[];
}

interface ChallengeListProps {
  challenges: Challenge[];
  onChallengePress: (challengeId: string) => void;
  onJoinChallenge: (challengeId: string) => void;
  variant?: 'list' | 'grid' | 'compact';
  showFilters?: boolean;
  onFilterPress?: () => void;
  onSortPress?: () => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  onChallengePress,
  onJoinChallenge,
  variant = 'list',
  showFilters = false,
  onFilterPress,
  onSortPress,
}) => {
  const renderChallenge = ({ item }: { item: Challenge }) => {
    const cardVariant = variant === 'compact' ? 'compact' : 'default';
    
    return (
      <ChallengeCard
        challenge={item}
        onPress={() => onChallengePress(item.id)}
        variant={cardVariant}
        showJoinButton={!item.isParticipating}
        onJoinPress={() => onJoinChallenge(item.id)}
        style={variant === 'grid' ? styles.gridItem : styles.listItem}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Target size={48} color={DesignTokens.colors.text.secondary} />
      <Text style={styles.emptyTitle}>No Challenges Available</Text>
      <Text style={styles.emptyDescription}>
        Check back later for new challenges or create your own!
      </Text>
    </View>
  );

  const getNumColumns = () => {
    return variant === 'grid' ? 2 : 1;
  };

  const getItemLayout = (data: any, index: number) => {
    const itemHeight = variant === 'compact' ? 80 : variant === 'grid' ? 200 : 180;
    const itemSpacing = DesignTokens.spacing[3];
    
    return {
      length: itemHeight,
      offset: (itemHeight + itemSpacing) * index,
      index,
    };
  };

  return (
    <View style={styles.container}>
      {/* Header with Filters */}
      {showFilters && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {challenges.length} Challenge{challenges.length !== 1 ? 's' : ''}
          </Text>
          
          <View style={styles.headerActions}>
            {onFilterPress && (
              <TouchableOpacity style={styles.headerButton} onPress={onFilterPress}>
                <Filter size={16} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.headerButtonText}>Filter</Text>
              </TouchableOpacity>
            )}
            
            {onSortPress && (
              <TouchableOpacity style={styles.headerButton} onPress={onSortPress}>
                <SortAsc size={16} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.headerButtonText}>Sort</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Challenge List */}
      <FlatList
        data={challenges}
        renderItem={renderChallenge}
        keyExtractor={(item) => item.id}
        numColumns={getNumColumns()}
        key={variant} // Force re-render when variant changes
        contentContainerStyle={[
          styles.listContainer,
          challenges.length === 0 && styles.emptyListContainer,
        ]}
        columnWrapperStyle={variant === 'grid' ? styles.gridRow : undefined}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        getItemLayout={variant === 'compact' ? getItemLayout : undefined}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border.primary,
  },

  headerTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },

  headerActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },

  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    gap: DesignTokens.spacing[1],
  },

  headerButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  listContainer: {
    padding: DesignTokens.spacing[3],
  },

  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  listItem: {
    marginBottom: DesignTokens.spacing[3],
  },

  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing[2],
  },

  gridItem: {
    width: '48%',
    marginBottom: DesignTokens.spacing[3],
  },

  separator: {
    height: DesignTokens.spacing[2],
  },

  emptyContainer: {
    alignItems: 'center',
    padding: DesignTokens.spacing[8],
  },

  emptyTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },

  emptyDescription: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
