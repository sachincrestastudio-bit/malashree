import { connectToDatabase } from "../database/mongoose";
import { MenuItem } from "../models/MenuItem";
import { Kitchen } from "../models/Kitchen";
import { Category } from "../models/Category";
import mongoose from "mongoose";

export class MenuService {
  static async getMenuByKitchen(kitchenIdentifier?: string) {
    await connectToDatabase();

    // Ensure models are registered for populate
    Category.modelName;
    Kitchen.modelName;
    MenuItem.modelName;

    let kitchenIdStr: string | null = null;

    if (kitchenIdentifier) {
      const isObjectId = mongoose.Types.ObjectId.isValid(kitchenIdentifier);
      const kitchen = (await Kitchen.findOne({
        $or: [
          ...(isObjectId ? [{ _id: kitchenIdentifier }] : []),
          { code: new RegExp(`^${kitchenIdentifier}$`, "i") },
        ],
        deletedAt: null,
      }).lean()) as any;

      if (kitchen) {
        kitchenIdStr = kitchen._id.toString();
      } else if (isObjectId) {
        kitchenIdStr = kitchenIdentifier;
      }
    }

    // If no kitchen specified or found, get the first active kitchen
    if (!kitchenIdStr) {
      const defaultKitchen = (await Kitchen.findOne({
        status: "active",
        deletedAt: null,
      }).lean()) as any;
      if (defaultKitchen) {
        kitchenIdStr = defaultKitchen._id.toString();
      }
    }

    // Fetch ALL dishes from the universal database
    const rawItems = await MenuItem.find({
      deletedAt: null,
    })
      .populate({ path: "category", model: Category })
      .sort({ name: 1 })
      .lean();

    return rawItems
      .map((item: any) => {
        let finalPrice = Number(item.price) || 0;
        let isAvailable = item.isAvailable !== undefined ? item.isAvailable : true;
        let isEnabled = true;

        if (kitchenIdStr && item.branchPricing && Array.isArray(item.branchPricing)) {
          const override = item.branchPricing.find(
            (bp: any) => bp.kitchenId?.toString() === kitchenIdStr
          );
          if (override) {
            if (override.price !== undefined && override.price !== null) {
              finalPrice = Number(override.price) || finalPrice;
            }
            if (override.isAvailable !== undefined) {
              isAvailable = override.isAvailable;
            }
            if (override.isEnabled !== undefined) {
              isEnabled = override.isEnabled;
            }
          }
        }

        // If dish is explicitly disabled for this branch, don't show on menu
        if (!isEnabled || !isAvailable) return null;

        const catName =
          (typeof item.category === "object" && item.category?.name) ||
          (typeof item.category === "string" && item.category.trim() ? item.category.trim() : "Main Course");

        return {
          id: item._id.toString(),
          name: item.name,
          desc: item.description || "",
          price: finalPrice,
          category: catName,
          tag: item.tags?.[0],
          rating: item.rating || 4.8,
          reviews: 120,
          veg: item.isVeg !== undefined ? item.isVeg : true,
          spice: 1,
          time: "25 mins",
          image:
            item.images?.[0] ||
            "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
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
        item.desc?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q)
    );
  }
}
