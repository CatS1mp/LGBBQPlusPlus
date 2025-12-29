import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, TextInput } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../../lib/hooks/useTheme';
import { colors, spacing, borderRadius, typography } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';

interface PrinterFiltersProps {
  keyword: string;
  status: string;
  building: string;
  onlyAvailable: boolean;
  colorOnly: boolean;
  duplexOnly: boolean;
  buildingOptions: string[];
  onKeywordChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onBuildingChange: (value: string) => void;
  onOnlyAvailableToggle: () => void;
  onColorOnlyToggle: () => void;
  onDuplexOnlyToggle: () => void;
}

export const PrinterFilters: React.FC<PrinterFiltersProps> = memo(({
  keyword,
  status,
  building,
  onlyAvailable,
  colorOnly,
  duplexOnly,
  buildingOptions,
  onKeywordChange,
  onStatusChange,
  onBuildingChange,
  onOnlyAvailableToggle,
  onColorOnlyToggle,
  onDuplexOnlyToggle,
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { t } = useTranslation('pages');

  const statusTabs: { value: string; label: string }[] = [
    { value: 'all', label: t('student.printers.status.all') },
    { value: 'online', label: t('student.print.step2.status.online') },
    { value: 'busy', label: t('student.printers.status.busy') },
    { value: 'maintenance', label: t('student.print.step2.status.maintenance') },
    { value: 'offline', label: t('student.print.step2.status.offline') },
  ];

  return (
    <Card style={styles.filtersCard}>
      <CardContent>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 1)',
              borderColor: themeColors.border,
              color: themeColors.foreground,
            },
          ]}
          placeholder={t('student.printers.searchPlaceholder')}
          placeholderTextColor={themeColors['muted-foreground']}
          value={keyword}
          onChangeText={onKeywordChange}
        />

        <View style={styles.filtersColumn}>
          <Select
            value={status}
            onChange={(value: string) => onStatusChange(value)}
            options={statusTabs.map(tab => ({
              label: tab.label,
              value: tab.value,
            }))}
            placeholder={t('student.printers.filterStatus')}
            style={styles.filterItem}
          />
          <Select
            value={building}
            onChange={onBuildingChange}
            options={[
              { label: t('student.print.step2.allBuildings'), value: 'all' },
              ...buildingOptions.map(b => ({ label: b, value: b })),
            ]}
            placeholder={t('student.print.step2.building')}
            style={styles.filterItem}
          />
        </View>

        <View style={styles.checkboxColumn}>
          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={onOnlyAvailableToggle}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: onlyAvailable
                    ? themeColors.primary
                    : 'transparent',
                  borderColor: themeColors.border,
                },
              ]}
            >
              {onlyAvailable && (
                <Check
                  size={16}
                  color={themeColors['primary-foreground']}
                  strokeWidth={3}
                />
              )}
            </View>
            <Text
              style={[
                styles.checkboxLabel,
                { color: themeColors.foreground },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {t('student.printers.filters.readyOnly')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={onColorOnlyToggle}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: colorOnly
                    ? themeColors.primary
                    : 'transparent',
                  borderColor: themeColors.border,
                },
              ]}
            >
              {colorOnly && (
                <Check
                  size={16}
                  color={themeColors['primary-foreground']}
                  strokeWidth={3}
                />
              )}
            </View>
            <Text
              style={[
                styles.checkboxLabel,
                { color: themeColors.foreground },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {t('student.printers.filters.colorOnly')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={onDuplexOnlyToggle}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: duplexOnly
                    ? themeColors.primary
                    : 'transparent',
                  borderColor: themeColors.border,
                },
              ]}
            >
              {duplexOnly && (
                <Check
                  size={16}
                  color={themeColors['primary-foreground']}
                  strokeWidth={3}
                />
              )}
            </View>
            <Text
              style={[
                styles.checkboxLabel,
                { color: themeColors.foreground },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {t('student.printers.filters.duplexOnly')}
            </Text>
          </TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  );
});

PrinterFilters.displayName = 'PrinterFilters';

const styles = StyleSheet.create({
  filtersCard: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
  },
  filtersColumn: {
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  filterItem: {
    width: '100%',
  },
  checkboxColumn: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.sm,
    flex: 1,
    minWidth: 0,
  },
});

