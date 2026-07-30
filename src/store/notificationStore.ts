import { create } from "zustand";

interface NotificationState {
  notifications: any[];
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
}));
