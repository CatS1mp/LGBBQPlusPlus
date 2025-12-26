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
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '../../components/ui';
import { apiClient } from '../../lib/api/client';
import { API_ENDPOINTS } from '../../lib/constants';
import { colors, spacing } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';

export const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigation = useNavigation();
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const validateEmail = (value: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setSuccess(true);
      setResendTimer(60);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to send reset email';
      setError(errorMessage);
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
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                { color: themeColors.foreground },
              ]}
            >
              Forgot Password
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              Enter your email to receive a password reset link
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

            {success ? (
              <View style={styles.successContainer}>
                <Text
                  style={[
                    styles.successText,
                    { color: themeColors.primary },
                  ]}
                >
                  Reset link sent! Check your email.
                </Text>
              </View>
            ) : null}

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!success}
            />

            <Button
              title={loading ? 'Sending...' : 'Send Reset Link'}
              onPress={handleSubmit}
              loading={loading}
              disabled={success}
              style={styles.submitButton}
            />

            {success && (
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={resendTimer > 0 || loading}
                style={[
                  styles.resendButton,
                  resendTimer > 0 && styles.resendButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.resendText,
                    { color: themeColors.primary },
                  ]}
                >
                  {resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : 'Resend Email'}
                </Text>
              </TouchableOpacity>
            )}

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
                Back to Login
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
  successContainer: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: spacing.md,
  },
  resendButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
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
});

