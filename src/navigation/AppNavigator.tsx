import React, { useMemo, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
} from 'lucide-react-native';
import { useAuthStore } from '../lib/stores/useAuthStore';
import { useTheme } from '../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme';
import {
  RootStackParamList,
  StudentTabParamList,
  StaffTabParamList,
} from './types';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';
import { StudentDashboardScreen } from '../screens/student/DashboardScreen';
import { PrintScreen } from '../screens/student/PrintScreen';
import { HistoryScreen } from '../screens/student/HistoryScreen';
import { PrintersScreen } from '../screens/student/PrintersScreen';
import { ProfileScreen } from '../screens/student/ProfileScreen';
import { BuyPagesScreen } from '../screens/student/BuyPagesScreen';
import { SettingsScreen as StudentSettingsScreen } from '../screens/student/SettingsScreen';
import { StaffDashboardScreen } from '../screens/staff/DashboardScreen';
import { ManagePrintersScreen } from '../screens/staff/ManagePrintersScreen';
import { ManageStudentsScreen } from '../screens/staff/ManageStudentsScreen';
import { ReportsScreen } from '../screens/staff/ReportsScreen';
import { SystemLogsScreen } from '../screens/staff/SystemLogsScreen';
import { ConfigurationScreen } from '../screens/staff/ConfigurationScreen';
import { SettingsScreen as StaffSettingsScreen } from '../screens/staff/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const StudentTabs = createBottomTabNavigator<StudentTabParamList>();
const StaffTabs = createBottomTabNavigator<StaffTabParamList>();

const StudentTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation('pages');
  const themeColors = colors[theme];

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

  return (
    <StudentTabs.Navigator screenOptions={screenOptions}>
      <StudentTabs.Screen
        name="StudentDashboard"
        component={StudentDashboardScreen}
        options={{
          title: t('dashboard.student.navigation.dashboard'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentDashboard', focused, color),
        }}
      />
      <StudentTabs.Screen
        name="StudentPrint"
        component={PrintScreen}
        options={{
          title: t('dashboard.student.navigation.print'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentPrint', focused, color),
        }}
      />
      <StudentTabs.Screen
        name="StudentHistory"
        component={HistoryScreen}
        options={{
          title: t('dashboard.student.navigation.history'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentHistory', focused, color),
        }}
      />
      <StudentTabs.Screen
        name="StudentPrinters"
        component={PrintersScreen}
        options={{
          title: t('dashboard.student.navigation.printers'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentPrinters', focused, color),
        }}
      />
      <StudentTabs.Screen
        name="StudentProfile"
        component={ProfileScreen}
        options={{
          title: t('dashboard.student.navigation.profile'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentProfile', focused, color),
        }}
      />
      <StudentTabs.Screen
        name="StudentBuyPages"
        component={BuyPagesScreen}
        options={{
          title: t('dashboard.student.navigation.buyPages'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentBuyPages', focused, color),
        }}
      />
      <StudentTabs.Screen
        name="StudentSettings"
        component={StudentSettingsScreen}
        options={{
          title: t('dashboard.student.navigation.settings'),
          tabBarIcon: ({ focused, color }) =>
            getStudentTabIcon('StudentSettings', focused, color),
        }}
      />
    </StudentTabs.Navigator>
  );
};

const StaffTabNavigator = () => {
  const { theme } = useTheme();
  const { t } = useTranslation('pages');
  const themeColors = colors[theme];

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

  return (
    <StaffTabs.Navigator screenOptions={screenOptions}>
      <StaffTabs.Screen
        name="StaffDashboard"
        component={StaffDashboardScreen}
        options={{
          title: t('dashboard.student.navigation.dashboard'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffDashboard', focused, color),
        }}
      />
      <StaffTabs.Screen
        name="StaffManagePrinters"
        component={ManagePrintersScreen}
        options={{
          title: t('dashboard.student.navigation.managePrinters'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffManagePrinters', focused, color),
        }}
      />
      <StaffTabs.Screen
        name="StaffManageStudents"
        component={ManageStudentsScreen}
        options={{
          title: t('dashboard.student.navigation.manageStudents'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffManageStudents', focused, color),
        }}
      />
      <StaffTabs.Screen
        name="StaffReports"
        component={ReportsScreen}
        options={{
          title: t('dashboard.student.navigation.reports'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffReports', focused, color),
        }}
      />
      <StaffTabs.Screen
        name="StaffSystemLogs"
        component={SystemLogsScreen}
        options={{
          title: t('dashboard.student.navigation.systemLogs'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffSystemLogs', focused, color),
        }}
      />
      <StaffTabs.Screen
        name="StaffConfiguration"
        component={ConfigurationScreen}
        options={{
          title: t('dashboard.student.navigation.configuration'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffConfiguration', focused, color),
        }}
      />
      <StaffTabs.Screen
        name="StaffSettings"
        component={StaffSettingsScreen}
        options={{
          title: t('dashboard.student.navigation.settings'),
          tabBarIcon: ({ focused, color }) =>
            getStaffTabIcon('StaffSettings', focused, color),
        }}
      />
    </StaffTabs.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return null; // Wait for store to hydrate from AsyncStorage
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
            />
          </>
        ) : user?.userType === 'staff' ? (
          <Stack.Screen name="StaffTabs" component={StaffTabNavigator} />
        ) : (
          <Stack.Screen name="StudentTabs" component={StudentTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

