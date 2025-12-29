import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  UploadedFileResponse,
  AvailablePrinterResponse,
} from '../../types/api';

export interface PrintConfig {
  pageSizeId: string;
  colorModeId: string;
  pageOrientation: 'portrait' | 'landscape';
  printSide: 'one-sided' | 'double-sided';
  numberOfCopy: number;
}

export interface PrintProgress {
  currentStep: number;
  uploadedFile: UploadedFileResponse | null;
  selectedPrinter: AvailablePrinterResponse | null;
  config: PrintConfig;
  timestamp: number;
}

interface PrintProgressState {
  progress: PrintProgress | null;
  saveProgress: (
    currentStep: number,
    uploadedFile: UploadedFileResponse | null,
    selectedPrinter: AvailablePrinterResponse | null,
    config: PrintConfig
  ) => Promise<void>;
  loadProgress: () => Promise<PrintProgress | null>;
  clearProgress: () => Promise<void>;
  hasProgress: () => Promise<boolean>;
}

const STORAGE_KEY = 'print-progress';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const usePrintProgressStore = create<PrintProgressState>((set, get) => ({
  progress: null,
  saveProgress: async (
    currentStep: number,
    uploadedFile: UploadedFileResponse | null,
    selectedPrinter: AvailablePrinterResponse | null,
    config: PrintConfig
  ) => {
    try {
      // Only save if user has uploaded file or is past step 1
      if (
        currentStep > 1 ||
        (uploadedFile && uploadedFile.uploadedFileId)
      ) {
        const progress: PrintProgress = {
          currentStep,
          uploadedFile: uploadedFile
            ? {
                // Don't save file object, only metadata
                uploadedFileId: uploadedFile.uploadedFileId,
                fileName: uploadedFile.fileName,
                fileType: uploadedFile.fileType,
                fileSizeKb: uploadedFile.fileSizeKb,
                fileUrl: uploadedFile.fileUrl,
                pageCount: uploadedFile.pageCount,
                uploadedAt: uploadedFile.uploadedAt,
                lastPrintedAt: uploadedFile.lastPrintedAt,
                printCount: uploadedFile.printCount,
              }
            : null,
          selectedPrinter,
          config,
          timestamp: Date.now(),
        };
        set({ progress });
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } else {
        // Clear progress if back to step 1 without file
        set({ progress: null });
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving print progress:', error);
    }
  },
  loadProgress: async (): Promise<PrintProgress | null> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        set({ progress: null });
        return null;
      }

      const progress: PrintProgress = JSON.parse(stored);

      // Validate timestamp (not older than 24 hours)
      const age = Date.now() - progress.timestamp;
      if (age > MAX_AGE_MS) {
        set({ progress: null });
        await AsyncStorage.removeItem(STORAGE_KEY);
        return null;
      }

      // Validate data structure
      if (
        !progress.currentStep ||
        progress.currentStep < 1 ||
        progress.currentStep > 4
      ) {
        set({ progress: null });
        await AsyncStorage.removeItem(STORAGE_KEY);
        return null;
      }

      set({ progress });
      return progress;
    } catch (error) {
      console.error('Error loading print progress:', error);
      set({ progress: null });
      return null;
    }
  },
  clearProgress: async () => {
    try {
      set({ progress: null });
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing print progress:', error);
    }
  },
  hasProgress: async (): Promise<boolean> => {
    try {
      const progress = await get().loadProgress();
      if (!progress) {
        return false;
      }

      // Check if progress has meaningful data
      return !!(
        progress.currentStep > 1 ||
        (progress.uploadedFile && !!progress.uploadedFile.uploadedFileId)
      );
    } catch (error) {
      console.error('Error checking print progress:', error);
      return false;
    }
  },
}));

