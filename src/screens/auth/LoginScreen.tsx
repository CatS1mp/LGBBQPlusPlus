import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../lib/stores/useAuthStore';
import { apiClient } from '../../lib/api/client';
import { colors, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Globe } from 'lucide-react-native';
import { useLanguageStore } from '../../lib/stores/useLanguageStore';
import { useMockModeStore } from '../../lib/stores/useMockModeStore';
import { locales } from '../../lib/i18n/config';
import { useToastStore } from '../../lib/stores/useToastStore';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setToken } = useAuthStore();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { t } = useTranslation('pages');
  const { locale, setLocale } = useLanguageStore();
  const { isMockMode, setMockMode } = useMockModeStore();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const languageSelectorRef = useRef<View>(null);
  const { showToast } = useToastStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.login.fillAllFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        user: {
          userId: string;
          email: string;
          fullName: string;
          userType: string;
        };
      }>('/auth/login', {
        email,
        password,
      });

      if (response.data && response.data.accessToken && response.data.user) {
        const { accessToken, refreshToken, user } = response.data;

        setToken(accessToken);
        setUser({
          id: user.userId,
          email: user.email,
          name: user.fullName,
          userType: user.userType as 'student' | 'staff',
        });

        // Save refresh token to AsyncStorage for token refresh
        if (refreshToken) {
          await AsyncStorage.setItem('refresh-token', refreshToken);
        }

        // Show success toast
        showToast(t('auth.login.success', 'Đăng nhập thành công'), 'success');

        // Navigation will be handled by AppNavigator based on auth state
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t('auth.login.error');
      
      // Check if it's a network error or service unavailable (503) and enable mock mode
      const isNetworkError = 
        err instanceof Error && 
        (errorMessage.includes('Network error') || 
         errorMessage.includes('Cannot connect') ||
         errorMessage.includes('timeout') ||
         errorMessage.includes('ERR_NETWORK') ||
         errorMessage.includes('Service unavailable') ||
         errorMessage.includes('Database or server is down'));
      
      // Also check for 503 status in axios error
      const is503Error = 
        err && 
        typeof err === 'object' && 
        'response' in err && 
        (err as { response?: { status?: number } }).response?.status === 503;
      
      if (isNetworkError || is503Error) {
        // Enable mock mode
        setMockMode(true);
        
        // Set mock user based on email or default to student
        const mockUserType = email.includes('staff') || email.includes('admin') ? 'staff' : 'student';
        setUser({
          id: 'mock-user-id',
          email: email || 'mock@example.com',
          name: email ? email.split('@')[0] : 'Mock User',
          userType: mockUserType,
        });
        setToken('mock-token');
        
        console.warn(
          '⚠️ [MOCK MODE] Login failed due to network error. Entering app with mock user and mock data.'
        );
        
        // Don't show error, just proceed
        return;
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View
            ref={languageSelectorRef}
            style={styles.languageSelectorContainer}
          >
            <TouchableOpacity
              onPress={() => setShowLanguageSelector(!showLanguageSelector)}
              style={[
                styles.languageButton,
                { borderColor: themeColors.border },
              ]}
            >
              <Globe size={18} color={themeColors.foreground} />
              <Text
                style={[
                  styles.languageButtonText,
                  { color: themeColors.foreground },
                ]}
              >
                {locale === 'en' ? t('auth.language.english') : t('auth.language.vietnamese')}
              </Text>
            </TouchableOpacity>
            {showLanguageSelector && (
              <Pressable
                onPress={e => e.stopPropagation()}
                style={[
                  styles.languageDropdown,
                  { backgroundColor: themeColors.card, borderColor: themeColors.border },
                ]}
              >
                {locales.map(loc => (
                  <TouchableOpacity
                    key={loc}
                    onPress={() => {
                      setLocale(loc);
                      setShowLanguageSelector(false);
                    }}
                    style={[
                      styles.languageOption,
                      locale === loc && {
                        backgroundColor: themeColors.primary + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.languageOptionText,
                        { color: themeColors.foreground },
                        locale === loc && { color: themeColors.primary, fontWeight: '600' },
                      ]}
                    >
                      {loc === 'en' ? t('auth.language.english') : t('auth.language.vietnamese')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Pressable>
            )}
          </View>
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                { color: themeColors.foreground },
              ]}
            >
              {t('auth.login.title')}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {t('auth.login.subtitle')}
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Text
                  style={[
                    styles.errorText,
                    { color: themeColors.destructive },
                  ]}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            <Input
              label={t('auth.login.emailLabel')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.login.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label={t('auth.login.passwordLabel')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.login.passwordPlaceholder')}
              secureTextEntry
              autoCapitalize="none"
            />

            {isMockMode && (
              <View style={styles.mockModeBanner}>
                <Text
                  style={[
                    styles.mockModeText,
                    { color: themeColors.primary },
                  ]}
                >
                  ⚠️ Mock Mode: App is using mock data
                </Text>
              </View>
            )}
            <Button
              title={t('auth.login.loginButton')}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword' as never)}
              style={styles.forgotButton}
            >
              <Text
                style={[
                  styles.forgotText,
                  { color: themeColors.primary },
                ]}
              >
                {t('auth.login.forgotPassword')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: spacing.md,
  },
  forgotButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageSelectorContainer: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    minWidth: 150,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  languageOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  languageOptionText: {
    fontSize: 14,
  },
  mockModeBanner: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  mockModeText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

