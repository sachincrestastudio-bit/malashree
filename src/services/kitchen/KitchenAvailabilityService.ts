import { connectToDatabase } from "../../database/mongoose";
import { MenuItem } from "../../models/MenuItem";
import { Category } from "../../models/Category";
import { Kitchen } from "../../models/Kitchen";
import { requireKitchenAccess } from "../../actions/kitchen/auth";
import mongoose from "mongoose";

export class KitchenAvailabilityService {
  /**
   * Retrieves menu items assigned to this kitchen or global master items.
   */
  static async getKitchenMenu(kitchenId: string) {
    await connectToDatabase();

    // Prevent tree-shaking of Mongoose registered schemas
    Category.modelName;
    Kitchen.modelName;

    const isObjectId = mongoose.Types.ObjectId.isValid(kitchenId);
    const targetId = isObjectId ? new mongoose.Types.ObjectId(kitchenId) : kitchenId;

    const items = await MenuItem.find({
      deletedAt: null,
    })
      .populate("category", "name")
      .sort({ name: 1 })
      .lean();

    return JSON.parse(JSON.stringify(items));
  }

  /**
   * Toggles the availability of a specific menu item for this branch.
   */
  static async toggleItemAvailability(itemId: string, isAvailable: boolean) {
    await connectToDatabase();
    const user = await requireKitchenAccess();

    const item = await MenuItem.findById(itemId);
    if (!item) throw new Error("Item not found");

    item.isAvailable = isAvailable;
    await item.save();

    return JSON.parse(JSON.stringify(item));
  }
}
