import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface SettingsSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  icon,
  rightElement,
  onPress,
  disabled = false,
  destructive = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.item,
        disabled && styles.itemDisabled,
        destructive && styles.itemDestructive,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        {icon && (
          <View style={styles.itemIcon}>
            {icon}
          </View>
        )}
        <View style={styles.itemContent}>
          <Text style={[
            styles.itemTitle,
            disabled && styles.itemTitleDisabled,
            destructive && styles.itemTitleDestructive,
          ]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.itemSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.itemRight}>
        {rightElement || (
          onPress && <ChevronRight size={20} color={DesignTokens.colors.text.tertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: DesignTokens.spacing[6],
  },
  header: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[3],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
  },
  content: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    marginHorizontal: DesignTokens.spacing[5],
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemDestructive: {
    backgroundColor: `${DesignTokens.colors.error[500]}10`,
  },
  itemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: DesignTokens.spacing[3],
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginBottom: DesignTokens.spacing[1],
  },
  itemTitleDisabled: {
    color: DesignTokens.colors.text.tertiary,
  },
  itemTitleDestructive: {
    color: DesignTokens.colors.error[500],
  },
  itemSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 18,
  },
  itemRight: {
    marginLeft: DesignTokens.spacing[3],
  },
});
