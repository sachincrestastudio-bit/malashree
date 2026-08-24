import mongoose from "mongoose";
import { connectToDatabase } from "../database/mongoose";
import { Cart } from "../models/Cart";
import { MenuItem } from "../models/MenuItem";
import { SystemSetting } from "../models/SystemSetting";
import { PricingService } from "./PricingService";
import { CouponService } from "./CouponService";
import { findDish } from "../lib/data";

export class CartService {
  /**
   * Calculates the trusted server-side totals for an array of requested items,
   * applying dynamic GST and settings from MongoDB.
   */
  static async calculateCart(
    kitchenId: string,
    requestedItems: { dishId: string; qty: number }[],
    couponCode: string | null = null,
  ) {
    await connectToDatabase();

    const objectIds = requestedItems
      .map((i) => i.dishId)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    let validItems: any[] = [];
    if (objectIds.length > 0) {
      validItems = await MenuItem.find({
        _id: { $in: objectIds },
        deletedAt: null,
      }).lean();
    }

    const validItemsMap = new Map(validItems.map((item) => [item._id.toString(), item.price]));

    const itemsToPrice = [];
    const validCartItems = [];

    for (const req of requestedItems) {
      let price = validItemsMap.get(req.dishId);
      if (price === undefined) {
        const staticDish = findDish(req.dishId);
        if (staticDish) price = staticDish.price;
      }
      if (price !== undefined && req.qty > 0) {
        itemsToPrice.push({ price, quantity: req.qty });
        if (mongoose.Types.ObjectId.isValid(req.dishId)) {
          validCartItems.push({ menuItemId: req.dishId, quantity: req.qty });
        }
      }
    }

    // Read system settings for GST rate and charges
    const settings = (await SystemSetting.findOne().lean()) as any;
    const taxPercentage = settings?.taxPercentage ?? 5;
    const packagingCharge = settings?.packagingCharge ?? 15;
    const platformFee = settings?.platformFee ?? 5;
    const defaultDeliveryFee = settings?.defaultDeliveryFee ?? 34;
    const freeDeliveryThreshold = settings?.freeDeliveryThreshold ?? 500;

    const discountPercentage = await CouponService.validateCoupon(kitchenId, couponCode);
    const totals = PricingService.calculateTotals(
      itemsToPrice,
      discountPercentage,
      taxPercentage,
      packagingCharge,
      platformFee,
      defaultDeliveryFee,
      freeDeliveryThreshold
    );

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
