import { useState, useEffect, useCallback } from 'react';
import { useSocial, SocialPost, SocialComment } from '@/contexts/SocialContext';

export interface UsePostCommentsReturn {
  // Comments data
  comments: SocialComment[];
  commentsCount: number;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addComment: (content: string) => Promise<SocialComment | null>;
  deleteComment: (commentId: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  unlikeComment: (commentId: string) => Promise<void>;
  
  // Sorting and filtering
  sortComments: (by: 'timestamp' | 'likes') => void;
  filterComments: (query: string) => SocialComment[];
  
  // Analytics
  getCommentsAnalytics: () => {
    totalComments: number;
    totalLikes: number;
    averageLikesPerComment: number;
    topComments: SocialComment[];
    recentActivity: Array<{ date: string; comments: number }>;
  };
}

export function usePostComments(post: SocialPost | null): UsePostCommentsReturn {
  const {
    addComment: contextAddComment,
    deleteComment: contextDeleteComment,
    likeComment: contextLikeComment,
  } = useSocial();

  // State
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'timestamp' | 'likes'>('timestamp');

  // Update comments when post changes
  useEffect(() => {
    if (post) {
      setComments(post.comments);
    } else {
      setComments([]);
    }
  }, [post]);

  // Sort comments when sort criteria changes
  useEffect(() => {
    if (comments.length > 0) {
      const sorted = [...comments].sort((a, b) => {
        switch (sortBy) {
          case 'timestamp':
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          case 'likes':
            return b.likes - a.likes;
          default:
            return 0;
        }
      });
      setComments(sorted);
    }
  }, [sortBy]);

  // Actions
  const addComment = async (content: string): Promise<SocialComment | null> => {
    if (!post || !content.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      const newComment = await contextAddComment(post.id, content.trim());
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (commentId: string): Promise<void> => {
    if (!post) return;

    setIsLoading(true);
    setError(null);

    try {
      await contextDeleteComment(post.id, commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const likeComment = async (commentId: string): Promise<void> => {
    if (!post) return;

    try {
      await contextLikeComment(post.id, commentId);
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked,
          };
        }
        return comment;
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to like comment';
      setError(errorMessage);
    }
  };

  const unlikeComment = async (commentId: string): Promise<void> => {
    await likeComment(commentId); // Same logic for toggle
  };

  // Sorting and filtering
  const sortComments = (by: 'timestamp' | 'likes') => {
    setSortBy(by);
  };

  const filterComments = useCallback((query: string): SocialComment[] => {
    if (!query.trim()) return comments;

    const lowercaseQuery = query.toLowerCase();
    return comments.filter(comment =>
      comment.content.toLowerCase().includes(lowercaseQuery) ||
      comment.username.toLowerCase().includes(lowercaseQuery)
    );
  }, [comments]);

  // Analytics
  const getCommentsAnalytics = useCallback(() => {
    const totalComments = comments.length;
    const totalLikes = comments.reduce((sum, comment) => sum + comment.likes, 0);
    const averageLikesPerComment = totalComments > 0 ? totalLikes / totalComments : 0;

    // Top comments by likes
    const topComments = [...comments]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);

    // Recent activity (last 7 days)
    const recentActivity: Array<{ date: string; comments: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const commentsOnDay = comments.filter(comment => 
        comment.timestamp.split('T')[0] === dateString
      ).length;

      recentActivity.push({
        date: dateString,
        comments: commentsOnDay,
      });
    }

    return {
      totalComments,
      totalLikes,
      averageLikesPerComment,
      topComments,
      recentActivity,
    };
  }, [comments]);

  return {
    // Comments data
    comments,
    commentsCount: comments.length,
    
    // State
    isLoading,
    error,
    
    // Actions
    addComment,
    deleteComment,
    likeComment,
    unlikeComment,
    
    // Sorting and filtering
    sortComments,
    filterComments,
    
    // Analytics
    getCommentsAnalytics,
  };
}
