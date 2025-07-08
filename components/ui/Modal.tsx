/**
 * Production-ready Modal component with offline states
 * Integrates with sync system and provides consistent modal patterns
 */

import React, { useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignTokens } from '@/design-system/tokens';
import { useOfflineSync } from '@/hooks/useOfflineSync';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  position?: 'center' | 'bottom';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  animationType?: 'slide' | 'fade';
  syncStatus?: 'synced' | 'pending' | 'failed' | 'offline';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  position = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  animationType = 'slide',
  syncStatus,
}) => {
  const insets = useSafeAreaInsets();
  const { isOnline } = useOfflineSync();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getModalHeight = () => {
    switch (size) {
      case 'small':
        return SCREEN_HEIGHT * 0.3;
      case 'medium':
        return SCREEN_HEIGHT * 0.5;
      case 'large':
        return SCREEN_HEIGHT * 0.7;
      case 'fullscreen':
        return SCREEN_HEIGHT;
      default:
        return SCREEN_HEIGHT * 0.5;
    }
  };

  const getTransform = () => {
    if (position === 'bottom') {
      return {
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [getModalHeight(), 0],
            }),
          },
        ],
      };
    }
    
    return {
      transform: [
        {
          scale: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
          }),
        },
      ],
    };
  };

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const modalStyles = [
    styles.modal,
    styles[`modal_${position}`],
    styles[`modal_${size}`],
    position === 'bottom' && { height: getModalHeight() },
    !isOnline && styles.offline,
    syncStatus && styles[`sync_${syncStatus}`],
  ];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </Animated.View>

        <Animated.View style={[modalStyles, getTransform()]}>
          {syncStatus && (
            <View style={[styles.syncIndicator, styles[`syncIndicator_${syncStatus}`]]} />
          )}
          
          {(title || showCloseButton) && (
            <View style={[styles.header, { paddingTop: position === 'fullscreen' ? insets.top : 0 }]}>
              {title && (
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
              )}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={DesignTokens.colors.text.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView
            style={styles.content}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: insets.bottom },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  backdropTouchable: {
    flex: 1,
  },
  
  modal: {
    backgroundColor: DesignTokens.colors.surface.primary,
    borderRadius: DesignTokens.borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.9,
    width: '90%',
    ...DesignTokens.shadow.lg,
    position: 'relative',
  },
  
  // Position variants
  modal_center: {
    alignSelf: 'center',
  },
  
  modal_bottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: DesignTokens.borderRadius.xl,
    borderTopRightRadius: DesignTokens.borderRadius.xl,
  },
  
  // Size variants
  modal_small: {
    maxWidth: 400,
  },
  
  modal_medium: {
    maxWidth: 500,
  },
  
  modal_large: {
    maxWidth: 600,
  },
  
  modal_fullscreen: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    maxHeight: '100%',
  },
  
  // States
  offline: {
    opacity: 0.9,
    backgroundColor: DesignTokens.colors.surface.secondary,
  },
  
  // Sync status
  sync_synced: {
    borderTopWidth: 3,
    borderTopColor: DesignTokens.colors.success[500],
  },
  sync_pending: {
    borderTopWidth: 3,
    borderTopColor: DesignTokens.colors.warning[500],
  },
  sync_failed: {
    borderTopWidth: 3,
    borderTopColor: DesignTokens.colors.error[500],
  },
  sync_offline: {
    borderTopWidth: 3,
    borderTopColor: DesignTokens.colors.text.secondary,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignTokens.spacing[6],
    paddingVertical: DesignTokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: DesignTokens.colors.border.primary,
  },
  
  title: {
    fontSize: DesignTokens.typography.fontSize.lg,
    fontWeight: DesignTokens.typography.fontWeight.semibold,
    color: DesignTokens.colors.text.primary,
    flex: 1,
  },
  
  closeButton: {
    padding: DesignTokens.spacing[2],
    marginRight: -DesignTokens.spacing[2],
  },
  
  content: {
    flex: 1,
  },
  
  contentContainer: {
    padding: DesignTokens.spacing[6],
    flexGrow: 1,
  },
  
  syncIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  
  syncIndicator_synced: {
    backgroundColor: DesignTokens.colors.success[500],
  },
  syncIndicator_pending: {
    backgroundColor: DesignTokens.colors.warning[500],
  },
  syncIndicator_failed: {
    backgroundColor: DesignTokens.colors.error[500],
  },
  syncIndicator_offline: {
    backgroundColor: DesignTokens.colors.text.secondary,
  },
});
