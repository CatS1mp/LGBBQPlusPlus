import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { CountUp } from '../ui/CountUp';
import { SummaryCard } from '../ui/SummaryCard';
import { SkeletonCard } from '../ui/Skeleton';
import { Pagination } from '../ui/Pagination';
import { historyStatusFilters } from '../../data/printHistoryMock';
import { format } from 'date-fns';
import { usePrintHistory, usePrintHistoryStats, usePrintHistoryDetail } from '../../lib/api/services/printHistory';
import type { StudentPrintHistoryItemResponse } from '../../types/api';
import { HistoryList } from './HistoryList';

export const HistoryContent: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<StudentPrintHistoryItemResponse | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Debug: Log component mount
  useEffect(() => {
    if (__DEV__) {
      console.log('🚀 [HistoryContent] Component Mounted/Re-rendered', {
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Debug: Log API params before calling
  const historyParams = useMemo(() => ({
    page: historyPage,
    limit: 10,
    status: status === 'all' ? undefined : (status as 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled'),
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    sort_by: 'createdAt',
    sort_direction: 'desc' as const,
  }), [historyPage, status, startDate, endDate]);

  useEffect(() => {
    if (__DEV__) {
      console.log('📋 [HistoryContent] usePrintHistory called with params:', historyParams);
    }
  }, [historyParams]);

  const { data: historyData, isLoading, isFetching, error: historyError } = usePrintHistory(historyParams);

  useEffect(() => {
    if (__DEV__) {
      console.log('📡 [HistoryContent] usePrintHistoryStatus:', {
        isLoading,
        isFetching,
        hasData: !!historyData,
        hasError: !!historyError,
        data: historyData ? 'present' : 'null',
      });
    }
  }, [isLoading, isFetching, historyData, historyError]);

  useEffect(() => {
    if (__DEV__) {
      console.log('📊 [HistoryContent] usePrintHistoryStats called');
    }
  }, []);

  const { data: statsData, isLoading: loadingStats, error: statsError, isFetching: fetchingStats } = usePrintHistoryStats();

  useEffect(() => {
    if (__DEV__) {
      console.log('📡 [HistoryContent] usePrintHistoryStatsStatus:', {
        isLoading: loadingStats,
        isFetching: fetchingStats,
        hasData: !!statsData,
        hasError: !!statsError,
        data: statsData ? 'present' : 'null',
      });
    }
  }, [loadingStats, fetchingStats, statsData, statsError]);
  
  // Fetch job detail when selected
  const { data: detailData, isLoading: detailLoading } = usePrintHistoryDetail(
    selected?.jobId || ''
  );

  // Update selected when detailData loads
  useEffect(() => {
    if (detailData?.data?.data && selected) {
      // Update selected with fresh data from API
      // Detail data has more fields, but we only need basic info for selected
      const detail = detailData.data.data;
      if (detail) {
        setSelected({
          jobId: detail.jobId,
          createdAt: detail.createdAt,
          startTime: detail.startTime,
          endTime: detail.endTime,
          printerLocation: detail.printerDisplayName.split(' - ')[0] || '',
          printerName: detail.printerDisplayName.split(' - ')[1] || detail.printerDisplayName,
          fileUrl: detail.fileUrl,
          fileName: detail.fileName,
          fileType: detail.fileType,
          colorMode: detail.colorMode,
          printSide: detail.printSide,
          pageOrientation: detail.pageOrientation,
          numberOfCopy: detail.numberOfCopy,
          totalPages: detail.totalPrintedPages,
          printStatus: detail.printStatus,
        } as StudentPrintHistoryItemResponse);
      }
    }
  }, [detailData, selected]);

  // Debug logging
  useEffect(() => {
    if (__DEV__) {
      const startTime = Date.now();
      console.log('🔍 [HistoryContent] API Call Status:', {
        isLoading,
        isFetching,
        hasHistoryData: !!historyData,
        hasStatsData: !!statsData,
        historyError: historyError ? 'Error occurred' : null,
        statsError: statsError ? 'Error occurred' : null,
      });

      if (historyData) {
        const loadTime = Date.now() - startTime;
        console.log('✅ [HistoryContent] History Data Loaded:', {
          loadTime: `${loadTime}ms`,
          url: '/student/print/history',
          params: {
            page: historyPage,
            limit: 10,
            status: status === 'all' ? undefined : status,
            fromDate: startDate || undefined,
            toDate: endDate || undefined,
          },
          response: {
            totalItems: historyData?.data?.pagination?.totalItems || 0,
            totalPages: historyData?.data?.pagination?.totalPages || 0,
            currentPage: historyData?.data?.pagination?.page || 0,
            itemsCount: historyData?.data?.data?.length || 0,
            data: historyData?.data?.data || [],
          },
        });
      }

      if (statsData) {
        console.log('✅ [HistoryContent] Stats Data Loaded:', {
          url: '/student/print/history/stats',
          response: statsData?.data,
        });
      }

      if (historyError) {
        console.error('❌ [HistoryContent] History API Error:', historyError);
      }

      if (statsError) {
        console.error('❌ [HistoryContent] Stats API Error:', statsError);
      }
    }
  }, [historyData, statsData, isLoading, isFetching, historyError, statsError, historyPage, status, startDate, endDate]);

  const printJobs = useMemo(() => {
    const jobs = historyData?.data?.data || [];
    if (__DEV__) {
      console.log('🔄 [HistoryContent] Processed printJobs:', {
        count: jobs.length,
        jobs: jobs.slice(0, 3).map(j => ({
          id: j.jobId,
          fileName: j.fileName,
          status: j.printStatus,
          createdAt: j.createdAt,
        })),
        totalItems: historyData?.data?.pagination?.totalItems || 0,
      });
    }
    return jobs;
  }, [historyData]);
  const historyPagination = historyData?.data?.pagination;

  const summaryStats = useMemo(() => {
    if (statsData?.data?.data) {
      const stats = statsData.data.data;
      // Theo API documentation: jobsThisMonth có { total, color, blackWhite, growthPercent }
      const totalJobs = stats.jobsThisMonth?.total || 0;
      const pagesLast30Days = stats.pagesLast30Days || 0;
      // successRate có { percent, status }
      const successRatePercent = stats.successRate?.percent || 0;
      return {
        totalJobsThisMonth: totalJobs,
        totalPagesThisMonth: pagesLast30Days,
        successRate: successRatePercent / 100, // Convert từ percent (0-100) sang decimal (0-1)
      };
    }
    // Fallback: tính từ printJobs nếu không có stats
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const thisMonthJobs = printJobs.filter(job => {
      const jobDate = new Date(job.createdAt);
      return jobDate >= thisMonth;
    });
    const completedJobs = thisMonthJobs.filter(job => job.printStatus === 'completed');
    return {
      totalJobsThisMonth: thisMonthJobs.length,
      totalPagesThisMonth: thisMonthJobs.reduce((sum, job) => sum + (job.totalPages || 0), 0),
      successRate: thisMonthJobs.length > 0 ? completedJobs.length / thisMonthJobs.length : 0,
    };
  }, [statsData, printJobs]);

  // Memoize summary card items to prevent re-render when page changes
  const summaryCardItems = useMemo(() => [
    {
      label: t('student.history.jobsThisMonth'),
      value: (
        <>
          <CountUp to={summaryStats.totalJobsThisMonth} /> {t('student.history.jobs')}
        </>
      ),
    },
    {
      label: t('student.history.pagesPrinted'),
      value: (
        <>
          <CountUp to={summaryStats.totalPagesThisMonth} /> {t('student.history.pages')}
        </>
      ),
    },
    {
      label: t('student.history.successRate'),
      value: `${Math.round(summaryStats.successRate * 100)}%`,
    },
  ], [summaryStats, t]);

  const filtered = useMemo(() => {
    return printJobs.filter(item => {
      const matchesStatus = status === 'all' || item.printStatus === status;
      const submitted = new Date(item.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const endInclusive = end ? new Date(end) : null;
      if (endInclusive) endInclusive.setHours(23, 59, 59, 999);
      const matchesTime =
        (!start || submitted >= start) &&
        (!endInclusive || submitted <= endInclusive);
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        item.fileName?.toLowerCase().includes(term) ||
        item.printerName?.toLowerCase().includes(term) ||
        item.printerLocation?.toLowerCase().includes(term) ||
        item.jobId?.toLowerCase().includes(term);
      return matchesStatus && matchesTime && matchesSearch;
    });
  }, [printJobs, status, startDate, endDate, search]);

  const getStatusStyle = useCallback((printStatus: string) => {
    switch (printStatus) {
      case 'completed':
        return {
          bg: theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
          text: theme === 'dark' ? '#86efac' : '#16a34a',
          dot: '#22c55e',
        };
      case 'printing':
        return {
          bg: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
          text: theme === 'dark' ? '#fde047' : '#d97706',
          dot: '#f59e0b',
        };
      case 'queued':
        return {
          bg: theme === 'dark' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.1)',
          text: theme === 'dark' ? '#cbd5e1' : '#64748b',
          dot: '#94a3b8',
        };
      case 'failed':
        return {
          bg: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
          text: theme === 'dark' ? '#fca5a5' : '#dc2626',
          dot: '#ef4444',
        };
      default:
        return {
          bg: theme === 'dark' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.1)',
          text: theme === 'dark' ? '#cbd5e1' : '#64748b',
          dot: '#94a3b8',
        };
    }
  }, [theme]);

  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateStr;
    }
  }, []);

  const handleItemPress = useCallback((item: StudentPrintHistoryItemResponse) => {
    setSelected(item);
  }, []);

  if (isLoading || loadingStats) {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SummaryCard items={summaryCardItems} />

      <Card style={styles.filtersCard}>
        <CardContent>
          <View style={styles.searchContainer}>
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
              placeholder={t('student.history.searchPlaceholder')}
              placeholderTextColor={themeColors['muted-foreground']}
              value={search}
              onChangeText={setSearch}
            />
            <Button
              title={t('student.history.filterButton')}
              onPress={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            />
          </View>

          {showFilters && (
            <View style={styles.filtersGrid}>
              <Select
                value={status}
                onChange={setStatus}
                options={historyStatusFilters.map(f => ({
                  label: f.label,
                  value: f.value,
                }))}
                placeholder={t('student.history.filterStatus')}
                style={styles.filterItem}
              />
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder={t('student.history.filterStartDate')}
                style={styles.filterItem}
              />
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder={t('student.history.filterEndDate')}
                style={styles.filterItem}
                min={startDate || undefined}
              />
            </View>
          )}
        </CardContent>
      </Card>

      <Card style={styles.historyCard}>
        <CardHeader>
          <CardTitle>
            <Text
              style={[
                styles.cardTitleText,
                { color: themeColors.foreground },
              ]}
            >
              {t('student.history.recentTitle')}
            </Text>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text
                style={[
                  styles.emptyStateText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.noData')}
              </Text>
            </View>
          ) : (
            <HistoryList
              data={filtered}
              onItemPress={handleItemPress}
              getStatusStyle={getStatusStyle}
              key={`history-list-${historyPage}-${status}-${search}`}
            />
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {historyPagination && historyPagination.totalItems > 0 && (
        <Pagination
          page={historyPage}
          pageSize={10}
          total={historyPagination.totalItems}
          onChange={setHistoryPage}
          style={styles.pagination}
        />
      )}

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t('student.history.modalTitle')}
        size="lg"
      >
        {detailLoading ? (
          <View style={styles.modalContent}>
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : detailData?.data?.data ? (
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalTitle,
                { color: themeColors.foreground },
              ]}
            >
              {detailData.data.data.fileName || selected?.fileName || '-'}
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              ID: {detailData.data.data.jobId || selected?.jobId || '-'}
            </Text>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.history.modalPrinter')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {detailData.data.data.printerDisplayName || '-'}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.history.modalConfig')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalPaperSize')} {detailData.data.data.pageSizeName || '—'}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalColorMode')} {detailData.data.data.colorMode || '—'}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalPrintSide')} {detailData.data.data.printSide === 'double-sided' ? t('student.history.printSide.twoSided') : t('student.history.printSide.oneSided')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalTotalPages')} {detailData.data.data.totalPrintedPages || 0}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.history.modalTime')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalSubmitted')} {formatDate(detailData.data.data.createdAt || selected?.createdAt || '')}
              </Text>
            </View>
          </View>
        ) : selected ? (
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalTitle,
                { color: themeColors.foreground },
              ]}
            >
              {selected.fileName || '-'}
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              ID: {selected.jobId || '-'}
            </Text>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.history.modalPrinter')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {selected.printerName || '-'}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {selected.printerLocation || '-'}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.history.modalConfig')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalPaperSize')} {selected.fileType ? selected.fileType.toUpperCase() : '—'}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalColorMode')} {selected.colorMode || '—'}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalPrintSide')} {selected.printSide === 'double-sided' ? t('student.history.printSide.twoSided') : t('student.history.printSide.oneSided')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalTotalPages')} {selected.totalPages || 0}
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.history.modalTime')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalSubmitted')} {formatDate(selected.createdAt)}
              </Text>
            </View>
          </View>
        ) : null}
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  filtersCard: {
    marginBottom: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
  },
  filtersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  filterItem: {
    flex: 1,
    minWidth: '30%',
  },
  historyCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  emptyState: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  modalContent: {
    gap: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: typography.fontSize.sm,
  },
  modalSection: {
    gap: spacing.xs,
  },
  modalSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  modalSectionText: {
    fontSize: typography.fontSize.sm,
  },
  pagination: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

