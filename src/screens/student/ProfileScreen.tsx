import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { studentProfilePageMock } from '../../data/studentProfilePageMock';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const navigation = useNavigation();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: studentProfilePageMock.fullName,
    phone: studentProfilePageMock.phone,
    dateOfBirth: studentProfilePageMock.dateOfBirth,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = () => {
    console.log('Saving profile:', editForm);
    setIsEditProfileOpen(false);
  };

  const handleChangePassword = () => {
    console.log('Changing password');
    setIsChangePasswordOpen(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
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
                  {studentProfilePageMock.avatarInitials}
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
                {studentProfilePageMock.fullName}
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
                  // Navigation handled by tab navigator
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
                <CountUp to={Math.floor(studentProfilePageMock.balance)} />
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
                {studentProfilePageMock.email}
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
                {studentProfilePageMock.phone}
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
                {studentProfilePageMock.studentId}
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
                {studentProfilePageMock.faculty}
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
                {studentProfilePageMock.major}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.profile.academicDetails.academicYear')}
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: themeColors.foreground },
                ]}
              >
                {studentProfilePageMock.academicYear}
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
          <View style={styles.modalField}>
            <Text
              style={[
                styles.modalLabel,
                { color: themeColors.foreground },
              ]}
            >
              {t('student.profile.contactInfo.dateOfBirth')}
            </Text>
            <Input
              value={editForm.dateOfBirth}
              onChangeText={text =>
                setEditForm({ ...editForm, dateOfBirth: text })
              }
              placeholder={t('student.profile.editProfileModal.dateOfBirthPlaceholder')}
              style={styles.modalInput}
            />
          </View>
          <View style={styles.modalActions}>
            <Button
              title={t('common.cancel')}
              onPress={() => setIsEditProfileOpen(false)}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title={t('common.save')}
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
              title={t('common.cancel')}
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
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.md,
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
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
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
  },
  modalButton: {
    flex: 1,
  },
});
