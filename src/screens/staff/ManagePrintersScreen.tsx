import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { printerInfoList, PrinterInfoMock, PrinterStatus } from '../../data/printersInfoMock';

type TabType = 'printers' | 'brands' | 'models' | 'activity';

export const ManagePrintersScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [activeTab, setActiveTab] = useState<TabType>('printers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterInfoMock | null>(null);

  const filteredPrinters = printerInfoList.filter(printer => {
    const normalized = searchQuery.trim().toLowerCase();
    return (
      normalized.length === 0 ||
      printer.name.toLowerCase().includes(normalized) ||
      printer.brand.toLowerCase().includes(normalized) ||
      printer.model.toLowerCase().includes(normalized)
    );
  });

  const getStatusStyle = (status: PrinterStatus) => {
    switch (status) {
      case 'online':
        return {
          bg: theme === 'dark' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
          text: theme === 'dark' ? '#86efac' : '#16a34a',
        };
      case 'busy':
        return {
          bg: theme === 'dark' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
          text: theme === 'dark' ? '#fde047' : '#d97706',
        };
      case 'offline':
        return {
          bg: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
          text: theme === 'dark' ? '#fca5a5' : '#dc2626',
        };
      case 'maintenance':
        return {
          bg: theme === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          text: theme === 'dark' ? '#7dd3fc' : '#0284c7',
        };
    }
  };

  const getStatusLabel = (status: PrinterStatus) => {
    switch (status) {
      case 'busy':
        return 'Đang in';
      case 'online':
        return 'Sẵn sàng';
      case 'maintenance':
        return 'Bảo trì';
      case 'offline':
        return 'Offline';
    }
  };

  const tabs: { value: TabType; label: string }[] = [
    { value: 'printers', label: t('staff.managePrinters.tabs.printers') },
    { value: 'brands', label: t('staff.managePrinters.tabs.brands') },
    { value: 'models', label: t('staff.managePrinters.tabs.models') },
    { value: 'activity', label: t('staff.managePrinters.tabs.activity') },
  ];

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
            {t('staff.managePrinters.title')}
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('staff.managePrinters.description')}
          </Text>
        </View>

        <View style={styles.tabsContainer}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeTab === tab.value
                      ? themeColors.primary
                      : theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                  borderColor:
                    activeTab === tab.value
                      ? themeColors.primary
                      : themeColors.border,
                },
              ]}
              onPress={() => setActiveTab(tab.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === tab.value
                        ? themeColors['primary-foreground']
                        : themeColors.foreground,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'printers' && (
          <>
            <Card style={styles.searchCard}>
              <CardContent>
                <TextInput
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor:
                        theme === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(255, 255, 255, 1)',
                      borderColor: themeColors.border,
                      color: themeColors.foreground,
                    },
                  ]}
                  placeholder="Tìm kiếm máy in..."
                  placeholderTextColor={themeColors['muted-foreground']}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </CardContent>
            </Card>

            <Card style={styles.printersCard}>
              <CardHeader>
                <CardTitle>
                  <Text
                    style={[
                      styles.cardTitleText,
                      { color: themeColors.foreground },
                    ]}
                  >
                    {t('staff.managePrinters.listTitle', { count: filteredPrinters.length })}
                  </Text>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPrinters.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text
                      style={[
                        styles.emptyStateText,
                        { color: themeColors['muted-foreground'] },
                      ]}
                    >
                      {t('staff.managePrinters.noResults')}
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={filteredPrinters}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                      const statusStyle = getStatusStyle(item.status);
                      return (
                        <TouchableOpacity
                          style={[
                            styles.printerItem,
                            {
                              backgroundColor:
                                theme === 'dark'
                                  ? 'rgba(255, 255, 255, 0.05)'
                                  : 'rgba(255, 255, 255, 0.9)',
                              borderColor: themeColors.border,
                            },
                          ]}
                          onPress={() => setSelectedPrinter(item)}
                        >
                          <View style={styles.printerInfo}>
                            <Text
                              style={[
                                styles.printerName,
                                { color: themeColors.foreground },
                              ]}
                            >
                              {item.name}
                            </Text>
                            <Text
                              style={[
                                styles.printerModel,
                                { color: themeColors['muted-foreground'] },
                              ]}
                            >
                              {item.brand} {item.model}
                            </Text>
                            <Text
                              style={[
                                styles.printerLocation,
                                { color: themeColors['muted-foreground'] },
                              ]}
                            >
                              {item.building} • {item.room} • {item.floor}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: statusStyle.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusText,
                                { color: statusStyle.text },
                              ]}
                            >
                              {getStatusLabel(item.status)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    scrollEnabled={false}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'brands' && (
          <Card style={styles.infoCard}>
            <CardContent>
              <Text
                style={[
                  styles.infoText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('staff.managePrinters.comingSoon.brands')}
              </Text>
            </CardContent>
          </Card>
        )}

        {activeTab === 'models' && (
          <Card style={styles.infoCard}>
            <CardContent>
              <Text
                style={[
                  styles.infoText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('staff.managePrinters.comingSoon.models')}
              </Text>
            </CardContent>
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card style={styles.infoCard}>
            <CardContent>
              <Text
                style={[
                  styles.infoText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('staff.managePrinters.comingSoon.activity')}
              </Text>
            </CardContent>
          </Card>
        )}
      </ScrollView>

      <Modal
        isOpen={Boolean(selectedPrinter)}
        onClose={() => setSelectedPrinter(null)}
        title="Chi tiết máy in"
        size="lg"
      >
        {selectedPrinter && (
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalTitle,
                { color: themeColors.foreground },
              ]}
            >
              {selectedPrinter.name}
            </Text>
            <Text
              style={[
                styles.modalSubtitle,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {selectedPrinter.brand} {selectedPrinter.model}
            </Text>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: themeColors.foreground },
                ]}
              >
                {t('staff.managePrinters.modalInfo')}
              </Text>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Serial:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.serial}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  IP Address:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.ipAddress}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text
                  style={[
                    styles.modalInfoLabel,
                    { color: themeColors['muted-foreground'] },
                  ]}
                >
                  Vị trí:
                </Text>
                <Text
                  style={[
                    styles.modalInfoValue,
                    { color: themeColors.foreground },
                  ]}
                >
                  {selectedPrinter.building} • {selectedPrinter.room} •{' '}
                  {selectedPrinter.floor}
                </Text>
              </View>
            </View>
          </View>
        )}
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
  tabsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  searchCard: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    height: 44,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
  },
  printersCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  printerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  printerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  printerName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  printerModel: {
    fontSize: typography.fontSize.sm,
  },
  printerLocation: {
    fontSize: typography.fontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  emptyState: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    padding: spacing.md,
  },
  modalContent: {
    gap: spacing.lg,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: typography.fontSize.sm,
  },
  modalSection: {
    gap: spacing.sm,
  },
  modalSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalInfoLabel: {
    fontSize: typography.fontSize.sm,
  },
  modalInfoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
});
