import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationLayout = 'horizontal' | 'vertical';

interface NavigationState {
  layout: NavigationLayout;
  setLayout: (layout: NavigationLayout) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    set => ({
      layout: 'horizontal',
      setLayout: (layout: NavigationLayout) => set({ layout }),
    }),
    {
      name: 'navigation-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

