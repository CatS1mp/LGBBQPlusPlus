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
import { Check } from 'lucide-react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { CountUp } from '../../components/ui/CountUp';
import { SummaryCard } from '../../components/ui/SummaryCard';
import {
  printerInfoList,
  printerInfoSummary,
  printerNotices,
  PrinterInfoMock,
  PrinterStatus,
} from '../../data/printersInfoMock';

type StatusTab = 'all' | PrinterStatus;

export const PrintersScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [status, setStatus] = useState<StatusTab>('all');
  const [building, setBuilding] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [colorOnly, setColorOnly] = useState(false);
  const [duplexOnly, setDuplexOnly] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterInfoMock | null>(null);

  const buildingOptions = useMemo(() => {
    const values = Array.from(new Set(printerInfoList.map(p => p.building)));
    return values.sort();
  }, []);

  const statusTabs: { value: StatusTab; label: string }[] = [
    { value: 'all', label: t('student.printers.status.all') },
    { value: 'online', label: t('student.print.step2.status.online') },
    { value: 'busy', label: t('student.printers.status.busy') },
    { value: 'maintenance', label: t('student.print.step2.status.maintenance') },
    { value: 'offline', label: t('student.print.step2.status.offline') },
  ];

  const filteredPrinters = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return printerInfoList.filter(printer => {
      if (status !== 'all' && printer.status !== status) return false;

      if (
        onlyAvailable &&
        (printer.status === 'offline' || printer.status === 'maintenance')
      )
        return false;

      if (building !== 'all' && printer.building !== building) return false;

      if (colorOnly && !printer.supportsColor) return false;

      if (duplexOnly && !printer.supportsDuplex) return false;

      if (
        normalized.length > 0 &&
        !printer.name.toLowerCase().includes(normalized) &&
        !printer.brand.toLowerCase().includes(normalized) &&
        !printer.model.toLowerCase().includes(normalized) &&
        !printer.room.toLowerCase().includes(normalized) &&
        !printer.building.toLowerCase().includes(normalized)
      )
        return false;

      return true;
    });
  }, [status, building, keyword, onlyAvailable, colorOnly, duplexOnly]);

  const getStatusStyle = (status: PrinterStatus) => {
    switch (status) {
      case 'online':
        return {
          bg: theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
          text: theme === 'dark' ? '#86efac' : '#16a34a',
        };
      case 'busy':
        return {
          bg: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
          text: theme === 'dark' ? '#fde047' : '#d97706',
        };
      case 'offline':
        return {
          bg: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
          text: theme === 'dark' ? '#fca5a5' : '#dc2626',
        };
      case 'maintenance':
        return {
          bg: theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          text: theme === 'dark' ? '#7dd3fc' : '#0284c7',
        };
    }
  };

  const getStatusLabel = (status: PrinterStatus) => {
    switch (status) {
      case 'busy':
        return t('student.printers.status.busy');
      case 'online':
        return t('student.print.step2.status.online');
      case 'maintenance':
        return t('student.print.step2.status.maintenance');
      case 'offline':
        return t('student.print.step2.status.offline');
    }
  };

  const renderPrinterCard = ({ item }: { item: PrinterInfoMock }) => {
    const statusStyle = getStatusStyle(item.status);
    const estimatedMinutes = Math.max(1, Math.round(item.queueLength * 2));

    console.log('[PrintersScreen] queue debug', {
      id: item.id,
      name: item.name,
      queueLength: item.queueLength,
    });

    return (
      <Card style={styles.printerCard}>
        <CardHeader>
          <View style={styles.printerCardHeader}>
            <View style={styles.printerCardTitle}>
              <Text
                style={[
                  styles.printerCardName,
                  { color: themeColors.foreground },
                ]}
              >
                {item.name}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.bg },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusStyle?.text },
                ]}
              >
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>
        </CardHeader>
          <CardContent>
          <View style={styles.printerDetails}>
            <View
              style={[
                styles.printerDetailRow,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(241, 245, 249, 0.8)',
                },
              ]}
            >
              <Text
                style={[
                  styles.printerDetailLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.printers.model')}
              </Text>
              <Text
                style={[
                  styles.printerDetailValue,
                  { color: themeColors.foreground },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.model}
              </Text>
            </View>

            <View
              style={[
                styles.printerDetailRow,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(241, 245, 249, 0.8)',
                },
              ]}
            >
              <Text
                style={[
                  styles.printerDetailLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.print.step2.building')}
              </Text>
              <Text
                style={[
                  styles.printerDetailValue,
                  { color: themeColors.foreground },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.building} • {item.room} • {item.floor}
              </Text>
            </View>

            <View
              style={[
                styles.printerDetailRow,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(241, 245, 249, 0.8)',
                },
              ]}
            >
              <Text
                style={[
                  styles.printerDetailLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.print.step2.features.color')} / {t('student.print.step2.features.duplex')}
              </Text>
              <View style={styles.printerFeatures}>
                <View
                  style={[
                    styles.featureBadge,
                    {
                      backgroundColor:
                        theme === 'dark'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(59, 130, 246, 0.1)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.featureText,
                      {
                        color:
                          theme === 'dark' ? '#7dd3fc' : '#0284c7',
                      },
                    ]}
                  >
                    {item.supportsDuplex ? t('student.printers.twoSided') : t('student.printers.oneSided')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.featureBadge,
                    {
                      backgroundColor:
                        theme === 'dark'
                          ? 'rgba(139, 92, 246, 0.15)'
                          : 'rgba(139, 92, 246, 0.1)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.featureText,
                      {
                        color:
                          theme === 'dark' ? '#c4b5fd' : '#7c3aed',
                      },
                    ]}
                  >
                    {item.supportsColor ? t('student.printers.color') : t('student.printers.blackWhite')}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.printerDetailRow,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(241, 245, 249, 0.8)',
                },
              ]}
            >
              <Text
                style={[
                  styles.printerDetailLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.printers.queue')}
              </Text>
              <View style={styles.queueInfo}>

                <View
                  style={[
                    styles.queueBadge,
                    {
                      backgroundColor:
                        theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(241, 245, 249, 0.8)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.queueText,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {t('student.printers.jobsCount', { count: item.queueLength })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.queueTime,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  ≈ {estimatedMinutes} phút
                </Text>
              </View>
            </View>
          </View>

          <Button
            title={t('common.viewMore', 'Xem thêm')}
            onPress={() => setSelectedPrinter(item)}
            variant="outline"
            style={styles.viewMoreButton}
          />
        </CardContent>
      </Card>
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
            {t('student.printers.title')}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('student.printers.description')}
          </Text>
        </View>

        <SummaryCard
          items={[
            {
              label: t('student.printers.summary.total'),
              value: <CountUp to={printerInfoSummary.total} />,
            },
            {
              label: t('student.printers.summary.online'),
              value: (
                <Text style={styles.summaryValueOnline}>
                  <CountUp to={printerInfoSummary.online} />
                </Text>
              ),
            },
            {
              label: t('student.printers.summary.busy'),
              value: (
                <Text style={styles.summaryValueBusy}>
                  <CountUp to={printerInfoSummary.busy} />
                </Text>
              ),
            },
          ]}
        />

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
              onChangeText={setKeyword}
            />

            <View style={styles.filtersRow}>
              <Select
                value={status}
                onChange={(value: string) => setStatus(value as StatusTab)}
                options={statusTabs.map(tab => ({
                  label: tab.label,
                  value: tab.value,
                }))}
                placeholder={t('student.printers.filterStatus')}
                style={styles.filterItem}
              />
              <Select
                value={building}
                onChange={setBuilding}
                options={[
                  { label: t('student.print.step2.allBuildings'), value: 'all' },
                  ...buildingOptions.map(b => ({ label: b, value: b })),
                ]}
                placeholder={t('student.print.step2.building')}
                style={styles.filterItem}
              />
            </View>

            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkboxItem}
                onPress={() => setOnlyAvailable(!onlyAvailable)}
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
                onPress={() => setColorOnly(!colorOnly)}
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
                onPress={() => setDuplexOnly(!duplexOnly)}
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

        {printerNotices.length > 0 && (
          <Card style={styles.noticesCard}>
            <CardHeader>
              <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('student.printers.notices')}
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {printerNotices.map(notice => {
                const severityStyle =
                  notice.severity === 'critical'
                    ? {
                        bg: theme === 'dark'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : 'rgba(239, 68, 68, 0.1)',
                        text: theme === 'dark' ? '#fca5a5' : '#dc2626',
                      }
                    : notice.severity === 'warning'
                      ? {
                          bg: theme === 'dark'
                            ? 'rgba(251, 191, 36, 0.15)'
                            : 'rgba(251, 191, 36, 0.1)',
                          text: theme === 'dark' ? '#fde047' : '#d97706',
                        }
                      : {
                          bg: theme === 'dark'
                            ? 'rgba(56, 189, 248, 0.15)'
                            : 'rgba(56, 189, 248, 0.1)',
                          text: theme === 'dark' ? '#7dd3fc' : '#0284c7',
                        };

                return (
                  <View
                    key={notice.id}
                    style={[
                      styles.noticeItem,
                      { backgroundColor: severityStyle.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.noticeTitle,
                        { color: themeColors.foreground },
                      ]}
                    >
                      {notice.title}
                    </Text>
                    <Text
                      style={[
                        styles.noticeDetail,
                        { color: themeColors['muted-foreground'] },
                      ]}
                    >
                      {notice.detail}
                    </Text>
                  </View>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card style={styles.printersCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.printers.listTitle', { count: filteredPrinters.length })}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPrinters.length === 0 ? (
              <View style={styles.emptyState}>
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.printers.noResults')}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredPrinters}
                renderItem={renderPrinterCard}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            )}
          </CardContent>
        </Card>
      </ScrollView>

      <Modal
        isOpen={Boolean(selectedPrinter)}
        onClose={() => setSelectedPrinter(null)}
        title={t('student.printers.modalTitle')}
        size="lg"
      >
        {selectedPrinter && (
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalTitle,
                { color: themeColors.foreground },
              ]}
            >
              {selectedPrinter.name}
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {selectedPrinter.brand} {selectedPrinter.model}
            </Text>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                Thông tin
              </Text>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Serial:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.serial}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  IP Address:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.ipAddress}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.printers.location')}
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.building} • {selectedPrinter.room} •{' '}
                  {selectedPrinter.floor}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.printers.uptime')}
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.uptime}%
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.printers.queueLabel')}
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('student.printers.jobsCount', { count: selectedPrinter.queueLength })}
                </Text>
              </View>
            </View>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
                >
                {t('student.printers.features')}
              </Text>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.printers.colorPrinting')}
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.supportsColor ? t('student.printers.yes') : t('student.printers.no')}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.printers.duplexPrinting')}
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.supportsDuplex ? t('student.printers.yes') : t('student.printers.no')}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.printers.maxPaperSize')}
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.maxPaperSize}
                </Text>
              </View>
            </View>

            {selectedPrinter.note && (
              <View style={styles.modalSection}>
                <Text
                  style={[
                    styles.modalSectionTitle,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('student.printers.note')}
                </Text>
                <Text
                  style={[
                    styles.modalNote,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {selectedPrinter.note}
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
  summaryValueOnline: {
    color: '#22c55e',
  },
  summaryValueBusy: {
    color: '#f59e0b',
  },
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
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  filterItem: {
    flex: 1,
  },
  checkboxRow: {
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
  noticesCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  noticeItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  noticeTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  noticeDetail: {
    fontSize: typography.fontSize.sm,
  },
  printersCard: {
    marginBottom: spacing.lg,
  },
  printerCard: {
    marginBottom: spacing.md,
  },
  printerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  printerCardTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  printerCardName: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  printerDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  printerDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    flexWrap: 'wrap',
  },
  printerDetailLabel: {
    fontSize: typography.fontSize.sm,
    flexShrink: 0,
    marginRight: spacing.sm,
  },
  printerDetailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  printerFeatures: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  featureBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  featureText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  queueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  queueBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  queueText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  queueTime: {
    fontSize: typography.fontSize.xs,
  },
  viewMoreButton: {
    marginTop: spacing.sm,
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
    gap: spacing.sm,
  },
  modalSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  modalInfoLabel: {
    fontSize: typography.fontSize.sm,
    flexShrink: 0,
    marginRight: spacing.sm,
  },
  modalInfoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  modalNote: {
    fontSize: typography.fontSize.sm,
  },
});

