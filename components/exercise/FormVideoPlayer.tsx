import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
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
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react-native';

interface FormVideoPlayerProps {
  videoUrl: string;
  exerciseName: string;
  onPlaybackStatusUpdate?: (status: any) => void;
  autoPlay?: boolean;
  showControls?: boolean;
  loopVideo?: boolean;
  compact?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function FormVideoPlayer({
  videoUrl,
  exerciseName,
  onPlaybackStatusUpdate,
  autoPlay = false,
  showControls = true,
  loopVideo = true,
  compact = false,
}: FormVideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.playAsync();
    }
  }, [autoPlay]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControlsOverlay && status.isPlaying) {
      timeout = setTimeout(() => {
        setShowControlsOverlay(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControlsOverlay, status.isPlaying]);

  const handlePlaybackStatusUpdate = (playbackStatus: any) => {
    setStatus(playbackStatus);
    onPlaybackStatusUpdate?.(playbackStatus);
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleRestart = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.replayAsync();
    } catch (error) {
      console.error('Error restarting video:', error);
    }
  };

  const toggleMute = async () => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const changePlaybackSpeed = async () => {
    if (!videoRef.current) return;

    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];

    try {
      await videoRef.current.setRateAsync(nextSpeed, true);
      setPlaybackSpeed(nextSpeed);
    } catch (error) {
      console.error('Error changing playback speed:', error);
    }
  };

  const seekBackward = async () => {
    if (!videoRef.current || !status.durationMillis) return;

    try {
      const newPosition = Math.max(0, (status.positionMillis || 0) - 5000);
      await videoRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error seeking backward:', error);
    }
  };

  const seekForward = async () => {
    if (!videoRef.current || !status.durationMillis) return;

    try {
      const newPosition = Math.min(
        status.durationMillis,
        (status.positionMillis || 0) + 5000
      );
      await videoRef.current.setPositionAsync(newPosition);
    } catch (error) {
      console.error('Error seeking forward:', error);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleControlsVisibility = () => {
    setShowControlsOverlay(!showControlsOverlay);
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!status.durationMillis || !status.positionMillis) return 0;
    return (status.positionMillis / status.durationMillis) * 100;
  };

  const videoStyle = compact 
    ? styles.compactVideo 
    : isFullscreen 
      ? styles.fullscreenVideo 
      : styles.normalVideo;

  const containerStyle = compact 
    ? styles.compactContainer 
    : isFullscreen 
      ? styles.fullscreenContainer 
      : styles.normalContainer;

  return (
    <View style={containerStyle}>
      <TouchableOpacity 
        style={styles.videoContainer} 
        activeOpacity={1}
        onPress={toggleControlsVisibility}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          style={videoStyle}
          resizeMode={ResizeMode.CONTAIN}
          isLooping={loopVideo}
          isMuted={isMuted}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          shouldPlay={autoPlay}
        />

        {/* Loading Overlay */}
        {status.isBuffering && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && showControlsOverlay && (
          <View style={styles.controlsOverlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.7)']}
              style={styles.controlsGradient}
            >
              {/* Top Controls */}
              <View style={styles.topControls}>
                <Text style={styles.exerciseTitle} numberOfLines={1}>
                  {exerciseName}
                </Text>
                <View style={styles.topRightControls}>
                  <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
                    {isMuted ? (
                      <VolumeX size={20} color="#fff" />
                    ) : (
                      <Volume2 size={20} color="#fff" />
                    )}
                  </TouchableOpacity>
                  {!compact && (
                    <TouchableOpacity style={styles.controlButton} onPress={toggleFullscreen}>
                      {isFullscreen ? (
                        <Minimize size={20} color="#fff" />
                      ) : (
                        <Maximize size={20} color="#fff" />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Center Controls */}
              <View style={styles.centerControls}>
                <TouchableOpacity style={styles.seekButton} onPress={seekBackward}>
                  <SkipBack size={24} color="#fff" />
                  <Text style={styles.seekText}>5s</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                  <LinearGradient
                    colors={['#FF6B35', '#FF8C42']}
                    style={styles.playButtonGradient}
                  >
                    {status.isPlaying ? (
                      <Pause size={32} color="#fff" />
                    ) : (
                      <Play size={32} color="#fff" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.seekButton} onPress={seekForward}>
                  <SkipForward size={24} color="#fff" />
                  <Text style={styles.seekText}>5s</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(status.positionMillis || 0)}
                  </Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${getProgressPercentage()}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.timeText}>
                    {formatTime(status.durationMillis || 0)}
                  </Text>
                </View>

                <View style={styles.bottomRightControls}>
                  <TouchableOpacity style={styles.controlButton} onPress={handleRestart}>
                    <RotateCcw size={18} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.speedButton} onPress={changePlaybackSpeed}>
                    <Text style={styles.speedText}>{playbackSpeed}x</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Error State */}
        {status.error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>Failed to load video</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRestart}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {/* External Controls for Compact Mode */}
      {compact && showControls && (
        <View style={styles.externalControls}>
          <TouchableOpacity style={styles.externalButton} onPress={togglePlayPause}>
            {status.isPlaying ? (
              <Pause size={16} color="#FF6B35" />
            ) : (
              <Play size={16} color="#FF6B35" />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.externalButton} onPress={handleRestart}>
            <RotateCcw size={16} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.externalButton} onPress={toggleMute}>
            {isMuted ? (
              <VolumeX size={16} color="#999" />
            ) : (
              <Volume2 size={16} color="#999" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  normalContainer: {
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  compactContainer: {
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 4,
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  videoContainer: {
    position: 'relative',
  },
  normalVideo: {
    width: '100%',
    height: 200,
  },
  compactVideo: {
    width: '100%',
    height: 120,
  },
  fullscreenVideo: {
    width: screenWidth,
    height: screenHeight,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsGradient: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    flex: 1,
    marginRight: 16,
  },
  topRightControls: {
    flexDirection: 'row',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  centerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekButton: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  seekText: {
    fontSize: 10,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginTop: 4,
  },
  playButton: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  bottomRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  speedText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  errorText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Inter-Medium',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  externalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
  },
  externalButton: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 8,
    marginHorizontal: 4,
  },
});
