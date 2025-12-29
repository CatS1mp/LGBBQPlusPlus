import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MockModeState {
  isMockMode: boolean;
  setMockMode: (enabled: boolean) => void;
  lastNetworkError: string | null;
  setLastNetworkError: (error: string | null) => void;
}

export const useMockModeStore = create<MockModeState>()(
  persist(
    set => ({
      isMockMode: false,
      setMockMode: (enabled: boolean) => {
        set({ isMockMode: enabled });
      },
      lastNetworkError: null,
      setLastNetworkError: (error: string | null) => {
        set({ lastNetworkError: error });
      },
    }),
    {
      name: 'mock-mode-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

