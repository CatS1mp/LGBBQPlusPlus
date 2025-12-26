import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CountUp } from '../../components/ui/CountUp';
import {
  statWidgets,
  weeklyPrintingActivity,
  paperSizeUsage,
  printerStatusSummary,
  alerts,
} from '../../data/staffDashboardMock';

export const StaffDashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  const getTrendColor = (trend: 'up' | 'down' | 'flat') => {
    switch (trend) {
      case 'up':
        return theme === 'dark' ? '#86efac' : '#16a34a';
      case 'down':
        return theme === 'dark' ? '#fca5a5' : '#dc2626';
      default:
        return themeColors['muted-foreground'];
    }
  };

  const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return {
          bg: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
          text: theme === 'dark' ? '#fca5a5' : '#dc2626',
          border: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.2)',
        };
      case 'warning':
        return {
          bg: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
          text: theme === 'dark' ? '#fde047' : '#d97706',
          border: theme === 'dark' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.2)',
        };
      default:
        return {
          bg: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.1)',
          text: theme === 'dark' ? '#7dd3fc' : '#0284c7',
          border: theme === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(56, 189, 248, 0.2)',
        };
    }
  };

  const getSeverityLabel = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return 'Critical';
      case 'warning':
        return 'Warning';
      default:
        return 'Info';
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
              styles.sectionLabel,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            STAFF DASHBOARD
          </Text>
          <Text
            style={[
              styles.headerTitle,
              { color: themeColors.foreground },
            ]}
          >
            Dashboard
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            Welcome back
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {statWidgets.map(stat => (
            <Card key={stat.id} style={styles.statCard}>
              <CardContent>
                <Text
                  style={[
                    styles.statLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {stat.id === 'printersOnline'
                    ? 'Printers online'
                    : stat.id === 'jobsToday'
                      ? 'Jobs today'
                      : 'Pages this month'}
                </Text>
                <View style={styles.statValueRow}>
                  <Text
                    style={[
                      styles.statValue,
                      { color: themeColors.foreground },
                    ]}
                  >
                    <CountUp to={stat.value} separator="," />
                  </Text>
                  {stat.suffix && (
                    <Text
                      style={[
                        styles.statSuffix,
                        { color: themeColors['muted-foreground'] },
                      ]}
                    >
                      {stat.suffix}
                    </Text>
                  )}
                </View>
                {stat.change && (
                  <View style={styles.statChangeRow}>
                    <Text
                      style={[
                        styles.statChange,
                        { color: getTrendColor(stat.trend) },
                      ]}
                    >
                      {stat.change}
                    </Text>
                  </View>
                )}
                {stat.captionKey && (
                  <Text
                    style={[
                      styles.statCaption,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    {stat.captionKey === 'total'
                      ? `Out of ${printerStatusSummary.online + printerStatusSummary.offline + printerStatusSummary.maintenance}`
                      : 'Last job finished 6m ago'}
                  </Text>
                )}
              </CardContent>
            </Card>
          ))}
        </View>

        <Card style={styles.chartCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                Weekly activity
              </Text>
            </CardTitle>
            <CardDescription>
              <Text
                style={[
                  styles.cardDescriptionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                Completed jobs and pages
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.weeklyActivityContainer}>
              {weeklyPrintingActivity.map((day, index) => (
                <View key={index} style={styles.weeklyDay}>
                  <Text
                    style={[
                      styles.weeklyDayLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    {day.day}
                  </Text>
                  <View style={styles.weeklyBars}>
                    <View
                      style={[
                        styles.weeklyBar,
                        styles.weeklyBarJobs,
                        { height: (day.jobs / 60) * 100 },
                      ]}
                    />
                    <View
                      style={[
                        styles.weeklyBar,
                        styles.weeklyBarPages,
                        { height: (day.pages / 900) * 100 },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.weeklyValue,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {day.jobs}
                  </Text>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        <Card style={styles.paperSizeCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                Paper size usage
              </Text>
            </CardTitle>
            <CardDescription>
              <Text
                style={[
                  styles.cardDescriptionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                Share of paper sizes used this month
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.paperSizeContainer}>
              {paperSizeUsage.map((paper, index) => (
                <View key={index} style={styles.paperSizeItem}>
                  <View
                    style={[
                      styles.paperSizeBar,
                      {
                        width: `${paper.value}%`,
                        backgroundColor: paper.color,
                      },
                    ]}
                  />
                  <View style={styles.paperSizeInfo}>
                    <View
                      style={[
                        styles.paperSizeDot,
                        { backgroundColor: paper.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.paperSizeLabel,
                        { color: themeColors.foreground },
                      ]}
                    >
                      {paper.name}
                    </Text>
                    <Text
                      style={[
                        styles.paperSizeValue,
                        { color: themeColors['muted-foreground'] },
                      ]}
                    >
                      {paper.value}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        <View style={styles.bottomGrid}>
          <Card style={styles.printerStatusCard}>
            <CardHeader>
              <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  Status
                </Text>
              </CardTitle>
              <CardDescription>
                <Text
                  style={[
                    styles.cardDescriptionText,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Health and utilization overview
                </Text>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View style={styles.printerStatusGrid}>
                <View
                  style={[
                    styles.printerStatusItem,
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
                      styles.printerStatusLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Online
                  </Text>
                  <Text
                    style={[
                      styles.printerStatusValue,
                      { color: '#22c55e' },
                    ]}
                  >
                    <CountUp to={printerStatusSummary.online} />
                  </Text>
                </View>
                <View
                  style={[
                    styles.printerStatusItem,
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
                      styles.printerStatusLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Offline
                  </Text>
                  <Text
                    style={[
                      styles.printerStatusValue,
                      { color: '#ef4444' },
                    ]}
                  >
                    <CountUp to={printerStatusSummary.offline} />
                  </Text>
                </View>
                <View
                  style={[
                    styles.printerStatusItem,
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
                      styles.printerStatusLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Maintenance
                  </Text>
                  <Text
                    style={[
                      styles.printerStatusValue,
                      { color: '#f59e0b' },
                    ]}
                  >
                    <CountUp to={printerStatusSummary.maintenance} />
                  </Text>
                </View>
                <View
                  style={[
                    styles.printerStatusItem,
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
                      styles.printerStatusLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    Utilization
                  </Text>
                  <Text
                    style={[
                      styles.printerStatusValue,
                      { color: themeColors.foreground },
                    ]}
                  >
                    <CountUp to={printerStatusSummary.utilization} />%
                  </Text>
                </View>
              </View>
              <View style={styles.utilizationProgress}>
                <View style={styles.utilizationProgressBar}>
                  <View
                    style={[
                      styles.utilizationProgressFill,
                      {
                        width: `${printerStatusSummary.utilization}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.utilizationLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  System utilization
                </Text>
              </View>
              <Button
                title="Go to printers"
                onPress={() => {
                  // Navigation handled by tab navigator
                }}
                variant="outline"
                style={styles.managePrintersButton}
              />
            </CardContent>
          </Card>

          <Card style={styles.alertsCard}>
            <CardHeader>
              <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  Alerts
                </Text>
              </CardTitle>
              <CardDescription>
                <Text
                  style={[
                    styles.cardDescriptionText,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Items to resolve soon
                </Text>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.slice(0, 2).map(alert => {
                const severityStyle = getSeverityColor(alert.severity);
                return (
                  <View
                    key={alert.id}
                    style={[
                      styles.alertItem,
                      {
                        backgroundColor: severityStyle.bg,
                        borderColor: severityStyle.border,
                      },
                    ]}
                  >
                    <View style={styles.alertHeader}>
                      <Text
                        style={[
                          styles.alertTitle,
                          { color: themeColors.foreground },
                        ]}
                      >
                        {alert.id === 'lowPaper'
                          ? 'A3 paper is low at R305'
                          : alert.id === 'driverUpdate'
                            ? 'Driver update needed for HP 4100'
                            : 'Printer R402 is offline'}
                      </Text>
                      <View
                        style={[
                          styles.alertBadge,
                          {
                            backgroundColor: severityStyle.bg,
                            borderColor: severityStyle.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.alertBadgeText,
                            { color: severityStyle.text },
                          ]}
                        >
                          {getSeverityLabel(alert.severity)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.alertTime,
                        { color: themeColors['muted-foreground'] },
                      ]}
                    >
                      {alert.id === 'lowPaper'
                        ? '10 minutes ago'
                        : alert.id === 'driverUpdate'
                          ? '35 minutes ago'
                          : '1 hour ago'}
                    </Text>
                    <Button
                      title={
                        alert.id === 'lowPaper'
                          ? 'Refill paper'
                          : alert.id === 'driverUpdate'
                            ? 'View details'
                            : 'Reroute jobs'
                      }
                      onPress={() => {}}
                      variant="secondary"
                      size="sm"
                      style={styles.alertButton}
                    />
                  </View>
                );
              })}
            </CardContent>
          </Card>
        </View>
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
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
  },
  statLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600',
  },
  statSuffix: {
    fontSize: typography.fontSize.lg,
  },
  statChangeRow: {
    marginTop: spacing.xs,
  },
  statChange: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  statCaption: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  chartCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  cardDescriptionText: {
    fontSize: typography.fontSize.sm,
  },
  weeklyActivityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingVertical: spacing.md,
  },
  weeklyDay: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  weeklyDayLabel: {
    fontSize: typography.fontSize.xs,
  },
  weeklyBars: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'flex-end',
    height: 120,
  },
  weeklyBar: {
    width: 12,
    borderRadius: borderRadius.sm,
  },
  weeklyBarJobs: {
    backgroundColor: '#3b82f6',
  },
  weeklyBarPages: {
    backgroundColor: '#a855f7',
  },
  weeklyValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  paperSizeCard: {
    marginBottom: spacing.lg,
  },
  paperSizeContainer: {
    gap: spacing.md,
  },
  paperSizeItem: {
    gap: spacing.xs,
  },
  paperSizeBar: {
    height: 8,
    borderRadius: borderRadius.sm,
  },
  paperSizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  paperSizeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paperSizeLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    flex: 1,
  },
  paperSizeValue: {
    fontSize: typography.fontSize.sm,
  },
  bottomGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  printerStatusCard: {
    flex: 1,
    minWidth: '48%',
  },
  printerStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  printerStatusItem: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  printerStatusLabel: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  printerStatusValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  utilizationProgress: {
    marginBottom: spacing.md,
  },
  utilizationProgressBar: {
    height: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  utilizationProgressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: borderRadius.full,
  },
  utilizationLabel: {
    fontSize: typography.fontSize.xs,
  },
  managePrintersButton: {
    marginTop: spacing.sm,
  },
  alertsCard: {
    flex: 1,
    minWidth: '48%',
  },
  alertItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  alertTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    flex: 1,
  },
  alertBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  alertBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  alertTime: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  alertButton: {
    alignSelf: 'flex-start',
  },
});
