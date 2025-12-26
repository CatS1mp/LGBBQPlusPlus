import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  style,
  secureTextEntry,
  ...props
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const showPasswordToggle = secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: themeColors.foreground },
          ]}
        >
          {label}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 1)',
              borderColor: error
                ? themeColors.destructive
                : themeColors.border,
              color: themeColors.foreground,
              paddingRight: showPasswordToggle ? spacing['3xl'] : spacing.md,
            },
            style,
          ]}
          placeholderTextColor={themeColors['muted-foreground']}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            {isPasswordVisible ? (
              <EyeOff
                size={20}
                color={themeColors['muted-foreground']}
              />
            ) : (
              <Eye
                size={20}
                color={themeColors['muted-foreground']}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={[
            styles.errorText,
            { color: themeColors.destructive },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});

