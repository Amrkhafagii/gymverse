import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface SettingsItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  type: 'navigation' | 'switch' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
  badge?: string;
}

interface SettingsGroupProps {
  title: string;
  items: SettingsItem[];
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  items,
}) => {
  const renderItem = (item: SettingsItem, index: number) => {
    const isLast = index === items.length - 1;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.item, isLast && styles.lastItem]}
        onPress={item.onPress}
        disabled={item.type === 'switch'}
        activeOpacity={item.type === 'switch' ? 1 : 0.7}
      >
        <View style={styles.itemContent}>
          {item.icon && (
            <View style={styles.iconContainer}>
              {item.icon}
            </View>
          )}
          
          <View style={styles.textContainer}>
            <Text style={[
              styles.itemTitle,
              item.destructive && styles.destructiveText
            ]}>
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            )}
          </View>

          <View style={styles.rightContainer}>
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
            
            {item.type === 'switch' && (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{ 
                  false: DesignTokens.colors.neutral[700], 
                  true: `${DesignTokens.colors.primary[500]}40` 
                }}
                thumbColor={item.value ? DesignTokens.colors.primary[500] : DesignTokens.colors.neutral[400]}
              />
            )}
            
            {item.type === 'navigation' && (
              <ChevronRight size={20} color={DesignTokens.colors.text.tertiary} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.groupTitle}>{title}</Text>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.groupContainer}
      >
        {items.map(renderItem)}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[6],
  },
  groupTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[3],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  groupContainer: {
    marginHorizontal: DesignTokens.spacing[5],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.base,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[4],
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${DesignTokens.colors.primary[500]}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: DesignTokens.spacing[3],
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[1],
  },
  destructiveText: {
    color: DesignTokens.colors.error[500],
  },
  itemSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
  },
  badge: {
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  badgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
});
