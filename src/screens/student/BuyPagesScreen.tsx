import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  PaymentMethod,
} from '../../data/rechargeMoneyMock';
import { CountUp } from '../../components/ui/CountUp';
import { SummaryCard } from '../../components/ui/SummaryCard';
import { format } from 'date-fns';
import { useDeposits, useCreateDeposit } from '../../lib/api/services/deposits';
import { useBalanceHistory } from '../../lib/api/services/studentBalance';
import { useStudentBalance } from '../../lib/api/services/studentBalance';
import { validateDepositRequest } from '../../lib/utils/validation';
import { getErrorMessage } from '../../lib/utils/error';
import { Alert, ActivityIndicator } from 'react-native';
import type { DepositResponse } from '../../types/api';

export const BuyPagesScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState<'package' | 'custom' | null>(null);

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

  // Predefined packages
  const packages = [
    { amount: 50000, label: '50,000 ₫' },
    { amount: 100000, label: '100,000 ₫' },
    { amount: 200000, label: '200,000 ₫', popular: true },
    { amount: 500000, label: '500,000 ₫' },
    { amount: 1000000, label: '1,000,000 ₫' },
  ];

  const deposits = depositsData?.data?.data || [];
  const balanceHistory = balanceHistoryData?.data?.data || [];

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

  const handlePaymentConfirm = (method: PaymentMethod) => {
    if (!selectedAmount) return;

    const validation = validateDepositRequest({
      amount: selectedAmount,
      paymentMethod: method.id,
    });

    if (!validation.valid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    createDepositMutation.mutate(
      {
        amount: selectedAmount,
        paymentMethod: method.id,
      },
      {
        onSuccess: (response) => {
          if (response.data?.data) {
            Alert.alert(
              'Success',
              `Deposit created successfully!\nDeposit Code: ${response.data.data.depositCode}`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setShowPaymentModal(false);
                    setSelectedAmount(null);
                    setCustomAmount('');
                    setPurchaseType(null);
                  },
                },
              ]
            );
          }
        },
        onError: (err) => {
          const errorMsg = getErrorMessage(err);
          Alert.alert('Deposit Failed', errorMsg);
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
                <ActivityIndicator size="small" color={themeColors.primary} />
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

          <Text
            style={[
              styles.paymentMethodLabel,
              { color: themeColors.foreground },
            ]}
          >
            {t('student.buyPages.paymentMethodLabel')}
          </Text>

          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethodItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.9)',
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() => handlePaymentConfirm({ id: 'bank', name: 'Bank Transfer' } as PaymentMethod)}
            >
              <Text
                style={[
                  styles.paymentMethodText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.buyPages.paymentMethod.bank')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paymentMethodItem,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.9)',
                  borderColor: themeColors.border,
                },
              ]}
              onPress={() => handlePaymentConfirm({ id: 'momo', name: 'MoMo' } as PaymentMethod)}
            >
              <Text
                style={[
                  styles.paymentMethodText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.buyPages.paymentMethod.momo')}
              </Text>
            </TouchableOpacity>
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
  paymentMethodLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  paymentMethods: {
    gap: spacing.md,
  },
  paymentMethodItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  paymentMethodText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
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
});

