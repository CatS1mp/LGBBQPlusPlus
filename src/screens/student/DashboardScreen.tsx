import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { Gradient, gradientPresets } from '../../components/ui/Gradient';
import {
  studentStatsMock,
  studentQuickActionsMock,
  studentHighlightsMock,
  studentRecentPrintsMock,
  studentProfileSummaryMock,
} from '../../data/studentDashboardMock';

export const StudentDashboardScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];

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

  const renderQuickAction = ({ item }: { item: typeof studentQuickActionsMock[0] }) => (
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
        // Navigation will be handled by tab navigator
      }}
    >
      <View style={styles.quickActionContent}>
        <Text
          style={[
            styles.quickActionTitle,
            { color: themeColors.foreground },
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.quickActionDescription,
            { color: themeColors['muted-foreground'] },
          ]}
        >
          {item.description}
        </Text>
      </View>
      {item.badge && (
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
            {item.badge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecentPrint = ({ item }: { item: typeof studentRecentPrintsMock[0] }) => {
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
            {item.printer} • {item.size}
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
              <Text
                style={[
                  styles.greetingText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('dashboard.student.greeting', { name: studentProfileSummaryMock.fullName })}
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <Gradient
                colors={gradientPresets.info}
                style={[
                  styles.statCard,
                  {
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
                  <Text
                    style={[
                      styles.statValue,
                      { color: themeColors.foreground },
                    ]}
                  >
                    <CountUp to={studentStatsMock.balance} />
                  </Text>
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
              </Gradient>

              <Gradient
                colors={gradientPresets.success}
                style={[
                  styles.statCard,
                  {
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    { color: '#ffffff' },
                  ]}
                >
                  {t('dashboard.student.stats.jobsThisMonth')}
                </Text>
                <Text
                  style={[
                    styles.statValue,
                    { color: '#ffffff' },
                  ]}
                >
                  <CountUp to={studentStatsMock.jobsThisMonth} />
                </Text>
                {studentStatsMock.jobsChangePercent !== 0 && (
                  <Text
                    style={[
                      styles.statChange,
                      {
                        color:
                          studentStatsMock.jobsChangePercent > 0
                            ? theme === 'dark'
                              ? '#86efac'
                              : '#16a34a'
                            : theme === 'dark'
                              ? '#fca5a5'
                              : '#dc2626',
                      },
                    ]}
                  >
                    {t('dashboard.student.stats.changePercent', {
                      percent: `${studentStatsMock.jobsChangePercent > 0 ? '+' : ''}${studentStatsMock.jobsChangePercent}`,
                    })}
                  </Text>
                )}
              </Gradient>

              <Gradient
                colors={gradientPresets.warning}
                style={[
                  styles.statCard,
                  {
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statLabel,
                    { color: '#ffffff' },
                  ]}
                >
                  {t('dashboard.student.stats.pagesThisMonth')}
                </Text>
                <View style={styles.statValueRow}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: '#ffffff' },
                    ]}
                  >
                    <CountUp to={studentStatsMock.pagesThisMonth} />
                  </Text>
                  <Text
                    style={[
                      styles.statUnit,
                      { color: '#ffffff', opacity: 0.9 },
                    ]}
                  >
                    A4
                  </Text>
                </View>
                {studentStatsMock.pagesChangePercent !== 0 && (
                  <Text
                    style={[
                      styles.statChange,
                      {
                        color:
                          studentStatsMock.pagesChangePercent > 0
                            ? theme === 'dark'
                              ? '#86efac'
                              : '#16a34a'
                            : theme === 'dark'
                              ? '#fca5a5'
                              : '#dc2626',
                      },
                    ]}
                  >
                    {t('dashboard.student.stats.changePercent', {
                      percent: `${studentStatsMock.pagesChangePercent > 0 ? '+' : ''}${studentStatsMock.pagesChangePercent}`,
                    })}
                  </Text>
                )}
              </Gradient>
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
                            (studentStatsMock.giftedQuotaUsed /
                              studentStatsMock.giftedQuotaTotal) *
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
                    Đã dùng: {studentStatsMock.giftedQuotaUsed} /{' '}
                    {studentStatsMock.giftedQuotaTotal} A4
                  </Text>
                  <Text
                    style={[
                      styles.quotaInfoText,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Còn lại:{' '}
                    {studentStatsMock.giftedQuotaTotal -
                      studentStatsMock.giftedQuotaUsed}{' '}
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
              data={studentRecentPrintsMock.slice(0, 5)}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
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
});
