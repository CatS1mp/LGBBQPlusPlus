import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useLanguageStore } from '../../lib/stores/useLanguageStore';
import { useMockModeStore } from '../../lib/stores/useMockModeStore';
import { useAuthStore } from '../../lib/stores/useAuthStore';
import { locales } from '../../lib/i18n/config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from '../../navigation/AppNavigator';

export const StaffSettingsScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme, themeMode, setThemeMode } = useTheme();
  const { locale, setLocale } = useLanguageStore();
  const { isMockMode } = useMockModeStore();
  const { user, setUser } = useAuthStore();
  const navigation = useNavigation();
  const themeColors = colors[theme];
  const [notifications, setNotifications] = React.useState(true);
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [versionTapCount, setVersionTapCount] = React.useState(0);

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
                styles.headerTitle,
                { color: themeColors.foreground },
              ]}
            >
              {t('staff.settings.title')}
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {t('staff.settings.description')}
            </Text>
        </View>

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.appearance.title')}
                </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.appearance.theme')}
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('staff.settings.appearance.themeDescription')}
                </Text>
              </View>
            </View>
            <Select
              value={themeMode}
              onChange={(value: string) => setThemeMode(value as 'light' | 'dark' | 'system')}
              options={[
                { label: t('staff.settings.appearance.light'), value: 'light' },
                { label: t('staff.settings.appearance.dark'), value: 'dark' },
                { label: t('staff.settings.appearance.system'), value: 'system' },
              ]}
              placeholder="Select theme"
              style={styles.themeSelect}
            />
          </CardContent>
        </Card>

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.language.title')}
                </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.language.select')}
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('staff.settings.language.description')}
                </Text>
              </View>
            </View>
            <Select
              value={locale}
              onChange={(value: string) => setLocale(value as 'en' | 'vi')}
              options={locales.map(loc => ({
                label: loc === 'en' 
                  ? t('staff.settings.language.english')
                  : t('staff.settings.language.vietnamese'),
                value: loc,
              }))}
              placeholder={t('staff.settings.language.select')}
              style={styles.languageSelect}
            />
          </CardContent>
        </Card>

        {isMockMode && (
          <Card style={styles.settingsCard}>
            <CardHeader>
              <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.mockMode.title', 'Mock Mode')}
                </Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text
                    style={[
                      styles.settingDescription,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    {t('staff.settings.mockMode.description', 'Switch between Student and Staff views in mock mode')}
                  </Text>
                </View>
              </View>
              <Select
                value={user?.userType || 'staff'}
                onChange={(value: string) => {
                  if (user) {
                    setUser({
                      ...user,
                      userType: value as 'student' | 'staff',
                    });
                    // Navigate to force re-render
                    setTimeout(() => {
                      if (navigationRef.isReady()) {
                        navigationRef.reset({
                          index: 0,
                          routes: [{ name: value === 'staff' ? 'StaffTabs' : 'StudentTabs' }],
                        });
                      }
                    }, 100);
                  }
                }}
                options={[
                  { label: t('staff.settings.mockMode.student', 'Student'), value: 'student' },
                  { label: t('staff.settings.mockMode.staff', 'Staff'), value: 'staff' },
                ]}
                placeholder={t('staff.settings.mockMode.selectRole', 'Select Role')}
                style={styles.roleSelect}
              />
            </CardContent>
          </Card>
        )}

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.notifications.title')}
                </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.notifications.push')}
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('staff.settings.notifications.pushDescription')}
                </Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: themeColors.muted,
                  true: themeColors.primary,
                }}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text
                  style={[
                    styles.settingLabel,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.notifications.email')}
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('staff.settings.notifications.emailDescription')}
                </Text>
              </View>
              <Switch
                value={emailAlerts}
                onValueChange={setEmailAlerts}
                trackColor={{
                  false: themeColors.muted,
                  true: themeColors.primary,
                }}
              />
            </View>
          </CardContent>
        </Card>

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.account.title')}
                </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.9)',
                },
              ]}
            >
              <Text
                style={[
                  styles.settingLabel,
                  { color: themeColors.foreground },
                ]}
              >
                {t('staff.settings.account.changePassword')}
              </Text>
              <ChevronRight
                size={20}
                color={themeColors['muted-foreground']}
                strokeWidth={2}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.settingItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.9)',
                },
              ]}
            >
              <Text
                style={[
                  styles.settingLabel,
                  { color: themeColors.foreground },
                ]}
              >
                {t('staff.settings.account.editProfile')}
              </Text>
              <ChevronRight
                size={20}
                color={themeColors['muted-foreground']}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </CardContent>
        </Card>

        <Card style={styles.settingsCard}>
          <CardHeader>
            <CardTitle>
                <Text
                  style={[
                    styles.cardTitleText,
                    { color: themeColors.foreground },
                  ]}
                >
                  {t('staff.settings.about.title')}
                </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TouchableOpacity
              style={styles.aboutItem}
              onPress={() => {
                const newCount = versionTapCount + 1;
                setVersionTapCount(newCount);
                if (newCount >= 5) {
                  setVersionTapCount(0);
                  navigation.navigate('DevTools' as never);
                }
              }}
            >
              <Text
                style={[
                  styles.aboutLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('staff.settings.about.version')}
              </Text>
              <Text
                style={[
                  styles.aboutValue,
                  { color: themeColors.foreground },
                ]}
              >
                1.0.0
              </Text>
            </TouchableOpacity>
            <View style={styles.aboutItem}>
              <Text
                style={[
                  styles.aboutLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('staff.settings.about.build')}
              </Text>
              <Text
                style={[
                  styles.aboutValue,
                  { color: themeColors.foreground },
                ]}
              >
                2024.12.09
              </Text>
            </View>
          </CardContent>
        </Card>

        <Button
          title={t('staff.settings.logout')}
          onPress={async () => {
            const { logout } = useAuthStore.getState();
            const { setMockMode } = useMockModeStore.getState();
            const { clearProgress } = usePrintProgressStore.getState();
            
            // Clear print progress on logout
            await clearProgress();
            
            logout();
            setMockMode(false);
            setTimeout(() => {
              if (navigationRef.isReady()) {
                navigationRef.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }
            }, 100);
          }}
          variant="destructive"
          style={styles.logoutButton}
        />
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
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
  },
  settingsCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.fontSize.sm,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  aboutLabel: {
    fontSize: typography.fontSize.sm,
  },
  aboutValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: spacing.md,
  },
  themeSelect: {
    marginTop: spacing.sm,
  },
  languageSelect: {
    marginTop: spacing.sm,
  },
  roleSelect: {
    marginTop: spacing.sm,
  },
});
