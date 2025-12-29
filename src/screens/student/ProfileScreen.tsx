import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { CountUp } from '../../components/ui/CountUp';
import { useNavigation } from '@react-navigation/native';
import { useStudentProfile, useUpdateStudentProfile, useChangePassword } from '../../lib/api/services/studentProfile';
import { useStudentBalance } from '../../lib/api/services/studentBalance';
import { getErrorMessage } from '../../lib/utils/error';
import { useMockModeStore } from '../../lib/stores/useMockModeStore';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { t: tCommon } = useTranslation('common');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const navigation = useNavigation();
  
  // API calls
  const { data: profileData, isLoading: loadingProfile, error: profileError } = useStudentProfile();
  const { data: balanceData, isLoading: loadingBalance, error: balanceError } = useStudentBalance();
  const updateProfileMutation = useUpdateStudentProfile();
  const changePasswordMutation = useChangePassword();
  const { isMockMode } = useMockModeStore();

  const profile = profileData?.data;
  const balance = balanceData?.data?.balanceAmount || 0;

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Initialize form when profile loads
  useEffect(() => {
    if (profile) {
      setEditForm({
        fullName: profile.fullName || '',
        phone: profile.phoneNumber || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!editForm.fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        fullName: editForm.fullName,
        phoneNumber: editForm.phone || undefined,
      });
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      setIsEditProfileOpen(false);
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error));
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      Alert.alert('Thành công', 'Đổi mật khẩu thành công');
      setIsChangePasswordOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      Alert.alert('Lỗi', getErrorMessage(error));
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
            {t('student.profile.title')}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('student.profile.description')}
          </Text>
        </View>

        <Card style={styles.profileCard}>
          <CardContent>
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: themeColors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: themeColors['primary-foreground'] },
                  ]}
                >
                  {profile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </Text>
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.profileName,
                  { color: themeColors.foreground },
                ]}
              >
                {profile?.fullName || 'Đang tải...'}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(56, 189, 248, 0.15)'
                        : 'rgba(56, 189, 248, 0.1)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color:
                        theme === 'dark' ? '#7dd3fc' : '#0284c7',
                    },
                  ]}
                >
                  {t('student.profile.badges.student')}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtonsContainer}>
              <View style={styles.actionButtons}>
                <Button
                  title={t('student.profile.editProfile')}
                  onPress={() => setIsEditProfileOpen(true)}
                  variant="outline"
                  style={styles.actionButton}
                />
                <Button
                  title={t('student.profile.changePassword')}
                  onPress={() => setIsChangePasswordOpen(true)}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.balanceCard}>
          <CardContent>
            <View style={styles.balanceHeader}>
              <Text
                style={[
                  styles.balanceLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.profile.balance.title')}
              </Text>
              <Button
                title={t('student.profile.balance.topUp')}
                onPress={() => {
                  navigation.navigate('StudentBuyPages' as never);
                }}
                size="sm"
                style={styles.topUpButton}
              />
            </View>
            <View style={styles.balanceAmount}>
              <Text
                style={[
                  styles.balanceValue,
                  { color: themeColors.foreground },
                ]}
              >
                <CountUp to={Math.floor(balance)} />
              </Text>
              <Text
                style={[
                  styles.balanceUnit,
                  { color: themeColors.foreground },
                ]}
              >
                ₫
              </Text>
            </View>
            <Text
              style={[
                styles.balanceSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {t('student.profile.balance.subtitle')}
            </Text>
          </CardContent>
        </Card>

        <Card style={styles.infoCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.profile.contactInfo.title')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.profile.contactInfo.email')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: themeColors.foreground },
                ]}
              >
                {profile?.email || '-'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.profile.contactInfo.phone')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: themeColors.foreground },
                ]}
              >
                {profile?.phoneNumber || '-'}
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card style={styles.infoCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.profile.academicDetails.title')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.profile.academicDetails.studentId')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: themeColors.foreground },
                ]}
              >
                {profile?.studentCode || '-'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.profile.academicDetails.faculty')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: themeColors.foreground },
                ]}
              >
                {profile?.facultyName || '-'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.profile.academicDetails.major')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: themeColors.foreground },
                ]}
              >
                {profile?.departmentName || profile?.majorName || '-'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.profile.academicDetails.classCode')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: themeColors.foreground },
                ]}
              >
                {profile?.classCode || profile?.className || '-'}
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>

      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title={t('student.profile.editProfileModal.title')}
        size="md"
      >
        <View style={styles.modalContent}>
          <View style={styles.modalField}>
            <Text
              style={[
                styles.modalLabel,
                { color: themeColors.foreground },
              ]}
            >
              {t('student.profile.editProfileModal.fullName')}
            </Text>
            <Input
              value={editForm.fullName}
              onChangeText={text => setEditForm({ ...editForm, fullName: text })}
              placeholder={t('student.profile.editProfileModal.fullNamePlaceholder')}
              style={styles.modalInput}
            />
          </View>
          <View style={styles.modalField}>
            <Text
              style={[
                styles.modalLabel,
                { color: themeColors.foreground },
              ]}
            >
              {t('student.profile.contactInfo.phone')}
            </Text>
            <Input
              value={editForm.phone}
              onChangeText={text => setEditForm({ ...editForm, phone: text })}
              placeholder={t('student.profile.editProfileModal.phonePlaceholder')}
              keyboardType="phone-pad"
              style={styles.modalInput}
            />
          </View>
          <View style={styles.modalActions}>
            <Button
              title={tCommon('cancel')}
              onPress={() => setIsEditProfileOpen(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={tCommon('save')}
              onPress={handleSaveProfile}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>

      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title={t('student.profile.changePasswordModal.title')}
        size="md"
      >
        <View style={styles.modalContent}>
          <View style={styles.modalField}>
            <Text
              style={[
                styles.modalLabel,
                { color: themeColors.foreground },
              ]}
            >
              {t('student.profile.changePasswordModal.currentPassword')}
            </Text>
            <Input
              value={passwordForm.currentPassword}
              onChangeText={text =>
                setPasswordForm({ ...passwordForm, currentPassword: text })
              }
              placeholder={t('student.profile.changePasswordModal.currentPasswordPlaceholder')}
              secureTextEntry
              style={styles.modalInput}
            />
          </View>
          <View style={styles.modalField}>
            <Text
              style={[
                styles.modalLabel,
                { color: themeColors.foreground },
              ]}
            >
              {t('student.profile.changePasswordModal.newPassword')}
            </Text>
            <Input
              value={passwordForm.newPassword}
              onChangeText={text =>
                setPasswordForm({ ...passwordForm, newPassword: text })
              }
              placeholder={t('student.profile.changePasswordModal.newPasswordPlaceholder')}
              secureTextEntry
              style={styles.modalInput}
            />
          </View>
          <View style={styles.modalField}>
            <Text
              style={[
                styles.modalLabel,
                { color: themeColors.foreground },
              ]}
            >
              {t('student.profile.changePasswordModal.confirmPassword')}
            </Text>
            <Input
              value={passwordForm.confirmPassword}
              onChangeText={text =>
                setPasswordForm({ ...passwordForm, confirmPassword: text })
              }
              placeholder={t('student.profile.changePasswordModal.confirmPasswordPlaceholder')}
              secureTextEntry
              style={styles.modalInput}
            />
          </View>
          <View style={styles.modalActions}>
            <Button
              title={tCommon('cancel')}
              onPress={() => setIsChangePasswordOpen(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={t('student.profile.changePasswordModal.submit')}
              onPress={handleChangePassword}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
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
  profileCard: {
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  profileName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 0,
  },
  balanceCard: {
    marginBottom: spacing.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topUpButton: {
    paddingHorizontal: spacing.md,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: 'bold',
  },
  balanceUnit: {
    fontSize: typography.fontSize.lg,
    marginLeft: spacing.xs,
  },
  balanceSubtitle: {
    fontSize: typography.fontSize.sm,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  modalContent: {
    gap: spacing.md,
  },
  modalField: {
    gap: spacing.xs,
  },
  modalLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  modalInput: {
    marginTop: spacing.xs,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    minWidth: 0,
  },
});
