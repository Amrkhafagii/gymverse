import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkoutHistory } from './WorkoutHistoryContext';
import { useAchievements } from './AchievementContext';
import { usePersonalRecords } from '@/hooks/usePersonalRecords';
import { useProgressPhotoContext } from './ProgressPhotoContext';

export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: 'workout_complete' | 'achievement' | 'progress_photo' | 'milestone' | 'personal_record' | 'text';
  content: string;
  timestamp: string;
  
  // Workout-related data
  workoutData?: {
    name: string;
    duration: number;
    exercises: number;
    calories?: number;
    volume?: number;
  };
  
  // Achievement data
  achievementData?: {
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    icon: string;
  };
  
  // Progress photo data
  photoData?: {
    imageUri: string;
    description?: string;
    measurements?: Record<string, number>;
  };
  
  // Personal record data
  recordData?: {
    exerciseName: string;
    previousValue: number;
    newValue: number;
    unit: string;
    improvement: number;
  };
  
  // Engagement data
  likes: number;
  comments: SocialComment[];
  shares: number;
  isLiked: boolean;
  
  // Metadata
  location?: string;
  tags?: string[];
  visibility: 'public' | 'friends' | 'private';
}

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: SocialComment[];
}

export interface SocialUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  isFollowing: boolean;
  isFollower: boolean;
  stats: {
    posts: number;
    followers: number;
    following: number;
    workouts: number;
    achievements: number;
  };
  joinDate: string;
  lastActive: string;
}

export interface SocialActivity {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'achievement' | 'workout' | 'milestone';
  userId: string;
  username: string;
  userAvatar: string;
  targetId?: string; // Post ID, user ID, etc.
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface SocialContextType {
  // Posts
  posts: SocialPost[];
  myPosts: SocialPost[];
  
  // Users
  currentUser: SocialUser | null;
  followers: SocialUser[];
  following: SocialUser[];
  
  // Activity
  activities: SocialActivity[];
  unreadActivities: number;
  
  // Actions
  createPost: (postData: Partial<SocialPost>) => Promise<SocialPost>;
  updatePost: (postId: string, updates: Partial<SocialPost>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  
  addComment: (postId: string, content: string) => Promise<SocialComment>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  likeComment: (postId: string, commentId: string) => Promise<void>;
  
  sharePost: (postId: string) => Promise<void>;
  
  // User management
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<SocialUser>) => Promise<void>;
  
  // Activity
  markActivityAsRead: (activityId: string) => Promise<void>;
  markAllActivitiesAsRead: () => Promise<void>;
  
  // Feed management
  refreshFeed: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  
  // Auto-posting
  enableAutoPosting: (types: SocialPost['type'][]) => Promise<void>;
  disableAutoPosting: (types: SocialPost['type'][]) => Promise<void>;
  
  // State
  isLoading: boolean;
  hasMorePosts: boolean;
  autoPostSettings: Record<SocialPost['type'], boolean>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const STORAGE_KEYS = {
  POSTS: '@social_posts',
  USERS: '@social_users',
  ACTIVITIES: '@social_activities',
  CURRENT_USER: '@social_current_user',
  AUTO_POST_SETTINGS: '@social_auto_post_settings',
  SOCIAL_STATS: '@social_stats',
};

export function SocialProvider({ children }: { children: React.ReactNode }) {
  // State
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [myPosts, setMyPosts] = useState<SocialPost[]>([]);
  const [currentUser, setCurrentUser] = useState<SocialUser | null>(null);
  const [followers, setFollowers] = useState<SocialUser[]>([]);
  const [following, setFollowing] = useState<SocialUser[]>([]);
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [autoPostSettings, setAutoPostSettings] = useState<Record<SocialPost['type'], boolean>>({
    workout_complete: true,
    achievement: true,
    progress_photo: false,
    milestone: true,
    personal_record: true,
    text: false,
  });

  // Hooks
  const { workouts } = useWorkoutHistory();
  const { unlockedAchievements } = useAchievements();
  const { personalRecords } = usePersonalRecords();
  const { photos } = useProgressPhotoContext();

  // Initialize
  useEffect(() => {
    initializeSocialData();
  }, []);

  // Auto-post on new achievements, workouts, etc.
  useEffect(() => {
    handleAutoPosting();
  }, [workouts.length, unlockedAchievements.length, personalRecords.length, photos.length]);

  const initializeSocialData = async () => {
    try {
      setIsLoading(true);
      
      // Load stored data
      const [
        storedPosts,
        storedUser,
        storedActivities,
        storedAutoSettings,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.POSTS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES),
        AsyncStorage.getItem(STORAGE_KEYS.AUTO_POST_SETTINGS),
      ]);

      if (storedPosts) {
        const parsedPosts = JSON.parse(storedPosts);
        setPosts(parsedPosts);
        setMyPosts(parsedPosts.filter((post: SocialPost) => post.userId === 'current_user'));
      }

      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      } else {
        // Create default user
        const defaultUser: SocialUser = {
          id: 'current_user',
          username: 'you',
          displayName: 'You',
          avatar: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
          bio: 'Fitness enthusiast on a journey to better health',
          isFollowing: false,
          isFollower: false,
          stats: {
            posts: 0,
            followers: 12,
            following: 8,
            workouts: workouts.length,
            achievements: unlockedAchievements.length,
          },
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
        };
        setCurrentUser(defaultUser);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultUser));
      }

      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }

      if (storedAutoSettings) {
        setAutoPostSettings(JSON.parse(storedAutoSettings));
      }

      // Generate sample social feed if empty
      if (!storedPosts || JSON.parse(storedPosts).length === 0) {
        await generateSampleFeed();
      }

    } catch (error) {
      console.error('Error initializing social data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleFeed = async () => {
    const samplePosts: SocialPost[] = [
      {
        id: 'sample_1',
        userId: 'user_1',
        username: 'sarah_fitness',
        userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
        type: 'workout_complete',
        content: 'Just crushed my leg day! New PR on squats 💪 Feeling stronger than ever!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        workoutData: {
          name: 'Leg Day Destroyer',
          duration: 45 * 60, // 45 minutes
          exercises: 8,
          calories: 320,
          volume: 2850,
        },
        likes: 24,
        comments: [
          {
            id: 'comment_1',
            postId: 'sample_1',
            userId: 'user_2',
            username: 'mike_lifts',
            userAvatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
            content: 'Beast mode! 🔥',
            timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            likes: 3,
            isLiked: false,
          },
        ],
        shares: 2,
        isLiked: false,
        location: 'PowerHouse Gym',
        tags: ['legday', 'squats', 'pr'],
        visibility: 'public',
      },
      {
        id: 'sample_2',
        userId: 'user_2',
        username: 'mike_lifts',
        userAvatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
        type: 'achievement',
        content: 'Unlocked the "Consistency King" achievement! 30 days straight of workouts! 🏆',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        achievementData: {
          name: 'Consistency King',
          description: 'Complete 30 consecutive days of workouts',
          rarity: 'epic',
          icon: '👑',
        },
        likes: 45,
        comments: [],
        shares: 8,
        isLiked: true,
        visibility: 'public',
      },
      {
        id: 'sample_3',
        userId: 'user_3',
        username: 'emma_wellness',
        userAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
        type: 'progress_photo',
        content: '3 months transformation! The journey continues 💪✨',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        photoData: {
          imageUri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
          description: '3 month progress comparison',
          measurements: {
            weight: 65,
            bodyFat: 18,
            muscle: 42,
          },
        },
        likes: 67,
        comments: [
          {
            id: 'comment_2',
            postId: 'sample_3',
            userId: 'user_1',
            username: 'sarah_fitness',
            userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
            content: 'Amazing progress! You look incredible! 🔥',
            timestamp: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
            likes: 8,
            isLiked: true,
          },
        ],
        shares: 12,
        isLiked: false,
        tags: ['transformation', 'progress', '3months'],
        visibility: 'public',
      },
    ];

    setPosts(samplePosts);
    await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(samplePosts));
  };

  const handleAutoPosting = async () => {
    if (!currentUser) return;

    try {
      // Auto-post new workouts
      if (autoPostSettings.workout_complete && workouts.length > 0) {
        const lastWorkout = workouts[0];
        const existingPost = posts.find(p => 
          p.type === 'workout_complete' && 
          p.workoutData?.name === lastWorkout.name &&
          new Date(p.timestamp).toDateString() === new Date(lastWorkout.date).toDateString()
        );

        if (!existingPost) {
          await createAutoPost('workout_complete', lastWorkout);
        }
      }

      // Auto-post new achievements
      if (autoPostSettings.achievement && unlockedAchievements.length > 0) {
        const recentAchievement = unlockedAchievements[0];
        const existingPost = posts.find(p => 
          p.type === 'achievement' && 
          p.achievementData?.name === recentAchievement.name
        );

        if (!existingPost) {
          await createAutoPost('achievement', recentAchievement);
        }
      }

      // Auto-post new personal records
      if (autoPostSettings.personal_record && personalRecords.length > 0) {
        const recentPR = personalRecords[0];
        const existingPost = posts.find(p => 
          p.type === 'personal_record' && 
          p.recordData?.exerciseName === recentPR.exercise_name &&
          new Date(p.timestamp).toDateString() === new Date(recentPR.date).toDateString()
        );

        if (!existingPost) {
          await createAutoPost('personal_record', recentPR);
        }
      }

    } catch (error) {
      console.error('Error in auto-posting:', error);
    }
  };

  const createAutoPost = async (type: SocialPost['type'], data: any) => {
    if (!currentUser) return;

    let postContent = '';
    let postData: Partial<SocialPost> = {};

    switch (type) {
      case 'workout_complete':
        postContent = `Just completed "${data.name}"! 💪 Another step closer to my goals!`;
        postData.workoutData = {
          name: data.name,
          duration: data.total_duration_seconds,
          exercises: data.exercises.length,
          calories: Math.round(data.total_duration_seconds / 60 * 5), // Rough estimate
        };
        break;

      case 'achievement':
        postContent = `Unlocked the "${data.name}" achievement! 🏆 ${data.description}`;
        postData.achievementData = {
          name: data.name,
          description: data.description,
          rarity: data.rarity,
          icon: data.icon,
        };
        break;

      case 'personal_record':
        const improvement = ((data.value - (data.previous_value || data.value * 0.9)) / (data.previous_value || data.value * 0.9)) * 100;
        postContent = `New PR on ${data.exercise_name}! ${data.value}${data.unit} 🎯 ${improvement.toFixed(1)}% improvement!`;
        postData.recordData = {
          exerciseName: data.exercise_name,
          previousValue: data.previous_value || data.value * 0.9,
          newValue: data.value,
          unit: data.unit,
          improvement,
        };
        break;
    }

    await createPost({
      type,
      content: postContent,
      ...postData,
    });
  };

  // Post management
  const createPost = async (postData: Partial<SocialPost>): Promise<SocialPost> => {
    if (!currentUser) throw new Error('No current user');

    const newPost: SocialPost = {
      id: `post_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      type: postData.type || 'text',
      content: postData.content || '',
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      shares: 0,
      isLiked: false,
      visibility: postData.visibility || 'public',
      ...postData,
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    setMyPosts([newPost, ...myPosts]);

    // Update user stats
    const updatedUser = {
      ...currentUser,
      stats: {
        ...currentUser.stats,
        posts: currentUser.stats.posts + 1,
      },
    };
    setCurrentUser(updatedUser);

    // Save to storage
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts)),
      AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser)),
    ]);

    return newPost;
  };

  const updatePost = async (postId: string, updates: Partial<SocialPost>) => {
    const updatedPosts = posts.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    );
    setPosts(updatedPosts);
    setMyPosts(updatedPosts.filter(post => post.userId === currentUser?.id));
    await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));
  };

  const deletePost = async (postId: string) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    setPosts(updatedPosts);
    setMyPosts(updatedPosts.filter(post => post.userId === currentUser?.id));
    await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));
  };

  // Engagement actions
  const likePost = async (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked,
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));
  };

  const unlikePost = async (postId: string) => {
    await likePost(postId); // Same logic for toggle
  };

  const addComment = async (postId: string, content: string): Promise<SocialComment> => {
    if (!currentUser) throw new Error('No current user');

    const newComment: SocialComment = {
      id: `comment_${Date.now()}`,
      postId,
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));

    return newComment;
  };

  const deleteComment = async (postId: string, commentId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.filter(comment => comment.id !== commentId),
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));
  };

  const likeComment = async (postId: string, commentId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked,
              };
            }
            return comment;
          }),
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));
  };

  const sharePost = async (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          shares: post.shares + 1,
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    await AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(updatedPosts));
  };

  // User management
  const followUser = async (userId: string) => {
    // Implementation for following users
    console.log('Following user:', userId);
  };

  const unfollowUser = async (userId: string) => {
    // Implementation for unfollowing users
    console.log('Unfollowing user:', userId);
  };

  const updateProfile = async (updates: Partial<SocialUser>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
  };

  // Activity management
  const markActivityAsRead = async (activityId: string) => {
    const updatedActivities = activities.map(activity =>
      activity.id === activityId ? { ...activity, isRead: true } : activity
    );
    setActivities(updatedActivities);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
  };

  const markAllActivitiesAsRead = async () => {
    const updatedActivities = activities.map(activity => ({ ...activity, isRead: true }));
    setActivities(updatedActivities);
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(updatedActivities));
  };

  // Feed management
  const refreshFeed = async () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const loadMorePosts = async () => {
    // Implementation for pagination
    setHasMorePosts(false);
  };

  // Auto-posting settings
  const enableAutoPosting = async (types: SocialPost['type'][]) => {
    const updatedSettings = { ...autoPostSettings };
    types.forEach(type => {
      updatedSettings[type] = true;
    });
    setAutoPostSettings(updatedSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_POST_SETTINGS, JSON.stringify(updatedSettings));
  };

  const disableAutoPosting = async (types: SocialPost['type'][]) => {
    const updatedSettings = { ...autoPostSettings };
    types.forEach(type => {
      updatedSettings[type] = false;
    });
    setAutoPostSettings(updatedSettings);
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_POST_SETTINGS, JSON.stringify(updatedSettings));
  };

  const unreadActivities = activities.filter(activity => !activity.isRead).length;

  const value: SocialContextType = {
    // Posts
    posts,
    myPosts,
    
    // Users
    currentUser,
    followers,
    following,
    
    // Activity
    activities,
    unreadActivities,
    
    // Actions
    createPost,
    updatePost,
    deletePost,
    
    likePost,
    unlikePost,
    
    addComment,
    deleteComment,
    likeComment,
    
    sharePost,
    
    // User management
    followUser,
    unfollowUser,
    updateProfile,
    
    // Activity
    markActivityAsRead,
    markAllActivitiesAsRead,
    
    // Feed management
    refreshFeed,
    loadMorePosts,
    
    // Auto-posting
    enableAutoPosting,
    disableAutoPosting,
    
    // State
    isLoading,
    hasMorePosts,
    autoPostSettings,
  };

  return (
    <SocialContext.Provider value={value}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}
