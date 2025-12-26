import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CountUp } from '../../components/ui/CountUp';
import { SummaryCard } from '../../components/ui/SummaryCard';
import {
  historyStatusFilters,
} from '../../data/printHistoryMock';
import { format } from 'date-fns';
import { usePrintJobs } from '../../lib/api/services/printJobs';
import type { PrintJobResponse } from '../../types/api';
import { ActivityIndicator } from 'react-native';

export const HistoryScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PrintJobResponse | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: printJobsData, isLoading } = usePrintJobs({
    page: 0,
    limit: 100,
    status: status === 'all' ? undefined : status,
  });

  const printJobs = useMemo(() => {
    return printJobsData?.data?.data || [];
  }, [printJobsData]);

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
        item.uploadedFile.fileName.toLowerCase().includes(term) ||
        item.printer.modelName.toLowerCase().includes(term) ||
        item.printer.location.toLowerCase().includes(term) ||
        item.jobId.toLowerCase().includes(term);
      return matchesStatus && matchesTime && matchesSearch;
    });
  }, [printJobs, status, startDate, endDate, search]);

  const getStatusStyle = (status: string) => {
    switch (status) {
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
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '--';
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
    } catch {
      return dateStr;
    }
  };

  const renderHistoryItem = ({ item }: { item: PrintJobResponse }) => {
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
        onPress={() => setSelected(item)}
      >
        <View style={styles.historyItemContent}>
          <Text
            style={[
              styles.historyItemTitle,
              { color: themeColors.foreground },
            ]}
          >
            {item.uploadedFile.fileName}
          </Text>
          <Text
            style={[
              styles.historyItemSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {item.printer.brandName} {item.printer.modelName} • {item.printer.location}
          </Text>
          <View style={styles.historyItemDetails}>
            <Text
              style={[
                styles.historyItemDetail,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {item.config.colorMode}{' '}
              • {item.config.printSide === 'double-sided' ? t('student.history.printSide.twoSided') : t('student.history.printSide.oneSided')} • {item.pricing.totalPages} {t('student.history.pages')}
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
            {t('student.history.title')}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('student.history.description')}
          </Text>
        </View>

        <SummaryCard
          items={[
            {
              label: t('student.history.jobsThisMonth'),
              value: (
                <>
                  <CountUp to={printHistorySummaryMock.totalJobsThisMonth} /> {t('student.history.jobs')}
                </>
              ),
            },
            {
              label: t('student.history.pagesPrinted'),
              value: (
                <>
                  <CountUp to={printHistorySummaryMock.totalPagesThisMonth} /> {t('student.history.pages')}
                </>
              ),
            },
            {
              label: t('student.history.successRate'),
              value: `${Math.round(printHistorySummaryMock.successRate * 100)}%`,
            },
          ]}
        />

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
              <FlatList
                data={filtered}
                renderItem={renderHistoryItem}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            )}
          </CardContent>
        </Card>
      </ScrollView>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={t('student.history.modalTitle')}
        size="lg"
      >
        {selected && (
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalTitle,
                { color: themeColors.foreground },
              ]}
            >
              {selected.documentName}
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              ID: {selected.id} • {selected.fileType} • {selected.fileSizeKB} KB
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
                {selected.printerName}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {selected.location}
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
                {t('student.history.modalPaperSize')} {selected.paperSize || '—'}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalColorMode')}{' '}
                {selected.colorMode === 'color'
                  ? t('student.history.colorMode.color')
                  : selected.colorMode === 'grayscale'
                    ? t('student.history.colorMode.grayscale')
                    : t('student.history.colorMode.blackWhite')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalPrintSide')} {selected.duplex ? t('student.history.printSide.twoSided') : t('student.history.printSide.oneSided')}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalCopies')} {selected.copies}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalTotalPages')} {selected.pageCount}
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
                {t('student.history.modalSubmitted')} {formatDate(selected.submittedAt)}
              </Text>
              <Text
                style={[
                  styles.modalSectionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.history.modalCompleted')} {formatDate(selected.completedAt)}
              </Text>
            </View>

            {selected.errorMessage && (
              <View
                style={[
                  styles.errorMessage,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(239, 68, 68, 0.1)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.errorMessageText,
                    {
                      color:
                        theme === 'dark' ? '#fca5a5' : '#dc2626',
                    },
                  ]}
                >
                  {selected.errorMessage}
                </Text>
              </View>
            )}
          </View>
        )}
      </Modal>
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
  errorMessage: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  errorMessageText: {
    fontSize: typography.fontSize.sm,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
  },
});

