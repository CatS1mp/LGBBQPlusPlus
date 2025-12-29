import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../lib/hooks/useTheme';
import { colors } from '../../../theme';
import { useTranslation } from 'react-i18next';
import { SkeletonCard } from '../../../components/ui/Skeleton';
import type { AvailablePrinterResponse } from '../../../types/api';

interface PrinterListProps {
  printers: AvailablePrinterResponse[];
  loading: boolean;
  isFetching?: boolean;
  selectedPrinter: AvailablePrinterResponse | null;
  onSelectPrinter: (printer: AvailablePrinterResponse) => void;
  queueData?: any;
  filterKey?: string;
}

const PrinterItem = memo<{
  item: AvailablePrinterResponse;
  isSelected: boolean;
  onPress: () => void;
  queueInfo?: any;
  theme: 'light' | 'dark';
  themeColors: any;
  t: any;
}>(({ item, isSelected, onPress, queueInfo, theme, themeColors, t }) => {
  return (
    <TouchableOpacity
      style={[
        styles.printerItem,
        {
          backgroundColor: isSelected
            ? themeColors.primary
            : theme === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.9)',
          borderColor: isSelected
            ? themeColors.primary
            : themeColors.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.printerInfo}>
        <Text
          style={[
            styles.printerName,
            {
              color: isSelected
                ? themeColors['primary-foreground']
                : themeColors.foreground,
            },
          ]}
        >
          {item.brandName} {item.modelName}
        </Text>
        <Text
          style={[
            styles.printerLocation,
            {
              color: isSelected
                ? themeColors['primary-foreground']
                : themeColors['muted-foreground'],
            },
          ]}
        >
          {item.buildingCode} • {item.roomCode}
        </Text>
        {queueInfo && queueInfo.queueCount > 0 && (
          <Text
            style={[
              styles.queueInfo,
              {
                color: isSelected
                  ? themeColors['primary-foreground']
                  : themeColors['muted-foreground'],
              },
            ]}
          >
            {queueInfo.queueCount} {t('student.printers.jobsAhead')}
          </Text>
        )}
        <View style={styles.printerFeatures}>
          {item.supportsColor && (
            <View
              style={[
                styles.featureBadge,
                {
                  backgroundColor: isSelected
                    ? 'rgba(255, 255, 255, 0.2)'
                    : theme === 'dark'
                      ? 'rgba(59, 130, 246, 0.15)'
                      : 'rgba(59, 130, 246, 0.1)',
                },
              ]}
            >
              <Text
                style={[
                  styles.featureText,
                  {
                    color: isSelected
                      ? themeColors['primary-foreground']
                      : theme === 'dark'
                        ? '#7dd3fc'
                        : '#0284c7',
                  },
                ]}
              >
                {t('student.printers.color')}
              </Text>
            </View>
          )}
          {item.supportsDuplex && (
            <View
              style={[
                styles.featureBadge,
                {
                  backgroundColor: isSelected
                    ? 'rgba(255, 255, 255, 0.2)'
                    : theme === 'dark'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(34, 197, 94, 0.1)',
                },
              ]}
            >
              <Text
                style={[
                  styles.featureText,
                  {
                    color: isSelected
                      ? themeColors['primary-foreground']
                      : theme === 'dark'
                        ? '#86efac'
                        : '#16a34a',
                  },
                ]}
              >
                {t('student.printers.twoSided')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

PrinterItem.displayName = 'PrinterItem';

export const PrinterList: React.FC<PrinterListProps> = memo(({
  printers,
  loading,
  isFetching = false,
  selectedPrinter,
  onSelectPrinter,
  queueData,
  filterKey = '',
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { t } = useTranslation('pages');

  const filteredPrinters = printers.filter(p => p.isEnabled);

  const renderItem = useCallback(({ item }: { item: AvailablePrinterResponse }) => {
    const isSelected = selectedPrinter?.printerId === item.printerId;
    const queueInfo = isSelected && queueData?.data?.data;

    return (
      <PrinterItem
        item={item}
        isSelected={isSelected}
        onPress={() => onSelectPrinter(item)}
        queueInfo={queueInfo}
        theme={theme}
        themeColors={themeColors}
        t={t}
      />
    );
  }, [selectedPrinter, queueData, onSelectPrinter, theme, themeColors, t]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (filteredPrinters.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: themeColors['muted-foreground'] }]}>
          {t('student.print.step2.noResults')}
        </Text>
      </View>
    );
  }

  const keyExtractor = useCallback((item: AvailablePrinterResponse) => item.printerId, []);

  return (
    <View style={styles.listContainer}>
      {isFetching && !loading && (
        <View style={styles.fetchingIndicator}>
          <SkeletonCard />
        </View>
      )}
      <FlatList
        data={filteredPrinters}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        key={`printer-list-${filterKey}`}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        scrollEnabled={false}
        getItemLayout={(_data, index) => ({
          length: 120, // Approximate item height
          offset: 120 * index,
          index,
        })}
      />
    </View>
  );
});

PrinterList.displayName = 'PrinterList';

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  listContainer: {
    position: 'relative',
  },
  fetchingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  printerItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  printerInfo: {
    gap: 8,
  },
  printerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  printerLocation: {
    fontSize: 14,
  },
  queueInfo: {
    fontSize: 12,
  },
  printerFeatures: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  featureBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

