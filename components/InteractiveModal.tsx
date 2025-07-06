import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

interface InteractiveModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
  closeOnBackdropPress?: boolean;
  closeOnBackButton?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export default function InteractiveModal({
  visible,
  onClose,
  children,
  animationType = 'slide',
  presentationStyle = 'pageSheet',
  closeOnBackdropPress = true,
  closeOnBackButton = true,
}: InteractiveModalProps) {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (animationType === 'slide') {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
      if (animationType === 'fade') {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } else {
      if (animationType === 'slide') {
        Animated.spring(slideAnim, {
          toValue: screenHeight,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
      if (animationType === 'fade') {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [visible, animationType, slideAnim, fadeAnim]);

  useEffect(() => {
    if (!closeOnBackButton) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onClose, closeOnBackButton]);

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const getAnimatedStyle = () => {
    switch (animationType) {
      case 'slide':
        return {
          transform: [{ translateY: slideAnim }],
        };
      case 'fade':
        return {
          opacity: fadeAnim,
        };
      default:
        return {};
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
      transparent={presentationStyle === 'overFullScreen'}
    >
      {presentationStyle === 'overFullScreen' && (
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}
      
      <Animated.View style={[styles.container, getAnimatedStyle()]}>
        <LinearGradient colors={['#0a0a0a', '#1a1a1a']} style={styles.gradient}>
          <SafeAreaView style={styles.safeArea}>
            {children}
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
