import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  MessageCircle,
  Share,
  Search,
  Users,
  Trophy,
  Target,
  Clock,
  MoreHorizontal,
} from 'lucide-react-native';

interface Post {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  workout?: {
    name: string;
    duration: number;
    exercises: number;
  };
  image?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked: boolean;
}

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<'feed' | 'friends'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        username: '@sarahfit',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      content: 'Just crushed my morning workout! Feeling stronger every day 💪',
      workout: {
        name: 'Upper Body Strength',
        duration: 45,
        exercises: 8,
      },
      image: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg?auto=compress&cs=tinysrgb&w=800',
      likes: 24,
      comments: 5,
      timestamp: '2h ago',
      isLiked: false,
    },
    {
      id: '2',
      user: {
        name: 'Mike Chen',
        username: '@mikelifts',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      content: 'New PR on deadlifts today! 225lbs x 5 reps. The grind never stops! 🔥',
      likes: 42,
      comments: 12,
      timestamp: '4h ago',
      isLiked: true,
    },
    {
      id: '3',
      user: {
        name: 'Emma Wilson',
        username: '@emmafitness',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      },
      content: 'Morning yoga session complete! Starting the day with mindfulness and movement 🧘‍♀️',
      workout: {
        name: 'Yoga Flow',
        duration: 30,
        exercises: 12,
      },
      image: 'https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg?auto=compress&cs=tinysrgb&w=800',
      likes: 18,
      comments: 3,
      timestamp: '6h ago',
      isLiked: false,
    },
  ]);

  const friends = [
    {
      id: '1',
      name: 'Alex Rodriguez',
      username: '@alexfitness',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'Just finished cardio',
      isOnline: true,
    },
    {
      id: '2',
      name: 'Jessica Lee',
      username: '@jessicastrong',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'Rest day recovery',
      isOnline: false,
    },
    {
      id: '3',
      name: 'David Kim',
      username: '@davidlifts',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'Leg day complete!',
      isOnline: true,
    },
  ];

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <LinearGradient
        colors={['#1a1a1a', '#2a2a2a']}
        style={styles.postGradient}
      >
        {/* Post Header */}
        <View style={styles.postHeader}>
          <Image source={{ uri: item.user.avatar }} style={styles.userAvatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.user.name}</Text>
            <Text style={styles.userHandle}>{item.user.username} • {item.timestamp}</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Workout Info */}
        {item.workout && (
          <View style={styles.workoutInfo}>
            <View style={styles.workoutHeader}>
              <Target size={16} color="#9E7FFF" />
              <Text style={styles.workoutName}>{item.workout.name}</Text>
            </View>
            <View style={styles.workoutStats}>
              <View style={styles.workoutStat}>
                <Clock size={14} color="#999" />
                <Text style={styles.workoutStatText}>{item.workout.duration} min</Text>
              </View>
              <View style={styles.workoutStat}>
                <Trophy size={14} color="#999" />
                <Text style={styles.workoutStatText}>{item.workout.exercises} exercises</Text>
              </View>
            </View>
          </View>
        )}

        {/* Post Image */}
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Heart 
              size={20} 
              color={item.isLiked ? '#FF6B35' : '#999'} 
              fill={item.isLiked ? '#FF6B35' : 'transparent'}
            />
            <Text style={[styles.actionText, item.isLiked && styles.likedText]}>
              {item.likes}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={20} color="#999" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Share size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderFriend = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <View style={styles.friendAvatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendUsername}>{item.username}</Text>
          <Text style={styles.friendStatus}>{item.status}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.messageButton}>
        <MessageCircle size={20} color="#9E7FFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Social</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Search size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search friends, workouts..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'feed' && styles.activeTab]}
            onPress={() => setActiveTab('feed')}
          >
            <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabText]}>
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
            onPress={() => setActiveTab('friends')}
          >
            <Users size={16} color={activeTab === 'friends' ? '#9E7FFF' : '#999'} />
            <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
              Friends
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'feed' ? (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.feedContent}
          />
        ) : (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.friendsContent}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    color: '#fff',
    fontFamily: 'Inter-Bold',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  activeTab: {
    backgroundColor: '#9E7FFF20',
    borderColor: '#9E7FFF',
  },
  tabText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#9E7FFF',
  },
  feedContent: {
    paddingBottom: 100,
  },
  friendsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  postCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postGradient: {
    padding: 20,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  userHandle: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  postContent: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
    marginBottom: 16,
  },
  workoutInfo: {
    backgroundColor: '#9E7FFF10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#9E7FFF20',
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 14,
    color: '#9E7FFF',
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutStatText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Inter-Regular',
    marginLeft: 6,
  },
  likedText: {
    color: '#FF6B35',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  friendAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00D4AA',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 12,
    color: '#9E7FFF',
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Inter-Regular',
  },
  messageButton: {
    padding: 8,
  },
});
