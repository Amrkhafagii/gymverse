import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

interface TouchableCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  preventBubbling?: boolean;
}

export default function TouchableCard({ 
  children, 
  style, 
  gradient = false,
  preventBubbling = false,
  onPress,
  ...props 
}: TouchableCardProps) {
  const handlePress = (event: any) => {
    if (preventBubbling) {
      event.stopPropagation();
    }
    onPress?.(event);
  };

  return (
    <TouchableOpacity
      style={[
        {
          borderRadius: 16,
          overflow: 'hidden',
        },
        style
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}
