import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { width: '80%', maxWidth: 400 };
      case 'lg':
        return { width: '95%', maxWidth: 900 };
      default:
        return { width: '90%', maxWidth: 600 };
    }
  };

  return (
    <RNModal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(15, 23, 42, 0.95)'
                  : 'rgba(255, 255, 255, 0.98)',
            },
            getSizeStyle(),
          ]}
        >
          <TouchableOpacity activeOpacity={1}>
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title && (
                  <Text
                    style={[
                      styles.title,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {title}
                  </Text>
                )}
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                  >
                    <X
                      size={20}
                      color={themeColors['muted-foreground']}
                      strokeWidth={2.5}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: borderRadius.xl,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.md,
  },
  content: {
    padding: spacing.lg,
  },
});

