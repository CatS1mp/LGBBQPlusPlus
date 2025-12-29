import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CountUp } from '../../components/ui/CountUp';
import { SummaryCard } from '../../components/ui/SummaryCard';
import { format } from 'date-fns';
import { useDeposits, useCreateDeposit, useDepositStatus } from '../../lib/api/services/deposits';
import { useQueryClient } from '@tanstack/react-query';
import { useBalanceHistory } from '../../lib/api/services/studentBalance';
import { useStudentBalance } from '../../lib/api/services/studentBalance';
import { getErrorMessage } from '../../lib/utils/error';
import { Alert } from 'react-native';
import { SkeletonCard } from '../../components/ui/Skeleton';
import type { DepositResponse } from '../../types/api';
import { useToastStore } from '../../lib/stores/useToastStore';

export const BuyPagesScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { t: tCommon } = useTranslation('common');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState<DepositResponse | null>(null);
  const [currentDepositId, setCurrentDepositId] = useState<string | null>(null);
  const [purchaseType, setPurchaseType] = useState<'package' | 'custom' | null>(null);
  const [hasShownSuccessAlert, setHasShownSuccessAlert] = useState(false);
  const [hasShownFailureAlert, setHasShownFailureAlert] = useState(false);

  // API hooks
  const { data: balanceData } = useStudentBalance();
  const { data: depositsData, isLoading: loadingDeposits } = useDeposits({
    page: 0,
    limit: 10,
  });
  const { data: balanceHistoryData } = useBalanceHistory({
    page: 0,
    limit: 10,
  });
  const createDepositMutation = useCreateDeposit();
  const queryClient = useQueryClient();
  const { showToast } = useToastStore();
  
  // Poll deposit status when QR modal is open
  const { data: depositStatusData } = useDepositStatus(
    currentDepositId,
    showQRModal && !!currentDepositId,
    3000 // Poll every 3 seconds
  );

  // Monitor deposit status changes
  useEffect(() => {
    if (!depositStatusData?.data?.data) return;
    
    const deposit = depositStatusData.data.data;
    const status = deposit.status || deposit.paymentStatus;
    
    if (status === 'completed' && !hasShownSuccessAlert) {
      setHasShownSuccessAlert(true);
      
      // Debug: Log webhook payment success
      console.log('🎉 [WEBHOOK] Payment Success Detected:', {
        depositId: deposit.depositId,
        depositCode: deposit.depositCode,
        amount: deposit.amount,
        status: status,
        paymentStatus: deposit.paymentStatus,
        timestamp: new Date().toISOString(),
        fullDepositData: deposit,
      });
      
      // Stop polling
      setCurrentDepositId(null);
      
      // Show success toast
      showToast(
        t('student.buyPages.paymentSuccessMessage', 'Giao dịch của bạn đã được xử lý thành công!'),
        'success'
      );
      
      // Close modal
      setShowQRModal(false);
      setQrData(null);
      setSelectedAmount(null);
      setCustomAmount('');
      setPurchaseType(null);
      
      // Reset alert flags
      setHasShownSuccessAlert(false);
      setHasShownFailureAlert(false);
      
      // Invalidate queries with delay to avoid network errors
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['student', 'balance'] });
        queryClient.invalidateQueries({ queryKey: ['student', 'deposits'] });
        createDepositMutation.reset();
      }, 500);
    } else if ((status === 'failed' || status === 'expired' || status === 'cancelled') && !hasShownFailureAlert) {
      setHasShownFailureAlert(true);
      
      // Show error toast
      const errorMessage =
        status === 'expired'
          ? t('student.buyPages.paymentExpired', 'Đơn nạp tiền đã hết hạn')
          : status === 'cancelled'
            ? t('student.buyPages.paymentCancelled', 'Đơn nạp tiền đã bị hủy')
            : t('student.buyPages.paymentFailedMessage', 'Giao dịch thất bại. Vui lòng thử lại.');
      
      showToast(errorMessage, 'error');
      
      // Close modal
      setShowQRModal(false);
      setQrData(null);
      setCurrentDepositId(null);
      setHasShownFailureAlert(false);
    }
  }, [depositStatusData?.data?.data, hasShownSuccessAlert, hasShownFailureAlert, queryClient, createDepositMutation, t, tCommon]);

  // Predefined packages
  const packages = [
    { amount: 50000, label: '50,000 ₫' },
    { amount: 100000, label: '100,000 ₫' },
    { amount: 200000, label: '200,000 ₫', popular: true },
    { amount: 500000, label: '500,000 ₫' },
    { amount: 1000000, label: '1,000,000 ₫' },
  ];

  // API returns ApiResponse<DepositHistoryResponse> where DepositHistoryResponse.data is PaginatedApiResponse
  // Structure: ApiResponse.data.data.data (array of deposits)
  const deposits = Array.isArray(depositsData?.data?.data?.data) 
    ? depositsData.data.data.data 
    : Array.isArray(depositsData?.data?.data)
    ? depositsData.data.data
    : [];
  const balanceHistory = Array.isArray(balanceHistoryData?.data?.data) 
    ? balanceHistoryData.data.data 
    : [];

  // Calculate summary from real data
  const summary = useMemo(() => {
    const completedDeposits = deposits.filter(
      d => d.paymentStatus === 'completed'
    );
    return {
      totalRecharges: completedDeposits.length,
      totalAmountRecharged: completedDeposits.reduce(
        (sum, d) => sum + (d.amount || 0),
        0
      ),
      totalBonusAmount: 0, // Bonus calculation if needed from API
    };
  }, [deposits]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handlePackageSelect = (amount: number) => {
    setSelectedAmount(amount);
    setPurchaseType('package');
    setShowPaymentModal(true);
  };

  const handleCustomRecharge = () => {
    const amount = parseInt(customAmount, 10);
    if (amount && amount >= 10000) {
      setSelectedAmount(amount);
      setPurchaseType('custom');
      setShowPaymentModal(true);
    } else {
      Alert.alert('Error', 'Minimum deposit amount is 10,000 VND');
    }
  };

  const handlePaymentConfirm = () => {
    if (!selectedAmount) return;

    if (selectedAmount < 10000) {
      Alert.alert('Error', 'Minimum deposit amount is 10,000 VND');
      return;
    }

    createDepositMutation.mutate(
      {
        amount: selectedAmount,
      },
      {
        onSuccess: (response) => {
          if (response.data?.data) {
            const depositData = response.data.data;
            setQrData(depositData);
            setCurrentDepositId(depositData.depositId);
            // Reset alert flags when creating new deposit
            setHasShownSuccessAlert(false);
            setHasShownFailureAlert(false);
            setShowPaymentModal(false);
            setShowQRModal(true);
          }
        },
        onError: (err) => {
          const errorMsg = getErrorMessage(err);
          showToast(errorMsg, 'error');
        },
      }
    );
  };

  const renderPackageCard = ({ item }: { item: typeof packages[0] }) => (
    <TouchableOpacity
      style={[
        styles.packageCard,
        {
          backgroundColor:
            theme === 'dark'
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.9)',
          borderColor: item.popular
            ? themeColors.primary
            : themeColors.border,
          borderWidth: item.popular ? 2 : 1,
        },
      ]}
      onPress={() => handlePackageSelect(item.amount)}
    >
      {item.popular && (
        <View
          style={[
            styles.packageBadge,
            {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(59, 130, 246, 0.15)'
                  : 'rgba(59, 130, 246, 0.1)',
            },
          ]}
        >
          <Text
            style={[
              styles.packageBadgeText,
              {
                color:
                  theme === 'dark'
                    ? '#7dd3fc'
                    : '#0284c7',
              },
            ]}
          >
            {t('student.buyPages.packageBadge.popular')}
          </Text>
        </View>
      )}

      <View style={styles.packageContent}>
        <Text
          style={[
            styles.packageName,
            { color: themeColors.foreground },
          ]}
        >
          {item.label}
        </Text>

        <View style={styles.packagePrice}>
          <Text
            style={[
              styles.packageAmount,
              { color: themeColors.foreground },
            ]}
          >
            {formatPrice(item.amount)}
          </Text>
        </View>

        <Button
          title={t('student.buyPages.selectPackage')}
          onPress={() => handlePackageSelect(item.amount)}
          style={styles.packageButton}
        />
      </View>
    </TouchableOpacity>
  );

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
            {t('student.buyPages.title')}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('student.buyPages.description')}
          </Text>
        </View>

        <SummaryCard
          items={[
            {
              label: t('student.buyPages.totalRecharges'),
              value: <CountUp to={summary.totalRecharges} />,
            },
            {
              label: t('student.buyPages.totalAmount'),
              value: formatPrice(summary.totalAmountRecharged),
            },
            {
              label: t('student.buyPages.totalBonus'),
              value: formatPrice(summary.totalBonusAmount),
            },
          ]}
        />

        <Card style={styles.packagesCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.buyPages.packagesTitle')}
              </Text>
            </CardTitle>
            <CardDescription>
              <Text
                style={[
                  styles.cardDescriptionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.buyPages.packagesDescription')}
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlatList
              data={packages}
              renderItem={renderPackageCard}
              keyExtractor={(item, index) => `package-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.packageRow}
            />
          </CardContent>
        </Card>

        <Card style={styles.customCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.buyPages.customTitle')}
              </Text>
            </CardTitle>
            <CardDescription>
              <Text
                style={[
                  styles.cardDescriptionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.buyPages.customDescription')}
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TextInput
              style={[
                styles.customInput,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 1)',
                  borderColor: themeColors.border,
                  color: themeColors.foreground,
                },
              ]}
              placeholder={t('student.buyPages.customPlaceholder')}
              placeholderTextColor={themeColors['muted-foreground']}
              value={customAmount}
              onChangeText={setCustomAmount}
              keyboardType="numeric"
            />
            <Button
              title={t('student.buyPages.customButton')}
              onPress={handleCustomRecharge}
              disabled={!customAmount || parseInt(customAmount, 10) < 10000}
              style={styles.customButton}
            />
          </CardContent>
        </Card>

        <Card style={styles.historyCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.buyPages.historyTitle')}
              </Text>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDeposits ? (
              <View style={styles.loadingContainer}>
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : deposits.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: themeColors['muted-foreground'] }]}>
                  {t('student.buyPages.noHistory')}
                </Text>
              </View>
            ) : (
              <FlatList
                data={deposits}
                keyExtractor={item => item.depositId}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.historyItem,
                      {
                        backgroundColor:
                          theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(255, 255, 255, 0.9)',
                        borderColor: themeColors.border,
                      },
                    ]}
                  >
                    <View style={styles.historyInfo}>
                      <Text
                        style={[
                          styles.historyTitle,
                          { color: themeColors.foreground },
                        ]}
                      >
                        {item.depositCode || t('student.buyPages.customRecharge')}
                      </Text>
                      <Text
                        style={[
                          styles.historyDetails,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        {format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')} •{' '}
                        {item.paymentMethod || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.historyAmount}>
                      <Text
                        style={[
                          styles.historyAmountValue,
                          { color: themeColors.foreground },
                        ]}
                      >
                        {formatPrice(item.amount || 0)}
                      </Text>
                      <View
                        style={[
                          styles.historyStatus,
                          {
                            backgroundColor:
                              item.paymentStatus === 'completed'
                                ? theme === 'dark'
                                  ? 'rgba(34, 197, 94, 0.15)'
                                  : 'rgba(34, 197, 94, 0.1)'
                                : theme === 'dark'
                                  ? 'rgba(251, 191, 36, 0.15)'
                                  : 'rgba(251, 191, 36, 0.1)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.historyStatusText,
                            {
                              color:
                                item.paymentStatus === 'completed'
                                  ? theme === 'dark'
                                    ? '#86efac'
                                    : '#16a34a'
                                  : theme === 'dark'
                                    ? '#fde047'
                                    : '#d97706',
                            },
                          ]}
                        >
                          {item.paymentStatus === 'completed'
                            ? t('student.buyPages.status.completed')
                            : item.paymentStatus === 'pending'
                              ? t('student.buyPages.status.pending')
                              : item.paymentStatus === 'failed'
                                ? t('student.buyPages.status.failed')
                                : t('student.buyPages.status.cancelled')}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                scrollEnabled={false}
              />
            )}
          </CardContent>
        </Card>
      </ScrollView>

      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={t('student.buyPages.paymentModalTitle')}
        size="md"
      >
        <View style={styles.modalContent}>
          <View
            style={[
              styles.paymentSummary,
              {
                backgroundColor:
                  theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(241, 245, 249, 0.8)',
              },
            ]}
          >
            <Text
              style={[
                styles.paymentLabel,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {t('student.buyPages.paymentAmount')}
            </Text>
            <Text
              style={[
                styles.paymentAmount,
                { color: themeColors.foreground },
              ]}
            >
              {selectedAmount ? formatPrice(selectedAmount) : formatPrice(0)}
            </Text>
            <Text
              style={[
                styles.paymentTotal,
                { color: themeColors.foreground },
              ]}
            >
              {t('student.buyPages.paymentTotal')}{' '}
              {selectedAmount ? formatPrice(selectedAmount) : formatPrice(0)}
            </Text>
          </View>

          <Button
            title={t('student.buyPages.confirmPayment', 'Xác nhận thanh toán')}
            onPress={handlePaymentConfirm}
            loading={createDepositMutation.isPending}
            style={styles.confirmPaymentButton}
          />
        </View>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setQrData(null);
          setCurrentDepositId(null);
          setSelectedAmount(null);
          setCustomAmount('');
          setPurchaseType(null);
        }}
        title={t('student.buyPages.qrModal.title', 'Thanh toán')}
        size="lg"
      >
        <View style={styles.qrModalContent}>
          {qrData?.qrUrl ? (
            <>
              <Text
                style={[
                  styles.qrModalTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.buyPages.qrModal.scanQR', 'Quét mã QR để thanh toán')}
              </Text>
              
              <View
                style={[
                  styles.qrImageContainer,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(241, 245, 249, 0.8)',
                  },
                ]}
              >
                <Image
                  source={{ uri: qrData.qrUrl }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>

              {qrData.transferContent && (
                <View
                  style={[
                    styles.transferInfo,
                    {
                      backgroundColor:
                        theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(241, 245, 249, 0.8)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.transferLabel,
                      { color: themeColors['muted-foreground'] },
                    ]}
                  >
                    {t('student.buyPages.qrModal.transferContent', 'Nội dung chuyển khoản')}:
                  </Text>
                  <Text
                    style={[
                      styles.transferContent,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {qrData.transferContent}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.amountInfo,
                  {
                    backgroundColor:
                      theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(241, 245, 249, 0.8)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.amountLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.buyPages.qrModal.amount', 'Số tiền')}:
                </Text>
                <Text
                  style={[
                    styles.amountValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {formatPrice(qrData.amount || 0)}
                </Text>
              </View>

              {qrData.expiredAt && (
                <Text
                  style={[
                    styles.expiryText,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  {t('student.buyPages.qrModal.expiresAt', 'Hết hạn vào')}:{' '}
                  {format(new Date(qrData.expiredAt), 'dd/MM/yyyy HH:mm')}
                </Text>
              )}

              {/* Deposit Status */}
              {depositStatusData?.data?.data && (
                <View
                  style={[
                    styles.statusContainer,
                    {
                      backgroundColor:
                        depositStatusData.data.data.status === 'completed'
                          ? theme === 'dark'
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(34, 197, 94, 0.1)'
                          : theme === 'dark'
                            ? 'rgba(251, 191, 36, 0.15)'
                            : 'rgba(251, 191, 36, 0.1)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          depositStatusData.data.data.status === 'completed'
                            ? theme === 'dark'
                              ? '#86efac'
                              : '#16a34a'
                            : theme === 'dark'
                              ? '#fde047'
                              : '#d97706',
                      },
                    ]}
                  >
                    {depositStatusData.data.data.status === 'completed'
                      ? t('student.buyPages.status.completed', 'Đã thanh toán')
                      : depositStatusData.data.data.status === 'pending'
                        ? t('student.buyPages.status.pending', 'Đang chờ thanh toán...')
                        : depositStatusData.data.data.status === 'expired'
                          ? t('student.buyPages.status.expired', 'Đã hết hạn')
                          : depositStatusData.data.data.status === 'cancelled'
                            ? t('student.buyPages.status.cancelled', 'Đã hủy')
                            : t('student.buyPages.status.failed', 'Thất bại')}
                  </Text>
                </View>
              )}

              <View style={styles.qrModalActions}>
                <Button
                  title={tCommon('cancel')}
                  onPress={() => {
                    setShowQRModal(false);
                    setQrData(null);
                    setCurrentDepositId(null);
                    setSelectedAmount(null);
                    setCustomAmount('');
                    setPurchaseType(null);
                  }}
                  variant="outline"
                  style={styles.qrModalButton}
                />
              </View>
            </>
          ) : (
            <View style={styles.qrErrorContainer}>
              <Text
                style={[
                  styles.qrErrorText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.buyPages.qrModal.noQR', 'Không có mã QR')}
              </Text>
              <Button
                title={tCommon('cancel')}
                onPress={() => {
                  setShowQRModal(false);
                  setQrData(null);
                }}
                variant="outline"
                style={styles.qrModalButton}
              />
            </View>
          )}
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
  packagesCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  cardDescriptionText: {
    fontSize: typography.fontSize.sm,
  },
  packageRow: {
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  packageCard: {
    width: 280,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    position: 'relative',
  },
  packageBadge: {
    position: 'absolute',
    top: -spacing.sm,
    left: '50%',
    transform: [{ translateX: -50 }],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    zIndex: 1,
  },
  packageBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  packageContent: {
    gap: spacing.sm,
  },
  packageName: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  packageDescription: {
    fontSize: typography.fontSize.xs,
  },
  packagePrice: {
    gap: spacing.xs,
  },
  packageAmount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
  },
  bonusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  bonusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  packageTotal: {
    fontSize: typography.fontSize.xs,
  },
  packageButton: {
    marginTop: spacing.sm,
  },
  customCard: {
    marginBottom: spacing.lg,
  },
  customInput: {
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
  },
  customButton: {
    marginTop: spacing.sm,
  },
  historyCard: {
    marginBottom: spacing.lg,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  historyDetails: {
    fontSize: typography.fontSize.sm,
  },
  historyAmount: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  historyAmountValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  historyStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  historyStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  modalContent: {
    gap: spacing.lg,
  },
  paymentSummary: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  paymentLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  paymentAmount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
  },
  paymentBonus: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  paymentTotal: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  confirmPaymentButton: {
    width: '100%',
    marginTop: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
  },
  qrModalContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  qrModalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  qrImageContainer: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  transferInfo: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  transferLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  transferContent: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  amountInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  expiryText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  qrModalActions: {
    width: '100%',
    marginTop: spacing.md,
  },
  qrModalButton: {
    width: '100%',
  },
  qrErrorContainer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  qrErrorText: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
  },
  statusContainer: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statusText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
});

