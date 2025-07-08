/**
 * MotivationalQuote - Previously unused, now integrated into home screen
 * Displays daily motivational quotes with category filtering
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Quote, RefreshCw, Heart } from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';

interface Quote {
  text: string;
  author: string;
  category: string;
}

export interface MotivationalQuoteProps {
  category?: 'fitness' | 'motivation' | 'success' | 'mindset';
  refreshOnMount?: boolean;
  onQuoteChange?: (quote: Quote) => void;
  style?: ViewStyle;
}

const QUOTES_BY_CATEGORY = {
  fitness: [
    {
      text: "The groundwork for all happiness is good health.",
      author: "Leigh Hunt",
      category: "fitness"
    },
    {
      text: "Take care of your body. It's the only place you have to live.",
      author: "Jim Rohn",
      category: "fitness"
    },
    {
      text: "Fitness is not about being better than someone else. It's about being better than you used to be.",
      author: "Khloe Kardashian",
      category: "fitness"
    },
    {
      text: "The only bad workout is the one that didn't happen.",
      author: "Unknown",
      category: "fitness"
    },
    {
      text: "Your body can do it. It's your mind you have to convince.",
      author: "Unknown",
      category: "fitness"
    },
  ],
  motivation: [
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "motivation"
    },
    {
      text: "The way to get started is to quit talking and begin doing.",
      author: "Walt Disney",
      category: "motivation"
    },
    {
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      category: "motivation"
    },
  ],
  success: [
    {
      text: "Success is not the key to happiness. Happiness is the key to success.",
      author: "Albert Schweitzer",
      category: "success"
    },
    {
      text: "The only impossible journey is the one you never begin.",
      author: "Tony Robbins",
      category: "success"
    },
  ],
  mindset: [
    {
      text: "Whether you think you can or you think you can't, you're right.",
      author: "Henry Ford",
      category: "mindset"
    },
    {
      text: "The mind is everything. What you think you become.",
      author: "Buddha",
      category: "mindset"
    },
  ],
};

export const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({
  category = 'fitness',
  refreshOnMount = false,
  onQuoteChange,
  style,
}) => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRandomQuote = (cat: string): Quote => {
    const quotes = QUOTES_BY_CATEGORY[cat as keyof typeof QUOTES_BY_CATEGORY] || QUOTES_BY_CATEGORY.fitness;
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const refreshQuote = async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newQuote = getRandomQuote(category);
      setCurrentQuote(newQuote);
      setIsLiked(false);
      onQuoteChange?.(newQuote);
      setIsRefreshing(false);
    }, 500);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  useEffect(() => {
    if (refreshOnMount || !currentQuote) {
      const quote = getRandomQuote(category);
      setCurrentQuote(quote);
      onQuoteChange?.(quote);
    }
  }, [category, refreshOnMount]);

  if (!currentQuote) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Quote size={20} color="#FFFFFF" />
          <View style={styles.actions}>
            <TouchableOpacity onPress={toggleLike} style={styles.actionButton}>
              <Heart 
                size={18} 
                color={isLiked ? "#FF6B6B" : "#FFFFFF"} 
                fill={isLiked ? "#FF6B6B" : "transparent"}
              />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={refreshQuote} 
              style={[styles.actionButton, isRefreshing && styles.refreshing]}
              disabled={isRefreshing}
            >
              <RefreshCw 
                size={18} 
                color="#FFFFFF" 
                style={isRefreshing ? styles.spinning : undefined}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.quoteText}>"{currentQuote.text}"</Text>
        
        <View style={styles.footer}>
          <Text style={styles.author}>— {currentQuote.author}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{currentQuote.category}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },

  gradient: {
    padding: DesignTokens.spacing[5],
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },

  actions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },

  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.full,
  },

  refreshing: {
    opacity: 0.6,
  },

  spinning: {
    // Note: In a real implementation, you'd use Animated.Value for rotation
    transform: [{ rotate: '45deg' }],
  },

  quoteText: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: '#FFFFFF',
    lineHeight: DesignTokens.typography.fontSize.lg * 1.4,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[4],
    fontStyle: 'italic',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  author: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },

  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: DesignTokens.spacing[2],
    paddingVertical: DesignTokens.spacing[1],
    borderRadius: DesignTokens.borderRadius.full,
  },

  categoryText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
});
