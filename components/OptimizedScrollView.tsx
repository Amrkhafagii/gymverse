import React, { useCallback } from 'react';
import { ScrollView, ScrollViewProps, RefreshControl } from 'react-native';

interface OptimizedScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  enableRefresh?: boolean;
}

export default function OptimizedScrollView({
  children,
  onRefresh,
  refreshing = false,
  enableRefresh = false,
  ...props
}: OptimizedScrollViewProps) {
  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      refreshControl={
        enableRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#9E7FFF"
            colors={['#9E7FFF']}
          />
        ) : undefined
      }
      {...props}
    >
      {children}
    </ScrollView>
  );
}
