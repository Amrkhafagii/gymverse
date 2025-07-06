import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Moon,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

interface SleepScoreCardProps {
  score: number;
  previousScore?: number;
  factors: {
    duration: number;
    efficiency: number;
    consistency: number;
    quality: number;
  };
  onInfoPress?: () => void;
}

export const SleepScoreCard: React.FC<SleepScoreCardProps> = ({
  score,
  previousScore,
  factors,
  onInfoPress,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return ['#10B981', '#059669']; // Green
    if (score >= 60) return ['#F59E0B', '#D97706']; // Orange
    return ['#EF4444', '#DC2626']; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getTrendIcon = () => {
    if (!previousScore) return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
    
    const diff = score - previousScore;
    if (diff > 0) return <TrendingUp size={16} color={DesignTokens.colors.success[500]} />;
    if (diff < 0) return <TrendingDown size={16} color={DesignTokens.colors.error[500]} />;
    return <Minus size={16} color={DesignTokens.colors.text.secondary} />;
  };

  const getTrendText = () => {
    if (!previousScore) return 'No previous data';
    
    const diff = Math.abs(score - previousScore);
    const direction = score > previousScore ? 'up' : score < previousScore ? 'down' : 'same';
    
    if (direction === 'same') return 'No change';
    return `${diff} points ${direction}`;
  };

  const handleInfoPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onInfoPress?.();
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.9}>
      <LinearGradient
        colors={getScoreColor(score)}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Moon size={24} color="#FFFFFF" />
            <Text style={styles.title}>Sleep Score</Text>
          </View>
          
          <TouchableOpacity onPress={handleInfoPress} style={styles.infoButton}>
            <Info size={16} color="#FFFFFF" opacity={0.8} />
          </TouchableOpacity>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.scoreLabel}>{getScoreLabel(score)}</Text>
        </View>

        <View style={styles.trendContainer}>
          {getTrendIcon()}
          <Text style={styles.trendText}>{getTrendText()}</Text>
        </View>

        <View style={styles.factorsContainer}>
          <Text style={styles.factorsTitle}>Contributing Factors</Text>
          <View style={styles.factorsGrid}>
            <View style={styles.factorItem}>
              <Text style={styles.factorLabel}>Duration</Text>
              <Text style={styles.factorValue}>{factors.duration}%</Text>
            </View>
            <View style={styles.factorItem}>
              <Text style={styles.factorLabel}>Efficiency</Text>
              <Text style={styles.factorValue}>{factors.efficiency}%</Text>
            </View>
            <View style={styles.factorItem}>
              <Text style={styles.factorLabel}>Consistency</Text>
              <Text style={styles.factorValue}>{factors.consistency}%</Text>
            </View>
            <View style={styles.factorItem}>
              <Text style={styles.factorLabel}>Quality</Text>
              <Text style={styles.factorValue}>{factors.quality}%</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacing[4],
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginLeft: DesignTokens.spacing[2],
  },
  infoButton: {
    padding: DesignTokens.spacing[1],
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  scoreText: {
    fontSize: DesignTokens.typography.fontSize['5xl'],
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  scoreLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: DesignTokens.spacing[1],
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing[5],
  },
  trendText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: '#FFFFFF',
    opacity: 0.8,
    marginLeft: DesignTokens.spacing[1],
  },
  factorsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
  },
  factorsTitle: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[3],
    textAlign: 'center',
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  factorItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[2],
  },
  factorLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: DesignTokens.spacing[1],
  },
  factorValue: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: '#FFFFFF',
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
});
