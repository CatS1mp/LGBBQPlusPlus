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
import { locales } from '../../lib/i18n/config';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme, themeMode, setThemeMode } = useTheme();
  const { locale, setLocale } = useLanguageStore();
  const themeColors = colors[theme];
  const [notifications, setNotifications] = React.useState(true);
  const [emailAlerts, setEmailAlerts] = React.useState(false);

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
              {t('student.settings.title')}
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {t('student.settings.description')}
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
                  {t('student.settings.appearance.title')}
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
                  {t('student.settings.appearance.description')}
                </Text>
              </View>
            </View>
            <Select
              value={themeMode}
              onChange={(value: string) => setThemeMode(value as 'light' | 'dark' | 'system')}
              options={[
                { label: t('student.settings.appearance.lightTitle'), value: 'light' },
                { label: t('student.settings.appearance.darkTitle'), value: 'dark' },
                { label: t('student.settings.appearance.systemTitle'), value: 'system' },
              ]}
              placeholder={t('student.printers.selectTheme')}
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
                {t('student.settings.language.title', 'Language')}
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
                  {t('student.settings.language.description', 'Choose your preferred language')}
                </Text>
              </View>
            </View>
            <Select
              value={locale}
              onChange={(value: string) => setLocale(value as 'en' | 'vi')}
              options={locales.map(loc => ({
                label: loc === 'en' 
                  ? t('student.settings.language.englishTitle')
                  : t('student.settings.language.vietnameseTitle'),
                value: loc,
              }))}
              placeholder={t('student.printers.selectLanguage')}
              style={styles.languageSelect}
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
                {t('student.settings.notifications.title')}
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
                  {t('student.settings.notifications.push')}
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.settings.notifications.pushDescription')}
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
                  {t('student.settings.notifications.email')}
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.settings.notifications.emailDescription')}
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
                {t('student.settings.account.title')}
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
                {t('student.settings.account.changePassword')}
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
                {t('student.settings.about.title')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.aboutItem}>
              <Text
                style={[
                  styles.aboutLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.settings.about.version')}
              </Text>
              <Text
                style={[
                  styles.aboutValue,
                  { color: themeColors.foreground },
                ]}
              >
                1.0.0
              </Text>
            </View>
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
  themeSelect: {
    marginTop: spacing.sm,
  },
  languageSelect: {
    marginTop: spacing.sm,
  },
});
