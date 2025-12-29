import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useAuthStore } from '../../lib/stores/useAuthStore';
import { useMockModeStore } from '../../lib/stores/useMockModeStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { navigationRef } from '../../navigation/AppNavigator';
import { Users, GraduationCap } from 'lucide-react-native';

export const RoleSwitcherScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { user, setUser } = useAuthStore();
  const { isMockMode } = useMockModeStore();

  const handleSwitchRole = (role: 'student' | 'staff') => {
    const currentUser = user || {
      id: 'mock-user-id',
      email: 'mock@example.com',
      name: 'Mock User',
      userType: 'student' as const,
    };
    
    setUser({
      ...currentUser,
      userType: role,
    });
    
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: role === 'staff' ? 'StaffTabs' : 'StudentTabs' }],
      });
    }
  };

  if (!isMockMode) {
    return null;
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
      edges={['top']}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.title,
                  { color: themeColors.foreground },
                ]}
              >
                {t('switchRole', 'Switch Role')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text
              style={[
                styles.description,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {t('switchRoleDescription', 'Switch between Student and Staff views in mock mode')}
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => handleSwitchRole('student')}
                activeOpacity={0.7}
                style={[
                  styles.roleButton,
                  user?.userType === 'student' && styles.activeRoleButton,
                  {
                    backgroundColor: user?.userType === 'student' 
                      ? themeColors.primary 
                      : 'transparent',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <GraduationCap 
                  size={24} 
                  color={user?.userType === 'student' ? '#fff' : themeColors.foreground} 
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    {
                      color: user?.userType === 'student' ? '#fff' : themeColors.foreground,
                    },
                  ]}
                >
                  {t('studentRole', 'Student')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleSwitchRole('staff')}
                activeOpacity={0.7}
                style={[
                  styles.roleButton,
                  user?.userType === 'staff' && styles.activeRoleButton,
                  {
                    backgroundColor: user?.userType === 'staff' 
                      ? themeColors.primary 
                      : 'transparent',
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <Users 
                  size={24} 
                  color={user?.userType === 'staff' ? '#fff' : themeColors.foreground} 
                />
                <Text
                  style={[
                    styles.roleButtonText,
                    {
                      color: user?.userType === 'staff' ? '#fff' : themeColors.foreground,
                    },
                  ]}
                >
                  {t('staffRole', 'Staff')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.currentRole}>
              <Text
                style={[
                  styles.currentRoleLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('currentRole', 'Current Role')}:
              </Text>
              <Text
                style={[
                  styles.currentRoleValue,
                  { color: themeColors.foreground },
                ]}
              >
                {user?.userType === 'staff' 
                  ? t('staffRole', 'Staff')
                  : t('studentRole', 'Student')}
              </Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  card: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
  },
  description: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    minHeight: 60,
    minWidth: 200,
  },
  activeRoleButton: {
    opacity: 1,
  },
  roleButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  currentRole: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  currentRoleLabel: {
    fontSize: typography.fontSize.sm,
  },
  currentRoleValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
});

