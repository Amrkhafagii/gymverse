import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
} from 'lucide-react-native';
import { DesignTokens } from '@/design-system/tokens';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

interface FormVideoPlayerProps {
  videoUrl: string;
  title?: string;
  onFullscreen?: () => void;
}

export const FormVideoPlayer: React.FC<FormVideoPlayerProps> = ({
  videoUrl,
  title,
  onFullscreen,
}) => {
  const [status, setStatus] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const video = useRef<Video>(null);
  const controlsTimeout = useRef<NodeJS.Timeout>();

  const handlePlayPause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (status.isPlaying) {
      video.current?.pauseAsync();
    } else {
      video.current?.playAsync();
    }
  };

  const handleRestart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    video.current?.replayAsync();
  };

  const handleMute = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsMuted(!isMuted);
    video.current?.setIsMutedAsync(!isMuted);
  };

  const handleSeek = async (direction: 'forward' | 'backward') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (status.positionMillis !== undefined && status.durationMillis) {
      const seekAmount = 5000; // 5 seconds
      const currentPosition = status.positionMillis;
      const newPosition = direction === 'forward' 
        ? Math.min(currentPosition + seekAmount, status.durationMillis)
        : Math.max(currentPosition - seekAmount, 0);
      
      video.current?.setPositionAsync(newPosition);
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    
    controlsTimeout.current = setTimeout(() => {
      if (status.isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleVideoPress = () => {
    showControlsTemporarily();
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.videoContainer}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <Video
          ref={video}
          style={styles.video}
          source={{ uri: videoUrl }}
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={false}
          isMuted={isMuted}
          onPlaybackStatusUpdate={(status) => {
            setStatus(status);
            if (status.isLoaded) {
              setIsLoading(false);
            }
          }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && !isLoading && (
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
            style={styles.controlsOverlay}
          >
            {/* Top Controls */}
            <View style={styles.topControls}>
              {title && (
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {title}
                </Text>
              )}
              <TouchableOpacity style={styles.controlButton} onPress={onFullscreen}>
                <Maximize size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity 
                style={styles.seekButton}
                onPress={() => handleSeek('backward')}
              >
                <SkipBack size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlayPause}
              >
                {status.isPlaying ? (
                  <Pause size={32} color="#FFFFFF" />
                ) : (
                  <Play size={32} color="#FFFFFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.seekButton}
                onPress={() => handleSeek('forward')}
              >
                <SkipForward size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      {
                        width: status.durationMillis 
                          ? `${(status.positionMillis / status.durationMillis) * 100}%`
                          : '0%'
                      }
                    ]}
                  />
                </View>
                <Text style={styles.timeText}>
                  {status.positionMillis ? formatTime(status.positionMillis) : '0:00'} / {' '}
                  {status.durationMillis ? formatTime(status.durationMillis) : '0:00'}
                </Text>
              </View>

              <View style={styles.bottomRightControls}>
                <TouchableOpacity style={styles.controlButton} onPress={handleRestart}>
                  <RotateCcw size={20} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton} onPress={handleMute}>
                  {isMuted ? (
                    <VolumeX size={20} color="#FFFFFF" />
                  ) : (
                    <Volume2 size={20} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignTokens.colors.neutral[900],
    borderRadius: DesignTokens.borderRadius.lg,
    overflow: 'hidden',
    ...DesignTokens.shadow.lg,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: DesignTokens.colors.primary[500],
    borderTopColor: 'transparent',
    marginBottom: DesignTokens.spacing[2],
  },
  loadingText: {
    fontSize: DesignTokens.typography.fontSize.sm,
    color: DesignTokens.colors.text.primary,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: DesignTokens.spacing[4],
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoTitle: {
    flex: 1,
    fontSize: DesignTokens.typography.fontSize.base,
    color: DesignTokens.colors.text.primary,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    marginRight: DesignTokens.spacing[2],
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: DesignTokens.spacing[6],
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    ...DesignTokens.shadow.base,
  },
  seekButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginRight: DesignTokens.spacing[4],
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: DesignTokens.spacing[1],
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignTokens.colors.primary[500],
    borderRadius: 2,
  },
  timeText: {
    fontSize: DesignTokens.typography.fontSize.xs,
    color: DesignTokens.colors.text.primary,
  },
  bottomRightControls: {
    flexDirection: 'row',
    gap: DesignTokens.spacing[2],
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
