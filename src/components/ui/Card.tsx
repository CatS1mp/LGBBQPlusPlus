import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            variant === 'outlined'
              ? 'transparent'
              : theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.9)',
          borderColor: themeColors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  return <View style={[styles.header, style]}>{children}</View>;
};

interface CardTitleProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, style }) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View style={style}>
      {typeof children === 'string' ? (
        <View style={[styles.title, { color: themeColors.foreground }]}>
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  style,
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View style={style}>
      {typeof children === 'string' ? (
        <View style={[styles.description, { color: themeColors['muted-foreground'] }]}>
          {children}
        </View>
      ) : (
        children
      )}
    </View>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  style,
}) => {
  return <View style={[styles.content, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
});

