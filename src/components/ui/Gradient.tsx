import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { ViewStyle, StyleProp } from 'react-native';

interface GradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const Gradient: React.FC<GradientProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  children,
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};

export const gradientPresets = {
  primary: ['#667eea', '#764ba2'],
  success: ['#11998e', '#38ef7d'],
  warning: ['#f093fb', '#f5576c'],
  info: ['#4facfe', '#00f2fe'],
  sunset: ['#fa709a', '#fee140'],
  ocean: ['#2ecc71', '#3498db'],
  purple: ['#a8edea', '#fed6e3'],
  christmas: ['#d32f2f', '#388e3c'],
  christmasAlt: ['#c62828', '#2e7d32'],
};

