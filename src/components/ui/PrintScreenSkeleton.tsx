import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton, SkeletonText } from './Skeleton';
import { Card, CardContent } from './Card';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { colors } from '../../theme';

export const PrintScreenSkeleton: React.FC = () => {
  const { theme } = useTheme();
  const themeColors = colors[theme];

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width="50%" height={32} style={styles.headerTitle} />
        <Skeleton width="70%" height={16} style={styles.headerSubtitle} />
      </View>

      {/* Step Indicator Skeleton */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map(i => (
          <React.Fragment key={i}>
            <Skeleton
              variant="circular"
              width={40}
              height={40}
              style={styles.stepCircle}
            />
            {i < 4 && <Skeleton width="20%" height={2} style={styles.stepLine} />}
          </React.Fragment>
        ))}
      </View>

      {/* Wizard Card Skeleton */}
      <Card style={styles.wizardCard}>
        <CardContent>
          {/* Step Title */}
          <Skeleton width="40%" height={24} style={styles.stepTitle} />
          <Skeleton width="60%" height={16} style={styles.stepDescription} />

          {/* Upload Area / File Info Skeleton */}
          <View
            style={[
              styles.uploadArea,
              {
                backgroundColor:
                  theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.9)',
                borderColor: themeColors.border,
              },
            ]}
          >
            <Skeleton width="50%" height={20} />
            <Skeleton width="40%" height={14} style={styles.uploadHint} />
          </View>

          {/* Actions Skeleton */}
          <View style={styles.stepActions}>
            <Skeleton width="48%" height={44} borderRadius={8} />
            <Skeleton width="48%" height={44} borderRadius={8} />
          </View>
        </CardContent>
      </Card>

      {/* Uploaded Files Card Skeleton */}
      <Card style={styles.uploadedFilesCard}>
        <CardContent>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <Skeleton width="40%" height={20} />
            <Skeleton width="60%" height={14} style={styles.cardDescription} />
          </View>

          {/* Files List Skeleton */}
          {[1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                styles.uploadedFileItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.9)',
                  borderColor: themeColors.border,
                },
              ]}
            >
              <View style={styles.uploadedFileInfo}>
                <Skeleton width="70%" height={16} style={styles.fileName} />
                <Skeleton width="50%" height={14} />
              </View>
              <Skeleton width={60} height={32} borderRadius={6} />
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  stepCircle: {
    marginHorizontal: spacing.xs,
  },
  stepLine: {
    marginHorizontal: spacing.sm,
  },
  wizardCard: {
    marginBottom: spacing.lg,
  },
  stepTitle: {
    marginBottom: spacing.xs,
  },
  stepDescription: {
    marginBottom: spacing.md,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: spacing.lg,
  },
  uploadHint: {
    marginTop: spacing.xs,
  },
  stepActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  uploadedFilesCard: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardDescription: {
    marginTop: spacing.xs,
  },
  uploadedFileItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadedFileInfo: {
    flex: 1,
  },
  fileName: {
    marginBottom: spacing.xs,
  },
});

