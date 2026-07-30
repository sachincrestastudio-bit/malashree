import { connectToDatabase } from "../database/mongoose";
import { Cart } from "../models/Cart";
import { MenuItem } from "../models/MenuItem";
import { PricingService } from "./PricingService";
import { CouponService } from "./CouponService";

export class CartService {
  /**
   * Calculates the trusted server-side totals for an array of requested items.
   * Also filters out items that don't belong to the kitchen or are unavailable.
   */
  static async calculateCart(
    kitchenId: string,
    requestedItems: { dishId: string; qty: number }[],
    couponCode: string | null = null,
  ) {
    await connectToDatabase();

    const dishIds = requestedItems.map((i) => i.dishId);

    // Fetch only available items belonging to the assigned kitchen
    const validItems = await MenuItem.find({
      _id: { $in: dishIds },
      kitchenId,
      isAvailable: true,
    }).lean();

    const validItemsMap = new Map(validItems.map((item) => [item._id.toString(), item.price]));

    const itemsToPrice = [];
    const validCartItems = []; // Safe array of items to store in DB

    for (const req of requestedItems) {
      const price = validItemsMap.get(req.dishId);
      if (price !== undefined && req.qty > 0) {
        itemsToPrice.push({ price, quantity: req.qty });
        validCartItems.push({ menuItemId: req.dishId, quantity: req.qty });
      }
    }

    const discountPercentage = await CouponService.validateCoupon(kitchenId, couponCode);
    const totals = PricingService.calculateTotals(itemsToPrice, discountPercentage);

    return { totals, validCartItems };
  }

  /**
   * Syncs a user's DB cart by completely recalculating it with the given items.
   */
  static async syncUserCart(
    userId: string,
    kitchenId: string,
    items: { dishId: string; qty: number }[],
    couponCode: string | null = null,
  ) {
    const { totals, validCartItems } = await this.calculateCart(kitchenId, items, couponCode);

    const cart = await Cart.findOneAndUpdate(
      { userId, kitchenId, status: "active" },
      {
        $set: {
          items: validCartItems,
          couponCode,
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          deliveryFee: totals.deliveryFee,
          grandTotal: totals.grandTotal,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return cart;
  }

  /**
   * Gets the active cart for a user in a specific kitchen.
   */
  static async getUserCart(userId: string, kitchenId: string) {
    await connectToDatabase();
    return await Cart.findOne({ userId, kitchenId, status: "active" }).lean();
  }

  /**
   * Clears the user's active cart for the kitchen.
   */
  static async clearUserCart(userId: string, kitchenId: string) {
    await connectToDatabase();
    await Cart.findOneAndDelete({ userId, kitchenId, status: "active" });
  }
}
