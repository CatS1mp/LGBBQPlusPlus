import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { Card } from './Card';

export type SummaryItem = {
  label: string | React.ReactNode;
  value: string | React.ReactNode;
  itemStyle?: ViewStyle;
  labelStyle?: TextStyle;
  valueStyle?: TextStyle;
};

interface SummaryCardProps {
  items: SummaryItem[];
  style?: ViewStyle;
  cardStyle?: ViewStyle;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  items,
  style,
  cardStyle,
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <Card style={[styles.card, cardStyle]}>
      <View style={[styles.content, style]}>
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              styles.item,
              {
                backgroundColor:
                  theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 1)',
                borderColor: themeColors.border,
              },
              item.itemStyle,
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: themeColors['muted-foreground'] },
                item.labelStyle,
              ]}
            >
              {item.label}
            </Text>
            <View style={styles.valueContainer}>
              {typeof item.value === 'string' ? (
                <Text
                  style={[
                    styles.value,
                    { color: themeColors.foreground },
                    item.valueStyle,
                  ]}
                >
                  {item.value}
                </Text>
              ) : React.isValidElement(item.value) &&
                typeof item.value.type === 'function' ? (
                React.cloneElement(item.value as React.ReactElement<any>, {
                  style: [
                    styles.value,
                    { color: themeColors.foreground },
                    item.valueStyle,
                    (item.value as React.ReactElement).props?.style,
                  ],
                })
              ) : (
                <Text
                  style={[
                    styles.value,
                    { color: themeColors.foreground },
                    item.valueStyle,
                  ]}
                >
                  {item.value}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  content: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  labelContainer: {
    flex: 1,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    flex: 1,
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'right',
  },
});

