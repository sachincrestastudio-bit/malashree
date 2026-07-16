
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
