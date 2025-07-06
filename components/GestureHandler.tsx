import React from 'react';
import { View, ViewProps } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

interface GestureHandlerProps extends ViewProps {
  children: React.ReactNode;
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
}

export default function GestureHandler({
  children,
  onTap,
  onLongPress,
  onSwipeLeft,
  onSwipeRight,
  disabled = false,
  style,
  ...props
}: GestureHandlerProps) {
  if (disabled || (!onTap && !onLongPress && !onSwipeLeft && !onSwipeRight)) {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  const tapGesture = onTap ? Gesture.Tap().onEnd(() => onTap()) : undefined;
  const longPressGesture = onLongPress ? Gesture.LongPress().onEnd(() => onLongPress()) : undefined;
  
  const panGesture = (onSwipeLeft || onSwipeRight) ? 
    Gesture.Pan()
      .onEnd((event) => {
        const { translationX } = event;
        if (Math.abs(translationX) > 50) {
          if (translationX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (translationX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        }
      }) : undefined;

  const gestures = [tapGesture, longPressGesture, panGesture].filter(Boolean);
  const composedGesture = gestures.length > 1 ? Gesture.Race(...gestures) : gestures[0];

  if (!composedGesture) {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={style} {...props}>
        {children}
      </View>
    </GestureDetector>
  );
}
