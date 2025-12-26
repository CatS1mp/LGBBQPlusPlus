import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Modal } from './Modal';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  style?: ViewStyle;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  style,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <>
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
          style,
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={[
            styles.text,
            {
              color: selectedOption
                ? themeColors.foreground
                : themeColors['muted-foreground'],
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder || 'Select...'}
        </Text>
        <ChevronDown
          size={20}
          color={themeColors['muted-foreground']}
          strokeWidth={2}
        />
      </TouchableOpacity>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={placeholder || 'Select an option'}
        size="sm"
      >
        <View>
          {options.map(item => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.option,
                {
                  backgroundColor:
                    item.value === value
                      ? themeColors.primary
                      : 'transparent',
                },
              ]}
              onPress={() => {
                onChange(item.value);
                setIsOpen(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color:
                      item.value === value
                        ? themeColors['primary-foreground']
                        : themeColors.foreground,
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: typography.fontSize.base,
    flex: 1,
  },
  arrow: {
    marginLeft: spacing.sm,
  },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  optionText: {
    fontSize: typography.fontSize.base,
  },
});

