import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BRANCHES, Dish } from "./data";
import { setAssignedKitchen } from "@/actions/kitchen";

export type CartItem = { dishId: string; qty: number };
export type Profile = {
  name: string;
  phone: string;
  address: string;
  branchId: string;
  email?: string;
  role?: string;
  joinedDate?: Date | string;
} | null;

export interface UserLocationState {
  lat: number;
  lng: number;
  label?: string;
  distanceKm?: number;
  etaMin?: number;
  kitchenName?: string;
}

type State = {
  branchId: string;
  setBranch: (id: string) => void;
  kitchenMenu: Dish[];
  setKitchenMenu: (menu: Dish[]) => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  cartTotals: {
    subtotal: number;
    discount: number;
    tax: number;
    deliveryFee: number;
    grandTotal: number;
    couponCode: string | null;
  } | null;
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
  userLocation: UserLocationState | null;
  setUserLocation: (loc: UserLocationState | null) => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      branchId: "pimple-saudagar",
      setBranch: (id) => {
        set({ branchId: id, kitchenMenu: [], cartTotals: null, locationResolved: true });
        setAssignedKitchen(id).catch(console.error);
      },
      kitchenMenu: [],
      setKitchenMenu: (menu) => set({ kitchenMenu: Array.isArray(menu) ? menu : [] }),
      cart: [],
      setCart: (cart) => set({ cart: Array.isArray(cart) ? cart : [] }),
      cartTotals: null,
      setCartTotals: (totals) => set({ cartTotals: totals }),
      addToCart: (dishId) => {
        const existing = get().cart.find((c) => c.dishId === dishId);
        if (existing)
          set({
            cart: get().cart.map((c) => (c.dishId === dishId ? { ...c, qty: c.qty + 1 } : c)),
          });
        else set({ cart: [...get().cart, { dishId, qty: 1 }] });
      },
      removeFromCart: (dishId) => set({ cart: get().cart.filter((c) => c.dishId !== dishId) }),
      setQty: (dishId, qty) =>
        set({
          cart:
            qty <= 0
              ? get().cart.filter((c) => c.dishId !== dishId)
              : get().cart.map((c) => (c.dishId === dishId ? { ...c, qty } : c)),
        }),
      clearCart: () => set({ cart: [] }),
      profile: null,
      setProfile: (p) => set({ profile: p }),
      favorites: [],
      toggleFav: (id) =>
        set({
          favorites: get().favorites.includes(id)
            ? get().favorites.filter((x) => x !== id)
            : [...get().favorites, id],
        }),
      orders: [],
      locationResolved: false,
      resolveLocation: (branchId) => {
        const currentBranch = get().branchId;
        if (currentBranch && currentBranch !== branchId) {
          // Keep items or refresh
        }
        set({ branchId, locationResolved: true });
        setAssignedKitchen(branchId).catch(console.error);
      },
      userLocation: null,
      setUserLocation: (loc) => set({ userLocation: loc }),
    }),
    { name: "malashree-store" },
  ),
);
