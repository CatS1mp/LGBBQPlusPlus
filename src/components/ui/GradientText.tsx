import React from 'react';
import { Text, TextProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';

interface GradientTextProps extends TextProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const GradientText: React.FC<GradientTextProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  style,
  children,
  ...textProps
}) => {
  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]} {...textProps}>
          {children}
        </Text>
      }
    >
      <LinearGradient colors={colors} start={start} end={end}>
        <Text style={[style, { opacity: 0 }]} {...textProps}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
};

