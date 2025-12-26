import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  systemConfigurationMockData,
  SystemConfigItem,
  ConfigurationCategory,
  categoryLabels,
} from '../../data/systemConfigurationMock';
import { format } from 'date-fns';

export const ConfigurationScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [selectedCategory, setSelectedCategory] = useState<
    ConfigurationCategory | 'all'
  >('all');
  const [selectedConfig, setSelectedConfig] = useState<SystemConfigItem | null>(
    null
  );
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredConfigs = useMemo(() => {
    if (selectedCategory === 'all') {
      return systemConfigurationMockData;
    }
    return systemConfigurationMockData.filter(
      config => config.category === selectedCategory
    );
  }, [selectedCategory]);

  const handleEdit = (config: SystemConfigItem) => {
    setSelectedConfig(config);
    setEditValue(config.configValue);
  };

  const handleSave = async () => {
    if (!selectedConfig) return;

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Saving config:', {
      configId: selectedConfig.configId,
      configKey: selectedConfig.configKey,
      configValue: editValue,
    });

    setIsSaving(false);
    setSelectedConfig(null);
    setEditValue('');
  };

  const renderConfigCard = ({ item }: { item: SystemConfigItem }) => {
    const displayValue =
      item.dataType === 'boolean'
        ? item.configValue === 'true'
          ? 'Bật'
          : 'Tắt'
        : item.configValue.length > 50
          ? `${item.configValue.substring(0, 50)}...`
          : item.configValue;

    return (
      <Card style={styles.configCard}>
        <CardHeader>
          <View style={styles.configHeader}>
            <View style={styles.configTitle}>
              <Text
                style={[
                  styles.configName,
                  { color: themeColors.foreground },
                ]}
              >
                {item.displayName}
              </Text>
              <Text
                style={[
                  styles.configDescription,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {item.description}
              </Text>
            </View>
            <Button
              title="✏️"
              onPress={() => handleEdit(item)}
              variant="ghost"
              size="sm"
              style={styles.editButton}
            />
          </View>
        </CardHeader>
        <CardContent>
          <View style={styles.configValueRow}>
            <Text
              style={[
                styles.configValue,
                { color: themeColors.foreground },
              ]}
            >
              {displayValue}
            </Text>
            {item.dataType === 'boolean' && (
              <Switch
                value={item.configValue === 'true'}
                onValueChange={() => {
                  handleEdit({
                    ...item,
                    configValue: item.configValue === 'true' ? 'false' : 'true',
                  });
                }}
                trackColor={{
                  false: themeColors.muted,
                  true: themeColors.primary,
                }}
              />
            )}
          </View>
          <Text
            style={[
              styles.configUpdated,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            Cập nhật: {format(new Date(item.updatedAt), 'dd/MM/yyyy HH:mm')} bởi{' '}
            {item.updatedByName}
          </Text>
        </CardContent>
      </Card>
    );
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
            Cấu hình hệ thống
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('staff.configuration.description')}
          </Text>
        </View>

        <Card style={styles.categoryCard}>
          <CardContent>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { label: t('staff.configuration.filterAllCategories'), value: 'all' },
                ...Object.entries(categoryLabels).map(([value, label]) => ({
                  label,
                  value,
                })),
              ]}
              placeholder={t('staff.configuration.filterCategory')}
            />
          </CardContent>
        </Card>

        <FlatList
          data={filteredConfigs}
          keyExtractor={item => item.configId}
          renderItem={renderConfigCard}
          scrollEnabled={false}
          contentContainerStyle={styles.configsList}
        />
      </ScrollView>

      <Modal
        isOpen={Boolean(selectedConfig)}
        onClose={() => {
          setSelectedConfig(null);
          setEditValue('');
        }}
        title="Chỉnh sửa cấu hình"
        size="md"
      >
        {selectedConfig && (
          <View style={styles.modalContent}>
            <Text
              style={[
                styles.modalTitle,
                { color: themeColors.foreground },
              ]}
            >
              {selectedConfig.displayName}
            </Text>
            <Text
              style={[
                styles.modalDescription,
                { color: themeColors['muted-foreground'] },
              ]}
            >
              {selectedConfig.description}
            </Text>

            {selectedConfig.dataType === 'boolean' ? (
              <View style={styles.booleanInput}>
                <Text
                  style={[
                    styles.modalLabel,
                    { color: themeColors.foreground },
                  ]}
                >
                  Giá trị
                </Text>
                <Switch
                  value={editValue === 'true'}
                  onValueChange={value => setEditValue(value ? 'true' : 'false')}
                  trackColor={{
                    false: themeColors.muted,
                    true: themeColors.primary,
                  }}
                />
                <Text
                  style={[
                    styles.switchLabel,
                    { color: themeColors.foreground },
                  ]}
                >
                  {editValue === 'true' ? 'Bật' : 'Tắt'}
                </Text>
              </View>
            ) : (
              <View style={styles.modalField}>
                <Text
                  style={[
                    styles.modalLabel,
                    { color: themeColors.foreground },
                  ]}
                >
                  Giá trị
                </Text>
                <Input
                  value={editValue}
                  onChangeText={setEditValue}
                  placeholder="Nhập giá trị"
                  keyboardType={
                    selectedConfig.dataType === 'number' ? 'numeric' : 'default'
                  }
                  style={styles.modalInput}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <Button
                title="Hủy"
                onPress={() => {
                  setSelectedConfig(null);
                  setEditValue('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title={isSaving ? t('staff.configuration.saving') : t('staff.configuration.save')}
                onPress={handleSave}
                disabled={isSaving || !editValue.trim()}
                style={styles.modalButton}
              />
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
  categoryCard: {
    marginBottom: spacing.lg,
  },
  configsList: {
    gap: spacing.md,
  },
  configCard: {
    marginBottom: spacing.md,
  },
  configHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  configTitle: {
    flex: 1,
  },
  configName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  configDescription: {
    fontSize: typography.fontSize.sm,
  },
  editButton: {
    marginLeft: spacing.md,
  },
  configValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  configValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    flex: 1,
  },
  configUpdated: {
    fontSize: typography.fontSize.xs,
  },
  modalContent: {
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: typography.fontSize.sm,
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
  booleanInput: {
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  switchLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
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
