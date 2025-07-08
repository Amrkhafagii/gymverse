import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ProgressPhotoProvider, useProgressPhotoContext } from '@/contexts/ProgressPhotoContext';
import { AddPhotoModal } from '@/components/photos/AddPhotoModal';
import { PhotoComparisonCard } from '@/components/photos/PhotoComparisonCard';
import { DesignTokens } from '@/design-system/tokens';
import { 
  Camera, 
  Image as ImageIcon, 
  Grid, 
  Calendar, 
  TrendingUp, 
  Plus,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react-native';
import { PhotoCategory } from '@/types/progressPhoto';

type TabType = 'gallery' | 'comparisons' | 'insights' | 'timeline';

function MeasurementsContent() {
  const {
    photos,
    comparisons,
    insights,
    isLoading,
    error,
    addPhoto,
    createComparison,
    getPhotosByCategory,
    refreshData,
    clearError,
  } = useProgressPhotoContext();

  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleAddPhoto = async (
    imageUri: string,
    category: PhotoCategory,
    notes?: string,
    weight?: number,
    measurements?: any,
    tags?: string[]
  ) => {
    try {
      await addPhoto(imageUri, category, notes, weight, measurements, tags);
      Alert.alert('Success', 'Progress photo added successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to add photo. Please try again.');
    }
  };

  const handleCreateComparison = async (beforeId: string, afterId: string) => {
    try {
      await createComparison(beforeId, afterId, 'Progress Comparison');
      Alert.alert('Success', 'Comparison created successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to create comparison. Please try again.');
    }
  };

  const getFilteredPhotos = () => {
    if (selectedCategory === 'all') return photos;
    return getPhotosByCategory(selectedCategory);
  };

  const TabButton = ({ tab, label, icon }: { tab: TabType; label: string; icon: React.ReactNode }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.tabButtonActive
      ]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.tabButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CategoryButton = ({ category, label }: { category: PhotoCategory | 'all'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category && styles.categoryButtonTextActive
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderGalleryContent = () => {
    const filteredPhotos = getFilteredPhotos();

    return (
      <ScrollView 
        style={styles.galleryContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryFilters}>
              <CategoryButton category="all" label="All" />
              <CategoryButton category="front" label="Front" />
              <CategoryButton category="side" label="Side" />
              <CategoryButton category="back" label="Back" />
              <CategoryButton category="progress" label="Progress" />
              <CategoryButton category="workout" label="Workout" />
            </View>
          </ScrollView>
        </View>

        {/* Photos Grid */}
        {filteredPhotos.length === 0 ? (
          <View style={styles.emptyState}>
            <Camera size={48} color={DesignTokens.colors.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No Photos Yet</Text>
            <Text style={styles.emptyStateText}>
              Start documenting your fitness journey by adding your first progress photo
            </Text>
            <TouchableOpacity
              style={styles.addFirstPhotoButton}
              onPress={() => setShowAddModal(true)}
            >
              <Plus size={20} color={DesignTokens.colors.text.primary} />
              <Text style={styles.addFirstPhotoText}>Add First Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photosGrid}>
            {filteredPhotos.map((photo) => (
              <TouchableOpacity key={photo.id} style={styles.photoCard}>
                <ImageIcon size={120} color={DesignTokens.colors.text.tertiary} />
                <Text style={styles.photoDate}>
                  {new Date(photo.date).toLocaleDateString()}
                </Text>
                <Text style={styles.photoCategory}>{photo.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderComparisonsContent = () => (
    <ScrollView 
      style={styles.comparisonsContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {comparisons.length === 0 ? (
        <View style={styles.emptyState}>
          <TrendingUp size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No Comparisons Yet</Text>
          <Text style={styles.emptyStateText}>
            Create before/after comparisons to track your visual progress over time
          </Text>
        </View>
      ) : (
        <View style={styles.comparisonsList}>
          {comparisons.map((comparison) => (
            <PhotoComparisonCard
              key={comparison.id}
              beforePhoto={comparison.beforePhoto}
              afterPhoto={comparison.afterPhoto}
              comparison={comparison}
              onShare={(comp) => console.log('Share comparison:', comp.id)}
              onEdit={(comp) => console.log('Edit comparison:', comp.id)}
              onDelete={(comp) => console.log('Delete comparison:', comp.id)}
            />
          ))}
        </View>
      )}

      {/* Suggested Comparisons */}
      {photos.length >= 2 && (
        <View style={styles.suggestedSection}>
          <Text style={styles.suggestedTitle}>Suggested Comparisons</Text>
          <Text style={styles.suggestedSubtitle}>
            Based on your photos, here are some comparisons you might want to create
          </Text>
          
          {/* Example suggested comparison */}
          {photos.length >= 2 && (
            <PhotoComparisonCard
              beforePhoto={photos[1]}
              afterPhoto={photos[0]}
              onCreateComparison={handleCreateComparison}
            />
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderInsightsContent = () => (
    <ScrollView 
      style={styles.insightsContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {insights.length === 0 ? (
        <View style={styles.emptyState}>
          <TrendingUp size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No Insights Yet</Text>
          <Text style={styles.emptyStateText}>
            Add more progress photos to unlock personalized insights about your journey
          </Text>
        </View>
      ) : (
        <View style={styles.insightsList}>
          {insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>{insight.description}</Text>
              {insight.recommendation && (
                <Text style={styles.insightRecommendation}>
                  💡 {insight.recommendation}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderTimelineContent = () => (
    <ScrollView 
      style={styles.timelineContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {photos.length === 0 ? (
        <View style={styles.emptyState}>
          <Calendar size={48} color={DesignTokens.colors.text.tertiary} />
          <Text style={styles.emptyStateTitle}>No Timeline Yet</Text>
          <Text style={styles.emptyStateText}>
            Your photo timeline will appear here as you add progress photos
          </Text>
        </View>
      ) : (
        <View style={styles.timelineList}>
          {photos.map((photo, index) => (
            <View key={photo.id} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              {index < photos.length - 1 && <View style={styles.timelineLine} />}
              <View style={styles.timelineContent}>
                <Text style={styles.timelineDate}>
                  {new Date(photo.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <View style={styles.timelinePhotoCard}>
                  <ImageIcon size={60} color={DesignTokens.colors.text.tertiary} />
                  <View style={styles.timelinePhotoInfo}>
                    <Text style={styles.timelinePhotoCategory}>{photo.category}</Text>
                    {photo.notes && (
                      <Text style={styles.timelinePhotoNotes}>{photo.notes}</Text>
                    )}
                    {photo.weight && (
                      <Text style={styles.timelinePhotoWeight}>
                        Weight: {photo.weight} lbs
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'gallery':
        return renderGalleryContent();
      case 'comparisons':
        return renderComparisonsContent();
      case 'insights':
        return renderInsightsContent();
      case 'timeline':
        return renderTimelineContent();
      default:
        return renderGalleryContent();
    }
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={clearError}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress Photos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={20} color={DesignTokens.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabButtons}>
            <TabButton
              tab="gallery"
              label="Gallery"
              icon={<Grid size={18} color={activeTab === 'gallery' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
            />
            <TabButton
              tab="comparisons"
              label="Compare"
              icon={<TrendingUp size={18} color={activeTab === 'comparisons' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
            />
            <TabButton
              tab="insights"
              label="Insights"
              icon={<TrendingUp size={18} color={activeTab === 'insights' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
            />
            <TabButton
              tab="timeline"
              label="Timeline"
              icon={<Calendar size={18} color={activeTab === 'timeline' ? DesignTokens.colors.text.primary : DesignTokens.colors.text.secondary} />}
            />
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Add Photo Modal */}
      <AddPhotoModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPhoto}
      />
    </SafeAreaView>
  );
}

export default function MeasurementsScreen() {
  return (
    <ProgressPhotoProvider>
      <MeasurementsContent />
    </ProgressPhotoProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignTokens.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  headerTitle: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
  },
  addButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: DesignTokens.borderRadius.full,
    padding: DesignTokens.spacing[3],
  },
  tabContainer: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  tabButtons: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    paddingVertical: DesignTokens.spacing[2],
    gap: DesignTokens.spacing[1],
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  tabButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  tabButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  galleryContainer: {
    flex: 1,
  },
  filterContainer: {
    paddingVertical: DesignTokens.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.neutral[800],
  },
  categoryFilters: {
    flexDirection: 'row',
    paddingHorizontal: DesignTokens.spacing[5],
    gap: DesignTokens.spacing[2],
  },
  categoryButton: {
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  categoryButtonActive: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  categoryButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: DesignTokens.colors.text.primary,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: DesignTokens.spacing[5],
    gap: DesignTokens.spacing[3],
  },
  photoCard: {
    width: '48%',
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoDate: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[2],
  },
  photoCategory: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
    textTransform: 'capitalize',
  },
  comparisonsContainer: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  comparisonsList: {
    gap: DesignTokens.spacing[4],
  },
  suggestedSection: {
    marginTop: DesignTokens.spacing[6],
    paddingTop: DesignTokens.spacing[6],
    borderTopWidth: 1,
    borderTopColor: DesignTokens.colors.neutral[800],
  },
  suggestedTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[1],
  },
  suggestedSubtitle: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[4],
  },
  insightsContainer: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  insightsList: {
    gap: DesignTokens.spacing[4],
  },
  insightCard: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  insightDescription: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    lineHeight: 20,
    marginBottom: DesignTokens.spacing[2],
  },
  insightRecommendation: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.warning[500],
    fontStyle: 'italic',
  },
  timelineContainer: {
    flex: 1,
    padding: DesignTokens.spacing[5],
  },
  timelineList: {
    gap: DesignTokens.spacing[4],
  },
  timelineItem: {
    flexDirection: 'row',
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DesignTokens.colors.primary[500],
    marginTop: DesignTokens.spacing[1],
    marginRight: DesignTokens.spacing[3],
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 20,
    bottom: -16,
    width: 2,
    backgroundColor: DesignTokens.colors.neutral[700],
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    marginBottom: DesignTokens.spacing[2],
  },
  timelinePhotoCard: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[3],
    gap: DesignTokens.spacing[3],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  timelinePhotoInfo: {
    flex: 1,
  },
  timelinePhotoCategory: {
    fontSize: DesignTokens.typography.fontSize.sm,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
    textTransform: 'capitalize',
    marginBottom: DesignTokens.spacing[1],
  },
  timelinePhotoNotes: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  timelinePhotoWeight: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.tertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[12],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  emptyStateTitle: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    color: DesignTokens.colors.text.primary,
    marginTop: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[2],
  },
  emptyStateText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DesignTokens.spacing[4],
  },
  addFirstPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing[2],
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  addFirstPhotoText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: DesignTokens.spacing[5],
  },
  errorText: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.error[500],
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  retryButton: {
    backgroundColor: DesignTokens.colors.primary[500],
    paddingHorizontal: DesignTokens.spacing[4],
    paddingVertical: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
  },
  retryButtonText: {
    fontSize: DesignTokens.typography.fontSize.base,
    fontWeight: DesignTokens.typography.fontWeight.medium,
    color: DesignTokens.colors.text.primary,
  },
});
