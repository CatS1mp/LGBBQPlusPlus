import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInput,
  Platform,
} from 'react-native';
import { Modal } from './Modal';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { format, parse } from 'date-fns';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  min?: string;
  max?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Select date',
  style,
  min,
  max,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      return format(date, 'dd/MM/yyyy');
    } catch {
      return dateStr;
    }
  };

  const handleConfirm = () => {
    onChange(tempValue);
    setIsOpen(false);
  };

  return (
    <View style={style}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor:
              theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 1)',
            borderColor: themeColors.border,
          },
        ]}
        onPress={() => {
          setTempValue(value || '');
          setIsOpen(true);
        }}
      >
        <Text
          style={[
            styles.text,
            {
              color: value
                ? themeColors.foreground
                : themeColors['muted-foreground'],
            },
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Select Date"
        size="sm"
      >
        <View style={styles.modalContent}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor:
                  theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 1)',
                borderColor: themeColors.border,
                color: themeColors.foreground,
              },
            ]}
            value={tempValue}
            onChangeText={setTempValue}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={themeColors['muted-foreground']}
          />
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: themeColors.primary },
            ]}
            onPress={handleConfirm}
          >
            <Text
              style={[
                styles.buttonText,
                { color: themeColors['primary-foreground'] },
              ]}
            >
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    height: 44,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  text: {
    fontSize: typography.fontSize.base,
  },
  modalContent: {
    padding: spacing.md,
  },
  input: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.fontSize.base,
  },
  button: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
});

