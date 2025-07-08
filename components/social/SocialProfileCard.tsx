import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MapPin,
  Calendar,
  Link,
  Shield,
  Star,
  Users,
  Trophy,
  Target,
  TrendingUp,
  Edit3,
  Share2,
  UserPlus,
  UserMinus,
  MessageCircle,
  MoreHorizontal,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import { SocialUser } from '@/contexts/SocialContext';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface SocialProfileCardProps {
  user: SocialUser;
  isCurrentUser?: boolean;
  onEdit?: () => void;
  onFollow?: () => void;
  onUnfollow?: () => void;
  onMessage?: () => void;
  onShare?: () => void;
  onMoreOptions?: () => void;
  variant?: 'full' | 'compact' | 'minimal';
}

export function SocialProfileCard({
  user,
  isCurrentUser = false,
  onEdit,
  onFollow,
  onUnfollow,
  onMessage,
  onShare,
  onMoreOptions,
  variant = 'full',
}: SocialProfileCardProps) {
  const handleActionPress = async (action: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{user.stats.posts}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{user.stats.followers.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{user.stats.following.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </View>
      {variant === 'full' && (
        <>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.workouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.achievements}</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </>
      )}
    </View>
  );

  const renderActions = () => {
    if (isCurrentUser) {
      return (
        <View style={styles.actionsContainer}>
          <Button
            title="Edit Profile"
            variant="secondary"
            size="medium"
            onPress={() => handleActionPress(onEdit!)}
            icon={<Edit3 size={16} color={DesignTokens.colors.primary[500]} />}
            style={styles.actionButton}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleActionPress(onShare!)}
          >
            <Share2 size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.actionsContainer}>
        <Button
          title={user.isFollowing ? 'Following' : 'Follow'}
          variant={user.isFollowing ? 'secondary' : 'primary'}
          size="medium"
          onPress={() => handleActionPress(user.isFollowing ? onUnfollow! : onFollow!)}
          icon={user.isFollowing ? 
            <UserMinus size={16} color={DesignTokens.colors.text.secondary} /> :
            <UserPlus size={16} color="#FFFFFF" />
          }
          style={styles.actionButton}
        />
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleActionPress(onMessage!)}
        >
          <MessageCircle size={20} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => handleActionPress(onMoreOptions!)}
        >
          <MoreHorizontal size={20} color={DesignTokens.colors.text.secondary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderBadges = () => {
    const badges = [];
    
    if (user.stats.followers > 1000) {
      badges.push({ icon: '🌟', label: 'Popular', color: '#f59e0b' });
    }
    if (user.stats.workouts > 100) {
      badges.push({ icon: '💪', label: 'Dedicated', color: '#10b981' });
    }
    if (user.stats.achievements > 20) {
      badges.push({ icon: '🏆', label: 'Achiever', color: '#8b5cf6' });
    }

    if (badges.length === 0) return null;

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.badgesContainer}
      >
        {badges.map((badge, index) => (
          <View key={index} style={[styles.badge, { borderColor: badge.color }]}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
            <Text style={styles.badgeLabel}>{badge.label}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  if (variant === 'minimal') {
    return (
      <View style={styles.minimalContainer}>
        <Image source={{ uri: user.avatar }} style={styles.minimalAvatar} />
        <View style={styles.minimalInfo}>
          <Text style={styles.minimalName}>{user.displayName}</Text>
          <Text style={styles.minimalUsername}>{user.username}</Text>
        </View>
        {!isCurrentUser && (
          <Button
            title={user.isFollowing ? 'Following' : 'Follow'}
            variant={user.isFollowing ? 'secondary' : 'primary'}
            size="small"
            onPress={() => handleActionPress(user.isFollowing ? onUnfollow! : onFollow!)}
          />
        )}
      </View>
    );
  }

  if (variant === 'compact') {
    return (
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <Image source={{ uri: user.avatar }} style={styles.compactAvatar} />
          <View style={styles.compactInfo}>
            <Text style={styles.compactName}>{user.displayName}</Text>
            <Text style={styles.compactUsername}>{user.username}</Text>
            {user.bio && (
              <Text style={styles.compactBio} numberOfLines={2}>
                {user.bio}
              </Text>
            )}
          </View>
        </View>
        {renderStats()}
        {renderActions()}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.statusIndicator} />
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            {user.stats.followers > 1000 && (
              <View style={styles.verifiedBadge}>
                <Shield size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
          <Text style={styles.username}>{user.username}</Text>
          
          {user.bio && (
            <Text style={styles.bio}>{user.bio}</Text>
          )}
          
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Calendar size={14} color={DesignTokens.colors.text.tertiary} />
              <Text style={styles.metadataText}>
                Joined {formatDistanceToNow(new Date(user.joinDate), { addSuffix: true })}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <TrendingUp size={14} color={DesignTokens.colors.text.tertiary} />
              <Text style={styles.metadataText}>
                Active {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Badges */}
      {renderBadges()}

      {/* Stats */}
      {renderStats()}

      {/* Actions */}
      {renderActions()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing[5],
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
    ...DesignTokens.shadow.lg,
  },
  compactContainer: {
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    marginHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
    ...DesignTokens.shadow.base,
  },
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[3],
  },
  header: {
    flexDirection: 'row',
    marginBottom: DesignTokens.spacing[4],
  },
  compactHeader: {
    flexDirection: 'row',
    marginBottom: DesignTokens.spacing[3],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: DesignTokens.spacing[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: DesignTokens.colors.primary[500],
  },
  compactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: DesignTokens.spacing[3],
  },
  minimalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: DesignTokens.colors.surface.primary,
  },
  userInfo: {
    flex: 1,
  },
  compactInfo: {
    flex: 1,
  },
  minimalInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[1],
  },
  displayName: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginRight: DesignTokens.spacing[2],
  },
  compactName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  minimalName: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
  },
  verifiedBadge: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[2],
  },
  compactUsername: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  minimalUsername: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  bio: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[3],
  },
  compactBio: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
    marginTop: DesignTokens.spacing[1],
  },
  metadata: {
    gap: DesignTokens.spacing[2],
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  metadataText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.tertiary,
  },
  badgesContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    marginRight: DesignTokens.spacing[2],
    gap: DesignTokens.spacing[1],
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: DesignTokens.spacing[4],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
    marginBottom: DesignTokens.spacing[4],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize.xl,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[3],
  },
  actionButton: {
    flex: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DesignTokens.colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
