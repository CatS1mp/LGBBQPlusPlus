import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useMockModeStore } from '../../lib/stores/useMockModeStore';
import { useStudentProfile } from '../../lib/api/services/studentProfile';
import { useStudentBalance } from '../../lib/api/services/studentBalance';
import { useNavigation } from '@react-navigation/native';

export const DevToolsScreen: React.FC = () => {
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const navigation = useNavigation();
  const { isMockMode, setMockMode, lastNetworkError } = useMockModeStore();
  
  const { data: profileData, isLoading: loadingProfile, error: profileError } = useStudentProfile();
  const { data: balanceData, isLoading: loadingBalance, error: balanceError } = useStudentBalance();

  const [searchText, setSearchText] = useState('');

  // Debug: Log API responses
  useEffect(() => {
    console.log('🔍 [DEV TOOLS] Profile Data:', JSON.stringify(profileData, null, 2));
    console.log('🔍 [DEV TOOLS] Balance Data:', JSON.stringify(balanceData, null, 2));
    console.log('🔍 [DEV TOOLS] Profile Error:', profileError);
    console.log('🔍 [DEV TOOLS] Balance Error:', balanceError);
    console.log('🔍 [DEV TOOLS] Is Mock Mode:', isMockMode);
  }, [profileData, balanceData, profileError, balanceError, isMockMode]);

  const formatJson = (obj: unknown): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

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
            🔧 Dev Tools
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            Debug information and tools
          </Text>
        </View>

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitle,
                  { color: themeColors.foreground },
                ]}
              >
                System Status
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: themeColors['muted-foreground'] }]}>
                Mock Mode:
              </Text>
              <View style={styles.statusValueContainer}>
                <Text style={[styles.statusValue, { color: isMockMode ? '#ef4444' : '#10b981' }]}>
                  {isMockMode ? 'ON' : 'OFF'}
                </Text>
                <Button
                  title={isMockMode ? 'Disable' : 'Enable'}
                  onPress={() => setMockMode(!isMockMode)}
                  size="sm"
                  variant="outline"
                  style={styles.toggleButton}
                />
              </View>
            </View>
            {lastNetworkError && (
              <View style={styles.errorSection}>
                <Text style={[styles.errorLabel, { color: '#ef4444' }]}>
                  Last Network Error:
                </Text>
                <Text style={[styles.errorText, { color: '#ef4444' }]}>
                  {lastNetworkError}
                </Text>
              </View>
            )}
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitle,
                  { color: themeColors.foreground },
                ]}
              >
                Profile API
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: themeColors['muted-foreground'] }]}>
                Loading:
              </Text>
              <Text style={[styles.statusValue, { color: themeColors.foreground }]}>
                {loadingProfile ? 'Yes' : 'No'}
              </Text>
            </View>
            {profileError && (
              <View style={styles.errorSection}>
                <Text style={[styles.errorLabel, { color: '#ef4444' }]}>
                  Error:
                </Text>
                <Text style={[styles.errorText, { color: '#ef4444' }]}>
                  {formatJson(profileError)}
                </Text>
              </View>
            )}
            <View style={styles.jsonSection}>
              <Text style={[styles.jsonLabel, { color: themeColors['muted-foreground'] }]}>
                Response:
              </Text>
              <TextInput
                style={[
                  styles.jsonInput,
                  {
                    color: themeColors.foreground,
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
                value={formatJson(profileData)}
                multiline
                editable={false}
                scrollEnabled
              />
            </View>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitle,
                  { color: themeColors.foreground },
                ]}
              >
                Balance API
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: themeColors['muted-foreground'] }]}>
                Loading:
              </Text>
              <Text style={[styles.statusValue, { color: themeColors.foreground }]}>
                {loadingBalance ? 'Yes' : 'No'}
              </Text>
            </View>
            {balanceError && (
              <View style={styles.errorSection}>
                <Text style={[styles.errorLabel, { color: '#ef4444' }]}>
                  Error:
                </Text>
                <Text style={[styles.errorText, { color: '#ef4444' }]}>
                  {formatJson(balanceError)}
                </Text>
              </View>
            )}
            <View style={styles.jsonSection}>
              <Text style={[styles.jsonLabel, { color: themeColors['muted-foreground'] }]}>
                Response:
              </Text>
              <TextInput
                style={[
                  styles.jsonInput,
                  {
                    color: themeColors.foreground,
                    backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  },
                ]}
                value={formatJson(balanceData)}
                multiline
                editable={false}
                scrollEnabled
              />
            </View>
          </CardContent>
        </Card>

        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.backButton}
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
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleButton: {
    paddingHorizontal: spacing.sm,
  },
  errorSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
  },
  jsonSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  jsonLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  jsonInput: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minHeight: 200,
    maxHeight: 400,
    textAlignVertical: 'top',
  },
  backButton: {
    marginTop: spacing.md,
  },
});

