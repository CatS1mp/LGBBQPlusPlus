import React, { useState, Suspense, lazy } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { SkeletonCard } from '../../components/ui/Skeleton';

const ProfileContent = lazy(() =>
  import('../../components/student/ProfileContent').then(module => ({
    default: module.ProfileContent,
  }))
);

const HistoryContent = lazy(() =>
  import('../../components/student/HistoryContent').then(module => ({
    default: module.HistoryContent,
  }))
);

type TabType = 'profile' | 'history';

export const ProfileAndHistoryScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const tabsContainerRef = React.useRef<View>(null);
  const [tabsWidth, setTabsWidth] = React.useState(0);

  // Debug: Log component mount
  React.useEffect(() => {
    if (__DEV__) {
      console.log('🚀 [ProfileAndHistoryScreen] Component Mounted');
    }
  }, []);

  // Debug: Log tab changes
  React.useEffect(() => {
    if (__DEV__) {
      console.log('📑 [ProfileAndHistoryScreen] Tab Changed:', {
        activeTab,
        timestamp: new Date().toISOString(),
      });
    }
  }, [activeTab]);

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeTab === 'profile' ? 0 : 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [activeTab, slideAnim]);

  const handleTabChange = (tab: TabType) => {
    if (__DEV__) {
      console.log('👆 [ProfileAndHistoryScreen] Tab Clicked:', {
        from: activeTab,
        to: tab,
        timestamp: new Date().toISOString(),
      });
    }
    setActiveTab(tab);
  };

  const handleTabsLayout = (event: { nativeEvent: { layout: { width: number } } }) => {
    const { width } = event.nativeEvent.layout;
    setTabsWidth(width);
  };

  const indicatorTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, tabsWidth * 0.5],
  });

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.headerTitle,
            { color: themeColors.foreground },
          ]}
        >
          {activeTab === 'profile'
            ? t('student.profile.title')
            : t('student.history.title')}
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: themeColors['muted-foreground'] },
          ]}
        >
          {activeTab === 'profile'
            ? t('student.profile.description')
            : t('student.history.description')}
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <View
          ref={tabsContainerRef}
          onLayout={handleTabsLayout}
          style={[
            styles.tabs,
            {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <Animated.View
            style={[
              styles.indicator,
              {
                backgroundColor: themeColors.primary,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          />
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('profile')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'profile'
                      ? theme === 'dark'
                        ? '#000000'
                        : '#ffffff'
                      : themeColors['muted-foreground'],
                  fontWeight: activeTab === 'profile' ? '600' : '400',
                },
              ]}
            >
              {t('student.profile.title')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('history')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'history'
                      ? theme === 'dark'
                        ? '#000000'
                        : '#ffffff'
                      : themeColors['muted-foreground'],
                  fontWeight: activeTab === 'history' ? '600' : '400',
                },
              ]}
            >
              {t('student.history.title')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Suspense
          fallback={
            <View style={styles.loadingContainer}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          }
        >
          {activeTab === 'profile' ? (
            <ProfileContent />
          ) : (
            <HistoryContent />
          )}
        </Suspense>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
  },
  tabContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '50%',
    borderRadius: borderRadius.md,
    marginHorizontal: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    padding: spacing.lg,
  },
});

