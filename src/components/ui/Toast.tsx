import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onDismiss,
  duration = 3000,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      handleDismiss();
    }
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          backgroundColor: '#10b981',
          iconColor: '#ffffff',
        };
      case 'error':
        return {
          icon: XCircle,
          backgroundColor: '#ef4444',
          iconColor: '#ffffff',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          backgroundColor: '#f59e0b',
          iconColor: '#ffffff',
        };
      default:
        return {
          icon: AlertCircle,
          backgroundColor: '#3b82f6',
          iconColor: '#ffffff',
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: config.backgroundColor,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Icon size={20} color={config.iconColor} style={styles.icon} />
        <Text style={styles.message} numberOfLines={3}>
          {message}
        </Text>
        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={16} color={config.iconColor} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    minHeight: 48,
    maxWidth: Dimensions.get('window').width - spacing.md * 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    color: '#ffffff',
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
});

