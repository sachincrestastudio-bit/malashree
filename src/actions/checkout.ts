'use server';

import { CheckoutService } from '../services/CheckoutService';
import { getAssignedKitchenId } from './kitchen';
import { getCurrentUser } from './user';

/**
 * Validates and places an order based on the user's cart.
 */
export const placeOrder = async (
  cartItems: { dishId: string; qty: number }[],
  couponCode: string | null,
  addressString: string | undefined,
  paymentMethod: string
) => {
  try {
    const kitchenId = await getAssignedKitchenId();
    if (!kitchenId) {
      return { success: false, error: 'Kitchen assignment is missing. Please refresh.' };
    }

    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'You must be logged in to place an order.' };
    }

    const order = await CheckoutService.processCheckout(
      user.id,
      kitchenId,
      cartItems,
      couponCode,
      addressString,
      paymentMethod
    );

    return { success: true, orderNumber: order.orderNumber };
  } catch (error: any) {
    console.error('placeOrder error:', error);
    return { success: false, error: error.message || 'An error occurred during checkout.' };
  }
};
