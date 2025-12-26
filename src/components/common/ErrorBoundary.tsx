import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const handleReload = () => {
    // In a real app, you might want to reset navigation state
    // For now, we'll just reload the app
    if (__DEV__) {
      console.log('Reloading app...');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: themeColors.foreground },
          ]}
        >
          Something went wrong
        </Text>
        <Text
          style={[
            styles.message,
            { color: themeColors['muted-foreground'] },
          ]}
        >
          {error?.message || 'An unexpected error occurred'}
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: themeColors.primary },
          ]}
          onPress={handleReload}
        >
          <Text
            style={[
              styles.buttonText,
              { color: themeColors['primary-foreground'] },
            ]}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

