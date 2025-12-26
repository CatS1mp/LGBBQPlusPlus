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
  studentsMockData,
  studentStats,
  studentFilters,
  StudentItem,
  StudentStatus,
} from '../../data/studentsMock';
import { format } from 'date-fns';

type StatusFilterValue = 'all' | StudentStatus;

const statusBadgeClass: Record<StudentStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  graduated: 'bg-blue-100 text-blue-700',
  suspended: 'bg-amber-100 text-amber-800',
  withdrawn: 'bg-rose-100 text-rose-700',
};

const statusLabel: Record<StudentStatus, string> = {
  active: 'Đang học',
  graduated: 'Tốt nghiệp',
  suspended: 'Tạm dừng',
  withdrawn: 'Rút',
};

export const ManageStudentsScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [search, setSearch] = useState('');
  const [faculty, setFaculty] = useState<string>('all');
  const [status, setStatus] = useState<StatusFilterValue>('all');
  const [yearLevel, setYearLevel] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState<StudentItem | null>(null);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    return studentsMockData.filter(student => {
      const matchesSearch =
        search.length === 0 ||
        student.fullName.toLowerCase().includes(search.toLowerCase()) ||
        student.studentCode.toLowerCase().includes(search.toLowerCase()) ||
        student.email.toLowerCase().includes(search.toLowerCase());

      const matchesFaculty = !faculty || faculty === 'all' || student.faculty === faculty;
      const matchesStatus = status === 'all' || student.status === status;
      const matchesYearLevel =
        yearLevel === 'all' || student.yearLevel.toString() === yearLevel;

      const enrollment = new Date(student.enrollmentDate);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const endInclusive = end ? new Date(end) : null;
      if (endInclusive) endInclusive.setHours(23, 59, 59, 999);
      const matchesTime =
        (!start || enrollment >= start) &&
        (!endInclusive || enrollment <= endInclusive);

      return (
        matchesSearch &&
        matchesFaculty &&
        matchesStatus &&
        matchesYearLevel &&
        matchesTime
      );
    });
  }, [search, faculty, status, yearLevel, startDate, endDate]);

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

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
            {t('staff.manageStudents.title')}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('staff.manageStudents.description')}
          </Text>
        </View>

        <SummaryCard
          items={studentStats.map((stat) => {
            const labelKey = stat.label === 'Tổng sinh viên'
              ? 'staff.manageStudents.summary.total'
              : stat.label === 'Đang hoạt động'
                ? 'staff.manageStudents.summary.active'
                : stat.label === 'Tạm dừng'
                  ? 'staff.manageStudents.summary.suspended'
                  : 'staff.manageStudents.summary.graduated';
            return {
              label: (
                <View style={styles.summaryItemLeft}>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    {t(labelKey)}
                  </Text>
                  <Text
                    style={[
                      styles.summaryDelta,
                      {
                        color:
                          stat.delta.startsWith('+')
                            ? theme === 'dark'
                              ? '#86efac'
                              : '#16a34a'
                            : theme === 'dark'
                              ? '#fca5a5'
                              : '#dc2626',
                      },
                    ]}
                  >
                    {stat.delta}
                  </Text>
                </View>
              ),
              value: <CountUp to={stat.value} separator="." />,
            };
          })}
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
              placeholder={t('staff.manageStudents.searchPlaceholder')}
              placeholderTextColor={themeColors['muted-foreground']}
              value={search}
              onChangeText={setSearch}
            />

            {showFilters && (
              <View style={styles.filtersRow}>
                <Select
                  value={faculty}
                  onChange={setFaculty}
                  options={[
                    { label: 'Tất cả khoa', value: 'all' },
                    ...studentFilters.faculties.map(f => ({
                      label: f,
                      value: f,
                    })),
                  ]}
                  placeholder="Khoa"
                  style={styles.filterItem}
                />
                <Select
                  value={status}
                  onChange={setStatus}
                  options={[
                    { label: 'Tất cả trạng thái', value: 'all' },
                    ...studentFilters.statuses.map(s => ({
                      label: statusLabel[s],
                      value: s,
                    })),
                  ]}
                  placeholder="Trạng thái"
                  style={styles.filterItem}
                />
                <Select
                  value={yearLevel}
                  onChange={setYearLevel}
                  options={[
                    { label: t('staff.manageStudents.filterYearAll'), value: 'all' },
                    { label: t('staff.manageStudents.filterYear1'), value: '1' },
                    { label: t('staff.manageStudents.filterYear2'), value: '2' },
                    { label: t('staff.manageStudents.filterYear3'), value: '3' },
                    { label: t('staff.manageStudents.filterYear4'), value: '4' },
                  ]}
                  placeholder={t('staff.manageStudents.filterYear')}
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
            )}

            <Button
              title={showFilters ? t('staff.manageStudents.hideFilters') : t('staff.manageStudents.showFilters')}
              onPress={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              style={styles.filterToggle}
            />
          </CardContent>
        </Card>

        <Card style={styles.studentsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('staff.manageStudents.listTitle', { count: filtered.length })}
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
                  {t('staff.manageStudents.noResults')}
                </Text>
              </View>
            ) : (
              <FlatList
                data={paginated}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.studentItem,
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
                    <View style={styles.studentInfo}>
                      <Text
                        style={[
                          styles.studentName,
                          { color: themeColors.foreground },
                        ]}
                      >
                        {item.fullName}
                      </Text>
                      <Text
                        style={[
                          styles.studentCode,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        {item.studentCode}
                      </Text>
                      <Text
                        style={[
                          styles.studentEmail,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        {item.email}
                      </Text>
                      <View style={styles.studentMeta}>
                        <Text
                          style={[
                            styles.studentMetaText,
                            { color: themeColors['muted-foreground'] },
                          ]}
                        >
                          {item.faculty} • {t('staff.manageStudents.modalYearLabel', { year: item.yearLevel })}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            theme === 'dark'
                              ? statusBadgeClass[item.status].split(' ')[0] ===
                                  'bg-emerald-100'
                                ? 'rgba(34, 197, 94, 0.15)'
                                : statusBadgeClass[item.status].split(' ')[0] ===
                                    'bg-blue-100'
                                  ? 'rgba(59, 130, 246, 0.15)'
                                  : statusBadgeClass[item.status].split(' ')[0] ===
                                      'bg-amber-100'
                                    ? 'rgba(251, 191, 36, 0.15)'
                                    : 'rgba(239, 68, 68, 0.15)'
                              : statusBadgeClass[item.status].split(' ')[0] ===
                                  'bg-emerald-100'
                                ? 'rgba(34, 197, 94, 0.1)'
                                : statusBadgeClass[item.status].split(' ')[0] ===
                                    'bg-blue-100'
                                  ? 'rgba(59, 130, 246, 0.1)'
                                  : statusBadgeClass[item.status].split(' ')[0] ===
                                      'bg-amber-100'
                                    ? 'rgba(251, 191, 36, 0.1)'
                                    : 'rgba(239, 68, 68, 0.1)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              theme === 'dark'
                                ? statusBadgeClass[item.status].split(' ')[1] ===
                                    'text-emerald-700'
                                  ? '#86efac'
                                  : statusBadgeClass[item.status].split(' ')[1] ===
                                      'text-blue-700'
                                    ? '#7dd3fc'
                                    : statusBadgeClass[item.status].split(' ')[1] ===
                                        'text-amber-800'
                                      ? '#fde047'
                                      : '#fca5a5'
                                : statusBadgeClass[item.status].split(' ')[1] ===
                                    'text-emerald-700'
                                  ? '#16a34a'
                                  : statusBadgeClass[item.status].split(' ')[1] ===
                                      'text-blue-700'
                                    ? '#0284c7'
                                    : statusBadgeClass[item.status].split(' ')[1] ===
                                        'text-amber-800'
                                      ? '#d97706'
                                      : '#dc2626',
                          },
                        ]}
                      >
                        {statusLabel[item.status]}
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
                  title={t('staff.manageStudents.previous')}
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
        title={t('staff.manageStudents.modalTitle')}
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
              {selected.fullName}
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {selected.studentCode}
            </Text>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('staff.manageStudents.modalContact')}
              </Text>
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
                  {selected.email}
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
                {t('staff.manageStudents.modalAcademic')}
              </Text>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Khoa:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selected.faculty}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Ngành:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selected.major}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Lớp:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selected.className}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('staff.manageStudents.modalYear')}
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.manageStudents.modalYearLabel', { year: selected.yearLevel })}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Ngày nhập học:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {format(new Date(selected.enrollmentDate), 'dd/MM/yyyy')}
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
  summaryItemLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'right',
  },
  summaryDelta: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
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
    marginBottom: spacing.md,
  },
  filterItem: {
    marginBottom: spacing.sm,
  },
  filterToggle: {
    marginTop: spacing.sm,
  },
  studentsCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  studentInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  studentName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  studentCode: {
    fontSize: typography.fontSize.sm,
  },
  studentEmail: {
    fontSize: typography.fontSize.sm,
  },
  studentMeta: {
    marginTop: spacing.xs,
  },
  studentMetaText: {
    fontSize: typography.fontSize.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
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

