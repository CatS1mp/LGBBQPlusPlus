import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { Button, Input } from '../../components/ui';
import { useResetPassword, useValidateResetToken } from '../../lib/api/services/auth';
import { colors, spacing } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../navigation/types';
import { Alert, ActivityIndicator } from 'react-native';

type ResetPasswordRouteProp = RouteProp<RootStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const route = useRoute<ResetPasswordRouteProp>();
  const token = route.params?.token || '';
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const resetPasswordMutation = useResetPassword();
  
  // Validate token when screen opens
  const { data: tokenValidation, isLoading: validatingToken, error: tokenError } = useValidateResetToken(token, !!token);

  useEffect(() => {
    if (!token) {
      setError(t('auth.resetPassword.missingToken') || 'Reset token is missing');
    } else if (tokenError) {
      setError(t('auth.resetPassword.invalidToken') || 'Invalid or expired token');
    }
  }, [token, tokenError, t]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return t('auth.resetPassword.passwordMinLength') || 'Password must be at least 8 characters';
    }
    if (!/(?=.*[a-z])/.test(pwd)) {
      return t('auth.resetPassword.passwordLowercase') || 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(pwd)) {
      return t('auth.resetPassword.passwordUppercase') || 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(pwd)) {
      return t('auth.resetPassword.passwordNumber') || 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&#])/.test(pwd)) {
      return t('auth.resetPassword.passwordSpecial') || 'Password must contain at least one special character (@$!%*?&#)';
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!token) {
      setError(t('auth.resetPassword.missingToken') || 'Reset token is missing');
      return;
    }
    if (!password || !confirmPassword) {
      setError(t('auth.resetPassword.fillAllFields') || 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.passwordsNotMatch') || 'Passwords do not match');
      return;
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setError('');

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: password,
      });
      Alert.alert(
        t('auth.resetPassword.successTitle') || 'Success',
        t('auth.resetPassword.successMessage') || 'Password reset successfully. Please login again.',
        [
          {
            text: t('auth.resetPassword.ok') || 'OK',
            onPress: () => navigation.navigate('Login' as never),
          },
        ]
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t('auth.resetPassword.error') || 'Failed to reset password';
      setError(errorMessage);
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
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                { color: themeColors.foreground },
              ]}
            >
              {t('auth.resetPassword.title') || 'Reset Password'}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {t('auth.resetPassword.description') || 'Enter your new password'}
            </Text>

            {validatingToken ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('auth.resetPassword.validatingToken') || 'Validating token...'}
                </Text>
              </View>
            ) : null}

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
              label={t('auth.resetPassword.newPasswordLabel') || 'New Password'}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.resetPassword.passwordPlaceholder') || '••••••••'}
              secureTextEntry
              autoCapitalize="none"
              editable={!validatingToken && !!tokenValidation?.data?.valid}
            />

            <Input
              label={t('auth.resetPassword.confirmPasswordLabel') || 'Confirm Password'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('auth.resetPassword.passwordPlaceholder') || '••••••••'}
              secureTextEntry
              autoCapitalize="none"
              editable={!validatingToken && !!tokenValidation?.data?.valid}
            />

            <Button
              title={resetPasswordMutation.isPending ? (t('auth.resetPassword.resetting') || 'Resetting...') : (t('auth.resetPassword.resetButton') || 'Reset Password')}
              onPress={handleSubmit}
              loading={resetPasswordMutation.isPending}
              disabled={validatingToken || !tokenValidation?.data?.valid}
              style={styles.submitButton}
            />

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft
                size={18}
                color={themeColors.primary}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.backText,
                  { color: themeColors.primary },
                ]}
              >
                {t('auth.resetPassword.backToLogin') || 'Back to Login'}
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
  submitButton: {
    marginTop: spacing.md,
  },
  backButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

