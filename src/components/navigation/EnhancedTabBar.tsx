import React, { useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Home,
  Printer,
  Cpu,
  User,
  Wallet,
  Settings,
  Users,
  FileText,
  List,
  Wrench,
  Layout,
} from 'lucide-react-native';
import { useTheme } from '../../lib/hooks/useTheme';
import { useNavigationStore } from '../../lib/stores/useNavigationStore';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabItem = {
  name: string;
  icon: React.ComponentType<any>;
  label: string;
};

interface EnhancedTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
  userType: 'student' | 'staff';
}

export const EnhancedTabBar: React.FC<EnhancedTabBarProps> = ({
  state,
  descriptors,
  navigation,
  userType,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation('pages');
  const { layout, setLayout } = useNavigationStore();
  const themeColors = colors[theme];
  const slideAnim = useRef(new Animated.Value(0)).current;

  const studentTabs: TabItem[] = useMemo(
    () => [
      {
        name: 'StudentDashboard',
        icon: Home,
        label: t('dashboard.student.navigation.dashboard'),
      },
      {
        name: 'StudentPrint',
        icon: Printer,
        label: t('dashboard.student.navigation.print'),
      },
      {
        name: 'StudentPrinters',
        icon: Cpu,
        label: t('dashboard.student.navigation.printers'),
      },
      {
        name: 'StudentProfile',
        icon: User,
        label: t('dashboard.student.navigation.profile'),
      },
      {
        name: 'StudentBuyPages',
        icon: Wallet,
        label: t('dashboard.student.navigation.buyPages'),
      },
      {
        name: 'StudentSettings',
        icon: Settings,
        label: t('dashboard.student.navigation.settings'),
      },
    ],
    [t]
  );

  const staffTabs: TabItem[] = useMemo(
    () => [
      {
        name: 'StaffDashboard',
        icon: Home,
        label: t('dashboard.student.navigation.dashboard'),
      },
      {
        name: 'StaffManagePrinters',
        icon: Printer,
        label: t('dashboard.student.navigation.managePrinters'),
      },
      {
        name: 'StaffManageStudents',
        icon: Users,
        label: t('dashboard.student.navigation.manageStudents'),
      },
      {
        name: 'StaffReports',
        icon: FileText,
        label: t('dashboard.student.navigation.reports'),
      },
      {
        name: 'StaffSystemLogs',
        icon: List,
        label: t('dashboard.student.navigation.systemLogs'),
      },
      {
        name: 'StaffConfiguration',
        icon: Wrench,
        label: t('dashboard.student.navigation.configuration'),
      },
      {
        name: 'StaffSettings',
        icon: Settings,
        label: t('dashboard.student.navigation.settings'),
      },
    ],
    [t]
  );

  const tabs = userType === 'student' ? studentTabs : staffTabs;

  const focusedIndex = state.index;

  React.useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: focusedIndex,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [focusedIndex, slideAnim]);

  const toggleLayout = useCallback(() => {
    setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal');
  }, [layout, setLayout]);

  if (layout === 'vertical') {
    return (
      <View
        style={[
          styles.verticalContainer,
          {
            backgroundColor: themeColors.background,
            borderRightColor: themeColors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={toggleLayout}
          style={[
            styles.layoutToggle,
            {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        >
          <Layout size={20} color={themeColors.foreground} />
        </TouchableOpacity>
        {tabs.map((tab, index) => {
          const route = state.routes.find((r: any) => r.name === tab.name);
          const isFocused = state.index === index;
          const Icon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={[
                styles.verticalTab,
                {
                  backgroundColor: isFocused
                    ? themeColors.primary + '20'
                    : 'transparent',
                },
              ]}
            >
              <Icon
                size={24}
                color={isFocused ? themeColors.primary : themeColors['muted-foreground']}
                strokeWidth={isFocused ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.verticalTabLabel,
                  {
                    color: isFocused
                      ? themeColors.primary
                      : themeColors['muted-foreground'],
                    fontWeight: isFocused ? '600' : '400',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.horizontalContainer,
        {
          backgroundColor: themeColors.background,
          borderTopColor: themeColors.border,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: themeColors.primary + '20',
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, tabs.length - 1],
                  outputRange: [0, (SCREEN_WIDTH / tabs.length) * (tabs.length - 1)],
                }),
              },
            ],
          },
        ]}
      />
      {tabs.map((tab, index) => {
        const route = state.routes.find((r: any) => r.name === tab.name);
        const isFocused = state.index === index;
        const Icon = tab.icon;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.horizontalTab}
          >
            <Icon
              size={24}
              color={isFocused ? themeColors.primary : themeColors['muted-foreground']}
              strokeWidth={isFocused ? 2.5 : 2}
            />
            <Text
              style={[
                styles.horizontalTabLabel,
                {
                  color: isFocused
                    ? themeColors.primary
                    : themeColors['muted-foreground'],
                  fontWeight: isFocused ? '600' : '400',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        onPress={toggleLayout}
        style={[
          styles.layoutToggleHorizontal,
          {
            backgroundColor:
              theme === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
      >
        <Layout size={18} color={themeColors.foreground} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
    position: 'relative',
  },
  horizontalTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  horizontalTabLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: `${100 / 6}%`,
    borderRadius: borderRadius.md,
  },
  verticalContainer: {
    width: 80,
    borderRightWidth: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  verticalTab: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  verticalTabLabel: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  layoutToggle: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  layoutToggleHorizontal: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    alignSelf: 'center',
  },
});

