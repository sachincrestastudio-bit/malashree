import { create } from "zustand";

interface KitchenState {
  activeKitchen: null;
}

export const useKitchenStore = create<KitchenState>((set) => ({
  activeKitchen: null,
}));
