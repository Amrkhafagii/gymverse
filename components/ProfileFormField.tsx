import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface ProfileFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  characterCount?: boolean;
}

export default function ProfileFormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  maxLength,
  error,
  icon,
  helperText,
  characterCount = false,
}: ProfileFormFieldProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>
      
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      
      <View style={styles.footerContainer}>
        {helperText && <Text style={styles.helperText}>{helperText}</Text>}
        {characterCount && maxLength && (
          <Text style={styles.characterCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Inter-Medium',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#4A90E2',
    fontFamily: 'Inter-Regular',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
});