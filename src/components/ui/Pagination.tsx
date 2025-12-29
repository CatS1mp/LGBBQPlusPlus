import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { Button } from './Button';

interface PaginationProps {
  page: number; // 0-indexed
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  style?: any;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onChange,
  style,
}) => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = page + 1; // Convert to 1-indexed for display
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);

  const goTo = (targetPage: number) => {
    const target = Math.min(totalPages - 1, Math.max(0, targetPage - 1)); // Convert to 0-indexed
    onChange(target);
  };

  const renderPages = () => {
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPageInitial = Math.min(
      totalPages,
      startPage + maxVisiblePages - 1
    );

    let endPage = endPageInitial;
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
      endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    }

    const pages: (number | string)[] = [];
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(i);
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <Text
            key={`ellipsis-${idx}`}
            style={[
              styles.ellipsis,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            ...
          </Text>
        );
      }

      const isActive = currentPage === p;
      return (
        <TouchableOpacity
          key={p}
          onPress={() => goTo(p as number)}
          style={[
            styles.pageButton,
            {
              backgroundColor: isActive
                ? themeColors.primary
                : 'transparent',
              borderColor: isActive
                ? themeColors.primary
                : themeColors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.pageButtonText,
              {
                color: isActive
                  ? themeColors['primary-foreground']
                  : themeColors.foreground,
              },
            ]}
          >
            {p}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.infoText,
          { color: themeColors['muted-foreground'] },
        ]}
      >
        Hiển thị{' '}
        <Text style={[styles.infoTextBold, { color: themeColors.foreground }]}>
          {start}
        </Text>
        -
        <Text style={[styles.infoTextBold, { color: themeColors.foreground }]}>
          {end}
        </Text>{' '}
        trên{' '}
        <Text style={[styles.infoTextBold, { color: themeColors.foreground }]}>
          {total}
        </Text>
      </Text>

      <View style={styles.pagesContainer}>
        <Button
          title="Trước"
          onPress={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
          size="sm"
          style={styles.navButton}
        />
        <View style={styles.pages}>{renderPages()}</View>
        <Button
          title="Sau"
          onPress={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
          size="sm"
          style={styles.navButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  infoTextBold: {
    fontWeight: '600',
  },
  pagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  pages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  pageButton: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  ellipsis: {
    paddingHorizontal: spacing.xs,
    fontSize: typography.fontSize.sm,
  },
  navButton: {
    minWidth: 60,
  },
});

