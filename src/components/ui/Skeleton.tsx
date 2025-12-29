import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../../lib/hooks/useTheme';
import { colors } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  variant = 'rectangular',
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: typeof height === 'number' ? height / 2 : 50,
        };
      case 'text':
        return {
          borderRadius: 4,
          height: 16,
        };
      default:
        return {
          borderRadius,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height: variant === 'text' ? 16 : height,
          backgroundColor:
            theme === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
          opacity,
        },
        getVariantStyle(),
        style,
      ]}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  width?: number | string;
  lastLineWidth?: number | string;
  style?: ViewStyle;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  width = '100%',
  lastLineWidth = '75%',
  style,
}) => {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : width}
          style={index < lines - 1 ? { marginBottom: 8 } : undefined}
        />
      ))}
    </View>
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            theme === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.9)',
        },
        style,
      ]}
    >
      <Skeleton width="60%" height={20} style={{ marginBottom: 12 }} />
      <SkeletonText lines={3} />
    </View>
  );
};

interface SkeletonAvatarProps {
  size?: number;
  style?: ViewStyle;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 64,
  style,
}) => {
  return <Skeleton variant="circular" width={size} height={size} style={style} />;
};

interface SkeletonButtonProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  width = 120,
  height = 44,
  style,
}) => {
  return <Skeleton width={width} height={height} borderRadius={8} style={style} />;
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  textContainer: {
    width: '100%',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
});

