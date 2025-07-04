import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['#9E7FFF', '#7C3AED']}
                style={styles.statGradient}
              >
                <Ionicons name="barbell" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#f472b6', '#ec4899']}
                style={styles.statGradient}
              >
                <Ionicons name="time" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Minutes</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['#38bdf8', '#0ea5e9']}
                style={styles.statGradient}
              >
                <Ionicons name="flame" size={24} color="#FFFFFF" />
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Personal Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Records</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.emptyStateGradient}
            >
              <Ionicons name="trophy" size={48} color="#A3A3A3" />
              <Text style={styles.emptyStateTitle}>No records yet</Text>
              <Text style={styles.emptyStateText}>
                Complete workouts to start tracking your personal bests
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Body Measurements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Body Measurements</Text>
            <TouchableOpacity>
              <Ionicons name="add-circle" size={24} color="#9E7FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.measurementCard}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.measurementGradient}
            >
              <View style={styles.measurementRow}>
                <View style={styles.measurementItem}>
                  <Ionicons name="scale" size={20} color="#9E7FFF" />
                  <Text style={styles.measurementLabel}>Weight</Text>
                  <Text style={styles.measurementValue}>-- kg</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Ionicons name="fitness" size={20} color="#f472b6" />
                  <Text style={styles.measurementLabel}>Body Fat</Text>
                  <Text style={styles.measurementValue}>-- %</Text>
                </View>
              </View>
              <View style={styles.measurementRow}>
                <View style={styles.measurementItem}>
                  <Ionicons name="body" size={20} color="#38bdf8" />
                  <Text style={styles.measurementLabel}>Muscle Mass</Text>
                  <Text style={styles.measurementValue}>-- kg</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Ionicons name="heart" size={20} color="#ef4444" />
                  <Text style={styles.measurementLabel}>Resting HR</Text>
                  <Text style={styles.measurementValue}>-- bpm</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Progress Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Progress Photos</Text>
            <TouchableOpacity>
              <Ionicons name="camera" size={24} color="#9E7FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.emptyStateGradient}
            >
              <Ionicons name="camera" size={48} color="#A3A3A3" />
              <Text style={styles.emptyStateTitle}>No photos yet</Text>
              <Text style={styles.emptyStateText}>
                Take progress photos to track your transformation
              </Text>
              <TouchableOpacity style={styles.emptyStateButton}>
                <Text style={styles.emptyStateButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Workout Chart Placeholder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Frequency</Text>
          <View style={styles.chartCard}>
            <LinearGradient
              colors={['#1f2937', '#111827']}
              style={styles.chartGradient}
            >
              <View style={styles.chartPlaceholder}>
                <Ionicons name="bar-chart" size={48} color="#A3A3A3" />
                <Text style={styles.chartText}>Chart will appear here</Text>
                <Text style={styles.chartSubtext}>Complete workouts to see your progress</Text>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    backgroundColor: '#9E7FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#9E7FFF',
    fontFamily: 'Inter-Medium',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
    opacity: 0.9,
  },
  emptyState: {
    marginBottom: 8,
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#9E7FFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  measurementCard: {
    marginBottom: 8,
  },
  measurementGradient: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  measurementItem: {
    flex: 1,
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Medium',
    marginTop: 8,
  },
  measurementValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 8,
  },
  chartGradient: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2F2F2F',
  },
  chartPlaceholder: {
    alignItems: 'center',
  },
  chartText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
  },
  chartSubtext: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
});
