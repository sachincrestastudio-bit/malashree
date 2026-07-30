"use server";

import { CartService } from "../services/CartService";
import { getAssignedKitchenId } from "./kitchen";
import { getCurrentUser } from "./user";

/**
 * Syncs the local guest cart with the server to get trusted pricing and validation.
 * If the user is authenticated, it updates their DB cart and returns the DB totals.
 */
export const syncCart = async (
  items: { dishId: string; qty: number }[],
  couponCode: string | null = null,
) => {
  try {
    const kitchenId = await getAssignedKitchenId();
    if (!kitchenId) return null;

    const user = await getCurrentUser();

    if (user) {
      // Authenticated User: Sync to DB and return the DB totals
      const dbCart = await CartService.syncUserCart(user.id, kitchenId, items, couponCode);
      return {
        subtotal: dbCart.subtotal,
        discount: dbCart.discount,
        tax: dbCart.tax,
        deliveryFee: dbCart.deliveryFee,
        grandTotal: dbCart.grandTotal,
        validCartItems: dbCart.items.map((i: any) => ({
          dishId: i.menuItemId.toString(),
          qty: i.quantity,
        })),
        couponCode: dbCart.couponCode,
      };
    } else {
      // Guest User: Calculate and return totals without saving to DB
      const { totals, validCartItems } = await CartService.calculateCart(
        kitchenId,
        items,
        couponCode,
      );
      return {
        ...totals,
        validCartItems: validCartItems.map((i: any) => ({ dishId: i.menuItemId, qty: i.quantity })),
        couponCode: couponCode,
      };
    }
  } catch (error) {
    console.error("syncCart error:", error);
    return null;
  }
};

/**
 * Merges a guest's local cart items into their authenticated DB cart.
 */
export const mergeGuestCart = async (localItems: { dishId: string; qty: number }[]) => {
  try {
    const kitchenId = await getAssignedKitchenId();
    const user = await getCurrentUser();
    if (!kitchenId || !user) return null;

    // 1. Get existing DB cart
    const existingDbCart = await CartService.getUserCart(user.id, kitchenId);

    // 2. Combine items
    const mergedMap = new Map<string, number>();

    if (existingDbCart) {
      existingDbCart.items.forEach((i: any) => {
        mergedMap.set(i.menuItemId.toString(), i.quantity);
      });
    }

    localItems.forEach((i) => {
      const currentQty = mergedMap.get(i.dishId) || 0;
      mergedMap.set(i.dishId, currentQty + i.qty);
    });

    const mergedItems = Array.from(mergedMap.entries()).map(([dishId, qty]) => ({ dishId, qty }));

    // 3. Sync the new merged list back to DB
    const dbCart = await CartService.syncUserCart(user.id, kitchenId, mergedItems);

    return {
      items: dbCart.items.map((i: any) => ({ dishId: i.menuItemId.toString(), qty: i.quantity })),
      totals: {
        subtotal: dbCart.subtotal,
        discount: dbCart.discount,
        tax: dbCart.tax,
        deliveryFee: dbCart.deliveryFee,
        grandTotal: dbCart.grandTotal,
        couponCode: dbCart.couponCode,
      },
    };
  } catch (error) {
    console.error("mergeGuestCart error:", error);
    return null;
  }
};

/**
 * Clears the authenticated user's cart in the DB.
 */
export const clearUserCart = async () => {
  try {
    const kitchenId = await getAssignedKitchenId();
    if (!kitchenId) return false;

    const user = await getCurrentUser();
    if (!user) return false;

    await CartService.clearUserCart(user.id, kitchenId);
    return true;
  } catch (error) {
    console.error("clearUserCart error:", error);
    return false;
  }
};
