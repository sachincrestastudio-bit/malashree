import { create } from 'zustand';

interface UserState {
  user: null;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
}));
