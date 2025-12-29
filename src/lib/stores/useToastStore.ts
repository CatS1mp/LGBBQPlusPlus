import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  message: string | null;
  type: ToastType;
  visible: boolean;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  visible: false,
  showToast: (message: string, type: ToastType = 'info') => {
    set({ message, type, visible: true });
  },
  hideToast: () => {
    set({ visible: false });
  },
}));

