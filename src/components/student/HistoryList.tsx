import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../lib/hooks/useTheme';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import type { StudentPrintHistoryItemResponse } from '../../types/api';

interface HistoryListProps {
  data: StudentPrintHistoryItemResponse[];
  onItemPress: (item: StudentPrintHistoryItemResponse) => void;
  getStatusStyle: (status: string) => {
    bg: string;
    text: string;
    dot: string;
  };
}

export const HistoryList: React.FC<HistoryListProps> = memo(({
  data,
  onItemPress,
  getStatusStyle,
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { t } = useTranslation('pages');

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateStr;
    }
  }, []);

  const renderHistoryItem = useCallback(({ item }: { item: StudentPrintHistoryItemResponse }) => {
    const statusStyle = getStatusStyle(item.printStatus);
    return (
      <TouchableOpacity
        style={[
          styles.historyItem,
          {
            backgroundColor:
              theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.9)',
            borderColor: themeColors.border,
          },
        ]}
        onPress={() => onItemPress(item)}
      >
        <View style={styles.historyItemContent}>
          <Text
            style={[
              styles.historyItemTitle,
              { color: themeColors.foreground },
            ]}
          >
            {item.fileName || '-'}
          </Text>
          <Text
            style={[
              styles.historyItemSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {item.printerName || '-'} • {item.printerLocation || '-'}
          </Text>
          <View style={styles.historyItemDetails}>
            <Text
              style={[
                styles.historyItemDetail,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {item.colorMode || '-'}{' '}
              • {item.printSide === 'double-sided' ? t('student.history.printSide.twoSided') : t('student.history.printSide.oneSided')} • {item.totalPages || 0} {t('student.history.pages')}
            </Text>
            <Text
              style={[
                styles.historyItemTime,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyle.bg },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: statusStyle.dot },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: statusStyle.text },
            ]}
          >
            {item.printStatus === 'completed'
              ? t('student.history.status.completed')
              : item.printStatus === 'printing'
                ? t('student.history.status.processing')
                : item.printStatus === 'queued'
                  ? t('student.history.status.queued')
                  : t('student.history.status.failed')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [theme, themeColors, t, getStatusStyle, onItemPress, formatDate]);

  const keyExtractor = useCallback((item: StudentPrintHistoryItemResponse) => item.jobId, []);

  return (
    <FlatList
      data={data}
      renderItem={renderHistoryItem}
      keyExtractor={keyExtractor}
      removeClippedSubviews={true}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      scrollEnabled={false}
      getItemLayout={(_data, index) => ({
        length: 100, // Approximate item height
        offset: 100 * index,
        index,
      })}
    />
  );
});

HistoryList.displayName = 'HistoryList';

const styles = StyleSheet.create({
  historyItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  historyItemSubtitle: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  historyItemDetails: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  historyItemDetail: {
    fontSize: typography.fontSize.xs,
  },
  historyItemTime: {
    fontSize: typography.fontSize.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
});

