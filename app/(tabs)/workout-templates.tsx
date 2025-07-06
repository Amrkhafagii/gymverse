import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  BookOpen,
  Star,
  TrendingUp,
  Crown,
  Download,
  Plus,
  Bookmark,
  Play,
  Award,
  Users,
  Zap,
  Clock,
  Target,
  Filter,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { WorkoutTemplateCard } from '@/components/workout/WorkoutTemplateCard';
import { TemplateFilterBar } from '@/components/workout/TemplateFilterBar';
import * as Haptics from 'expo-haptics';

// Mock workout template data - in real app, this would come from API/database
const WORKOUT_TEMPLATES = [
  {
    id: '1',
    name: 'Full Body Strength Builder',
    description: 'A comprehensive full-body workout designed to build strength and muscle mass. Perfect for intermediate lifters looking to progress.',
    creator: {
      name: 'Alex Johnson',
      avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      is_verified: true,
      is_premium: false,
    },
    difficulty_level: 'intermediate' as const,
    workout_type: 'strength',
    estimated_duration_minutes: 75,
    exercise_count: 8,
    equipment_needed: ['barbell', 'dumbbells', 'bench'],
    target_muscle_groups: ['chest', 'back', 'legs', 'shoulders'],
    rating: 4.8,
    total_ratings: 1247,
    downloads: 15420,
    is_premium: false,
    is_featured: true,
    tags: ['strength', 'muscle-building', 'compound'],
    preview_image_url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'HIIT Fat Burner',
    description: 'High-intensity interval training workout to maximize fat burn and improve cardiovascular fitness in minimal time.',
    creator: {
      name: 'Sarah Chen',
      avatar_url: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      is_verified: true,
      is_premium: true,
    },
    difficulty_level: 'advanced' as const,
    workout_type: 'hiit',
    estimated_duration_minutes: 30,
    exercise_count: 6,
    equipment_needed: [],
    target_muscle_groups: ['full_body'],
    rating: 4.9,
    total_ratings: 892,
    downloads: 8750,
    is_premium: true,
    is_featured: true,
    tags: ['hiit', 'fat-loss', 'bodyweight', 'cardio'],
    preview_image_url: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    created_at: '2024-01-18T14:30:00Z',
  },
  {
    id: '3',
    name: 'Beginner Push-Pull Split',
    description: 'Perfect introduction to split training. Alternates between pushing and pulling movements for balanced development.',
    creator: {
      name: 'Mike Rodriguez',
      avatar_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      is_verified: false,
      is_premium: false,
    },
    difficulty_level: 'beginner' as const,
    workout_type: 'strength',
    estimated_duration_minutes: 45,
    exercise_count: 6,
    equipment_needed: ['dumbbells'],
    target_muscle_groups: ['chest', 'back', 'shoulders', 'arms'],
    rating: 4.6,
    total_ratings: 634,
    downloads: 5230,
    is_premium: false,
    is_featured: false,
    tags: ['beginner', 'push-pull', 'split'],
    preview_image_url: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    created_at: '2024-01-12T09:15:00Z',
  },
  {
    id: '4',
    name: 'Yoga Flow for Athletes',
    description: 'Dynamic yoga sequence designed specifically for athletes to improve flexibility, balance, and recovery.',
    creator: {
      name: 'Emma Thompson',
      avatar_url: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      is_verified: true,
      is_premium: true,
    },
    difficulty_level: 'intermediate' as const,
    workout_type: 'flexibility',
    estimated_duration_minutes: 60,
    exercise_count: 12,
    equipment_needed: ['yoga_mat'],
    target_muscle_groups: ['full_body'],
    rating: 4.7,
    total_ratings: 456,
    downloads: 3420,
    is_premium: true,
    is_featured: false,
    tags: ['yoga', 'flexibility', 'recovery', 'athletes'],
    preview_image_url: 'https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    created_at: '2024-01-20T16:45:00Z',
  },
  {
    id: '5',
    name: 'Home Cardio Blast',
    description: 'No-equipment cardio workout that can be done anywhere. Great for busy schedules and travel.',
    creator: {
      name: 'David Kim',
      avatar_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      is_verified: false,
      is_premium: false,
    },
    difficulty_level: 'beginner' as const,
    workout_type: 'cardio',
    estimated_duration_minutes: 25,
    exercise_count: 8,
    equipment_needed: [],
    target_muscle_groups: ['full_body'],
    rating: 4.4,
    total_ratings: 789,
    downloads: 6890,
    is_premium: false,
    is_featured: false,
    tags: ['cardio', 'bodyweight', 'home', 'travel'],
    preview_image_url: 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    created_at: '2024-01-10T11:20:00Z',
  },
  {
    id: '6',
    name: 'Powerlifting Prep',
    description: 'Advanced powerlifting program focusing on the big three: squat, bench press, and deadlift. Includes accessory work.',
    creator: {
      name: 'Marcus Williams',
      avatar_url: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      is_verified: true,
      is_premium: true,
    },
    difficulty_level: 'advanced' as const,
    workout_type: 'strength',
    estimated_duration_minutes: 90,
    exercise_count: 5,
    equipment_needed: ['barbell', 'squat_rack', 'bench'],
    target_muscle_groups: ['legs', 'chest', 'back'],
    rating: 4.9,
    total_ratings: 312,
    downloads: 2150,
    is_premium: true,
    is_featured: true,
    tags: ['powerlifting', 'strength', 'competition'],
    preview_image_url: 'https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&dpr=2',
    created_at: '2024-01-22T08:00:00Z',
  },
];

type ViewMode = 'discover' | 'popular' | 'featured' | 'premium' | 'bookmarked' | 'downloaded' | 'all';

export default function WorkoutTemplatesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    workoutType?: string;
    difficulty?: string;
    duration?: string;
    equipment?: string[];
    muscleGroup?: string;
    isPremium?: boolean;
    isFeatured?: boolean;
    minRating?: number;
  }>({});
  const [bookmarkedTemplates, setBookmarkedTemplates] = useState<string[]>(['1', '4']);
  const [downloadedTemplates, setDownloadedTemplates] = useState<string[]>(['1', '3', '5']);

  // Mock personal stats - in real app, this would come from API/database
  const personalStats = {
    '1': { timesUsed: 8, lastUsed: '2024-01-20', averageRating: 4.5 },
    '3': { timesUsed: 3, lastUsed: '2024-01-18', averageRating: 4.0 },
    '5': { timesUsed: 12, lastUsed: '2024-01-19', averageRating: 4.2 },
  };

  const filterOptions = {
    workoutTypes: ['strength', 'cardio', 'hiit', 'flexibility', 'mixed'],
    difficulties: ['beginner', 'intermediate', 'advanced'],
    durations: ['quick', 'medium', 'long'],
    equipment: ['barbell', 'dumbbells', 'bench', 'yoga_mat', 'squat_rack', 'bodyweight'],
    muscleGroups: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full_body'],
  };

  const filteredTemplates = useMemo(() => {
    let templates = WORKOUT_TEMPLATES;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.creator.name.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filters
    if (filters.workoutType) {
      templates = templates.filter(t => t.workout_type === filters.workoutType);
    }

    if (filters.difficulty) {
      templates = templates.filter(t => t.difficulty_level === filters.difficulty);
    }

    if (filters.duration) {
      templates = templates.filter(t => {
        switch (filters.duration) {
          case 'quick': return t.estimated_duration_minutes < 30;
          case 'medium': return t.estimated_duration_minutes >= 30 && t.estimated_duration_minutes <= 60;
          case 'long': return t.estimated_duration_minutes > 60;
          default: return true;
        }
      });
    }

    if (filters.equipment && filters.equipment.length > 0) {
      templates = templates.filter(t => 
        filters.equipment!.some(eq => 
          eq === 'bodyweight' ? t.equipment_needed.length === 0 : t.equipment_needed.includes(eq)
        )
      );
    }

    if (filters.muscleGroup) {
      templates = templates.filter(t => t.target_muscle_groups.includes(filters.muscleGroup!));
    }

    if (filters.isPremium) {
      templates = templates.filter(t => t.is_premium);
    }

    if (filters.isFeatured) {
      templates = templates.filter(t => t.is_featured);
    }

    if (filters.minRating) {
      templates = templates.filter(t => t.rating >= filters.minRating!);
    }

    // Apply view mode filters
    switch (viewMode) {
      case 'popular':
        return templates.sort((a, b) => b.downloads - a.downloads);
      case 'featured':
        return templates.filter(t => t.is_featured);
      case 'premium':
        return templates.filter(t => t.is_premium);
      case 'bookmarked':
        return templates.filter(t => bookmarkedTemplates.includes(t.id));
      case 'downloaded':
        return templates.filter(t => downloadedTemplates.includes(t.id));
      case 'discover':
      case 'all':
      default:
        return templates.sort((a, b) => b.rating - a.rating);
    }
  }, [searchQuery, filters, viewMode, bookmarkedTemplates, downloadedTemplates]);

  const featuredTemplates = WORKOUT_TEMPLATES.filter(t => t.is_featured);
  const popularTemplates = WORKOUT_TEMPLATES.sort((a, b) => b.downloads - a.downloads).slice(0, 5);
  const premiumTemplates = WORKOUT_TEMPLATES.filter(t => t.is_premium);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleViewModeChange = async (mode: ViewMode) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(mode);
  };

  const handleTemplatePress = async (template: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/workout-detail',
      params: { templateId: template.id }
    });
  };

  const handleBookmark = async (templateId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setBookmarkedTemplates(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId);
      } else {
        return [...prev, templateId];
      }
    });
  };

  const handleDownload = async (templateId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    setDownloadedTemplates(prev => {
      if (!prev.includes(templateId)) {
        return [...prev, templateId];
      }
      return prev;
    });

    Alert.alert(
      'Template Downloaded',
      'Workout template has been saved to your device for offline use.',
      [{ text: 'OK' }]
    );
  };

  const handleShare = async (template: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Share Template',
      `Share "${template.name}" with others?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => console.log('Sharing template:', template.id) },
      ]
    );
  };

  const handleQuickStart = async (template: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      'Start Workout',
      `Start "${template.name}" now?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start', 
          onPress: () => router.push({
            pathname: '/workout-session',
            params: { templateId: template.id }
          })
        },
      ]
    );
  };

  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'discover': return 'Discover Templates';
      case 'popular': return 'Popular Templates';
      case 'featured': return 'Featured Templates';
      case 'premium': return 'Premium Templates';
      case 'bookmarked': return 'Bookmarked Templates';
      case 'downloaded': return 'Downloaded Templates';
      case 'all': return 'All Templates';
      default: return 'Workout Templates';
    }
  };

  const getViewModeDescription = () => {
    switch (viewMode) {
      case 'discover': return 'Curated workout templates for your fitness goals';
      case 'popular': return 'Most downloaded templates by the community';
      case 'featured': return `${featuredTemplates.length} editor's choice templates`;
      case 'premium': return `${premiumTemplates.length} premium templates available`;
      case 'bookmarked': return `${bookmarkedTemplates.length} saved templates`;
      case 'downloaded': return `${downloadedTemplates.length} offline templates`;
      case 'all': return `${WORKOUT_TEMPLATES.length} total templates`;
      default: return 'Explore our comprehensive template library';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <BookOpen size={28} color={DesignTokens.colors.primary[500]} />
            <View style={styles.headerText}>
              <Text style={styles.title}>Workout Templates</Text>
              <Text style={styles.subtitle}>{WORKOUT_TEMPLATES.length} templates</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.push('/create-workout')} 
            style={styles.headerButton}
          >
            <Plus size={20} color={DesignTokens.colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* View Mode Selector */}
        <View style={styles.viewModeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'discover', label: 'Discover', icon: <Star size={16} color="#fff" /> },
              { key: 'popular', label: 'Popular', icon: <TrendingUp size={16} color="#fff" /> },
              { key: 'featured', label: 'Featured', icon: <Award size={16} color="#fff" /> },
              { key: 'premium', label: 'Premium', icon: <Crown size={16} color="#fff" /> },
              { key: 'bookmarked', label: 'Saved', icon: <Bookmark size={16} color="#fff" /> },
              { key: 'downloaded', label: 'Downloaded', icon: <Download size={16} color="#fff" /> },
              { key: 'all', label: 'All', icon: <Filter size={16} color="#fff" /> },
            ].map((mode) => (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.viewModeTab,
                  viewMode === mode.key && styles.viewModeTabActive
                ]}
                onPress={() => handleViewModeChange(mode.key as ViewMode)}
              >
                {mode.icon}
                <Text style={[
                  styles.viewModeText,
                  viewMode === mode.key && styles.viewModeTextActive
                ]}>
                  {mode.label}
                </Text>
                {mode.key === 'bookmarked' && bookmarkedTemplates.length > 0 && (
                  <View style={styles.viewModeBadge}>
                    <Text style={styles.viewModeBadgeText}>{bookmarkedTemplates.length}</Text>
                  </View>
                )}
                {mode.key === 'downloaded' && downloadedTemplates.length > 0 && (
                  <View style={styles.viewModeBadge}>
                    <Text style={styles.viewModeBadgeText}>{downloadedTemplates.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* View Mode Info */}
        <View style={styles.viewModeInfo}>
          <Text style={styles.viewModeTitle}>{getViewModeTitle()}</Text>
          <Text style={styles.viewModeDescription}>{getViewModeDescription()}</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search and Filters */}
        <TemplateFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          filterOptions={filterOptions}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          resultCount={filteredTemplates.length}
        />

        {/* Discover Mode - Curated Content */}
        {viewMode === 'discover' && !searchQuery && Object.keys(filters).length === 0 && (
          <>
            {/* Featured Templates */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⭐ Featured Templates</Text>
                <TouchableOpacity onPress={() => handleViewModeChange('featured')}>
                  <Text style={styles.sectionAction}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {featuredTemplates.map((template) => (
                <WorkoutTemplateCard
                  key={template.id}
                  template={template}
                  variant="featured"
                  isBookmarked={bookmarkedTemplates.includes(template.id)}
                  isDownloaded={downloadedTemplates.includes(template.id)}
                  personalStats={personalStats[template.id as keyof typeof personalStats]}
                  onPress={() => handleTemplatePress(template)}
                  onBookmark={() => handleBookmark(template.id)}
                  onDownload={() => handleDownload(template.id)}
                  onShare={() => handleShare(template)}
                  onQuickStart={() => handleQuickStart(template)}
                />
              ))}
            </View>

            {/* Popular Templates */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🔥 Most Popular</Text>
                <TouchableOpacity onPress={() => handleViewModeChange('popular')}>
                  <Text style={styles.sectionAction}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {popularTemplates.map((template) => (
                  <WorkoutTemplateCard
                    key={template.id}
                    template={template}
                    variant="compact"
                    isBookmarked={bookmarkedTemplates.includes(template.id)}
                    isDownloaded={downloadedTemplates.includes(template.id)}
                    personalStats={personalStats[template.id as keyof typeof personalStats]}
                    onPress={() => handleTemplatePress(template)}
                    onBookmark={() => handleBookmark(template.id)}
                    onDownload={() => handleDownload(template.id)}
                    onShare={() => handleShare(template)}
                    onQuickStart={() => handleQuickStart(template)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Premium Templates */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👑 Premium Collection</Text>
                <TouchableOpacity onPress={() => handleViewModeChange('premium')}>
                  <Text style={styles.sectionAction}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {premiumTemplates.map((template) => (
                  <WorkoutTemplateCard
                    key={template.id}
                    template={template}
                    variant="minimal"
                    isBookmarked={bookmarkedTemplates.includes(template.id)}
                    isDownloaded={downloadedTemplates.includes(template.id)}
                    personalStats={personalStats[template.id as keyof typeof personalStats]}
                    onPress={() => handleTemplatePress(template)}
                    onBookmark={() => handleBookmark(template.id)}
                    onDownload={() => handleDownload(template.id)}
                    onShare={() => handleShare(template)}
                    onQuickStart={() => handleQuickStart(template)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Quick Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Template Library Stats</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.statGradient}>
                    <Users size={24} color="#FFFFFF" />
                    <Text style={styles.statValue}>
                      {WORKOUT_TEMPLATES.reduce((sum, t) => sum + t.downloads, 0).toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Total Downloads</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.statGradient}>
                    <Star size={24} color="#FFFFFF" />
                    <Text style={styles.statValue}>
                      {(WORKOUT_TEMPLATES.reduce((sum, t) => sum + t.rating, 0) / WORKOUT_TEMPLATES.length).toFixed(1)}
                    </Text>
                    <Text style={styles.statLabel}>Avg Rating</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.statGradient}>
                    <Crown size={24} color="#FFFFFF" />
                    <Text style={styles.statValue}>{premiumTemplates.length}</Text>
                    <Text style={styles.statLabel}>Premium</Text>
                  </LinearGradient>
                </View>
                
                <View style={styles.statCard}>
                  <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statGradient}>
                    <Download size={24} color="#FFFFFF" />
                    <Text style={styles.statValue}>{downloadedTemplates.length}</Text>
                    <Text style={styles.statLabel}>Downloaded</Text>
                  </LinearGradient>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Template List */}
        <View style={styles.section}>
          {viewMode !== 'discover' && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {getViewModeTitle()} ({filteredTemplates.length})
              </Text>
            </View>
          )}

          {filteredTemplates.length === 0 ? (
            <View style={styles.emptyState}>
              <LinearGradient colors={['#1f2937', '#111827']} style={styles.emptyStateGradient}>
                <BookOpen size={48} color={DesignTokens.colors.text.secondary} />
                <Text style={styles.emptyStateTitle}>
                  {viewMode === 'bookmarked' ? 'No bookmarked templates' :
                   viewMode === 'downloaded' ? 'No downloaded templates' :
                   'No templates found'}
                </Text>
                <Text style={styles.emptyStateText}>
                  {viewMode === 'bookmarked' ? 'Bookmark templates to see them here' :
                   viewMode === 'downloaded' ? 'Download templates for offline use' :
                   'Try adjusting your search or filters'}
                </Text>
                {viewMode !== 'bookmarked' && viewMode !== 'downloaded' && (
                  <TouchableOpacity 
                    style={styles.clearFiltersButton} 
                    onPress={() => {
                      setFilters({});
                      setSearchQuery('');
                    }}
                  >
                    <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </View>
          ) : (
            filteredTemplates.map((template) => (
              <WorkoutTemplateCard
                key={template.id}
                template={template}
                variant="default"
                isBookmarked={bookmarkedTemplates.includes(template.id)}
                isDownloaded={downloadedTemplates.includes(template.id)}
                personalStats={personalStats[template.id as keyof typeof personalStats]}
                onPress={() => handleTemplatePress(template)}
                onBookmark={() => handleBookmark(template.id)}
                onDownload={() => handleDownload(template.id)}
                onShare={() => handleShare(template)}
                onQuickStart={() => handleQuickStart(template)}
              />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.surface.primary,
  },
  header: {
    paddingHorizontal: DesignTokens.spacing[5],
    paddingTop: DesignTokens.spacing[2],
    paddingBottom: DesignTokens.spacing[4],
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: DesignTokens.spacing[3],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  headerButton: {
    padding: DesignTokens.spacing[2],
  },
  viewModeContainer: {
    marginBottom: DesignTokens.spacing[4],
  },
  viewModeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
    marginRight: DesignTokens.spacing[3],
    position: 'relative',
  },
  viewModeTabActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  viewModeText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    marginLeft: DesignTokens.spacing[2],
  },
  viewModeTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  viewModeBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: DesignTokens.colors.error[500],
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeBadgeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  viewModeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
  },
  viewModeTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  viewModeDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  sectionAction: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignTokens.spacing[3],
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  statGradient: {
    padding: DesignTokens.spacing[4],
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginTop: DesignTokens.spacing[2],
    fontFamily: 'SF Mono',
  },
  statLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: DesignTokens.spacing[1],
    textAlign: 'center',
  },
  emptyState: {
    marginBottom: DesignTokens.spacing[4],
  },
  emptyStateGradient: {
    padding: DesignTokens.spacing[8],
    borderRadius: DesignTokens.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignTokens.colors.neutral[800],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
    lineHeight: DesignTokens.typography.fontSize.base * 1.4,
  },
  clearFiltersButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[6],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.full,
  },
  clearFiltersButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
  },
  bottomPadding: {
    height: 100,
  },
});
