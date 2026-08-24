import { connectToDatabase } from "../database/mongoose";
import { MenuItem } from "../models/MenuItem";
import mongoose from "mongoose";

export class MenuService {
  static async getMenuByKitchen(kitchenId: string) {
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(kitchenId);

    const rawItems = await MenuItem.find({
      $or: [
        ...(isObjectId ? [{ kitchenId }] : []),
        { isGlobalMaster: true },
        { kitchenId: null },
      ],
      deletedAt: null,
    })
      .populate("category")
      .lean();

    return rawItems
      .map((item: any) => {
        let finalPrice = item.price;
        let isAvailable = item.isAvailable;
        let isEnabled = true;

        if (item.branchPricing && Array.isArray(item.branchPricing)) {
          const override = item.branchPricing.find(
            (bp: any) => bp.kitchenId?.toString() === kitchenId?.toString()
          );
          if (override) {
            if (override.price !== undefined && override.price !== null) {
              finalPrice = override.price;
            }
            if (override.isAvailable !== undefined) {
              isAvailable = override.isAvailable;
            }
            if (override.isEnabled !== undefined) {
              isEnabled = override.isEnabled;
            }
          }
        }

        if (!isEnabled || !isAvailable) return null;

        return {
          ...item,
          price: finalPrice,
          isAvailable,
        };
      })
      .filter(Boolean);
  }

  static async searchMenu(kitchenId: string, query: string) {
    const allItems = await this.getMenuByKitchen(kitchenId);
    if (!query.trim()) return allItems;

    const q = query.toLowerCase();
    return allItems.filter(
      (item: any) =>
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.category?.name?.toLowerCase().includes(q)
    );
  }
}
