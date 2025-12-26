import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Modal } from '../../components/ui/Modal';
import { CountUp } from '../../components/ui/CountUp';
import { SummaryCard } from '../../components/ui/SummaryCard';
import {
  systemLogsMockData,
  systemLogsSummaryMock,
  SystemLogItem,
  ActionType,
  actionTypeLabels,
  actionTypeColors,
} from '../../data/systemLogsMock';
import { format } from 'date-fns';

type ActionFilterValue = 'all' | ActionType;
const PAGE_SIZE = 10;

export const SystemLogsScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState<ActionFilterValue>('all');
  const [tableName, setTableName] = useState<string>('all');
  const [userRole, setUserRole] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState<SystemLogItem | null>(null);
  const [page, setPage] = useState(1);

  const uniqueTableNames = useMemo(() => {
    return Array.from(new Set(systemLogsMockData.map(log => log.tableName))).sort();
  }, []);

  const uniqueUserRoles = useMemo(() => {
    return Array.from(new Set(systemLogsMockData.map(log => log.userRole))).sort();
  }, []);

  const filtered = useMemo(() => {
    return systemLogsMockData.filter(log => {
      const matchesSearch =
        search.length === 0 ||
        log.userName.toLowerCase().includes(search.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        log.tableName.toLowerCase().includes(search.toLowerCase()) ||
        log.ipAddress.toLowerCase().includes(search.toLowerCase()) ||
        (log.recordId &&
          log.recordId.toLowerCase().includes(search.toLowerCase()));

      const matchesActionType =
        actionType === 'all' || log.actionType === actionType;
      const matchesTableName = !tableName || tableName === 'all' || log.tableName === tableName;
      const matchesUserRole = !userRole || userRole === 'all' || log.userRole === userRole;

      const timestamp = new Date(log.actionTimestamp);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const endInclusive = end ? new Date(end) : null;
      if (endInclusive) endInclusive.setHours(23, 59, 59, 999);
      const matchesTime =
        (!start || timestamp >= start) &&
        (!endInclusive || timestamp <= endInclusive);

      return (
        matchesSearch &&
        matchesActionType &&
        matchesTableName &&
        matchesUserRole &&
        matchesTime
      );
    });
  }, [search, actionType, tableName, userRole, startDate, endDate]);

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const getActionColor = (actionType: ActionType) => {
    const colorClass = actionTypeColors[actionType];
    if (theme === 'dark') {
      if (colorClass.includes('emerald')) return '#86efac';
      if (colorClass.includes('blue')) return '#7dd3fc';
      if (colorClass.includes('rose')) return '#fca5a5';
      if (colorClass.includes('green')) return '#86efac';
      if (colorClass.includes('amber')) return '#fde047';
      if (colorClass.includes('purple')) return '#c4b5fd';
      return '#cbd5e1';
    } else {
      if (colorClass.includes('emerald')) return '#16a34a';
      if (colorClass.includes('blue')) return '#0284c7';
      if (colorClass.includes('rose')) return '#dc2626';
      if (colorClass.includes('green')) return '#16a34a';
      if (colorClass.includes('amber')) return '#d97706';
      if (colorClass.includes('purple')) return '#7c3aed';
      return '#475569';
    }
  };

  const getActionBg = (actionType: ActionType) => {
    const colorClass = actionTypeColors[actionType];
    if (theme === 'dark') {
      if (colorClass.includes('emerald')) return 'rgba(34, 197, 94, 0.15)';
      if (colorClass.includes('blue')) return 'rgba(59, 130, 246, 0.15)';
      if (colorClass.includes('rose')) return 'rgba(239, 68, 68, 0.15)';
      if (colorClass.includes('green')) return 'rgba(34, 197, 94, 0.15)';
      if (colorClass.includes('amber')) return 'rgba(251, 191, 36, 0.15)';
      if (colorClass.includes('purple')) return 'rgba(139, 92, 246, 0.15)';
      return 'rgba(148, 163, 184, 0.15)';
    } else {
      if (colorClass.includes('emerald')) return 'rgba(34, 197, 94, 0.1)';
      if (colorClass.includes('blue')) return 'rgba(59, 130, 246, 0.1)';
      if (colorClass.includes('rose')) return 'rgba(239, 68, 68, 0.1)';
      if (colorClass.includes('green')) return 'rgba(34, 197, 94, 0.1)';
      if (colorClass.includes('amber')) return 'rgba(251, 191, 36, 0.1)';
      if (colorClass.includes('purple')) return 'rgba(139, 92, 246, 0.1)';
      return 'rgba(148, 163, 184, 0.1)';
    }
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
            System Logs
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            View system activity and logs
          </Text>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryCardContent}>
            <View
              style={[
                styles.summaryItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 1)',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.summaryLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('staff.systemLogs.total')}
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: themeColors.foreground },
                ]}
              >
                <CountUp to={systemLogsSummaryMock.totalLogs} separator="." />
              </Text>
            </View>
            <View
              style={[
                styles.summaryItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 1)',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.summaryLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('staff.systemLogs.today')}
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: themeColors.foreground },
                ]}
              >
                <CountUp to={systemLogsSummaryMock.logsToday} separator="." />
              </Text>
            </View>
            <View
              style={[
                styles.summaryItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 1)',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.summaryLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('staff.systemLogs.thisWeek')}
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: themeColors.foreground },
                ]}
              >
                <CountUp to={systemLogsSummaryMock.logsThisWeek} separator="." />
              </Text>
            </View>
            <View
              style={[
                styles.summaryItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 1)',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.summaryLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('staff.systemLogs.thisMonth')}
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: themeColors.foreground },
                ]}
              >
                <CountUp to={systemLogsSummaryMock.logsThisMonth} separator="." />
              </Text>
            </View>
          </View>
        </Card>

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
              placeholder="Tìm kiếm..."
              placeholderTextColor={themeColors['muted-foreground']}
              value={search}
              onChangeText={setSearch}
            />

            <View style={styles.filtersRow}>
              <Select
                value={actionType}
                onChange={setActionType}
                options={[
                  { label: t('staff.systemLogs.filterActionTypeAll'), value: 'all' },
                  ...Object.entries(actionTypeLabels).map(([value, label]) => ({
                    label,
                    value,
                  })),
                ]}
                placeholder={t('staff.systemLogs.filterActionType')}
                style={styles.filterItem}
              />
              <Select
                value={tableName}
                onChange={setTableName}
                options={[
                  { label: 'Tất cả bảng', value: 'all' },
                  ...uniqueTableNames.map(name => ({ label: name, value: name })),
                ]}
                placeholder="Bảng"
                style={styles.filterItem}
              />
              <Select
                value={userRole}
                onChange={setUserRole}
                options={[
                  { label: 'Tất cả vai trò', value: 'all' },
                  ...uniqueUserRoles.map(role => ({ label: role, value: role })),
                ]}
                placeholder="Vai trò"
                style={styles.filterItem}
              />
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Từ ngày"
                style={styles.filterItem}
              />
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Đến ngày"
                style={styles.filterItem}
              />
            </View>
          </CardContent>
        </Card>

        <Card style={styles.logsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                Danh sách logs ({filtered.length})
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paginated.length === 0 ? (
              <View style={styles.emptyState}>
                <Text
                  style={[
                    styles.emptyStateText,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('staff.systemLogs.noResults')}
                </Text>
              </View>
            ) : (
              <FlatList
                data={paginated}
                keyExtractor={item => item.auditId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.logItem,
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
                    <View style={styles.logInfo}>
                      <View style={styles.logHeader}>
                        <Text
                          style={[
                            styles.logUserName,
                            { color: themeColors.foreground },
                          ]}
                        >
                          {item.userName}
                        </Text>
                        <View
                          style={[
                            styles.actionBadge,
                            { backgroundColor: getActionBg(item.actionType) },
                          ]}
                        >
                          <Text
                            style={[
                              styles.actionText,
                              { color: getActionColor(item.actionType) },
                            ]}
                          >
                            {actionTypeLabels[item.actionType]}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.logDetails,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        {item.tableName} • {item.userRole}
                      </Text>
                      <Text
                        style={[
                          styles.logTimestamp,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        {format(new Date(item.actionTimestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            )}

            {totalPages > 1 && (
              <View style={styles.pagination}>
                <Button
                  title={t('staff.systemLogs.previous')}
                  onPress={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                />
                <Text
                  style={[
                    styles.paginationText,
                    { color: themeColors.foreground },
                  ]}
                >
                  Trang {page} / {totalPages}
                </Text>
                <Button
                  title="Sau"
                  onPress={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                  size="sm"
                />
              </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>

      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Chi tiết log"
        size="lg"
      >
        {selected && (
          <View style={styles.modalContent}>
            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('staff.systemLogs.modalUserInfo')}
              </Text>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('staff.systemLogs.modalName')}
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selected.userName}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Email:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selected.userEmail}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Vai trò:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selected.userRole}
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
                {t('staff.systemLogs.modalAction')}
              </Text>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Loại:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {actionTypeLabels[selected.actionType]}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Bảng:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selected.tableName}
                </Text>
              </View>
              {selected.recordId && (
                <View style={styles.modalInfoRow}>
                  <Text
                    style={[
                      styles.modalInfoLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Record ID:
                  </Text>
                  <Text
                    style={[
                      styles.modalInfoValue,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {selected.recordId}
                  </Text>
                </View>
              )}
              {selected.changedField && (
                <View style={styles.modalInfoRow}>
                  <Text
                    style={[
                      styles.modalInfoLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    {t('staff.systemLogs.modalFieldChanged')}
                  </Text>
                  <Text
                    style={[
                      styles.modalInfoValue,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {selected.changedField}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('staff.systemLogs.modalTechnicalInfo')}
              </Text>
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
                  {selected.ipAddress}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Thời gian:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {format(
                    new Date(selected.actionTimestamp),
                    'dd/MM/yyyy HH:mm:ss'
                  )}
                </Text>
              </View>
            </View>
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
  searchInput: {
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
  },
  filtersRow: {
    gap: spacing.md,
  },
  filterItem: {
    marginBottom: spacing.sm,
  },
  logsCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  logItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  logInfo: {
    gap: spacing.xs,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logUserName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    flex: 1,
  },
  actionBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  logDetails: {
    fontSize: typography.fontSize.sm,
  },
  logTimestamp: {
    fontSize: typography.fontSize.xs,
  },
  emptyState: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  paginationText: {
    fontSize: typography.fontSize.sm,
  },
  modalContent: {
    gap: spacing.lg,
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
  },
  modalInfoLabel: {
    fontSize: typography.fontSize.sm,
  },
  modalInfoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});

