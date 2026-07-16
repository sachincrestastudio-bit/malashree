
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  assignedKitchen: string | null;
  distance: number | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'error' | null;
  loading: boolean;
  lastUpdated: number | null;
  locationSource: 'gps' | 'cached' | 'default' | null;
  
  setLoading: (loading: boolean) => void;
  setPermissionError: (status: 'denied' | 'error') => void;
  setLocation: (lat: number, lng: number, kitchenId: string | null, distance: number | null, source: 'gps' | 'cached' | 'default') => void;
  reset: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      assignedKitchen: null,
      distance: null,
      permissionStatus: null,
      loading: false,
      lastUpdated: null,
      locationSource: null,

      setLoading: (loading) => set({ loading }),
      setPermissionError: (status) => set({ permissionStatus: status, loading: false }),
      setLocation: (lat, lng, kitchenId, distance, source) => set({
        latitude: lat,
        longitude: lng,
        assignedKitchen: kitchenId,
        distance,
        locationSource: source,
        permissionStatus: 'granted',
        lastUpdated: Date.now(),
        loading: false
      }),
      reset: () => set({
        latitude: null,
        longitude: null,
        assignedKitchen: null,
        distance: null,
        permissionStatus: null,
        lastUpdated: null,
        locationSource: null
      })
    }),
    {
      name: 'malashree-location-storage',
    }
  )
);
