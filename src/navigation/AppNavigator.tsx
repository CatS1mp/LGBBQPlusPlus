import React, { useMemo, useCallback, Suspense, useRef, useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator } from 'react-native';
import {
  Home,
  Printer,
  Clock,
  Cpu,
  User,
  Wallet,
  Settings,
  Users,
  FileText,
  List,
  Wrench,
  Repeat,
} from 'lucide-react-native';
import { useAuthStore } from '../lib/stores/useAuthStore';
import { useMockModeStore } from '../lib/stores/useMockModeStore';
import { useTheme } from '../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';
import {
  RootStackParamList,
  StudentTabParamList,
  StaffTabParamList,
} from './types';

// Lazy load screens
const LoginScreen = React.lazy(() => import('../screens/auth/LoginScreen').then(m => ({ default: m.LoginScreen })));
const ForgotPasswordScreen = React.lazy(() => import('../screens/auth/ForgotPasswordScreen').then(m => ({ default: m.ForgotPasswordScreen })));
const ResetPasswordScreen = React.lazy(() => import('../screens/auth/ResetPasswordScreen').then(m => ({ default: m.ResetPasswordScreen })));
const StudentDashboardScreen = React.lazy(() => import('../screens/student/DashboardScreen').then(m => ({ default: m.StudentDashboardScreen })));
const PrintScreen = React.lazy(() => import('../screens/student/PrintScreen').then(m => ({ default: m.PrintScreen })));
const PrintersScreen = React.lazy(() => import('../screens/student/PrintersScreen').then(m => ({ default: m.PrintersScreen })));
const ProfileAndHistoryScreen = React.lazy(() => import('../screens/student/ProfileAndHistoryScreen').then(m => ({ default: m.ProfileAndHistoryScreen })));
const BuyPagesScreen = React.lazy(() => import('../screens/student/BuyPagesScreen').then(m => ({ default: m.BuyPagesScreen })));
const StudentSettingsScreen = React.lazy(() => import('../screens/student/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const StaffDashboardScreen = React.lazy(() => import('../screens/staff/DashboardScreen').then(m => ({ default: m.StaffDashboardScreen })));
const ManagePrintersScreen = React.lazy(() => import('../screens/staff/ManagePrintersScreen').then(m => ({ default: m.ManagePrintersScreen })));
const ManageStudentsScreen = React.lazy(() => import('../screens/staff/ManageStudentsScreen').then(m => ({ default: m.ManageStudentsScreen })));
const ReportsScreen = React.lazy(() => import('../screens/staff/ReportsScreen').then(m => ({ default: m.ReportsScreen })));
const SystemLogsScreen = React.lazy(() => import('../screens/staff/SystemLogsScreen').then(m => ({ default: m.SystemLogsScreen })));
const ConfigurationScreen = React.lazy(() => import('../screens/staff/ConfigurationScreen').then(m => ({ default: m.ConfigurationScreen })));
const StaffSettingsScreen = React.lazy(() => import('../screens/staff/SettingsScreen').then(m => ({ default: m.StaffSettingsScreen })));
const DevToolsScreen = React.lazy(() => import('../screens/common/DevToolsScreen').then(m => ({ default: m.DevToolsScreen })));

const ScreenLoader: React.FC = () => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
      <ActivityIndicator size="large" color={themeColors.primary} />
    </View>
  );
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Create tab navigators inside components to avoid duplicate registration
const getStudentTabs = () => createBottomTabNavigator<StudentTabParamList>();
const getStaffTabs = () => createBottomTabNavigator<StaffTabParamList>();

const StudentTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation('pages');
  const { isMockMode } = useMockModeStore();
  const themeColors = colors[theme];
  const StudentTabs = getStudentTabs();

  const getStudentTabIcon = useCallback((routeName: string, focused: boolean, color: string) => {
    const iconSize = 24;
    const strokeWidth = focused ? 2.5 : 2;
    const iconProps = { size: iconSize, color, strokeWidth };

    switch (routeName) {
      case 'StudentDashboard':
        return <Home {...iconProps} />;
      case 'StudentPrint':
        return <Printer {...iconProps} />;
      case 'StudentHistory':
        return <Clock {...iconProps} />;
      case 'StudentPrinters':
        return <Cpu {...iconProps} />;
      case 'StudentProfile':
        return <User {...iconProps} />;
      case 'StudentBuyPages':
        return <Wallet {...iconProps} />;
      case 'StudentSettings':
        return <Settings {...iconProps} />;
      case 'StudentRoleSwitcher':
        return <Repeat {...iconProps} />;
      default:
        return <Home {...iconProps} />;
    }
  }, []);

  const screenOptions = useMemo(
    () => ({
      tabBarActiveTintColor: themeColors.primary,
      tabBarInactiveTintColor: themeColors['muted-foreground'],
      tabBarStyle: {
        backgroundColor: themeColors.background,
        borderTopColor: themeColors.border,
        borderTopWidth: 1,
      },
      headerShown: false,
      tabBarHideOnKeyboard: true,
    }),
    [themeColors]
  );

  const RoleSwitcherScreen = React.lazy(() => import('../screens/common/RoleSwitcherScreen').then(m => ({ default: m.RoleSwitcherScreen })));

  return (
    <StudentTabs.Navigator screenOptions={screenOptions}>
      <StudentTabs.Screen
        name="StudentDashboard"
        options={{
          title: t('dashboard.student.navigation.dashboard'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentDashboard', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <StudentDashboardScreen />
          </Suspense>
        )}
      </StudentTabs.Screen>
      <StudentTabs.Screen
        name="StudentPrint"
        options={{
          title: t('dashboard.student.navigation.print'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentPrint', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <PrintScreen />
          </Suspense>
        )}
      </StudentTabs.Screen>
      <StudentTabs.Screen
        name="StudentPrinters"
        options={{
          title: t('dashboard.student.navigation.printers'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentPrinters', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <PrintersScreen />
          </Suspense>
        )}
      </StudentTabs.Screen>
      <StudentTabs.Screen
        name="StudentProfile"
        options={{
          title: t('dashboard.student.navigation.profile'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentProfile', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <ProfileAndHistoryScreen />
          </Suspense>
        )}
      </StudentTabs.Screen>
      <StudentTabs.Screen
        name="StudentBuyPages"
        options={{
          title: t('dashboard.student.navigation.buyPages'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentBuyPages', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <BuyPagesScreen />
          </Suspense>
        )}
      </StudentTabs.Screen>
      <StudentTabs.Screen
        name="StudentSettings"
        options={{
          title: t('dashboard.student.navigation.settings'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentSettings', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <StudentSettingsScreen />
          </Suspense>
        )}
      </StudentTabs.Screen>
      {isMockMode && (
        <StudentTabs.Screen
          name="StudentRoleSwitcher"
          options={{
            title: t('common.switchRole', 'Switch Role'),
            tabBarIcon: ({ focused, color }) =>
              getStudentTabIcon('StudentRoleSwitcher', focused, color),
          }}
        >
          {() => (
            <Suspense fallback={<ScreenLoader />}>
              <RoleSwitcherScreen />
            </Suspense>
          )}
        </StudentTabs.Screen>
      )}
    </StudentTabs.Navigator>
  );
};

const StaffTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation('pages');
  const { isMockMode } = useMockModeStore();
  const themeColors = colors[theme];
  const StaffTabs = getStaffTabs();

  const getStaffTabIcon = useCallback((routeName: string, focused: boolean, color: string) => {
    const iconSize = 24;
    const strokeWidth = focused ? 2.5 : 2;
    const iconProps = { size: iconSize, color, strokeWidth };

    switch (routeName) {
      case 'StaffDashboard':
        return <Home {...iconProps} />;
      case 'StaffManagePrinters':
        return <Printer {...iconProps} />;
      case 'StaffManageStudents':
        return <Users {...iconProps} />;
      case 'StaffReports':
        return <FileText {...iconProps} />;
      case 'StaffSystemLogs':
        return <List {...iconProps} />;
      case 'StaffConfiguration':
        return <Wrench {...iconProps} />;
      case 'StaffSettings':
        return <Settings {...iconProps} />;
      case 'StaffRoleSwitcher':
        return <Repeat {...iconProps} />;
      default:
        return <Home {...iconProps} />;
    }
  }, []);

  const screenOptions = useMemo(
    () => ({
      tabBarActiveTintColor: themeColors.primary,
      tabBarInactiveTintColor: themeColors['muted-foreground'],
      tabBarStyle: {
        backgroundColor: themeColors.background,
        borderTopColor: themeColors.border,
        borderTopWidth: 1,
      },
      headerShown: false,
      tabBarHideOnKeyboard: true,
    }),
    [themeColors]
  );

  const RoleSwitcherScreen = React.lazy(() => import('../screens/common/RoleSwitcherScreen').then(m => ({ default: m.RoleSwitcherScreen })));

  return (
    <StaffTabs.Navigator screenOptions={screenOptions}>
      <StaffTabs.Screen
        name="StaffDashboard"
        options={{
          title: t('dashboard.student.navigation.dashboard'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffDashboard', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <StaffDashboardScreen />
          </Suspense>
        )}
      </StaffTabs.Screen>
      <StaffTabs.Screen
        name="StaffManagePrinters"
        options={{
          title: t('dashboard.student.navigation.managePrinters'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffManagePrinters', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <ManagePrintersScreen />
          </Suspense>
        )}
      </StaffTabs.Screen>
      <StaffTabs.Screen
        name="StaffManageStudents"
        options={{
          title: t('dashboard.student.navigation.manageStudents'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffManageStudents', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <ManageStudentsScreen />
          </Suspense>
        )}
      </StaffTabs.Screen>
      <StaffTabs.Screen
        name="StaffReports"
        options={{
          title: t('dashboard.student.navigation.reports'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffReports', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <ReportsScreen />
          </Suspense>
        )}
      </StaffTabs.Screen>
      <StaffTabs.Screen
        name="StaffSystemLogs"
        options={{
          title: t('dashboard.student.navigation.systemLogs'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffSystemLogs', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <SystemLogsScreen />
          </Suspense>
        )}
      </StaffTabs.Screen>
      <StaffTabs.Screen
        name="StaffConfiguration"
        options={{
          title: t('dashboard.student.navigation.configuration'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffConfiguration', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <ConfigurationScreen />
          </Suspense>
        )}
      </StaffTabs.Screen>
      <StaffTabs.Screen
        name="StaffSettings"
        options={{
          title: t('dashboard.student.navigation.settings'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffSettings', focused, color),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <StaffSettingsScreen />
          </Suspense>
        )}
      </StaffTabs.Screen>
      {isMockMode && (
        <StaffTabs.Screen
          name="StaffRoleSwitcher"
          options={{
            title: t('common.switchRole', 'Switch Role'),
            tabBarIcon: ({ focused, color }) =>
              getStaffTabIcon('StaffRoleSwitcher', focused, color),
          }}
        >
          {() => (
            <Suspense fallback={<ScreenLoader />}>
              <RoleSwitcherScreen />
            </Suspense>
          )}
        </StaffTabs.Screen>
      )}
    </StaffTabs.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const { isMockMode } = useMockModeStore();

  useEffect(() => {
    if (navigationRef.isReady()) {
      const { apiClient } = require('../lib/api/client');
      apiClient.setNavigationRef(navigationRef);
    }
  }, []);

  if (!_hasHydrated) {
    return null; // Wait for store to hydrate from AsyncStorage
  }

  // Allow access if authenticated OR (in mock mode AND user exists)
  const canAccessApp = isAuthenticated || (isMockMode && user);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!canAccessApp ? (
          <>
            <Stack.Screen name="Login">
              {() => (
                <Suspense fallback={<ScreenLoader />}>
                  <LoginScreen />
                </Suspense>
              )}
            </Stack.Screen>
            <Stack.Screen name="ForgotPassword">
              {() => (
                <Suspense fallback={<ScreenLoader />}>
                  <ForgotPasswordScreen />
                </Suspense>
              )}
            </Stack.Screen>
            <Stack.Screen name="ResetPassword">
              {() => (
                <Suspense fallback={<ScreenLoader />}>
                  <ResetPasswordScreen />
                </Suspense>
              )}
            </Stack.Screen>
            <Stack.Screen name="DevTools">
              {() => (
                <Suspense fallback={<ScreenLoader />}>
                  <DevToolsScreen />
                </Suspense>
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            {user?.userType === 'staff' || (isMockMode && !user && !isAuthenticated) ? (
              <Stack.Screen name="StaffTabs" component={StaffTabNavigator} />
            ) : (
              <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
            )}
            <Stack.Screen name="DevTools">
              {() => (
                <Suspense fallback={<ScreenLoader />}>
                  <DevToolsScreen />
                </Suspense>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

