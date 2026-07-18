'use server';

import { MenuService } from '../services/MenuService';
import { CategoryService } from '../services/CategoryService';
import { getAssignedKitchenId } from './kitchen';

// Helper to validate and fetch kitchen ID
const getKitchenContext = async () => {
  const kitchenId = await getAssignedKitchenId();
  if (!kitchenId) {
    throw new Error('No assigned kitchen found. Please allow location access.');
  }
  return kitchenId;
};

// Map MongoDB documents to the expected frontend type
const mapMenuItem = (d: any) => ({
  id: d._id.toString(),
  name: d.name,
  desc: d.description,
  price: d.price,
  image: d.images?.[0] || '',
  veg: d.isVeg,
  rating: d.rating,
  category: d.category?.name || 'Uncategorized',
  tag: d.tags?.[0] || undefined,
});

export const getKitchenMenu = async () => {
  try {
    const kitchenId = await getKitchenContext();
    const items = await MenuService.getMenuByKitchen(kitchenId);
    return items.map(mapMenuItem);
  } catch (err) {
    console.error('getKitchenMenu error:', err);
    return [];
  }
};

export const getKitchenCategories = async () => {
  try {
    const kitchenId = await getKitchenContext();
    const categories = await CategoryService.getCategoriesByKitchen(kitchenId);
    return categories.map(c => c.name);
  } catch (err) {
    console.error('getKitchenCategories error:', err);
    return [];
  }
};

export const searchKitchenMenu = async (query: string) => {
  try {
    if (!query) return await getKitchenMenu();
    
    const kitchenId = await getKitchenContext();
    const items = await MenuService.searchMenu(kitchenId, query);
    return items.map(mapMenuItem);
  } catch (err) {
    console.error('searchKitchenMenu error:', err);
    return [];
  }
};
