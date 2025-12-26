import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { CountUp } from '../../components/ui/CountUp';
import { SummaryCard } from '../../components/ui/SummaryCard';
import { reportsDataMock } from '../../data/reportsMock';

export const ReportsScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [dateRange, setDateRange] = useState<
    '7days' | '30days' | '90days' | 'custom'
  >('30days');

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
      edges={['top']}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              { color: themeColors.foreground },
            ]}
          >
            {t('staff.reports.title')}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('staff.reports.description')}
          </Text>
        </View>

        <Card style={styles.filterCard}>
          <CardContent>
            <Select
              value={dateRange}
              onChange={setDateRange}
              options={[
                { label: t('staff.reports.dateRange.7days'), value: '7days' },
                { label: t('staff.reports.dateRange.30days'), value: '30days' },
                { label: t('staff.reports.dateRange.90days'), value: '90days' },
                { label: t('staff.reports.dateRange.custom'), value: 'custom' },
              ]}
              placeholder={t('staff.reports.dateRange.placeholder')}
            />
          </CardContent>
        </Card>

        <SummaryCard
          items={[
            {
              label: t('staff.reports.totalPrintJobs'),
              value: <CountUp to={reportsDataMock.summary.totalPrintJobs} separator="." />,
            },
            {
              label: t('staff.reports.totalPagesPrinted'),
              value: <CountUp to={reportsDataMock.summary.totalPagesPrinted} separator="." />,
            },
            {
              label: t('staff.reports.totalRevenue'),
              value: formatCurrency(reportsDataMock.summary.totalRevenue),
            },
            {
              label: t('staff.reports.successRate'),
              value: `${(reportsDataMock.summary.successRate * 100).toFixed(1)}%`,
            },
          ]}
        />

        <Card style={styles.chartCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('staff.reports.statusDistribution')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.chartItemsContainer}>
            {reportsDataMock.printStatusDistribution.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.chartItem,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.chartItemHeader}>
                  <View
                    style={[
                      styles.chartColorDot,
                      { backgroundColor: item.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chartItemName,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.chartItemValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  <CountUp to={item.value} separator="." />
                </Text>
              </View>
            ))}
            </View>
          </CardContent>
        </Card>

        <Card style={styles.chartCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                Top máy in
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportsDataMock.topPrinters.map((printer, index) => (
              <View
                key={index}
                style={[
                  styles.printerItem,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View style={styles.printerInfo}>
                  <Text
                    style={[
                      styles.printerName,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {printer.printerName}
                  </Text>
                  <Text
                    style={[
                      styles.printerStats,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    {printer.totalJobs} {t('staff.reports.jobs')} • {printer.totalPages} {t('staff.reports.pages')} •{' '}
                    {(printer.successRate * 100).toFixed(0)}% {t('staff.reports.success')}
                  </Text>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
  },
  filterCard: {
    marginBottom: spacing.lg,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryCardContent: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    flex: 1,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'right',
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  chartItemsContainer: {
    gap: spacing.md,
  },
  chartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  chartItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  chartColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chartItemName: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  chartItemValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  printerItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  printerInfo: {
    gap: spacing.xs,
  },
  printerName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  printerStats: {
    fontSize: typography.fontSize.sm,
  },
});

