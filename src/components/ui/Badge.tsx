import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Gradient, gradientPresets } from './Gradient';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient' | 'christmas';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: string[];
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
  gradientColors,
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return {
          bg: theme === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)',
          text: theme === 'dark' ? '#86efac' : '#16a34a',
        };
      case 'warning':
        return {
          bg: theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.15)',
          text: theme === 'dark' ? '#fde047' : '#d97706',
        };
      case 'error':
        return {
          bg: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
          text: theme === 'dark' ? '#fca5a5' : '#dc2626',
        };
      case 'info':
        return {
          bg: theme === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(56, 189, 248, 0.15)',
          text: theme === 'dark' ? '#7dd3fc' : '#0284c7',
        };
      case 'christmas':
        return {
          bg: 'transparent',
          text: '#ffffff',
        };
      default:
        return {
          bg: theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.15)',
          text: theme === 'dark' ? '#cbd5e1' : '#64748b',
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          fontSize: typography.fontSize.xs,
        };
      case 'lg':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          fontSize: typography.fontSize.base,
        };
      default:
        return {
          paddingVertical: spacing.xs + 2,
          paddingHorizontal: spacing.sm + 2,
          fontSize: typography.fontSize.sm,
        };
    }
  };

  const sizeStyle = getSizeStyle();
  const badgeColors = getBadgeColors();

  const badgeContent = (
    <Text
      style={[
        styles.text,
        {
          color: badgeColors.text,
          fontSize: sizeStyle.fontSize,
        },
        textStyle,
      ]}
    >
      {label}
    </Text>
  );

  if (variant === 'gradient' || variant === 'christmas') {
    const gradientColorsToUse =
      variant === 'christmas'
        ? gradientPresets.christmas
        : gradientColors || gradientPresets.primary;

    return (
      <Gradient
        colors={gradientColorsToUse}
        style={[
          styles.badge,
          {
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            borderRadius: borderRadius.full,
          },
          style,
        ]}
      >
        {badgeContent}
      </Gradient>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          paddingVertical: sizeStyle.paddingVertical,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: borderRadius.full,
        },
        style,
      ]}
    >
      {badgeContent}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});

