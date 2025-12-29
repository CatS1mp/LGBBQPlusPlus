import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Pagination } from '../../components/ui/Pagination';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { useAvailablePrinters, usePrinterQueue } from '../../lib/api/services/studentPrinters';
import type { AvailablePrinterResponse } from '../../types/api';

type StatusTab = 'all' | 'online' | 'busy' | 'maintenance' | 'offline';

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
  const [selectedPrinter, setSelectedPrinter] = useState<AvailablePrinterResponse | null>(null);
  const [printerPage, setPrinterPage] = useState(0);

  // Check if we need to fetch all data for accurate pagination
  const hasClientSideFilter = building !== 'all' || onlyAvailable;
  
  // API calls - fetch all data if client-side filter is active
  const { data: printersData, isLoading } = useAvailablePrinters({
    keyword: keyword || undefined,
    status: status !== 'all' ? status : undefined,
    supportsColor: colorOnly || undefined,
    supportsDuplex: duplexOnly || undefined,
    page: hasClientSideFilter ? 0 : printerPage,
    limit: hasClientSideFilter ? 1000 : 10, // Fetch all if client-side filter
  });

  const printers = useMemo(() => {
    // Response structure: ApiResponse<{ stats, data, pagination }>
    // printersData.data.data.data is the array of printers
    return printersData?.data?.data?.data || [];
  }, [printersData]);
  const printerPagination = printersData?.data?.data?.pagination;
  
  // Get queue for selected printer
  const { data: queueData } = usePrinterQueue(
    selectedPrinter?.printerId || '',
    !!selectedPrinter
  );
  
  // Get queue for modal
  const { data: selectedQueueData } = usePrinterQueue(
    selectedPrinter?.printerId || '',
    !!selectedPrinter
  );

  // Reset page to 0 when filters change
  useEffect(() => {
    setPrinterPage(0);
  }, [status, keyword, colorOnly, duplexOnly, building, onlyAvailable]);

  const buildingOptions = useMemo(() => {
    const values = Array.from(new Set(printers.map(p => p.buildingCode)));
    return values.sort();
  }, [printers]);

  // Calculate summary stats
  const printerSummary = useMemo(() => {
    const total = printers.length;
    const online = printers.filter(p => p.status === 'online' || p.printingStatus === 'idle').length;
    const busy = printers.filter(p => p.printingStatus === 'printing' || p.status === 'busy').length;
    const offline = printers.filter(p => p.status === 'offline').length;
    const maintenance = printers.filter(p => p.status === 'maintenance').length;
    return { total, online, busy, offline, maintenance };
  }, [printers]);

  const statusTabs: { value: StatusTab; label: string }[] = [
    { value: 'all', label: t('student.printers.status.all') },
    { value: 'online', label: t('student.print.step2.status.online') },
    { value: 'busy', label: t('student.printers.status.busy') },
    { value: 'maintenance', label: t('student.print.step2.status.maintenance') },
    { value: 'offline', label: t('student.print.step2.status.offline') },
  ];

  const filteredPrinters = useMemo(() => {
    let result = printers;
    
    // Apply client-side filters
    if (building !== 'all') {
      result = result.filter(printer => printer.buildingCode === building);
    }
    
    if (onlyAvailable) {
      result = result.filter(printer => 
        printer.status !== 'offline' && printer.status !== 'maintenance'
      );
    }
    
    // Apply pagination if client-side filter is active
    if (hasClientSideFilter) {
      const limit = 10;
      const start = printerPage * limit;
      const end = start + limit;
      return result.slice(start, end);
    }
    
    return result;
  }, [printers, building, onlyAvailable, hasClientSideFilter, printerPage]);

  // Calculate pagination based on filtered results
  const effectivePagination = useMemo(() => {
    if (!hasClientSideFilter) {
      // No client-side filter, use API pagination
      return printerPagination;
    }

    // Has client-side filter, calculate based on all filtered results
    const allFiltered = printers.filter(printer => {
      if (building !== 'all' && printer.buildingCode !== building) return false;
      if (onlyAvailable && (printer.status === 'offline' || printer.status === 'maintenance')) return false;
      return true;
    });
    
    const limit = 10;
    const totalItems = allFiltered.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      page: printerPage,
      limit: limit,
      totalItems: totalItems,
      totalPages: totalPages,
      first: printerPage === 0,
      last: printerPage >= totalPages - 1,
    };
  }, [printers, building, onlyAvailable, hasClientSideFilter, printerPage, printerPagination]);

  const getStatusStyle = useCallback((printerStatus: string) => {
    switch (printerStatus) {
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
  }, [theme]);

  const getStatusLabel = useCallback((printerStatus: string) => {
    switch (printerStatus) {
      case 'busy':
        return t('student.printers.status.busy');
      case 'online':
        return t('student.print.step2.status.online');
      case 'maintenance':
        return t('student.print.step2.status.maintenance');
      case 'offline':
        return t('student.print.step2.status.offline');
    }
  }, [t]);

  const renderPrinterCard = useCallback(({ item }: { item: AvailablePrinterResponse }) => {
    const displayStatus = item.printingStatus === 'printing' ? 'busy' : item.status;
    const statusStyle = getStatusStyle(displayStatus);
    const queueLength = (queueData?.data as any)?.queueCount || 0;
    const estimatedMinutes = Math.max(1, Math.round(queueLength * 2));

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
                {item.brandName} {item.modelName}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle?.bg || 'rgba(148, 163, 184, 0.1)' },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusStyle?.text },
                ]}
              >
                {getStatusLabel(displayStatus)}
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
                {item.modelName}
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
                {item.buildingCode || '-'} • {item.roomCode || '-'}
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
                    {t('student.printers.jobsCount', { count: queueLength })}
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
  }, [theme, themeColors, t, queueData, setSelectedPrinter, getStatusLabel, getStatusStyle]);

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
              value: <CountUp to={printerSummary.total} />,
            },
            {
              label: t('student.printers.summary.online'),
              value: (
                <Text style={styles.summaryValueOnline}>
                  <CountUp to={printerSummary.online} />
                </Text>
              ),
            },
            {
              label: t('student.printers.summary.busy'),
              value: (
                <Text style={styles.summaryValueBusy}>
                  <CountUp to={printerSummary.busy} />
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

            <View style={styles.filtersColumn}>
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

            <View style={styles.checkboxColumn}>
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

        {false && (
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
              {[].length > 0 ? (
                [].map((notice: any) => {
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
                })
              ) : null}
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
            {isLoading && !printersData ? (
              <View style={styles.loadingContainer}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : filteredPrinters.length === 0 ? (
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
              <View style={styles.printerListContainer}>
                <FlatList
                  data={filteredPrinters}
                  renderItem={renderPrinterCard}
                  keyExtractor={item => item.printerId}
                  key={`printer-list-${printerPage}-${status}-${building}-${colorOnly}-${duplexOnly}`}
                  removeClippedSubviews={true}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  scrollEnabled={false}
                  getItemLayout={(_data, index) => ({
                    length: 200, // Approximate item height
                    offset: 200 * index,
                    index,
                  })}
                />
              </View>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {effectivePagination && effectivePagination.totalItems > 0 && (
          <Pagination
            page={printerPage}
            pageSize={10}
            total={effectivePagination.totalItems}
            onChange={setPrinterPage}
            style={styles.pagination}
          />
        )}
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
              {selectedPrinter.brandName} {selectedPrinter.modelName}
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {selectedPrinter.brandName} {selectedPrinter.modelName}
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
                  {selectedPrinter.serialNumber || '-'}
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
                  {'-'}
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
                  {selectedPrinter.buildingCode || '-'} • {selectedPrinter.roomCode || '-'}
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
                  {'-'}
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
                  {t('student.printers.jobsCount', { count: (selectedQueueData?.data as any)?.queueCount || 0 })}
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
                  {selectedPrinter.maxPageSize || '-'}
                </Text>
              </View>
            </View>

            {false && (
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
                  {'-'}
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
    flexDirection: 'column',
    gap: spacing.sm,
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
  printerListContainer: {
    position: 'relative',
  },
  fetchingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: spacing.sm,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  pagination: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});

