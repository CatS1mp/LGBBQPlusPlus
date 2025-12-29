import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StudentTabParamList } from '../../navigation/types';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CountUp } from '../../components/ui/CountUp';
import { Badge } from '../../components/ui/Badge';
import { gradientPresets } from '../../components/ui/Gradient';
import { GradientText } from '../../components/ui/GradientText';
import {
  studentQuickActionsMock,
  studentHighlightsMock,
} from '../../data/studentDashboardMock';
import { useStudentDashboard, useBonusPackages } from '../../lib/api/services/student';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DashboardSkeleton } from '../../components/ui/DashboardSkeleton';

type NavigationProp = NativeStackNavigationProp<StudentTabParamList>;

export const StudentDashboardScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const navigation = useNavigation<NavigationProp>();

  // API calls - using unified dashboard API
  const {
    data: dashboardData,
    isLoading: isLoadingDashboard,
    isError: isErrorDashboard,
  } = useStudentDashboard();
  const { data: bonusPackagesData, isLoading: isLoadingBonusPackages } =
    useBonusPackages();

  // Extract data from dashboard response
  const dashboard = dashboardData?.data?.data;
  const userName = dashboard?.userName || 'Sinh viên';
  const balance = dashboard?.balance?.balanceAmount || 0;
  const balanceResponse = dashboard?.balance;
  const jobsThisMonth = dashboard?.printHistoryStats?.jobsThisMonth?.total || 0;
  const jobsGrowthPercent =
    dashboard?.printHistoryStats?.jobsThisMonth?.growthPercent || 0;
  const pagesThisMonth = dashboard?.printHistoryStats?.pagesThisMonth || 0;
  const pagesLast30Days = dashboard?.printHistoryStats?.pagesLast30Days || 0;

  // Calculate pages difference
  const estimatedPagesLastMonth = Math.max(0, pagesLast30Days - pagesThisMonth);
  const pagesDifference = pagesThisMonth - estimatedPagesLastMonth;

  // Bonus packages
  const bonusPackages = Array.isArray(bonusPackagesData?.data?.data)
    ? bonusPackagesData.data.data
    : [];
  const activeBonusPackages = Array.isArray(bonusPackages)
    ? bonusPackages
        .filter((pkg: any) => pkg?.isActive !== false)
        .sort((a: any, b: any) => (a?.minPages || 0) - (b?.minPages || 0))
    : [];

  const isLoading = isLoadingDashboard || isLoadingBonusPackages;

  // Transform recent files to match UI format
  const transformedRecentPrints = useMemo(() => {
    const recentFiles = Array.isArray(dashboard?.recentFiles)
      ? dashboard.recentFiles
      : [];
    if (!Array.isArray(recentFiles) || recentFiles.length === 0) {
      return [];
    }
    return recentFiles.map((item: any) => {
      const jobId = item?.jobId || '';
      const fileName = item?.fileName || 'Unknown';
      const printer = item?.printerName || item?.printerLocation || 'Unknown';
      const totalPages = item?.totalPages || 0;
      const createdAt = item?.createdAt || new Date().toISOString();
      const printStatus = item?.printStatus || 'completed';

      return {
        id: jobId,
        fileName,
        printer,
        size: 'A4', // Default size
        pagesUsedA4: totalPages,
        timeAgo: formatDistanceToNow(new Date(createdAt), {
          addSuffix: true,
          locale: vi,
        }),
        status: printStatus,
      };
    });
  }, [dashboard?.recentFiles]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
          text: theme === 'dark' ? '#86efac' : '#16a34a',
          dot: '#22c55e',
        };
      case 'pending':
        return {
          bg: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
          text: theme === 'dark' ? '#fde047' : '#d97706',
          dot: '#f59e0b',
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return t('dashboard.student.recent.status.completed');
      case 'pending':
        return t('dashboard.student.recent.status.pending');
      case 'failed':
        return t('dashboard.student.recent.status.failed');
      default:
        return status;
    }
  };

  const renderQuickAction = ({ item }: { item: typeof studentQuickActionsMock[0] }) => {
    // Get translated title and description
    const translatedTitle = t(`dashboard.student.quickActions.items.${item.id}.title`);
    const translatedDescription = t(`dashboard.student.quickActions.items.${item.id}.description`);
    
    // Map badge value to translation key
    const getBadgeKey = (badge: string | undefined): string | null => {
      if (!badge) return null;
      // Map Vietnamese badge text to translation key
      const badgeMap: Record<string, string> = {
        'Mới': 'new',
        'mới': 'new',
      };
      const badgeKey = badgeMap[badge] || 'new'; // Default to 'new' if not found
      return `dashboard.student.quickActions.badges.${badgeKey}`;
    };
    
    const badgeTranslationKey = getBadgeKey(item.badge);
    const translatedBadge = badgeTranslationKey ? t(badgeTranslationKey) : null;

    return (
      <TouchableOpacity
        style={[
          styles.quickActionItem,
          {
            backgroundColor:
              theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.9)',
            borderColor: themeColors.border,
          },
        ]}
        onPress={() => {
          // Navigate based on action ID
          switch (item.id) {
            case 'print':
              navigation.navigate('StudentPrint');
              break;
            case 'buy':
              navigation.navigate('StudentBuyPages');
              break;
            case 'history':
              // Navigate to Profile tab which contains history
              navigation.navigate('StudentProfile');
              break;
            case 'printers':
              navigation.navigate('StudentPrinters');
              break;
            default:
              break;
          }
        }}
      >
        <View style={styles.quickActionContent}>
          <Text
            style={[
              styles.quickActionTitle,
              { color: themeColors.foreground },
            ]}
          >
            {translatedTitle}
          </Text>
          <Text
            style={[
              styles.quickActionDescription,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {translatedDescription}
          </Text>
        </View>
        {translatedBadge && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  theme === 'dark'
                    ? 'rgba(34, 197, 94, 0.15)'
                    : 'rgba(34, 197, 94, 0.1)',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color:
                    theme === 'dark' ? '#86efac' : '#16a34a',
                },
              ]}
            >
              {translatedBadge}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderRecentPrint = ({ item }: { item: typeof transformedRecentPrints[0] }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <View
        style={[
          styles.recentPrintItem,
          {
            backgroundColor:
              theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.9)',
            borderColor: themeColors.border,
          },
        ]}
      >
        <View style={styles.recentPrintContent}>
          <Text
            style={[
              styles.recentPrintFileName,
              { color: themeColors.foreground },
            ]}
          >
            {item.fileName}
          </Text>
          <Text
            style={[
              styles.recentPrintDetails,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {item.printer || '-'} • {item.size || '-'}
          </Text>
          <View style={styles.recentPrintFooter}>
            <Text
              style={[
                styles.recentPrintPages,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {item.pagesUsedA4} A4
            </Text>
            <Text
              style={[
                styles.recentPrintTime,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {item.timeAgo}
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
            {getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
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
          <DashboardSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (isErrorDashboard) {
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
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: themeColors.destructive }]}>
              Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          <View style={styles.headerTop}>
            <Text
              style={[
                styles.headerTitle,
                { color: themeColors.foreground },
              ]}
            >
              {t('dashboard.student.stats.title', 'Home')}
            </Text>
            <Badge label="🎄 Christmas" variant="christmas" size="sm" />
          </View>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('dashboard.student.subtext')}
          </Text>
        </View>

        <Card style={styles.balanceCard}>
          <CardContent>
            <View style={styles.greetingSection}>
              <GradientText
                colors={gradientPresets.primary}
                style={styles.greetingText}
              >
                {t('dashboard.student.greeting', { name: userName })}
              </GradientText>
            </View>

            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('dashboard.student.stats.balance')}
                </Text>
                <View style={styles.statValueRow}>
                  <CountUp
                    to={balance}
                    style={[
                      styles.statValue,
                      { color: themeColors.foreground },
                    ] as any}
                  />
                  <Text
                    style={[
                      styles.statUnit,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    ₫
                  </Text>
                </View>
                <Text
                  style={[
                    styles.statSubtitle,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('dashboard.student.stats.availableBalance')}
                </Text>
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('dashboard.student.stats.jobsThisMonth')}
                </Text>
                <CountUp
                  to={jobsThisMonth}
                  style={[
                    styles.statValue,
                    { color: themeColors.foreground },
                  ] as any}
                />
                {jobsGrowthPercent !== 0 && (
                  <Text
                    style={[
                      styles.statChange,
                      {
                        color:
                          jobsGrowthPercent > 0
                            ? theme === 'dark'
                              ? '#86efac'
                              : '#16a34a'
                            : theme === 'dark'
                              ? '#fca5a5'
                              : '#dc2626',
                      },
                    ]}
                  >
                    {jobsGrowthPercent > 0 ? '+' : ''}
                    {jobsGrowthPercent}% so với tháng trước
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.statCard,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('dashboard.student.stats.pagesThisMonth')}
                </Text>
                <View style={styles.statValueRow}>
                  <CountUp
                    to={pagesThisMonth}
                    style={[
                      styles.statValue,
                      { color: themeColors.foreground },
                    ] as any}
                  />
                  <Text
                    style={[
                      styles.statUnit,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    A4
                  </Text>
                </View>
                {estimatedPagesLastMonth > 0 && pagesDifference !== 0 && (
                  <Text
                    style={[
                      styles.statChange,
                      {
                        color:
                          pagesDifference > 0
                            ? theme === 'dark'
                              ? '#86efac'
                              : '#16a34a'
                            : theme === 'dark'
                              ? '#fca5a5'
                              : '#dc2626',
                      },
                    ]}
                  >
                    {pagesDifference > 0 ? '+' : ''}
                    {pagesDifference} trang so với tháng trước
                  </Text>
                )}
              </View>
            </View>

            <View
              style={[
                styles.quotaCard,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.quotaTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('dashboard.student.balance.quotaTitle')}
              </Text>
              <Text
                style={[
                  styles.quotaSubtitle,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('dashboard.student.balance.quotaSubtitle')}
              </Text>
              <View style={styles.quotaProgress}>
                <View style={styles.quotaProgressBar}>
                  <View
                    style={[
                      styles.quotaProgressFill,
                      {
                        width: `${Math.min(
                          100,
                          Math.round(
                            ((balanceResponse?.balanceInPages || 0) / 150) *
                              100
                          )
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.quotaInfo}>
                  <Text
                    style={[
                      styles.quotaInfoText,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Đã dùng: {150 - (balanceResponse?.balanceInPages || 0)} /{' '}
                    150 A4
                  </Text>
                  <Text
                    style={[
                      styles.quotaInfoText,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Còn lại:{' '}
                    {balanceResponse?.balanceInPages || 0}{' '}
                    A4
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.highlightsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('dashboard.student.tips.title')}
              </Text>
            </CardTitle>
            <CardDescription>
              <Text
                style={[
                  styles.cardDescriptionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('dashboard.student.tips.description')}
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Bonus packages highlight */}
            {activeBonusPackages.length > 0 && (
              <View
                style={[
                  styles.highlightItem,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(241, 245, 249, 0.8)',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.highlightTitle,
                    { color: themeColors.foreground },
                  ]}
                >
                  Gói giảm giá khi in
                </Text>
                {activeBonusPackages.map((pkg: any, idx: number) => {
                  const discountPercent = (pkg.discountPercentage * 100).toFixed(0);
                  const description =
                    pkg.discountPercentage === 0
                      ? `In từ ${pkg.minPages} trang: không giảm giá`
                      : `In từ ${pkg.minPages} trang: giảm ${discountPercent}%`;
                  return (
                    <Text
                      key={idx}
                      style={[
                        styles.highlightDescription,
                        { color: themeColors['muted-foreground'] },
                      ]}
                    >
                      • {description}
                    </Text>
                  );
                })}
              </View>
            )}
            {/* Other highlights */}
            {studentHighlightsMock.map(item => (
              <View
                key={item.id}
                style={[
                  styles.highlightItem,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(241, 245, 249, 0.8)',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.highlightTitle,
                    { color: themeColors.foreground },
                  ]}
                >
                  {item.title}
                </Text>
                {Array.isArray(item.description) ? (
                  item.description.map((line, idx) => (
                    <Text
                      key={idx}
                      style={[
                        styles.highlightDescription,
                        { color: themeColors['muted-foreground'] },
                      ]}
                    >
                      • {line}
                    </Text>
                  ))
                ) : (
                  <Text
                    style={[
                      styles.highlightDescription,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    {item.description}
                  </Text>
                )}
              </View>
            ))}
          </CardContent>
        </Card>

        <Card style={styles.recentPrintsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('dashboard.student.recent.title')}
              </Text>
            </CardTitle>
            <CardDescription>
              <Text
                style={[
                  styles.cardDescriptionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('dashboard.student.recent.description')}
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlatList
              data={transformedRecentPrints}
              ListEmptyComponent={
                isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColors.primary} />
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: themeColors['muted-foreground'] }]}>
                      {t('dashboard.student.recent.empty')}
                    </Text>
                  </View>
                )
              }
              renderItem={renderRecentPrint}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
            <Button
              title={t('dashboard.student.recent.viewAll')}
              onPress={() => {
                // Navigation handled by tab navigator
              }}
              variant="outline"
              style={styles.viewHistoryButton}
            />
          </CardContent>
        </Card>

        <Card style={styles.quickActionsCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('dashboard.student.quickActions.title')}
              </Text>
            </CardTitle>
            <CardDescription>
              <Text
                style={[
                  styles.cardDescriptionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('dashboard.student.quickActions.description')}
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlatList
              data={studentQuickActionsMock}
              renderItem={renderQuickAction}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
  },
  balanceCard: {
    marginBottom: spacing.lg,
  },
  greetingSection: {
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600',
  },
  greetingName: {
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'column',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600',
  },
  statUnit: {
    fontSize: typography.fontSize.sm,
  },
  statSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  statChange: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  quotaCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  quotaTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  quotaSubtitle: {
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.md,
  },
  quotaProgress: {
    gap: spacing.sm,
  },
  quotaProgressBar: {
    height: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  quotaProgressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: borderRadius.full,
  },
  quotaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quotaInfoText: {
    fontSize: typography.fontSize.xs,
  },
  highlightsCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  cardDescriptionText: {
    fontSize: typography.fontSize.sm,
  },
  highlightItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  highlightTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  highlightDescription: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.base,
  },
  recentPrintsCard: {
    marginBottom: spacing.lg,
  },
  recentPrintItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  recentPrintContent: {
    flex: 1,
  },
  recentPrintFileName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  recentPrintDetails: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  recentPrintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentPrintPages: {
    fontSize: typography.fontSize.xs,
  },
  recentPrintTime: {
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
  viewHistoryButton: {
    marginTop: spacing.md,
  },
  quickActionsCard: {
    marginBottom: spacing.lg,
  },
  quickActionItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  quickActionDescription: {
    fontSize: typography.fontSize.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  errorText: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
});
