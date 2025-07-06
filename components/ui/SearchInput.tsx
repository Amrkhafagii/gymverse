import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onClear,
  style,
  autoFocus = false,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Search size={20} color={DesignTokens.colors.text.tertiary} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={DesignTokens.colors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear || (() => onChangeText(''))}
        >
          <X size={18} color={DesignTokens.colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  searchIcon: {
    marginRight: DesignTokens.spacing[2],
  },
  input: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontFamily: DesignTokens.typography.fontFamily.primary,
  },
  clearButton: {
    padding: DesignTokens.spacing[1],
    marginLeft: DesignTokens.spacing[2],
  },
});
