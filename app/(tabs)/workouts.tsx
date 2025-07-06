import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Plus,
  Sparkles,
  Filter,
  Grid,
  List,
  TrendingUp,
  Clock,
  Target,
  Zap,
  Calendar,
  Award
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterChip } from '@/components/ui/FilterChip';
import { SmartSuggestionCard } from '@/components/ui/SmartSuggestionCard';
import { EnhancedTemplateCard } from '@/components/ui/EnhancedTemplateCard';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

interface SmartSuggestion {
  id: string;
  name: string;
  reason: string;
  duration: string;
  exercises: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  confidence: number;
  muscleGroups: string[];
}

interface WorkoutTemplate {
  id: number;
  name: string;
  description: string;
  duration: string;
  exercises: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  muscleGroups: string[];
  category: string;
  popularity?: number;
  isBookmarked?: boolean;
  completionRate?: number;
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Mock data - in real app, this would come from your data context
  const smartSuggestions: SmartSuggestion[] = [
    {
      id: '1',
      name: 'Upper Body Power',
      reason: 'Perfect for your Tuesday schedule and recent chest focus',
      duration: '45 min',
      exercises: 6,
      difficulty: 'Intermediate',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      confidence: 92,
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    },
    {
      id: '2',
      name: 'HIIT Cardio Blast',
      reason: 'Great for active recovery after yesterday\'s leg day',
      duration: '30 min',
      exercises: 8,
      difficulty: 'Beginner',
      image: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=400',
      confidence: 87,
      muscleGroups: ['Full Body', 'Cardio'],
    },
    {
      id: '3',
      name: 'Core & Stability',
      reason: 'Complement your strength training with core work',
      duration: '25 min',
      exercises: 5,
      difficulty: 'Intermediate',
      image: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400',
      confidence: 84,
      muscleGroups: ['Core', 'Stability'],
    },
  ];

  const workoutTemplates: WorkoutTemplate[] = [
    {
      id: 1,
      name: 'Push Day Power',
      description: 'Chest, shoulders, and triceps focused workout',
      duration: '45 min',
      exercises: 6,
      difficulty: 'Intermediate',
      image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      category: 'strength',
      popularity: 95,
      isBookmarked: true,
      completionRate: 87,
    },
    {
      id: 2,
      name: 'Pull Day Strength',
      description: 'Back and biceps muscle building routine',
      duration: '50 min',
      exercises: 7,
      difficulty: 'Advanced',
      image: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400',
      muscleGroups: ['Back', 'Biceps', 'Rear Delts'],
      category: 'strength',
      popularity: 89,
      isBookmarked: false,
      completionRate: 92,
    },
    {
      id: 3,
      name: 'Leg Day Beast',
      description: 'Complete lower body strength and power',
      duration: '55 min',
      exercises: 8,
      difficulty: 'Advanced',
      image: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=400',
      muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'],
      category: 'strength',
      popularity: 91,
      isBookmarked: true,
      completionRate: 78,
    },
    {
      id: 4,
      name: 'HIIT Cardio Burn',
      description: 'High-intensity interval training for fat loss',
      duration: '30 min',
      exercises: 10,
      difficulty: 'Intermediate',
      image: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400',
      muscleGroups: ['Full Body', 'Cardio'],
      category: 'cardio',
      popularity: 86,
      isBookmarked: false,
      completionRate: 94,
    },
    {
      id: 5,
      name: 'Core & Flexibility',
      description: 'Strengthen your core and improve mobility',
      duration: '35 min',
      exercises: 6,
      difficulty: 'Beginner',
      image: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400',
      muscleGroups: ['Core', 'Hip Flexors', 'Hamstrings'],
      category: 'flexibility',
      popularity: 73,
      isBookmarked: false,
      completionRate: 96,
    },
    {
      id: 6,
      name: 'Full Body Circuit',
      description: 'Complete workout targeting all muscle groups',
      duration: '40 min',
      exercises: 9,
      difficulty: 'Intermediate',
      image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400',
      muscleGroups: ['Full Body'],
      category: 'mixed',
      popularity: 82,
      isBookmarked: true,
      completionRate: 85,
    },
  ];

  const filters = [
    { id: 'all', label: 'All', count: workoutTemplates.length },
    { id: 'strength', label: 'Strength', count: workoutTemplates.filter(t => t.category === 'strength').length },
    { id: 'cardio', label: 'Cardio', count: workoutTemplates.filter(t => t.category === 'cardio').length },
    { id: 'flexibility', label: 'Flexibility', count: workoutTemplates.filter(t => t.category === 'flexibility').length },
    { id: 'mixed', label: 'Mixed', count: workoutTemplates.filter(t => t.category === 'mixed').length },
  ];

  const weeklyStats = [
    { 
      label: 'This Week', 
      value: '4', 
      unit: 'workouts', 
      icon: <Target size={20} color="#4ECDC4" />, 
      color: '#4ECDC4',
      trend: 'up' as const,
      trendValue: '+1'
    },
    { 
      label: 'Avg Duration', 
      value: '42', 
      unit: 'min', 
      icon: <Clock size={20} color="#45B7D1" />, 
      color: '#45B7D1',
      trend: 'up' as const,
      trendValue: '+5 min'
    },
    { 
      label: 'Streak', 
      value: '12', 
      unit: 'days', 
      icon: <Award size={20} color="#96CEB4" />, 
      color: '#96CEB4',
      trend: 'up' as const,
      trendValue: '+3'
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredTemplates = workoutTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.muscleGroups.some(group => 
                           group.toLowerCase().includes(searchQuery.toLowerCase())
                         );
    
    const matchesFilter = activeFilter === 'all' || template.category === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleTemplatePress = (template: WorkoutTemplate) => {
    router.push({
      pathname: '/(tabs)/workout-detail',
      params: { workoutId: template.id.toString() }
    });
  };

  const handleStartWorkout = (template: WorkoutTemplate) => {
    router.push({
      pathname: '/(tabs)/workout-session',
      params: { 
        templateId: template.id.toString(),
        workoutName: template.name 
      }
    });
  };

  const handleBookmarkToggle = (template: WorkoutTemplate) => {
    // In real app, this would update the bookmark status
    Alert.alert(
      template.isBookmarked ? 'Remove Bookmark' : 'Add Bookmark',
      `${template.isBookmarked ? 'Remove' : 'Add'} "${template.name}" ${template.isBookmarked ? 'from' : 'to'} bookmarks?`
    );
  };

  const handleSuggestionStart = (suggestion: SmartSuggestion) => {
    router.push({
      pathname: '/(tabs)/workout-session',
      params: { 
        suggestionId: suggestion.id,
        workoutName: suggestion.name 
      }
    });
  };

  const handleSuggestionCustomize = (suggestion: SmartSuggestion) => {
    router.push({
      pathname: '/workout-creator',
      params: { 
        baseTemplate: suggestion.id,
        workoutName: suggestion.name 
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Workouts</Text>
            <Text style={styles.subtitle}>Find your perfect training session</Text>
          </View>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => router.push('/workout-creator')}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Weekly Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            {weeklyStats.map((stat, index) => (
              <StatCard
                key={index}
                {...stat}
                variant="compact"
                onPress={() => router.push('/(tabs)/progress')}
              />
            ))}
          </View>
        </View>

        {/* Smart Suggestions */}
        {showSuggestions && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  <Sparkles size={20} color={DesignTokens.colors.primary[500]} /> AI Recommendations
                </Text>
                <Text style={styles.sectionSubtitle}>Personalized for your goals and schedule</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.suggestionsScroll}
            >
              {smartSuggestions.map((suggestion) => (
                <SmartSuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onStart={() => handleSuggestionStart(suggestion)}
                  onCustomize={() => handleSuggestionCustomize(suggestion)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickActions}>
            <Button
              title="Start Last Workout"
              variant="gradient"
              size="medium"
              onPress={() => router.push('/repeat-workout')}
              icon={<Zap size={20} color="#FFFFFF" />}
              style={styles.quickActionButton}
            />
            <Button
              title="Schedule Workout"
              variant="secondary"
              size="medium"
              onPress={() => router.push('/schedule-workout')}
              icon={<Calendar size={20} color={DesignTokens.colors.primary[500]} />}
              style={styles.quickActionButton}
            />
          </View>
        </View>

        {/* Template Browser */}
        <View style={styles.section}>
          <View style={styles.browserHeader}>
            <Text style={styles.sectionTitle}>Browse Templates</Text>
            <View style={styles.viewControls}>
              <TouchableOpacity
                style={[styles.viewButton, viewMode === 'grid' && styles.activeViewButton]}
                onPress={() => setViewMode('grid')}
              >
                <Grid size={18} color={viewMode === 'grid' ? '#FFFFFF' : DesignTokens.colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewButton, viewMode === 'list' && styles.activeViewButton]}
                onPress={() => setViewMode('list')}
              >
                <List size={18} color={viewMode === 'list' ? '#FFFFFF' : DesignTokens.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search and Filters */}
          <View style={styles.searchContainer}>
            <SearchInput
              placeholder="Search workouts, muscles, or exercises..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
            <TouchableOpacity style={styles.filterButton}>
              <Filter size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            {filters.map((filter) => (
              <FilterChip
                key={filter.id}
                label={filter.label}
                count={filter.count}
                active={activeFilter === filter.id}
                onPress={() => setActiveFilter(filter.id)}
              />
            ))}
          </ScrollView>

          {/* Templates */}
          {viewMode === 'grid' ? (
            <FlatList
              data={filteredTemplates}
              renderItem={({ item }) => (
                <EnhancedTemplateCard
                  template={item}
                  onPreview={() => handleTemplatePress(item)}
                  onStart={() => handleStartWorkout(item)}
                  onBookmark={() => handleBookmarkToggle(item)}
                  variant="grid"
                />
              )}
              numColumns={2}
              scrollEnabled={false}
              key="grid"
            />
          ) : (
            <View>
              {filteredTemplates.map((template) => (
                <EnhancedTemplateCard
                  key={template.id}
                  template={template}
                  onPreview={() => handleTemplatePress(template)}
                  onStart={() => handleStartWorkout(template)}
                  onBookmark={() => handleBookmarkToggle(template)}
                  variant="list"
                />
              ))}
            </View>
          )}

          {filteredTemplates.length === 0 && (
            <View style={styles.emptyState}>
              <TrendingUp size={48} color={DesignTokens.colors.text.tertiary} />
              <Text style={styles.emptyStateTitle}>No workouts found</Text>
              <Text style={styles.emptyStateText}>
                Try adjusting your search or filters to find the perfect workout
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[2],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['4xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  createButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadow.base,
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginBottom: DesignTokens.spacing[1],
  },
  sectionSubtitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  dismissText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  suggestionsScroll: {
    marginTop: DesignTokens.spacing[4],
  },
  quickActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginTop: DesignTokens.spacing[4],
  },
  quickActionButton: {
    flex: 1,
  },
  browserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  viewControls: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.md,
    padding: DesignTokens.spacing[1],
  },
  viewButton: {
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.sm,
  },
  activeViewButton: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  searchContainer: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
    marginBottom: DesignTokens.spacing[4],
  },
  searchInput: {
    flex: 1,
  },
  filterButton: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    padding: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  filtersScroll: {
    marginBottom: DesignTokens.spacing[4],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: DesignTokens.spacing[8],
  },
});
