'use server';

import { getCurrentUser } from '../user';

/**
 * Ensures the current user is a kitchen manager and has an assigned kitchen.
 * Throws an error if unauthorized.
 */
export async function requireKitchenAccess() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'kitchen_manager') {
    throw new Error('Unauthorized: Kitchen access required');
  }
  if (!user.assignedKitchen) {
    throw new Error('Forbidden: No kitchen assigned to this user');
  }
  return {
    ...user,
    kitchenId: user.assignedKitchen.toString()
  };
}
