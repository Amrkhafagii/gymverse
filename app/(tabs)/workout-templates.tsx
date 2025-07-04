import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Search, 
  Filter, 
  Clock, 
  Target, 
  Zap, 
  Users, 
  Star,
  ChevronRight,
  Dumbbell,
  Heart,
  Flame
} from 'lucide-react-native';
import { 
  WORKOUT_TEMPLATES, 
  WorkoutTemplate,
  getTemplatesByGoal,
  getTemplatesByDifficulty,
  getPopularTemplates,
  searchTemplates
} from '@/lib/data/workoutTemplates';

type FilterType = 'all' | 'strength' | 'weight_loss' | 'muscle_building' | 'endurance' | 'flexibility' | 'general_fitness';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function WorkoutTemplatesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<FilterType>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTemplates = useMemo(() => {
    let templates = WORKOUT_TEMPLATES;

    // Apply search filter
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery.trim());
    }

    // Apply goal filter
    if (selectedGoal !== 'all') {
      templates = templates.filter(template => template.goal === selectedGoal);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      templates = templates.filter(template => template.difficulty === selectedDifficulty);
    }

    return templates;
  }, [searchQuery, selectedGoal, selectedDifficulty]);

  const popularTemplates = getPopularTemplates(3);

  const handleTemplatePress = (template: WorkoutTemplate) => {
    router.push({
      pathname: '/template-preview',
      params: { templateId: template.id }
    });
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'strength': return <Dumbbell size={16} color="#FF6B35" />;
      case 'weight_loss': return <Flame size={16} color="#E74C3C" />;
      case 'muscle_building': return <Target size={16} color="#9B59B6" />;
      case 'endurance': return <Heart size={16} color="#3498DB" />;
      case 'flexibility': return <Zap size={16} color="#2ECC71" />;
      case 'general_fitness': return <Star size={16} color="#F39C12" />;
      default: return <Target size={16} color="#95A5A6" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#2ECC71';
      case 'intermediate': return '#F39C12';
      case 'advanced': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const goalFilters: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Star size={16} color="#fff" /> },
    { key: 'strength', label: 'Strength', icon: <Dumbbell size={16} color="#fff" /> },
    { key: 'weight_loss', label: 'Fat Loss', icon: <Flame size={16} color="#fff" /> },
    { key: 'muscle_building', label: 'Muscle', icon: <Target size={16} color="#fff" /> },
    { key: 'endurance', label: 'Endurance', icon: <Heart size={16} color="#fff" /> },
    { key: 'flexibility', label: 'Flexibility', icon: <Zap size={16} color="#fff" /> },
    { key: 'general_fitness', label: 'General', icon: <Users size={16} color="#fff" /> },
  ];

  const difficultyFilters: { key: DifficultyFilter; label: string }[] = [
    { key: 'all', label: 'All Levels' },
    { key: 'beginner', label: 'Beginner' },
    { key: 'intermediate', label: 'Intermediate' },
    { key: 'advanced', label: 'Advanced' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workout Templates</Text>
          <Text style={styles.subtitle}>Choose from expertly designed workouts</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search templates..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? "#FF6B35" : "#fff"} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filterTitle}>Goal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {goalFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    selectedGoal === filter.key && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedGoal(filter.key)}
                >
                  {filter.icon}
                  <Text style={[
                    styles.filterChipText,
                    selectedGoal === filter.key && styles.filterChipTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterTitle}>Difficulty</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {difficultyFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterChip,
                    selectedDifficulty === filter.key && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedDifficulty(filter.key)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedDifficulty === filter.key && styles.filterChipTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Popular Templates */}
        {!searchQuery && selectedGoal === 'all' && selectedDifficulty === 'all' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Popular Templates</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {popularTemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.popularCard}
                  onPress={() => handleTemplatePress(template)}
                >
                  <LinearGradient
                    colors={['#1f2937', '#111827']}
                    style={styles.popularCardGradient}
                  >
                    <Image source={{ uri: template.image_url }} style={styles.popularImage} />
                    <View style={styles.popularOverlay}>
                      <View style={styles.popularBadge}>
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.popularScore}>{template.popularity_score}</Text>
                      </View>
                    </View>
                    <View style={styles.popularContent}>
                      <Text style={styles.popularName}>{template.name}</Text>
                      <View style={styles.popularStats}>
                        <View style={styles.popularStat}>
                          <Clock size={12} color="#999" />
                          <Text style={styles.popularStatText}>{template.duration_minutes}min</Text>
                        </View>
                        <View style={styles.popularStat}>
                          <Flame size={12} color="#999" />
                          <Text style={styles.popularStatText}>{template.estimated_calories} cal</Text>
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Templates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Search Results (${filteredTemplates.length})` : 'All Templates'}
            </Text>
            {filteredTemplates.length > 0 && (
              <Text style={styles.resultsCount}>{filteredTemplates.length} templates</Text>
            )}
          </View>

          {filteredTemplates.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient
                colors={['#1f2937', '#111827']}
                style={styles.emptyStateGradient}
              >
                <Search size={48} color="#666" />
                <Text style={styles.emptyStateTitle}>No templates found</Text>
                <Text style={styles.emptyStateText}>
                  Try adjusting your search or filters
                </Text>
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedGoal('all');
                    setSelectedDifficulty('all');
                  }}
                >
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          ) : (
            filteredTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => handleTemplatePress(template)}
              >
                <LinearGradient
                  colors={['#1f2937', '#111827']}
                  style={styles.templateGradient}
                >
                  <Image source={{ uri: template.image_url }} style={styles.templateImage} />
                  <View style={styles.templateContent}>
                    <View style={styles.templateHeader}>
                      <View style={styles.templateTitleRow}>
                        <Text style={styles.templateName}>{template.name}</Text>
                        <ChevronRight size={20} color="#666" />
                      </View>
                      <View style={styles.templateBadges}>
                        <View style={styles.goalBadge}>
                          {getGoalIcon(template.goal)}
                          <Text style={styles.goalBadgeText}>
                            {template.goal.replace('_', ' ')}
                          </Text>
                        </View>
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: getDifficultyColor(template.difficulty) + '20' }
                        ]}>
                          <Text style={[
                            styles.difficultyText,
                            { color: getDifficultyColor(template.difficulty) }
                          ]}>
                            {template.difficulty}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.templateDescription} numberOfLines={2}>
                      {template.description}
                    </Text>

                    <View style={styles.templateStats}>
                      <View style={styles.templateStat}>
                        <Clock size={16} color="#999" />
                        <Text style={styles.templateStatText}>{template.duration_minutes} min</Text>
                      </View>
                      <View style={styles.templateStat}>
                        <Target size={16} color="#999" />
                        <Text style={styles.templateStatText}>{template.exercises.length} exercises</Text>
                      </View>
                      <View style={styles.templateStat}>
                        <Flame size={16} color="#999" />
                        <Text style={styles.templateStatText}>{template.estimated_calories} cal</Text>
                      </View>
                      <View style={styles.templateStat}>
                        <Star size={16} color="#FFD700" />
                        <Text style={styles.templateStatText}>{template.popularity_score}</Text>
                      </View>
                    </View>

                    {template.equipment_needed.length > 0 && (
                      <View style={styles.equipmentContainer}>
                        <Text style={styles.equipmentLabel}>Equipment:</Text>
                        <Text style={styles.equipmentText} numberOfLines={1}>
                          {template.equipment_needed.join(', ').replace(/_/g, ' ')}
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={styles.bottomSpacer} />
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
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    paddingVertical: 12,
  },
  filterButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#FF6B3520',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 12,
    marginTop: 8,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  filterChipTextActive: {
    color: '#fff',
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
  resultsCount: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
  },
  popularCard: {
    width: 200,
    marginRight: 16,
  },
  popularCardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  popularImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  popularOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularScore: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'Inter-Bold',
    marginLeft: 4,
  },
  popularContent: {
    padding: 12,
  },
  popularName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 8,
  },
  popularStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popularStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularStatText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  templateCard: {
    marginBottom: 16,
  },
  templateGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  templateImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  templateContent: {
    padding: 16,
  },
  templateHeader: {
    marginBottom: 12,
  },
  templateTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-Bold',
    flex: 1,
  },
  templateBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B3520',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  goalBadgeText: {
    fontSize: 12,
    color: '#FF6B35',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  templateDescription: {
    fontSize: 14,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    lineHeight: 20,
  },
  templateStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  templateStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateStatText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  equipmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginRight: 6,
  },
  equipmentText: {
    fontSize: 12,
    color: '#A3A3A3',
    fontFamily: 'Inter-Regular',
    flex: 1,
    textTransform: 'capitalize',
  },
  emptyState: {
    marginBottom: 8,
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearFiltersButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  bottomSpacer: {
    height: 100,
  },
});
