import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BRANCHES } from "./data";

export type CartItem = { dishId: string; qty: number };
export type Profile = { name: string; phone: string; address: string; branchId: string; email?: string; role?: string; joinedDate?: Date | string; } | null;
import { Dish } from "./data";

type State = {
  branchId: string;
  setBranch: (id: string) => void;
  kitchenMenu: Dish[];
  setKitchenMenu: (menu: Dish[]) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  cartTotals: { subtotal: number; discount: number; tax: number; deliveryFee: number; grandTotal: number; couponCode: string | null } | null;
  setCartTotals: (totals: any) => void;
  addToCart: (dishId: string) => void;
  removeFromCart: (dishId: string) => void;
  setQty: (dishId: string, qty: number) => void;
  clearCart: () => void;
  profile: Profile;
  setProfile: (p: Profile) => void;
  favorites: string[];
  toggleFav: (id: string) => void;
  orders: { id: string; date: string; branchId: string; items: CartItem[]; total: number }[];
  locationResolved: boolean;
  resolveLocation: (branchId: string) => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      branchId: BRANCHES[0].id,
      setBranch: (id) => set({ branchId: id, cart: [], kitchenMenu: [], cartTotals: null }),
      kitchenMenu: [],
      setKitchenMenu: (menu) => set({ kitchenMenu: menu }),
      cart: [],
      setCart: (cart) => set({ cart }),
      cartTotals: null,
      setCartTotals: (totals) => set({ cartTotals: totals }),
      addToCart: (dishId) => {
        const existing = get().cart.find(c => c.dishId === dishId);
        if (existing) set({ cart: get().cart.map(c => c.dishId === dishId ? { ...c, qty: c.qty + 1 } : c) });
        else set({ cart: [...get().cart, { dishId, qty: 1 }] });
      },
      removeFromCart: (dishId) => set({ cart: get().cart.filter(c => c.dishId !== dishId) }),
      setQty: (dishId, qty) => set({
        cart: qty <= 0
          ? get().cart.filter(c => c.dishId !== dishId)
          : get().cart.map(c => c.dishId === dishId ? { ...c, qty } : c)
      }),
      clearCart: () => set({ cart: [] }),
      profile: null,
      setProfile: (p) => set({ profile: p }),
      favorites: [],
      toggleFav: (id) => set({
        favorites: get().favorites.includes(id)
          ? get().favorites.filter(x => x !== id)
          : [...get().favorites, id]
      }),
      orders: [],
      locationResolved: false,
      resolveLocation: (branchId) => {
        const currentBranch = get().branchId;
        // If kitchen changes, clear the cart to prevent ordering items that don't belong to the new kitchen
        if (currentBranch && currentBranch !== branchId) {
          set({ cart: [] });
        }
        set({ branchId, locationResolved: true });
      },
    }),
    { name: "malashree-store" }
  )
);