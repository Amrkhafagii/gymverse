import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Plus, TrendingUp, Users } from 'lucide-react-native';

interface QuickAction {
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface HomeQuickActionsSectionProps {
  quickActions: QuickAction[];
}

export default function HomeQuickActionsSection({ quickActions }: HomeQuickActionsSectionProps) {
  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.quickActionCard}>
            <LinearGradient
              colors={[action.color, `${action.color}CC`]}
              style={styles.quickActionGradient}>
              <action.icon size={28} color="#fff" />
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickActionCard: {
    width: '48%',
    marginBottom: 12,
  },
  quickActionGradient: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 8,
    textAlign: 'center',
  },
});