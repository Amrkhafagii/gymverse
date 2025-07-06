import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { Svg, Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';
import { DesignTokens } from '@/design-system/tokens';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SleepTrendChartProps {
  data: Array<{
    date: string;
    score: number;
    duration: number; // in minutes
  }>;
  period: '7d' | '30d' | '90d';
}

export const SleepTrendChart: React.FC<SleepTrendChartProps> = ({
  data,
  period,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get('window');
  
  const chartWidth = width - 40;
  const chartHeight = 200;
  const padding = 20;

  useEffect(() => {
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [data]);

  const maxScore = Math.max(...data.map(d => d.score));
  const minScore = Math.min(...data.map(d => d.score));
  const scoreRange = maxScore - minScore || 1;

  const maxDuration = Math.max(...data.map(d => d.duration));
  const minDuration = Math.min(...data.map(d => d.duration));

  const getScoreY = (score: number) => {
    return chartHeight - padding - ((score - minScore) / scoreRange) * (chartHeight - 2 * padding);
  };

  const getDurationY = (duration: number) => {
    const durationRange = maxDuration - minDuration || 1;
    return chartHeight - padding - ((duration - minDuration) / durationRange) * (chartHeight - 2 * padding);
  };

  const getX = (index: number) => {
    return padding + (index / (data.length - 1)) * (chartWidth - 2 * padding);
  };

  // Create score path
  const scorePath = data.map((point, index) => {
    const x = getX(index);
    const y = getScoreY(point.score);
    return index === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');

  // Create duration path
  const durationPath = data.map((point, index) => {
    const x = getX(index);
    const y = getDurationY(point.duration);
    return index === 0 ? `M${x},${y}` : `L${x},${y}`;
  }).join(' ');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };

  const getAverageScore = () => {
    return Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length);
  };

  const getAverageDuration = () => {
    return Math.round(data.reduce((sum, d) => sum + d.duration, 0) / data.length);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sleep Trends</Text>
        <View style={styles.averages}>
          <View style={styles.averageItem}>
            <Text style={styles.averageLabel}>Avg Score</Text>
            <Text style={styles.averageValue}>{getAverageScore()}</Text>
          </View>
          <View style={styles.averageItem}>
            <Text style={styles.averageLabel}>Avg Sleep</Text>
            <Text style={styles.averageValue}>{formatDuration(getAverageDuration())}</Text>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          {/* Grid lines */}
          <G opacity={0.2}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <Line
                key={index}
                x1={padding}
                y1={padding + ratio * (chartHeight - 2 * padding)}
                x2={chartWidth - padding}
                y2={padding + ratio * (chartHeight - 2 * padding)}
                stroke={DesignTokens.colors.text.secondary}
                strokeWidth={0.5}
              />
            ))}
          </G>

          {/* Duration area (background) */}
          <AnimatedPath
            d={`${durationPath} L${getX(data.length - 1)},${chartHeight - padding} L${padding},${chartHeight - padding} Z`}
            fill="rgba(158, 127, 255, 0.1)"
            opacity={animatedValue}
          />

          {/* Duration line */}
          <AnimatedPath
            d={durationPath}
            stroke="#9E7FFF"
            strokeWidth={2}
            fill="none"
            strokeDasharray={animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0, 1000', '1000, 0'],
            })}
          />

          {/* Score line */}
          <AnimatedPath
            d={scorePath}
            stroke="#10B981"
            strokeWidth={3}
            fill="none"
            strokeDasharray={animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: ['0, 1000', '1000, 0'],
            })}
          />

          {/* Data points */}
          {data.map((point, index) => (
            <G key={index}>
              {/* Score point */}
              <AnimatedCircle
                cx={getX(index)}
                cy={getScoreY(point.score)}
                r={animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                })}
                fill="#10B981"
              />
              
              {/* Duration point */}
              <AnimatedCircle
                cx={getX(index)}
                cy={getDurationY(point.duration)}
                r={animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 3],
                })}
                fill="#9E7FFF"
              />
            </G>
          ))}
        </Svg>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Sleep Score</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#9E7FFF' }]} />
            <Text style={styles.legendText}>Sleep Duration</Text>
          </View>
        </View>
      </View>

      {/* X-axis labels */}
      <View style={styles.xAxisLabels}>
        {data.map((point, index) => {
          if (index % Math.ceil(data.length / 4) === 0 || index === data.length - 1) {
            return (
              <Text key={index} style={styles.xAxisLabel}>
                {formatDate(point.date)}
              </Text>
            );
          }
          return null;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing[4],
    marginBottom: DesignTokens.spacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[4],
  },
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  averages: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[4],
  },
  averageItem: {
    alignItems: 'center',
  },
  averageLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
    marginBottom: DesignTokens.spacing[1],
  },
  averageValue: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    fontFamily: 'SF Mono',
  },
  chartContainer: {
    position: 'relative',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: DesignTokens.spacing[4],
    marginTop: DesignTokens.spacing[3],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: DesignTokens.spacing[1],
  },
  legendText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[5],
  },
  xAxisLabel: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.secondary,
  },
});
