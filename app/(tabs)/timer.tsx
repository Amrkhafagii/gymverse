import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Timer,
  Play,
  Pause,
  Square,
  Plus,
  Settings,
  Clock,
  Zap,
  Target,
  RotateCcw,
  Volume2,
  VolumeX,
  Edit3,
  Save,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { DesignTokens } from '@/design-system/tokens';
import { CircularTimer } from '@/components/timer/CircularTimer';
import { TimerPreset } from '@/components/timer/TimerPreset';
import { IntervalTimer } from '@/components/timer/IntervalTimer';
import { Button } from '@/components/ui/Button';
import * as Haptics from 'expo-haptics';

type TimerMode = 'simple' | 'interval' | 'stopwatch';

export default function TimerScreen() {
  const [mode, setMode] = useState<TimerMode>('simple');
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(60); // Default 1 minute
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('1');
  const [customSeconds, setCustomSeconds] = useState('0');

  // Timer presets
  const timerPresets = [
    {
      id: 'rest-30',
      name: 'Quick Rest',
      duration: 30,
      type: 'rest' as const,
      description: 'Short break',
      color: ['#3B82F6', '#2563EB'],
    },
    {
      id: 'rest-60',
      name: 'Rest',
      duration: 60,
      type: 'rest' as const,
      description: 'Standard rest',
      color: ['#3B82F6', '#2563EB'],
    },
    {
      id: 'rest-90',
      name: 'Long Rest',
      duration: 90,
      type: 'rest' as const,
      description: 'Extended break',
      color: ['#3B82F6', '#2563EB'],
    },
    {
      id: 'work-20',
      name: 'Tabata Work',
      duration: 20,
      type: 'work' as const,
      description: 'High intensity',
      color: ['#10B981', '#059669'],
    },
    {
      id: 'work-45',
      name: 'Work Set',
      duration: 45,
      type: 'work' as const,
      description: 'Standard work',
      color: ['#10B981', '#059669'],
    },
    {
      id: 'warmup-300',
      name: 'Warm Up',
      duration: 300,
      type: 'warmup' as const,
      description: '5 min prep',
      color: ['#F59E0B', '#D97706'],
    },
  ];

  // Interval training presets
  const intervalPresets = [
    {
      name: 'Tabata',
      intervals: [
        { name: 'Work', duration: 20, type: 'work' as const, color: '#10B981' },
        { name: 'Rest', duration: 10, type: 'rest' as const, color: '#3B82F6' },
      ],
      rounds: 8,
    },
    {
      name: 'HIIT',
      intervals: [
        { name: 'High Intensity', duration: 45, type: 'work' as const, color: '#10B981' },
        { name: 'Recovery', duration: 15, type: 'rest' as const, color: '#3B82F6' },
      ],
      rounds: 6,
    },
    {
      name: 'Circuit',
      intervals: [
        { name: 'Exercise', duration: 60, type: 'work' as const, color: '#10B981' },
        { name: 'Transition', duration: 30, type: 'rest' as const, color: '#3B82F6' },
      ],
      rounds: 5,
    },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => {
          const newElapsed = prev + 1;
          
          if (mode === 'simple' && newElapsed >= duration) {
            handleTimerComplete();
            return duration;
          }
          
          return newElapsed;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, duration, mode]);

  const handleTimerComplete = async () => {
    setIsRunning(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Timer Complete!', 'Your timer has finished.');
  };

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRunning(false);
    setElapsed(0);
  };

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setElapsed(0);
  };

  const handlePresetSelect = (preset: typeof timerPresets[0]) => {
    setSelectedPreset(preset.id);
    setDuration(preset.duration);
    setElapsed(0);
    setIsRunning(false);
  };

  const handleCustomTimer = () => {
    const minutes = parseInt(customMinutes) || 0;
    const seconds = parseInt(customSeconds) || 0;
    const totalSeconds = minutes * 60 + seconds;
    
    if (totalSeconds > 0) {
      setDuration(totalSeconds);
      setElapsed(0);
      setIsRunning(false);
      setSelectedPreset(null);
      setShowCustomTimer(false);
    }
  };

  const toggleSound = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSoundEnabled(!soundEnabled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (selectedPreset) {
      const preset = timerPresets.find(p => p.id === selectedPreset);
      return preset?.color[0] || '#9E7FFF';
    }
    return '#9E7FFF';
  };

  const renderSimpleTimer = () => (
    <View style={styles.timerContainer}>
      <CircularTimer
        duration={duration}
        elapsed={elapsed}
        size={320}
        color={getTimerColor()}
        showTime={true}
      />
      
      <View style={styles.timerInfo}>
        <Text style={styles.timerLabel}>
          {selectedPreset ? 
            timerPresets.find(p => p.id === selectedPreset)?.name || 'Timer' :
            'Custom Timer'
          }
        </Text>
        <Text style={styles.timerDuration}>
          {formatTime(duration)} total
        </Text>
      </View>
    </View>
  );

  const renderStopwatch = () => (
    <View style={styles.timerContainer}>
      <CircularTimer
        duration={3600} // 1 hour max display
        elapsed={elapsed}
        size={320}
        color="#10B981"
        showTime={false}
      />
      
      <View style={styles.stopwatchTime}>
        <Text style={styles.stopwatchText}>{formatTime(elapsed)}</Text>
        <Text style={styles.stopwatchLabel}>elapsed</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Timer size={28} color={DesignTokens.colors.primary[500]} />
            <Text style={styles.title}>Timer</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleSound} style={styles.headerButton}>
              {soundEnabled ? (
                <Volume2 size={20} color={DesignTokens.colors.text.secondary} />
              ) : (
                <VolumeX size={20} color={DesignTokens.colors.text.secondary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/timer-settings')} 
              style={styles.headerButton}
            >
              <Settings size={20} color={DesignTokens.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          {(['simple', 'interval', 'stopwatch'] as TimerMode[]).map((timerMode) => (
            <TouchableOpacity
              key={timerMode}
              style={[
                styles.modeButton,
                mode === timerMode && styles.activeModeButton,
              ]}
              onPress={() => {
                setMode(timerMode);
                setIsRunning(false);
                setElapsed(0);
              }}
            >
              <Text style={[
                styles.modeButtonText,
                mode === timerMode && styles.activeModeButtonText,
              ]}>
                {timerMode.charAt(0).toUpperCase() + timerMode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {mode === 'simple' && (
          <>
            {/* Timer Display */}
            {renderSimpleTimer()}

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleReset}
              >
                <RotateCcw size={24} color={DesignTokens.colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton]}
                onPress={handlePlayPause}
              >
                <LinearGradient
                  colors={['#9E7FFF', '#7C3AED']}
                  style={styles.primaryButtonGradient}
                >
                  {isRunning ? (
                    <Pause size={32} color="#FFFFFF" />
                  ) : (
                    <Play size={32} color="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleStop}
              >
                <Square size={24} color={DesignTokens.colors.error[500]} />
              </TouchableOpacity>
            </View>

            {/* Presets */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Timers</Text>
                <TouchableOpacity 
                  onPress={() => setShowCustomTimer(true)}
                  style={styles.customButton}
                >
                  <Plus size={16} color={DesignTokens.colors.primary[500]} />
                  <Text style={styles.customButtonText}>Custom</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.presetsScroll}
              >
                {timerPresets.map((preset) => (
                  <TimerPreset
                    key={preset.id}
                    preset={preset}
                    isSelected={selectedPreset === preset.id}
                    onPress={() => handlePresetSelect(preset)}
                  />
                ))}
              </ScrollView>
            </View>
          </>
        )}

        {mode === 'interval' && (
          <View style={styles.intervalSection}>
            <Text style={styles.sectionTitle}>Interval Training</Text>
            {intervalPresets.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={styles.intervalPreset}
                onPress={() => router.push('/interval-timer')}
              >
                <LinearGradient
                  colors={['#1A1A1A', '#2A2A2A']}
                  style={styles.intervalPresetGradient}
                >
                  <View style={styles.intervalPresetHeader}>
                    <Text style={styles.intervalPresetName}>{preset.name}</Text>
                    <Text style={styles.intervalPresetRounds}>
                      {preset.rounds} rounds
                    </Text>
                  </View>
                  
                  <View style={styles.intervalPresetDetails}>
                    {preset.intervals.map((interval, idx) => (
                      <View key={idx} style={styles.intervalDetail}>
                        <View 
                          style={[
                            styles.intervalDot,
                            { backgroundColor: interval.color }
                          ]} 
                        />
                        <Text style={styles.intervalDetailText}>
                          {interval.name}: {interval.duration}s
                        </Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {mode === 'stopwatch' && (
          <>
            {/* Stopwatch Display */}
            {renderStopwatch()}

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleReset}
              >
                <RotateCcw size={24} color={DesignTokens.colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.controlButton, styles.primaryButton]}
                onPress={handlePlayPause}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.primaryButtonGradient}
                >
                  {isRunning ? (
                    <Pause size={32} color="#FFFFFF" />
                  ) : (
                    <Play size={32} color="#FFFFFF" />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleStop}
              >
                <Square size={24} color={DesignTokens.colors.error[500]} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* Custom Timer Modal */}
      <Modal
        visible={showCustomTimer}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomTimer(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom Timer</Text>
            
            <View style={styles.timeInputContainer}>
              <View style={styles.timeInput}>
                <TextInput
                  style={styles.timeInputField}
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="0"
                  placeholderTextColor={DesignTokens.colors.text.tertiary}
                />
                <Text style={styles.timeInputLabel}>min</Text>
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              <View style={styles.timeInput}>
                <TextInput
                  style={styles.timeInputField}
                  value={customSeconds}
                  onChangeText={setCustomSeconds}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="0"
                  placeholderTextColor={DesignTokens.colors.text.tertiary}
                />
                <Text style={styles.timeInputLabel}>sec</Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowCustomTimer(false)}
                style={styles.modalButton}
              />
              <Button
                title="Set Timer"
                onPress={handleCustomTimer}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: DesignTokens.typography.fontSize['3xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginLeft: DesignTokens.spacing[3],
  },
  headerRight: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  headerButton: {
    padding: DesignTokens.spacing[2],
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[1],
  },
  modeButton: {
    flex: 1,
    paddingVertical: DesignTokens.spacing[2],
    paddingHorizontal: DesignTokens.spacing[3],
    borderRadius: DesignTokens.borderRadius.md,
    alignItems: 'center',
  },
  activeModeButton: {
    backgroundColor: DesignTokens.colors.primary[500],
  },
  modeButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  activeModeButtonText: {
    color: DesignTokens.colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing[8],
  },
  timerInfo: {
    alignItems: 'center',
    marginTop: DesignTokens.spacing[4],
  },
  timerLabel: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginBottom: DesignTokens.spacing[1],
  },
  timerDuration: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  stopwatchTime: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopwatchText: {
    fontSize: DesignTokens.typography.fontSize['4xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    fontFamily: 'SF Mono',
  },
  stopwatchLabel: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
    marginTop: DesignTokens.spacing[1],
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[8],
    marginBottom: DesignTokens.spacing[8],
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DesignTokens.colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: DesignTokens.spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing[5],
    marginBottom: DesignTokens.spacing[4],
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignTokens.colors.surface.secondary,
    paddingHorizontal: DesignTokens.spacing[3],
    paddingVertical: DesignTokens.spacing[2],
    borderRadius: DesignTokens.borderRadius.lg,
    gap: DesignTokens.spacing[1],
  },
  customButtonText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.primary[500],
    fontWeight: DesignTokens.typography.fontWeight.medium,
  },
  presetsScroll: {
    paddingLeft: DesignTokens.spacing[5],
  },
  intervalSection: {
    padding: DesignTokens.spacing[5],
  },
  intervalPreset: {
    marginBottom: DesignTokens.spacing[4],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
  },
  intervalPresetGradient: {
    padding: DesignTokens.spacing[4],
  },
  intervalPresetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing[3],
  },
  intervalPresetName: {
    fontSize: DesignTokens.typography.fontSize.lg,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
  },
  intervalPresetRounds: {
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.secondary,
  },
  intervalPresetDetails: {
    gap: DesignTokens.spacing[2],
  },
  intervalDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intervalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: DesignTokens.spacing[2],
  },
  intervalDetailText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: DesignTokens.colors.surface.secondary,
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing[6],
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: DesignTokens.typography.fontSize.xl,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: DesignTokens.spacing[6],
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing[6],
  },
  timeInput: {
    alignItems: 'center',
  },
  timeInputField: {
    backgroundColor: DesignTokens.colors.surface.tertiary,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing[4],
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontFamily: 'SF Mono',
    textAlign: 'center',
    minWidth: 80,
    marginBottom: DesignTokens.spacing[2],
  },
  timeInputLabel: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.secondary,
  },
  timeSeparator: {
    fontSize: DesignTokens.typography.fontSize['2xl'],
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.bold,
    marginHorizontal: DesignTokens.spacing[4],
  },
  modalButtons: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[3],
  },
  modalButton: {
    flex: 1,
  },
});
