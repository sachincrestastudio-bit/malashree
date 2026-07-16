import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
}));
