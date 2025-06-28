import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Preference {
  label: string;
  value: string;
}

interface ProfilePreferencesSectionProps {
  preferences: Preference[];
  onPreferencePress: (index: number) => void;
}

export default function ProfilePreferencesSection({ 
  preferences, 
  onPreferencePress 
}: ProfilePreferencesSectionProps) {
  return (
    <View style={styles.preferencesContainer}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      {preferences.map((preference, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.preferenceItem}
          onPress={() => onPreferencePress(index)}
        >
          <Text style={styles.preferenceLabel}>{preference.label}</Text>
          <Text style={styles.preferenceValue}>{preference.value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  preferencesContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  preferenceItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
});