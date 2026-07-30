const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "src");

const files = {
  "utils/client/locationUtils.ts": `
export const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatDistance = (km: number): string => {
  return \`\${Math.round(km * 10) / 10} km\`;
};

export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};
`,
  "services/client/KitchenAssignmentService.ts": `
import { calculateHaversineDistance } from '../../utils/client/locationUtils';
import { BRANCHES } from '../../lib/data';

const KITCHENS_COORDS: Record<string, { lat: number; lng: number, radiusKm: number }> = {
  "pimple-saudagar": { lat: 18.5987, lng: 73.7978, radiusKm: 15 },
  "chinchwad": { lat: 18.6253, lng: 73.7788, radiusKm: 15 },
  "sangvi": { lat: 18.5772, lng: 73.8055, radiusKm: 15 },
};

export interface KitchenAssignmentResult {
  kitchenId: string | null;
  distance: number | null;
  isOutsideDeliveryArea: boolean;
}

export const assignNearestKitchen = (lat: number, lng: number): KitchenAssignmentResult => {
  let nearestBranchId: string | null = null;
  let minDistance = Infinity;

  BRANCHES.forEach((b) => {
    const coords = KITCHENS_COORDS[b.id];
    if (coords) {
      const dist = calculateHaversineDistance(lat, lng, coords.lat, coords.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestBranchId = b.id;
      }
    }
  });

  if (nearestBranchId) {
    const coords = KITCHENS_COORDS[nearestBranchId];
    if (minDistance > coords.radiusKm) {
      return { kitchenId: null, distance: minDistance, isOutsideDeliveryArea: true };
    }
  }

  return { 
    kitchenId: nearestBranchId, 
    distance: minDistance === Infinity ? null : minDistance, 
    isOutsideDeliveryArea: false 
  };
};
`,
  "services/client/LocationService.ts": `
export interface LocationResult {
  latitude: number;
  longitude: number;
}

export const requestGPSLocation = async (): Promise<LocationResult> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return reject(new Error("Browser does not support GPS."));
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};
`,
  "store/locationStore.ts": `
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
`,
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(src, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log("Location Services generated.");
