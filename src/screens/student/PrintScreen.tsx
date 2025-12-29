import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../lib/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { SkeletonCard } from '../../components/ui/Skeleton';
import * as DocumentPicker from '@react-native-documents/picker';
import {
  useUploadedFiles,
  useUploadFile,
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
  CalculateCostResponse,
} from '../../types/api';
import { validatePrintJobRequest, validateFileSize, validateFileType } from '../../lib/utils/validation';
import { getErrorMessage } from '../../lib/utils/error';
import { PrintScreenSkeleton } from '../../components/ui/PrintScreenSkeleton';
import { usePrintProgressStore } from '../../lib/stores/usePrintProgressStore';
import type { PrintConfig } from '../../lib/stores/usePrintProgressStore';
import { Pagination } from '../../components/ui/Pagination';
import { PrinterList } from './PrintScreen/PrinterList';
import { PrinterFilters } from './PrintScreen/PrinterFilters';
import { useDebounce } from '../../lib/hooks/useDebounce';
import { useToastStore } from '../../lib/stores/useToastStore';
import { ENV } from '../../config/env';

type PrintStep = 1 | 2 | 3 | 4;

export const PrintScreen: React.FC = () => {
  const { t } = useTranslation('pages');
  const { theme } = useTheme();
  const themeColors = colors[theme];
  const { saveProgress, loadProgress, clearProgress } = usePrintProgressStore();
  const { showToast } = useToastStore();
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
  const [_error, setError] = useState<string | null>(null);
  const [costEstimate, setCostEstimate] = useState<CalculateCostResponse | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  
  // Track last cost calculation params to avoid duplicate logs
  const lastCostParamsRef = useRef<string>('');
  
  // Printer filters and pagination (for step 2)
  const [printerPage, setPrinterPage] = useState(0);
  const [printerStatus, setPrinterStatus] = useState<'all' | 'online' | 'busy' | 'maintenance' | 'offline'>('all');
  const [printerBuilding, setPrinterBuilding] = useState<string>('all');
  const [printerKeyword, setPrinterKeyword] = useState('');
  const [printerOnlyAvailable, setPrinterOnlyAvailable] = useState(true);
  const [printerColorOnly, setPrinterColorOnly] = useState(false);
  const [printerDuplexOnly, setPrinterDuplexOnly] = useState(false);

  // Debounce keyword to avoid too many API calls
  const debouncedKeyword = useDebounce(printerKeyword, 500);

  // API hooks
  const { data: uploadedFilesData, isLoading: loadingFiles } = useUploadedFiles({
    page: 0,
    limit: 10,
  });
  const uploadFileMutation = useUploadFile();

  // Check if we need to fetch all data for accurate pagination
  const hasClientSideFilter = printerBuilding !== 'all' || printerOnlyAvailable;
  
  const { data: printersData, isLoading: loadingPrinters, isFetching: fetchingPrinters } = useAvailablePrinters({
    page: hasClientSideFilter ? 0 : printerPage,
    limit: hasClientSideFilter ? 1000 : 10, // Fetch all if client-side filter
    keyword: debouncedKeyword || undefined,
    status: printerStatus !== 'all' ? printerStatus : undefined,
    supportsColor: printerColorOnly || undefined,
    supportsDuplex: printerDuplexOnly || undefined,
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
    // Response structure: ApiResponse<{ stats, data, pagination }>
    // printersData.data.data.data is the array of printers
    let result = printersData?.data?.data?.data || [];
    
    // Client-side filtering for building and onlyAvailable
    if (printerBuilding !== 'all') {
      result = result.filter(p => p.buildingCode === printerBuilding);
    }
    
    if (printerOnlyAvailable) {
      result = result.filter(p => 
        p.status !== 'offline' && p.status !== 'maintenance'
      );
    }
    
    // Apply pagination if client-side filter is active
    if (hasClientSideFilter) {
      const limit = 10;
      const start = printerPage * limit;
      const end = start + limit;
      return result.slice(start, end);
    }
    
    return result;
  }, [printersData, printerBuilding, printerOnlyAvailable, hasClientSideFilter, printerPage]);
  
  // Response structure: ApiResponse<{ stats, data, pagination }>
  // pagination is inside printersData.data.data.pagination
  const apiPagination = printersData?.data?.data?.pagination;
  
  // Calculate pagination based on filtered results
  const printerPagination = useMemo(() => {
    if (!hasClientSideFilter) {
      // No client-side filter, use API pagination
      return apiPagination;
    }

    // Has client-side filter, calculate based on all filtered results
    const allPrinters = printersData?.data?.data?.data || [];
    const allFiltered = allPrinters.filter(p => {
      if (printerBuilding !== 'all' && p.buildingCode !== printerBuilding) return false;
      if (printerOnlyAvailable && (p.status === 'offline' || p.status === 'maintenance')) return false;
      return true;
    });
    
    const limit = 10;
    const totalItems = allFiltered.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    return {
      page: printerPage,
      limit: limit,
      totalItems: totalItems,
      totalPages: totalPages,
      first: printerPage === 0,
      last: printerPage >= totalPages - 1,
    };
  }, [printersData, printerBuilding, printerOnlyAvailable, hasClientSideFilter, printerPage, apiPagination]);
  const printerBuildingOptions = useMemo(() => {
    const allPrinters = printersData?.data?.data?.data || [];
    const values = Array.from(new Set(allPrinters.map(p => p.buildingCode)));
    return values.sort();
  }, [printersData]);

  const pageSizes = useMemo(() => {
    return pageSizesData?.data?.data || [];
  }, [pageSizesData]);

  const colorModes = useMemo(() => {
    return colorModesData?.data?.data || [];
  }, [colorModesData]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleStatusChange = useCallback((value: string) => {
    setPrinterStatus(value as typeof printerStatus);
  }, []);

  const handleOnlyAvailableToggle = useCallback(() => {
    setPrinterOnlyAvailable(prev => !prev);
  }, []);

  const handleColorOnlyToggle = useCallback(() => {
    setPrinterColorOnly(prev => !prev);
  }, []);

  const handleDuplexOnlyToggle = useCallback(() => {
    setPrinterDuplexOnly(prev => !prev);
  }, []);

  const handleSelectPrinter = useCallback((printer: AvailablePrinterResponse) => {
    setSelectedPrinter(printer);
  }, []);

  // Reset page to 0 when filters change
  useEffect(() => {
    setPrinterPage(0);
  }, [printerStatus, debouncedKeyword, printerColorOnly, printerDuplexOnly, printerBuilding, printerOnlyAvailable]);

  const handlePageChange = useCallback((newPage: number) => {
    setPrinterPage(newPage);
  }, []);

  // Restore progress on mount
  useEffect(() => {
    const restoreProgress = async () => {
      if (isRestored) return;
      try {
        const savedProgress = await loadProgress();
        if (savedProgress) {
          setCurrentStep(savedProgress.currentStep as PrintStep);
          setUploadedFile(savedProgress.uploadedFile);
          setSelectedPrinter(savedProgress.selectedPrinter);
          setConfig(savedProgress.config);
        }
      } catch (error) {
        console.error('Error restoring print progress:', error);
      } finally {
        setIsRestored(true);
      }
    };
    restoreProgress();
  }, [loadProgress, isRestored]);

  // Save progress whenever state changes
  useEffect(() => {
    if (!isRestored) return; // Don't save during initial restore
    saveProgress(currentStep, uploadedFile, selectedPrinter, config).catch(
      error => console.error('Error saving print progress:', error)
    );
  }, [currentStep, uploadedFile, selectedPrinter, config, saveProgress, isRestored]);

  // Set default values when data loads
  useEffect(() => {
    if (pageSizes.length === 0) return;

    const exists = pageSizes.some(s => s.pageSizeId === config.pageSizeId);
    if (!config.pageSizeId || !exists) {
      const defaultSize = pageSizes.find(s => s.isDefault) || pageSizes[0];
      setConfig(prev => ({ ...prev, pageSizeId: defaultSize.pageSizeId }));
    }
  }, [pageSizes, config.pageSizeId]);

  useEffect(() => {
    if (colorModes.length === 0) return;

    const exists = colorModes.some(m => m.colorModeId === config.colorModeId);
    if (!config.colorModeId || !exists) {
      const defaultMode = colorModes.find(m => m.colorModeName === 'grayscale') || colorModes[0];
      setConfig(prev => ({ ...prev, colorModeId: defaultMode.colorModeId }));
    }
  }, [colorModes, config.colorModeId]);

  useEffect(() => {
    // Reset dependent selections when printer changes to avoid stale page sizes
    setConfig(prev => ({ ...prev, pageSizeId: '' }));
    setCostEstimate(null);
  }, [selectedPrinter?.printerId]);

  // Calculate cost when config changes
  useEffect(() => {
    if (
      !uploadedFile?.uploadedFileId ||
      !selectedPrinter?.printerId ||
      !config.pageSizeId ||
      !config.colorModeId ||
      currentStep < 3
    ) {
      lastCostParamsRef.current = '';
      return;
    }

    const selectedPageSize = pageSizes.find(s => s.pageSizeId === config.pageSizeId);
    const selectedColorMode = colorModes.find(m => m.colorModeId === config.colorModeId);

    const validationErrors: string[] = [];
    if (!uploadedFile.uploadedFileId.trim()) {
      validationErrors.push('uploadedFileId is empty');
    }
    if (!selectedPrinter.printerId.trim()) {
      validationErrors.push('printerId is empty');
    }
    if (!selectedPageSize) {
      validationErrors.push(`pageSizeId not found: ${config.pageSizeId}`);
    }
    if (!selectedColorMode) {
      validationErrors.push(`colorModeId not found: ${config.colorModeId}`);
    }
    if (!config.pageOrientation || !['portrait', 'landscape'].includes(config.pageOrientation)) {
      validationErrors.push(`pageOrientation is invalid: ${config.pageOrientation}`);
    }
    if (!config.printSide || !['one-sided', 'double-sided'].includes(config.printSide)) {
      validationErrors.push(`printSide is invalid: ${config.printSide}`);
    }
    if (!config.numberOfCopy || config.numberOfCopy < 1) {
      validationErrors.push(`numberOfCopy is invalid: ${config.numberOfCopy}`);
    }

    if (validationErrors.length > 0) {
      console.error('❌ Validation Errors:');
      validationErrors.forEach(err => console.error('  -', err));
      setError(validationErrors.join('; '));
      setCostEstimate(null);
      lastCostParamsRef.current = '';
      return;
    }

    const mapColorModeName = (colorModeName: string): string => {
      if (colorModeName === 'black-white') {
        return 'black-white';
      }
      if(colorModeName === 'grayscale')
      { return 'grayscale'; } 
      if (colorModeName === 'color') {
        return 'color';
      }
      return colorModeName; // fallback
    };

    const costParams = {
      uploadedFileId: uploadedFile.uploadedFileId,
      printerId: selectedPrinter.printerId,
      pageSizeName: selectedPageSize?.sizeName || '',
      colorModeName: selectedColorMode ? mapColorModeName(selectedColorMode.colorModeName) : '',
      pageOrientation: config.pageOrientation,
      printSide: config.printSide,
      numberOfCopy: config.numberOfCopy,
    };

    const paramsKey = JSON.stringify(costParams);
    if (lastCostParamsRef.current === paramsKey) {
      return;
    }

    lastCostParamsRef.current = paramsKey;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💰 [COST] Calculating cost (ONCE)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 API Info:');
    console.log('  Endpoint: POST /students/print-jobs/calculate-cost');
    console.log('  Full URL:', ENV.NEXT_PUBLIC_API_URL + '/students/print-jobs/calculate-cost');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 Request Params:');
    console.log('  uploadedFileId:', costParams.uploadedFileId, `(${costParams.uploadedFileId?.length} chars)`);
    console.log('  printerId:', costParams.printerId, `(${costParams.printerId?.length} chars)`);
    console.log('  pageSizeName:', costParams.pageSizeName, `(from pageSizeId: ${config.pageSizeId})`);
    console.log('  colorModeName:', costParams.colorModeName, `(from colorModeId: ${config.colorModeId}, original: ${selectedColorMode?.colorModeName})`);
    console.log('  pageOrientation:', costParams.pageOrientation);
    console.log('  printSide:', costParams.printSide);
    console.log('  numberOfCopy:', costParams.numberOfCopy, `(type: ${typeof costParams.numberOfCopy})`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 Request Body (JSON):');
    console.log(JSON.stringify(costParams, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 File Info:');
    console.log('  fileName:', uploadedFile?.fileName);
    console.log('  pageCount:', uploadedFile?.pageCount, `(type: ${typeof uploadedFile?.pageCount})`);
    console.log('  fileSizeKb:', uploadedFile?.fileSizeKb, `(type: ${typeof uploadedFile?.fileSizeKb})`);
    console.log('  uploadedFileId:', uploadedFile?.uploadedFileId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 Mapping Info:');
    console.log('  Selected PageSize:', selectedPageSize ? `${selectedPageSize.sizeName} (${selectedPageSize.pageSizeId})` : 'NOT FOUND');
    console.log('  Selected ColorMode:', selectedColorMode ? `${selectedColorMode.colorModeName} → ${costParams.colorModeName} (${selectedColorMode.colorModeId})` : 'NOT FOUND');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⏳ [COST] Sending request...');

    calculateCostMutation.mutate(
      costParams,
      {
        onSuccess: (response) => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('✅ [COST] API Response SUCCESS');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📥 Full Response Object:');
          console.log(JSON.stringify(response, null, 2));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📥 Response Data (response.data):');
          console.log(JSON.stringify(response.data, null, 2));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          if (response.data?.data) {
            const costData = response.data.data;
            console.log('📊 Cost Calculation Result:');
            console.log('  Total Pages:', costData.totalPages);
            console.log('  Estimated Pages:', costData.estimatedPages);
            console.log('  Base Price Per Page:', costData.basePricePerPage, 'VND');
            console.log('  Color Mode Price Per Page:', costData.colorModePricePerPage, 'VND');
            console.log('  Subtotal Before Discount:', costData.subtotalBeforeDiscount, 'VND');
            if (costData.discountPercentage !== undefined && costData.discountPercentage !== null) {
              console.log('  Discount:', costData.discountPercentage + '%');
              console.log('  Discount Amount:', costData.discountAmount, 'VND');
            } else {
              console.log('  Discount: None');
            }
            console.log('  ────────────────────────────────────────');
            console.log('  💰 TOTAL PRICE:', costData.totalPrice, 'VND');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🔍 Debug Analysis:');
            console.log('  totalPages * numberOfCopy =', costData.totalPages, '*', costParams.numberOfCopy, '=', costData.totalPages * costParams.numberOfCopy);
            console.log('  basePricePerPage =', costData.basePricePerPage);
            console.log('  colorModePricePerPage =', costData.colorModePricePerPage);
            console.log('  Expected subtotal =', (costData.basePricePerPage + costData.colorModePricePerPage) * costData.totalPages * costParams.numberOfCopy);
            console.log('  Actual subtotalBeforeDiscount =', costData.subtotalBeforeDiscount);
            console.log('  Actual totalPrice =', costData.totalPrice);
            if (costData.totalPrice === 0) {
              console.warn('  ⚠️ WARNING: totalPrice is 0!');
              console.warn('  Possible reasons:');
              console.warn('    - totalPages is 0:', costData.totalPages === 0);
              console.warn('    - basePricePerPage is 0:', costData.basePricePerPage === 0);
              console.warn('    - colorModePricePerPage is 0:', costData.colorModePricePerPage === 0);
              console.warn('    - numberOfCopy is 0:', costParams.numberOfCopy === 0);
            }
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            setCostEstimate(costData);
          } else {
            console.warn('⚠️ [COST] Response missing data:', response);
            console.warn('⚠️ Response structure:', {
              hasData: !!response.data,
              hasDataData: !!response.data?.data,
              responseKeys: response.data ? Object.keys(response.data) : [],
            });
          }
        },
        onError: (err) => {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('❌ [COST] Calculation Error (ONCE)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('  Error Message:', err?.message);
          console.error('  Error Code:', (err as any)?.code);
          
          // Check if error is 404 (API endpoint not found)
          const axiosError = err as any;
          const is404 = axiosError?.response?.status === 404 || err?.message?.includes('404');
          
          if (is404) {
            console.warn('⚠️ [COST] API endpoint not found. Using fallback calculation.');
            console.warn('⚠️ Note: Backend may not have /students/print-jobs/calculate-cost endpoint yet.');
            console.warn('⚠️ Creating estimated cost based on basic calculation...');
            
            // Fallback: create estimated cost (basic calculation)
            const totalPages = uploadedFile?.pageCount || 0;
            const basePricePerPage = 500; // 500 VND per page (default)
            const colorMultiplier = costParams.colorModeName === 'color' ? 2 : 1;
            const effectivePages = config.printSide === 'double-sided' ? Math.ceil(totalPages / 2) : totalPages;
            const subtotal = effectivePages * basePricePerPage * colorMultiplier * config.numberOfCopy;
            
            const fallbackCost: CalculateCostResponse = {
              totalPages: totalPages,
              estimatedPages: effectivePages,
              basePricePerPage: basePricePerPage,
              colorModePricePerPage: basePricePerPage * (colorMultiplier - 1),
              subtotalBeforeDiscount: subtotal,
              totalPrice: subtotal,
            };
            
            console.log('✅ [COST] Fallback calculation:', fallbackCost);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            setCostEstimate(fallbackCost);
            setError(null);
            return;
          }
          
          if (axiosError?.response) {
            console.error('  Response Status:', axiosError.response.status);
            console.error('  Response Status Text:', axiosError.response.statusText);
            console.error('  Response Headers:', JSON.stringify(axiosError.response.headers, null, 2));
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('  📥 Response Data (Full):');
            console.error(JSON.stringify(axiosError.response.data, null, 2));
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            const responseData = axiosError.response.data;
            if (responseData && typeof responseData === 'object') {
              if (responseData.errors) {
                console.error('  ⚠️ Validation Errors:');
                console.error(JSON.stringify(responseData.errors, null, 2));
              }
              if (responseData.message) {
                console.error('  📝 Error Message:', responseData.message);
              }
              if (responseData.error) {
                console.error('  📝 Error:', responseData.error);
              }
              if (responseData.details) {
                console.error('  📋 Error Details:', JSON.stringify(responseData.details, null, 2));
              }
            }
          }
          
          if (axiosError?.request) {
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('  📤 Request Info:');
            console.error('    URL:', axiosError.request?.config?.url || axiosError.request?.url);
            console.error('    Method:', axiosError.request?.config?.method || axiosError.request?.method);
            console.error('    Request Data:', JSON.stringify(axiosError.request?.config?.data || axiosError.request?.data, null, 2));
            console.error('    Request Headers:', JSON.stringify(axiosError.request?.config?.headers, null, 2));
          }
          
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('  🔍 Full Error Object:');
          try {
            const errorKeys = Object.getOwnPropertyNames(err);
            const errorObj: Record<string, unknown> = {};
            errorKeys.forEach(key => {
              try {
                errorObj[key] = (err as any)[key];
              } catch {
                errorObj[key] = '[Cannot serialize]';
              }
            });
            console.error(JSON.stringify(errorObj, null, 2));
          } catch {
            console.error('  [Cannot serialize error object]');
          }
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          setError(getErrorMessage(err));
        },
      }
    );
  }, [
    uploadedFile,
    selectedPrinter?.printerId,
    config.pageSizeId,
    config.colorModeId,
    config.pageOrientation,
    config.printSide,
    config.numberOfCopy,
    currentStep,
    pageSizes,
    colorModes,
    calculateCostMutation,
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

        // File type for validation

        // Upload file immediately after picking
        setIsUploadingFile(true);
        uploadFileMutation.mutate(
          {
            uri: file.uri,
            type: file.type || 'application/octet-stream',
            name: file.name || 'document',
          },
          {
            onSuccess: (response) => {
              console.log('✅ [PRINT] File uploaded successfully:', response.data);
              if (response.data?.data) {
                setUploadedFile(response.data.data);
                setIsUploadingFile(false);
                showToast(t('student.print.uploadSuccess', 'File uploaded successfully'), 'success');
              } else {
                setIsUploadingFile(false);
                showToast(t('student.print.uploadError', 'Upload succeeded but no file data returned'), 'error');
              }
            },
            onError: (error) => {
              console.error('❌ [PRINT] File upload failed:', error);
              setIsUploadingFile(false);
              const errorMsg = getErrorMessage(error);
              showToast(errorMsg, 'error');
            },
          }
        );
      }
    } catch (err: any) {
      // DocumentPicker throws error when user cancels, but we don't need to show error for that
      // Check if error is cancellation (usually has code 'DOCUMENT_PICKER_CANCELED' or message contains 'cancel')
      const isCanceled = err?.code === 'DOCUMENT_PICKER_CANCELED' || 
                        err?.message?.toLowerCase().includes('cancel') ||
                        false;
      
      if (err && !isCanceled) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
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

  const handleCancel = async () => {
    Alert.alert(
      t('student.print.cancelTitle', 'Hủy tiến trình in'),
      t('student.print.cancelMessage', 'Bạn có chắc muốn hủy tiến trình in? Tất cả thông tin đã nhập sẽ bị xóa.'),
      [
        {
          text: t('common.cancel', 'Hủy'),
          style: 'cancel',
        },
        {
          text: t('student.print.cancelConfirm', 'Xác nhận'),
          style: 'destructive',
          onPress: async () => {
            await clearProgress();
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
  };

  const handleConfirm = async () => {
    console.log('🚀 [PRINT] handleConfirm called');
    
    if (!uploadedFile || !selectedPrinter) {
      console.warn('⚠️ [PRINT] Missing file or printer:', { uploadedFile: !!uploadedFile, selectedPrinter: !!selectedPrinter });
      Alert.alert('Error', 'Please select a file and printer');
      return;
    }

    // Validate uploadedFileId exists (file must be uploaded)
    if (!uploadedFile.uploadedFileId || uploadedFile.uploadedFileId.trim() === '') {
      console.error('❌ [PRINT] File not uploaded yet');
      Alert.alert(
        'File Not Uploaded',
        'Please wait for the file to finish uploading, or select a file from the uploaded files list.'
      );
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
      console.error('❌ [PRINT] Validation failed:', validation.errors);
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    // Check balance
    if (costEstimate && balanceData?.data?.data) {
      const balanceAmount = balanceData.data.data.balanceAmount;
      const totalPrice = costEstimate.totalPrice;
      console.log('💰 [PRINT] Balance check:', {
        balanceAmount,
        totalPrice,
        isSufficient: balanceAmount >= totalPrice,
      });
      
      if (balanceAmount < totalPrice) {
        Alert.alert(
          'Insufficient Balance',
          `You need ${totalPrice.toLocaleString('vi-VN')} VND but only have ${balanceAmount.toLocaleString('vi-VN')} VND`
        );
        return;
      }
    }

    // Find pageSize and colorMode by ID to get names
    const selectedPageSize = pageSizes.find(s => s.pageSizeId === config.pageSizeId);
    const selectedColorMode = colorModes.find(m => m.colorModeId === config.colorModeId);

    if (!selectedPageSize || !selectedColorMode) {
      Alert.alert('Error', 'Page size or color mode not found. Please reselect.');
      return;
    }

const mapColorModeName = (colorModeName: string): string => {
      if (colorModeName === 'black-white') {
        return 'black-white';
      }
      if(colorModeName === 'grayscale')
      { return 'grayscale'; } 
      if (colorModeName === 'color') {
        return 'color';
      }
      return colorModeName; // fallback
    };

    // Prepare request payload with names (not IDs) as backend expects
    const requestPayload = {
      uploadedFileId: uploadedFile.uploadedFileId,
      printerId: selectedPrinter.printerId,
      pageSizeName: selectedPageSize.sizeName,
      colorModeName: mapColorModeName(selectedColorMode.colorModeName),
      pageOrientation: config.pageOrientation,
      printSide: config.printSide,
      numberOfCopy: config.numberOfCopy,
      paymentMethod: 'balance' as const, // Default to balance payment
    };

    console.log('📤 [PRINT] Creating print job with payload:', {
      ...requestPayload,
      uploadedFile: {
        fileName: uploadedFile.fileName,
        pageCount: uploadedFile.pageCount,
        fileSizeKb: uploadedFile.fileSizeKb,
      },
      printer: {
        printerId: selectedPrinter.printerId,
        brandName: selectedPrinter.brandName,
        modelName: selectedPrinter.modelName,
      },
      costEstimate: costEstimate ? {
        totalPrice: costEstimate.totalPrice,
        totalPages: costEstimate.totalPages,
      } : null,
    });

    // Create print job
    createJobMutation.mutate(
      requestPayload,
      {
        onSuccess: async (response) => {
          console.log('✅ [PRINT] Print job created successfully:', {
            response: response.data,
            jobId: response.data?.data?.jobId,
            remainingBalance: response.data?.data?.remainingBalance,
          });
          
          if (response.data?.data) {
            // Clear progress after successful print job creation
            await clearProgress();
            console.log('🧹 [PRINT] Progress cleared');
            
            Alert.alert(
              'Success',
              `Print job created successfully!\nJob ID: ${response.data.data.jobId}\nRemaining Balance: ${response.data.data.remainingBalance.toLocaleString('vi-VN')} VND`,
              [
                {
                  text: 'OK',
                  onPress: () => {
                    console.log('🔄 [PRINT] Resetting form');
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
          } else {
            console.warn('⚠️ [PRINT] Response missing data:', response);
          }
        },
        onError: (err) => {
          console.error('❌ [PRINT] Print job creation failed:', {
            error: err,
            message: err?.message,
            response: (err as any)?.response?.data,
            status: (err as any)?.response?.status,
          });
          
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
            {uploadedFile.fileName}
          </Text>
          <Text
            style={[
              styles.fileDetails,
              { color: themeColors['muted-foreground'] },
            ]}
          >
            {uploadedFile.fileSizeKb} KB • {uploadedFile.fileType}
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
            title={
              isUploadingFile
                ? t('student.print.uploading', 'Đang tải lên...')
                : t('student.print.step1.next')
            }
            onPress={handleNext}
            disabled={
              !uploadedFile ||
              isUploadingFile ||
              !uploadedFile.uploadedFileId ||
              uploadedFile.uploadedFileId.trim() === ''
            }
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

      {/* Filters */}
      <PrinterFilters
        keyword={printerKeyword}
        status={printerStatus}
        building={printerBuilding}
        onlyAvailable={printerOnlyAvailable}
        colorOnly={printerColorOnly}
        duplexOnly={printerDuplexOnly}
        buildingOptions={printerBuildingOptions}
        onKeywordChange={setPrinterKeyword}
        onStatusChange={handleStatusChange}
        onBuildingChange={setPrinterBuilding}
        onOnlyAvailableToggle={handleOnlyAvailableToggle}
        onColorOnlyToggle={handleColorOnlyToggle}
        onDuplexOnlyToggle={handleDuplexOnlyToggle}
      />

      {/* Printer List */}
      <PrinterList
        printers={printers}
        loading={loadingPrinters}
        isFetching={fetchingPrinters}
        selectedPrinter={selectedPrinter}
        onSelectPrinter={handleSelectPrinter}
        queueData={queueData}
        filterKey={`${printerPage}-${printerStatus}-${printerBuilding}-${printerOnlyAvailable}-${printerColorOnly}-${printerDuplexOnly}-${debouncedKeyword}`}
      />

      {/* Pagination */}
      {printerPagination && printerPagination.totalItems > 0 && (
        <Pagination
          page={printerPage}
          pageSize={printerPagination.limit || 10}
          total={printerPagination.totalItems}
          onChange={handlePageChange}
          style={styles.pagination}
        />
      )}

      <View style={styles.stepActions}>
        <View style={styles.stepActionsRow}>
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
        <Button
          title={t('student.print.cancel', 'Hủy')}
          onPress={handleCancel}
          variant="destructive"
          style={styles.cancelButton}
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
          value={config.pageOrientation}
          onChange={value =>
            setConfig({
              ...config,
              pageOrientation: value as 'portrait' | 'landscape',
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
          value={config.printSide}
          onChange={value =>
            setConfig({
              ...config,
              printSide: value as 'one-sided' | 'double-sided',
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

      <Card style={styles.costPreviewCard}>
        <CardContent>
          {!uploadedFile || !selectedPrinter ? (
            <Text style={{ color: themeColors['muted-foreground'] }}>
              {t('student.print.step3.costNeedFilePrinter', 'Vui lòng chọn file và máy in để tính chi phí.')}
            </Text>
          ) : !config.pageSizeId || !config.colorModeId ? (
            <Text style={{ color: themeColors['muted-foreground'] }}>
              {t('student.print.step3.costNeedConfig', 'Chọn khổ giấy và chế độ màu để xem chi phí.')}
            </Text>
          ) : calculateCostMutation.isPending ? (
            <Text style={{ color: themeColors['muted-foreground'] }}>
              {t('student.print.step3.costCalculating', 'Đang tính chi phí...')}
            </Text>
          ) : costEstimate ? (
            <View style={styles.costPreviewRow}>
              <View>
                <Text style={[styles.costLabel, { color: themeColors['muted-foreground'] }]}>
                  {t('student.print.step3.costTotal', 'Tổng tạm tính')}
                </Text>
                <Text style={[styles.costValue, { color: themeColors.primary }]}>
                  {costEstimate.totalPrice.toLocaleString('vi-VN')} ₫
                </Text>
                <Text style={[styles.costPreviewSub, { color: themeColors['muted-foreground'] }]}>
                  {t('student.print.step3.costDetail', {
                    defaultValue: '{{pages}} trang x {{copies}} bản',
                    pages: costEstimate.totalPages,
                    copies: config.numberOfCopy,
                  })}
                </Text>
              </View>
              <Button
                title={t('student.print.step3.refreshCost', 'Tính lại')}
                onPress={() => {
                  lastCostParamsRef.current = '';
                  setCostEstimate(null);
                  // trigger recalculation by updating ref dependency
                  calculateCostMutation.reset?.();
                  setConfig(prev => ({ ...prev }));
                }}
                variant="outline"
                style={styles.refreshCostButton}
              />
            </View>
          ) : (
            <Text style={{ color: themeColors['muted-foreground'] }}>
              {t('student.print.step3.costNoData', 'Chưa có dữ liệu chi phí.')}
            </Text>
          )}
        </CardContent>
      </Card>

      <View style={styles.stepActions}>
        <View style={styles.stepActionsRow}>
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
        <Button
          title={t('student.print.cancel', 'Hủy')}
          onPress={handleCancel}
          variant="destructive"
          style={styles.cancelButton}
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
                {t('student.print.step4.estimatedCost')}
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
                  {t('student.profile.balance.subtitle')}: {balanceData.data.data.balanceAmount.toLocaleString('vi-VN')} ₫
                  {!isBalanceSufficient && ` (${t('student.print.step4.insufficient', 'Không đủ')})`}
                </Text>
              )}
            </View>
          </CardContent>
        </Card>

        <View style={styles.stepActions}>
          <View style={styles.stepActionsRow}>
            <Button
              title={t('student.print.step2.back')}
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
              disabled={createJobMutation.isPending}
            />
            <Button
              title={t('student.print.step4.confirm')}
              onPress={handleConfirm}
              disabled={createJobMutation.isPending || !isBalanceSufficient || calculateCostMutation.isPending || !costEstimate}
              style={styles.confirmButton}
            />
          </View>
          <Button
            title={t('student.print.cancel', 'Hủy')}
            onPress={handleCancel}
            variant="destructive"
            style={styles.cancelButton}
          />
        </View>
      </View>
    );
  };

  // Optimize API call for pageSizes by caching and reducing unnecessary calls
  // Loading state
  if (loadingFiles || loadingPrinters) {
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
          <PrintScreenSkeleton />
        </ScrollView>
      </SafeAreaView>
    );
  }

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

        {currentStep === 1 && (
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
                  <SkeletonCard />
                  <SkeletonCard />
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
        )}
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
  filtersContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  filterInput: {
    marginBottom: spacing.xs,
  },
  filterSelect: {
    flex: 1,
    minWidth: 120,
  },
  filterCheckbox: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  filterCheckboxText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  pagination: {
    marginTop: spacing.md,
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
  costPreviewCard: {
    marginTop: spacing.sm,
  },
  costPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  costInfoContainer: {
    flex: 1,
  },
  costPreviewSub: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  costDiscountText: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  costEmptyState: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  costEmptyText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  costLoadingState: {
    paddingVertical: spacing.md,
  },
  costSkeletonContainer: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  costSkeletonLabel: {
    height: 14,
    width: '40%',
    borderRadius: borderRadius.sm,
    opacity: 0.3,
  },
  costSkeletonValue: {
    height: 28,
    width: '70%',
    borderRadius: borderRadius.sm,
    opacity: 0.3,
  },
  costSkeletonSub: {
    height: 12,
    width: '50%',
    borderRadius: borderRadius.sm,
    opacity: 0.3,
  },
  costLoadingText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  refreshCostButton: {
    alignSelf: 'flex-start',
  },
  stepActions: {
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
    width: '100%',
  },
  stepActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    width: '100%',
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
