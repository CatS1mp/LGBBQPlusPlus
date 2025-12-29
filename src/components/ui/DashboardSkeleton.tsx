import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, SkeletonText } from './Skeleton';
import { Card, CardContent, CardHeader } from './Card';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { colors } from '../../theme';

export const DashboardSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width="40%" height={32} style={styles.headerTitle} />
        <Skeleton width="60%" height={16} style={styles.headerSubtitle} />
      </View>

      {/* Balance Card Skeleton */}
      <Card style={styles.balanceCard}>
        <CardContent>
          {/* Greeting Skeleton */}
          <View style={styles.greetingSection}>
            <Skeleton width="70%" height={28} />
          </View>

          {/* Stats Grid Skeleton */}
          <View style={styles.statsGrid}>
            {/* Balance Card */}
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Skeleton width="60%" height={14} style={styles.statLabel} />
              <View style={styles.statValueRow}>
                <Skeleton width="80%" height={32} />
                <Skeleton width="20" height={16} />
              </View>
              <Skeleton width="50%" height={12} style={styles.statSubtitle} />
            </View>

            {/* Jobs This Month Card */}
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Skeleton width="70%" height={14} style={styles.statLabel} />
              <Skeleton width="60%" height={32} />
            </View>

            {/* Pages This Month Card */}
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <Skeleton width="65%" height={14} style={styles.statLabel} />
              <View style={styles.statValueRow}>
                <Skeleton width="70%" height={32} />
                <Skeleton width="30" height={16} />
              </View>
            </View>
          </View>

          {/* Quota Card Skeleton */}
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
            <Skeleton width="50%" height={16} style={styles.quotaTitle} />
            <Skeleton width="70%" height={12} style={styles.quotaSubtitle} />
            <View style={styles.quotaProgress}>
              <Skeleton width="100%" height={12} borderRadius={6} />
              <View style={styles.quotaInfo}>
                <Skeleton width="40%" height={12} />
                <Skeleton width="40%" height={12} />
              </View>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Highlights Card Skeleton */}
      <Card style={styles.highlightsCard}>
        <CardHeader>
          <Skeleton width="40%" height={20} />
          <Skeleton width="60%" height={14} style={styles.cardDescription} />
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map(i => (
            <View
              key={i}
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
              <Skeleton width="50%" height={16} style={styles.highlightTitle} />
              <SkeletonText lines={2} width="100%" />
            </View>
          ))}
        </CardContent>
      </Card>

      {/* Recent Prints Card Skeleton */}
      <Card style={styles.recentPrintsCard}>
        <CardHeader>
          <Skeleton width="35%" height={20} />
          <Skeleton width="55%" height={14} style={styles.cardDescription} />
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map(i => (
            <View
              key={i}
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
                <Skeleton width="70%" height={16} style={styles.recentPrintFileName} />
                <Skeleton width="50%" height={14} style={styles.recentPrintDetails} />
                <View style={styles.recentPrintFooter}>
                  <Skeleton width="30%" height={12} />
                  <Skeleton width="30%" height={12} />
                </View>
              </View>
              <Skeleton width={60} height={24} borderRadius={12} />
            </View>
          ))}
          <Skeleton width="100%" height={44} borderRadius={8} style={styles.viewHistoryButton} />
        </CardContent>
      </Card>

      {/* Quick Actions Card Skeleton */}
      <Card style={styles.quickActionsCard}>
        <CardHeader>
          <Skeleton width="40%" height={20} />
          <Skeleton width="65%" height={14} style={styles.cardDescription} />
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4].map(i => (
            <View
              key={i}
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
            >
              <View style={styles.quickActionContent}>
                <Skeleton width="60%" height={16} style={styles.quickActionTitle} />
                <Skeleton width="80%" height={14} />
              </View>
              {i % 2 === 0 && <Skeleton width={50} height={20} borderRadius={10} />}
            </View>
          ))}
        </CardContent>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    marginBottom: spacing.sm,
  },
  headerSubtitle: {},
  balanceCard: {
    marginBottom: spacing.lg,
  },
  greetingSection: {
    marginBottom: spacing.lg,
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
    marginBottom: spacing.xs,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statSubtitle: {
    marginTop: spacing.xs,
  },
  quotaCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  quotaTitle: {
    marginBottom: spacing.xs,
  },
  quotaSubtitle: {
    marginBottom: spacing.md,
  },
  quotaProgress: {
    gap: spacing.sm,
  },
  quotaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  highlightsCard: {
    marginBottom: spacing.lg,
  },
  cardDescription: {
    marginTop: spacing.xs,
  },
  highlightItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  highlightTitle: {
    marginBottom: spacing.xs,
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
    marginBottom: spacing.xs,
  },
  recentPrintDetails: {
    marginBottom: spacing.xs,
  },
  recentPrintFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginBottom: spacing.xs,
  },
});

