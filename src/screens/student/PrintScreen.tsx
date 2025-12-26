import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import DocumentPicker from '@react-native-documents/picker';
import {
  useUploadedFiles,
  useUploadFile,
  useDeleteUploadedFile,
} from '../../lib/api/services/studentFiles';
import {
  useAvailablePrinters,
  usePrinterQueue,
} from '../../lib/api/services/studentPrinters';
import {
  usePageSizes,
  useColorModes,
} from '../../lib/api/services/config';
import {
  useCalculatePrintCost,
  useCreatePrintJob,
} from '../../lib/api/services/printJobs';
import { useStudentBalance } from '../../lib/api/services/studentBalance';
import type {
  UploadedFileResponse,
  AvailablePrinterResponse,
  PageSizeConfigResponse,
  ColorModeResponse,
  CalculateCostResponse,
} from '../../types/api';
import { validatePrintJobRequest, validateFileSize, validateFileType } from '../../lib/utils/validation';
import { getErrorMessage } from '../../lib/utils/error';

type PrintStep = 1 | 2 | 3 | 4;

interface PrintConfig {
  pageSizeId: string;
  colorModeId: string;
  pageOrientation: 'portrait' | 'landscape';
  printSide: 'one-sided' | 'double-sided';
  numberOfCopy: number;
}

export const PrintScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const [currentStep, setCurrentStep] = useState<PrintStep>(1);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileResponse | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<AvailablePrinterResponse | null>(null);
  const [config, setConfig] = useState<PrintConfig>({
    pageSizeId: '',
    colorModeId: '',
    pageOrientation: 'portrait',
    printSide: 'one-sided',
    numberOfCopy: 1,
  });
  const [error, setError] = useState<string | null>(null);
  const [costEstimate, setCostEstimate] = useState<CalculateCostResponse | null>(null);

  // API hooks
  const { data: uploadedFilesData, isLoading: loadingFiles } = useUploadedFiles({
    page: 0,
    limit: 10,
  });
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteUploadedFile();

  const { data: printersData, isLoading: loadingPrinters } = useAvailablePrinters({
    page: 0,
    limit: 50,
  });

  const { data: queueData } = usePrinterQueue(
    selectedPrinter?.printerId || '',
    !!selectedPrinter
  );

  const { data: pageSizesData } = usePageSizes(selectedPrinter?.printerId);
  const { data: colorModesData } = useColorModes();
  const calculateCostMutation = useCalculatePrintCost();
  const createJobMutation = useCreatePrintJob();
  const { data: balanceData } = useStudentBalance(
    costEstimate?.totalPrice
  );

  const steps = [
    { number: 1, label: t('student.print.steps.upload'), active: currentStep >= 1 },
    { number: 2, label: t('student.print.steps.choosePrinter'), active: currentStep >= 2 },
    { number: 3, label: t('student.print.steps.configuration'), active: currentStep >= 3 },
    { number: 4, label: t('student.print.steps.confirm'), active: currentStep >= 4 },
  ];

  // Computed values
  const uploadedFiles = useMemo(() => {
    return uploadedFilesData?.data?.data || [];
  }, [uploadedFilesData]);

  const printers = useMemo(() => {
    return printersData?.data?.data || [];
  }, [printersData]);

  const pageSizes = useMemo(() => {
    return pageSizesData?.data?.data || [];
  }, [pageSizesData]);

  const colorModes = useMemo(() => {
    return colorModesData?.data?.data || [];
  }, [colorModesData]);

  // Set default values when data loads
  useEffect(() => {
    if (pageSizes.length > 0 && !config.pageSizeId) {
      const defaultSize = pageSizes.find(s => s.isDefault) || pageSizes[0];
      setConfig(prev => ({ ...prev, pageSizeId: defaultSize.pageSizeId }));
    }
  }, [pageSizes, config.pageSizeId]);

  useEffect(() => {
    if (colorModes.length > 0 && !config.colorModeId) {
      const defaultMode = colorModes.find(m => m.colorModeName === 'grayscale') || colorModes[0];
      setConfig(prev => ({ ...prev, colorModeId: defaultMode.colorModeId }));
    }
  }, [colorModes, config.colorModeId]);

  // Calculate cost when config changes
  useEffect(() => {
    if (
      uploadedFile?.uploadedFileId &&
      selectedPrinter?.printerId &&
      config.pageSizeId &&
      config.colorModeId &&
      currentStep >= 3
    ) {
      calculateCostMutation.mutate(
        {
          uploadedFileId: uploadedFile.uploadedFileId,
          printerId: selectedPrinter.printerId,
          pageSizeId: config.pageSizeId,
          colorModeId: config.colorModeId,
          pageOrientation: config.pageOrientation,
          printSide: config.printSide,
          numberOfCopy: config.numberOfCopy,
        },
        {
          onSuccess: (response) => {
            if (response.data?.data) {
              setCostEstimate(response.data.data);
            }
          },
          onError: (err) => {
            setError(getErrorMessage(err));
          },
        }
      );
    }
  }, [
    uploadedFile?.uploadedFileId,
    selectedPrinter?.printerId,
    config,
    currentStep,
  ]);

  const handleFilePick = async () => {
    try {
      setError(null);
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.images,
        ],
      });
      if (result && result[0]) {
        const file = result[0];
        
        // Validate file size (50MB max)
        if (!validateFileSize(file.size || 0, 50)) {
          Alert.alert('Error', 'File size exceeds 50MB limit');
          return;
        }

        // Validate file type
        const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'bmp'];
        if (!validateFileType(file.name || 'file', allowedExtensions)) {
          Alert.alert('Error', 'File type not supported');
          return;
        }

        // Upload file
        uploadFileMutation.mutate(
          {
            uri: file.uri,
            type: file.type || 'application/pdf',
            name: file.name || 'document',
          },
          {
            onSuccess: (response) => {
              if (response.data?.data) {
                setUploadedFile(response.data.data);
                setError(null);
              }
            },
            onError: (err) => {
              const errorMsg = getErrorMessage(err);
              setError(errorMsg);
              Alert.alert('Upload Failed', errorMsg);
            },
          }
        );
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        console.error('Error picking file:', err);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as PrintStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as PrintStep);
    }
  };

  const handleConfirm = async () => {
    if (!uploadedFile || !selectedPrinter) {
      Alert.alert('Error', 'Please select a file and printer');
      return;
    }

    // Validate request
    const validation = validatePrintJobRequest({
      uploadedFileId: uploadedFile.uploadedFileId,
      printerId: selectedPrinter.printerId,
      pageSizeId: config.pageSizeId,
      colorModeId: config.colorModeId,
      numberOfCopy: config.numberOfCopy,
    });

    if (!validation.valid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    // Check balance
    if (costEstimate && balanceData?.data?.data) {
      if (balanceData.data.data.balanceAmount < costEstimate.totalPrice) {
        Alert.alert(
          'Insufficient Balance',
          `You need ${costEstimate.totalPrice.toLocaleString('vi-VN')} VND but only have ${balanceData.data.data.balanceAmount.toLocaleString('vi-VN')} VND`
        );
        return;
      }
    }

    // Create print job
    createJobMutation.mutate(
      {
        uploadedFileId: uploadedFile.uploadedFileId,
        printerId: selectedPrinter.printerId,
        pageSizeId: config.pageSizeId,
        colorModeId: config.colorModeId,
        pageOrientation: config.pageOrientation,
        printSide: config.printSide,
        numberOfCopy: config.numberOfCopy,
      },
      {
        onSuccess: (response) => {
          if (response.data?.data) {
            Alert.alert(
              'Success',
              `Print job created successfully!\nJob ID: ${response.data.data.jobId}\nRemaining Balance: ${response.data.data.remainingBalance.toLocaleString('vi-VN')} VND`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    setCurrentStep(1);
                    setUploadedFile(null);
                    setSelectedPrinter(null);
                    setConfig({
                      pageSizeId: '',
                      colorModeId: '',
                      pageOrientation: 'portrait',
                      printSide: 'one-sided',
                      numberOfCopy: 1,
                    });
                    setCostEstimate(null);
                    setError(null);
                  },
                },
              ]
            );
          }
        },
        onError: (err) => {
          const errorMsg = getErrorMessage(err);
          setError(errorMsg);
          Alert.alert('Print Job Failed', errorMsg);
        },
      }
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <View
            style={[
              styles.stepCircle,
              {
                backgroundColor: step.active
                  ? themeColors.primary
                  : themeColors.muted,
              },
            ]}
          >
            <Text
              style={[
                styles.stepNumber,
                {
                  color: step.active
                    ? themeColors['primary-foreground']
                    : themeColors['muted-foreground'],
                },
              ]}
            >
              {step.number}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.stepLine,
                {
                  backgroundColor: step.active
                    ? themeColors.primary
                    : themeColors.muted,
                },
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text
        style={[
          styles.stepTitle,
          { color: themeColors.foreground },
        ]}
      >
        {t('student.print.step1.title')}
      </Text>
      <Text
        style={[
          styles.stepDescription,
          { color: themeColors['muted-foreground'] },
        ]}
      >
        {t('student.print.step1.selectFile')}
      </Text>

      {uploadedFile ? (
        <View
          style={[
            styles.fileInfo,
            {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.9)',
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.fileName,
              { color: themeColors.foreground },
            ]}
          >
            {uploadedFile.file_name}
          </Text>
          <Text
            style={[
              styles.fileDetails,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {uploadedFile.file_size_kb} KB • {uploadedFile.file_type}
          </Text>
          <Button
            title={t('student.print.step1.changeFile')}
            onPress={handleFilePick}
            variant="outline"
            size="sm"
            style={styles.changeFileButton}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.uploadArea,
            {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.9)',
              borderColor: themeColors.border,
            },
          ]}
          onPress={handleFilePick}
        >
          <Text
            style={[
              styles.uploadText,
              { color: themeColors.foreground },
            ]}
          >
            {t('student.print.step1.dragDrop')}
          </Text>
          <Text
            style={[
              styles.uploadHint,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {t('student.print.step1.fileSizeLimit')}
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.stepActions}>
        <Button
          title={t('student.print.step1.next')}
          onPress={handleNext}
          disabled={!uploadedFile}
          style={styles.nextButton}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text
        style={[
          styles.stepTitle,
          { color: themeColors.foreground },
        ]}
      >
        {t('student.print.step2.choosePrinter')}
      </Text>
      <Text
        style={[
          styles.stepDescription,
          { color: themeColors['muted-foreground'] },
        ]}
      >
        {t('student.print.step2.selectPrinter')}
      </Text>

      {loadingPrinters ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors['muted-foreground'] }]}>
            Loading printers...
          </Text>
        </View>
      ) : printers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: themeColors['muted-foreground'] }]}>
            No printers available
          </Text>
        </View>
      ) : (
        <FlatList
          data={printers.filter(p => p.isEnabled && p.status === 'idle')}
          keyExtractor={item => item.printerId}
          renderItem={({ item }) => {
            const isSelected = selectedPrinter?.printerId === item.printerId;
            const queueInfo = isSelected && queueData?.data?.data;
            
            return (
              <TouchableOpacity
                style={[
                  styles.printerItem,
                  {
                    backgroundColor: isSelected
                      ? themeColors.primary
                      : theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(255, 255, 255, 0.9)',
                    borderColor: isSelected
                      ? themeColors.primary
                      : themeColors.border,
                  },
                ]}
                onPress={() => setSelectedPrinter(item)}
              >
                <View style={styles.printerInfo}>
                  <Text
                    style={[
                      styles.printerName,
                      {
                        color: isSelected
                          ? themeColors['primary-foreground']
                          : themeColors.foreground,
                      },
                    ]}
                  >
                    {item.brandName} {item.modelName}
                  </Text>
                  <Text
                    style={[
                      styles.printerLocation,
                      {
                        color: isSelected
                          ? themeColors['primary-foreground']
                          : themeColors['muted-foreground'],
                      },
                    ]}
                  >
                    {item.buildingCode} • {item.roomCode}
                  </Text>
                  {queueInfo && queueInfo.queueCount > 0 && (
                    <Text
                      style={[
                        styles.queueInfo,
                        {
                          color: isSelected
                            ? themeColors['primary-foreground']
                            : themeColors['muted-foreground'],
                        },
                      ]}
                    >
                      {queueInfo.queueCount} jobs ahead
                    </Text>
                  )}
                  <View style={styles.printerFeatures}>
                    {item.supportsColor && (
                      <View
                        style={[
                          styles.featureBadge,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(255, 255, 255, 0.2)'
                              : theme === 'dark'
                                ? 'rgba(59, 130, 246, 0.15)'
                                : 'rgba(59, 130, 246, 0.1)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.featureText,
                            {
                              color: isSelected
                                ? themeColors['primary-foreground']
                                : theme === 'dark'
                                  ? '#7dd3fc'
                                  : '#0284c7',
                            },
                          ]}
                        >
                          {t('student.printers.color')}
                        </Text>
                      </View>
                    )}
                    {item.supportsDuplex && (
                      <View
                        style={[
                          styles.featureBadge,
                          {
                            backgroundColor: isSelected
                              ? 'rgba(255, 255, 255, 0.2)'
                              : theme === 'dark'
                                ? 'rgba(34, 197, 94, 0.15)'
                                : 'rgba(34, 197, 94, 0.1)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.featureText,
                            {
                              color: isSelected
                                ? themeColors['primary-foreground']
                                : theme === 'dark'
                                  ? '#86efac'
                                  : '#16a34a',
                            },
                          ]}
                        >
                          {t('student.printers.twoSided')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          scrollEnabled={false}
        />
      )}

      <View style={styles.stepActions}>
        <Button
          title={t('student.print.step2.back')}
          onPress={handleBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title={t('student.print.step2.next')}
          onPress={handleNext}
          disabled={!selectedPrinter}
          style={styles.nextButton}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text
        style={[
          styles.stepTitle,
          { color: themeColors.foreground },
        ]}
      >
        Configuration
      </Text>
      <Text
        style={[
          styles.stepDescription,
          { color: themeColors['muted-foreground'] },
        ]}
      >
        Configure print settings
      </Text>

      <View style={styles.configSection}>
        <Text
          style={[
            styles.configLabel,
            { color: themeColors.foreground },
          ]}
        >
          {t('student.print.step3.paperSize')}
        </Text>
        <Select
          value={config.pageSizeId}
          onChange={value => setConfig({ ...config, pageSizeId: value })}
          options={pageSizes.map(size => ({
            label: size.sizeName,
            value: size.pageSizeId,
          }))}
          placeholder={t('student.print.step3.selectPaperSize')}
          style={styles.configInput}
        />
      </View>

      <View style={styles.configSection}>
        <Text
          style={[
            styles.configLabel,
            { color: themeColors.foreground },
          ]}
        >
          {t('student.print.step3.orientation')}
        </Text>
        <Select
          value={config.orientation}
          onChange={value =>
            setConfig({
              ...config,
              orientation: value as 'portrait' | 'landscape',
            })
          }
          options={[
            { label: t('student.print.step3.portrait'), value: 'portrait' },
            { label: t('student.print.step3.landscape'), value: 'landscape' },
          ]}
          placeholder={t('student.print.step3.selectOrientation')}
          style={styles.configInput}
        />
      </View>

      <View style={styles.configSection}>
        <Text
          style={[
            styles.configLabel,
            { color: themeColors.foreground },
          ]}
        >
          {t('student.print.step3.printSide')}
        </Text>
        <Select
          value={config.print_side}
          onChange={value =>
            setConfig({
              ...config,
              print_side: value as 'one-sided' | 'double-sided',
            })
          }
          options={[
            { label: t('student.print.step3.oneSided'), value: 'one-sided' },
            { label: t('student.print.step3.doubleSided'), value: 'double-sided' },
          ]}
          placeholder={t('student.print.step3.selectPrintSide')}
          style={styles.configInput}
        />
      </View>

      <View style={styles.configSection}>
        <Text
          style={[
            styles.configLabel,
            { color: themeColors.foreground },
          ]}
        >
          {t('student.print.step3.colorMode')}
        </Text>
        <Select
          value={config.colorModeId}
          onChange={value => setConfig({ ...config, colorModeId: value })}
          options={colorModes.map(mode => ({
            label: mode.description,
            value: mode.colorModeId,
          }))}
          placeholder={t('student.print.step3.selectColorMode')}
          style={styles.configInput}
        />
      </View>

      <View style={styles.configSection}>
        <Text
          style={[
            styles.configLabel,
            { color: themeColors.foreground },
          ]}
        >
          {t('student.print.step3.numberOfCopies')}
        </Text>
        <Input
          value={config.numberOfCopy.toString()}
          onChangeText={text => {
            const num = parseInt(text, 10);
            if (!isNaN(num) && num > 0 && num <= 99) {
              setConfig({ ...config, numberOfCopy: num });
            }
          }}
          keyboardType="numeric"
          placeholder="1"
          style={styles.configInput}
        />
      </View>

      <View style={styles.stepActions}>
        <Button
          title={t('student.print.step2.back')}
          onPress={handleBack}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title={t('student.print.step3.next')}
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </View>
  );

  const renderStep4 = () => {
    const currentCost = costEstimate?.totalPrice || 0;
    const isBalanceSufficient = balanceData?.data?.data?.isSufficient !== false;

    return (
      <View style={styles.stepContent}>
        <Text
          style={[
            styles.stepTitle,
            { color: themeColors.foreground },
          ]}
        >
          {t('student.print.step4.confirmTitle')}
        </Text>
        <Text
          style={[
            styles.stepDescription,
            { color: themeColors['muted-foreground'] },
          ]}
        >
          {t('student.print.step4.description')}
        </Text>

        <Card style={styles.confirmCard}>
          <CardContent>
            <View style={styles.confirmSection}>
              <Text
                style={[
                  styles.confirmLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.print.step4.fileInfo')}
              </Text>
              <Text
                style={[
                  styles.confirmValue,
                  { color: themeColors.foreground },
                ]}
              >
                {uploadedFile?.fileName}
              </Text>
              <Text
                style={[
                  styles.confirmSubValue,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {uploadedFile?.fileSizeKb} KB • {uploadedFile?.pageCount || 0} pages
              </Text>
            </View>

            <View style={styles.confirmSection}>
              <Text
                style={[
                  styles.confirmLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.print.step4.selectedPrinter')}
              </Text>
              <Text
                style={[
                  styles.confirmValue,
                  { color: themeColors.foreground },
                ]}
              >
                {selectedPrinter?.brandName} {selectedPrinter?.modelName}
              </Text>
              <Text
                style={[
                  styles.confirmSubValue,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {selectedPrinter?.buildingCode} • {selectedPrinter?.roomCode}
              </Text>
            </View>

            <View style={styles.confirmSection}>
              <Text
                style={[
                  styles.confirmLabel,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.print.step4.printConfig')}
              </Text>
              <Text
                style={[
                  styles.confirmValue,
                  { color: themeColors.foreground },
                ]}
              >
                {pageSizes.find(s => s.pageSizeId === config.pageSizeId)?.sizeName || 'N/A'} • {config.pageOrientation} •{' '}
                {config.printSide === 'one-sided' ? t('student.printers.oneSided') : t('student.printers.twoSided')} •{' '}
                {colorModes.find(m => m.colorModeId === config.colorModeId)?.description || 'N/A'}
              </Text>
              <Text
                style={[
                  styles.confirmSubValue,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {config.numberOfCopy} {t('student.print.step4.copies')}
              </Text>
            </View>

            <View
              style={[
                styles.costSection,
                {
                  backgroundColor:
                    theme === 'dark'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : 'rgba(34, 197, 94, 0.1)',
                },
              ]}
            >
              <Text
                style={[
                  styles.costLabel,
                  { color: themeColors.foreground },
                ]}
              >
                Estimated Cost
              </Text>
              <Text
                style={[
                  styles.costValue,
                  { color: theme === 'dark' ? '#86efac' : '#16a34a' },
                ]}
              >
                {currentCost.toLocaleString('vi-VN')} ₫
              </Text>
              {balanceData?.data?.data && (
                <Text
                  style={[
                    styles.balanceInfo,
                    {
                      color: isBalanceSufficient
                        ? theme === 'dark' ? '#86efac' : '#16a34a'
                        : theme === 'dark' ? '#fca5a5' : '#dc2626',
                    },
                  ]}
                >
                  Balance: {balanceData.data.data.balanceAmount.toLocaleString('vi-VN')} ₫
                  {!isBalanceSufficient && ' (Insufficient)'}
                </Text>
              )}
            </View>
          </CardContent>
        </Card>

        <View style={styles.stepActions}>
          <Button
            title={t('student.print.step2.back')}
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title={t('student.print.step4.confirm')}
            onPress={handleConfirm}
            disabled={createJobMutation.isPending || !isBalanceSufficient}
            style={styles.confirmButton}
          />
          {createJobMutation.isPending && (
            <ActivityIndicator
              size="small"
              color={themeColors.primary}
              style={styles.loadingIndicator}
            />
          )}
        </View>
      </View>
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
            In tài liệu
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            Tải file và gửi lệnh in ngay
          </Text>
        </View>

        {renderStepIndicator()}

        <Card style={styles.wizardCard}>
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </CardContent>
        </Card>

        <Card style={styles.uploadedFilesCard}>
          <CardHeader>
            <CardTitle>
              <Text
                style={[
                  styles.cardTitleText,
                  { color: themeColors.foreground },
                ]}
              >
                {t('student.print.uploadedFiles.title')}
              </Text>
            </CardTitle>
            <CardDescription>
              <Text
                style={[
                  styles.cardDescriptionText,
                  { color: themeColors['muted-foreground'] },
                ]}
              >
                {t('student.print.uploadedFiles.description')}
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingFiles ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={themeColors.primary} />
              </View>
            ) : uploadedFiles.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: themeColors['muted-foreground'] }]}>
                  No uploaded files
                </Text>
              </View>
            ) : (
              <FlatList
                data={uploadedFiles}
                keyExtractor={item => item.uploadedFileId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.uploadedFileItem,
                      {
                        backgroundColor:
                          theme === 'dark'
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(255, 255, 255, 0.9)',
                        borderColor: themeColors.border,
                      },
                    ]}
                    onPress={() => {
                      setUploadedFile(item);
                      setCurrentStep(2);
                    }}
                  >
                    <View style={styles.uploadedFileInfo}>
                      <Text
                        style={[
                          styles.uploadedFileName,
                          { color: themeColors.foreground },
                        ]}
                      >
                        {item.fileName}
                      </Text>
                      <Text
                        style={[
                          styles.uploadedFileDetails,
                          { color: themeColors['muted-foreground'] },
                        ]}
                      >
                        {item.fileSizeKb} KB • {item.pageCount || 0} {t('student.print.uploadedFiles.pages')} •{' '}
                        {item.printCount || 0} {t('student.print.uploadedFiles.prints')}
                      </Text>
                    </View>
                    <Button
                      title={t('student.print.uploadedFiles.use')}
                      onPress={() => {
                        setUploadedFile(item);
                        setCurrentStep(2);
                      }}
                      size="sm"
                      style={styles.useFileButton}
                    />
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            )}
          </CardContent>
        </Card>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: spacing.sm,
  },
  wizardCard: {
    marginBottom: spacing.lg,
  },
  stepContent: {
    gap: spacing.lg,
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  uploadText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  uploadHint: {
    fontSize: typography.fontSize.sm,
  },
  fileInfo: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  fileName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  fileDetails: {
    fontSize: typography.fontSize.sm,
  },
  changeFileButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  printerItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  printerInfo: {
    gap: spacing.xs,
  },
  printerName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  printerLocation: {
    fontSize: typography.fontSize.sm,
  },
  printerFeatures: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  featureBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  featureText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  configSection: {
    marginBottom: spacing.md,
  },
  configLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  configInput: {
    marginTop: spacing.xs,
  },
  confirmCard: {
    marginTop: spacing.md,
  },
  confirmSection: {
    marginBottom: spacing.md,
  },
  confirmLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  confirmValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
  },
  confirmSubValue: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  costSection: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  costLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  costValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
  },
  stepActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  uploadedFilesCard: {
    marginBottom: spacing.lg,
  },
  cardTitleText: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  cardDescriptionText: {
    fontSize: typography.fontSize.sm,
  },
  uploadedFileItem: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  uploadedFileInfo: {
    flex: 1,
  },
  uploadedFileName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  uploadedFileDetails: {
    fontSize: typography.fontSize.sm,
  },
  useFileButton: {
    marginLeft: spacing.md,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  loadingIndicator: {
    marginTop: spacing.sm,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
  },
  queueInfo: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  balanceInfo: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
});
