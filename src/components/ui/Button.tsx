import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { Gradient, gradientPresets } from './Gradient';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';

type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'gradient';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradientColors?: string[];
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  style,
  textStyle,
  gradientColors,
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'sm':
        baseStyle.paddingVertical = spacing.sm;
        baseStyle.paddingHorizontal = spacing.md;
        baseStyle.minHeight = 36;
        break;
      case 'lg':
        baseStyle.paddingVertical = spacing.md;
        baseStyle.paddingHorizontal = spacing.xl;
        baseStyle.minHeight = 48;
        break;
      case 'icon':
        baseStyle.width = 40;
        baseStyle.height = 40;
        baseStyle.paddingVertical = 0;
        baseStyle.paddingHorizontal = 0;
        break;
      default:
        baseStyle.paddingVertical = spacing.sm + 2;
        baseStyle.paddingHorizontal = spacing.lg;
        baseStyle.minHeight = 44;
    }

    // Variant styles
    switch (variant) {
      case 'default':
        baseStyle.backgroundColor = themeColors.primary;
        break;
      case 'destructive':
        baseStyle.backgroundColor = themeColors.destructive;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = themeColors.border;
        break;
      case 'secondary':
        baseStyle.backgroundColor = themeColors.secondary;
        break;
      case 'ghost':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'link':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'gradient':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: typography.fontSize.base,
      fontWeight: '600',
    };

    switch (size) {
      case 'sm':
        baseStyle.fontSize = typography.fontSize.sm;
        break;
      case 'lg':
        baseStyle.fontSize = typography.fontSize.lg;
        break;
    }

    switch (variant) {
      case 'default':
        baseStyle.color = themeColors['primary-foreground'];
        break;
      case 'destructive':
        baseStyle.color = themeColors['destructive-foreground'];
        break;
      case 'outline':
      case 'secondary':
        baseStyle.color = themeColors['secondary-foreground'];
        break;
      case 'ghost':
        baseStyle.color = themeColors.foreground;
        break;
      case 'link':
        baseStyle.color = themeColors.primary;
        baseStyle.textDecorationLine = 'underline';
        break;
      case 'gradient':
        baseStyle.color = '#ffffff';
        break;
    }

    return baseStyle;
  };

  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextStyle().color}
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </>
  );

  if (variant === 'gradient' && !disabled) {
    const gradientColorsToUse = gradientColors || gradientPresets.primary;
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
          style={[disabled && styles.disabled, style]}
        >
          <Gradient
            colors={gradientColorsToUse}
            style={[getButtonStyle()]}
          >
            {buttonContent}
          </Gradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[getButtonStyle(), disabled && styles.disabled, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.7}
      >
        {buttonContent}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});

