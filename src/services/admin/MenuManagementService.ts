import { connectToDatabase } from "../../database/mongoose";
import { MenuItem } from "../../models/MenuItem";
import { Category } from "../../models/Category";
import { Kitchen } from "../../models/Kitchen";

export class MenuManagementService {
  /**
   * Retrieves all menu items across all kitchens.
   */
  static async getAllMenuItems(filters = {}) {
    await connectToDatabase();

    // Touch models to prevent tree-shaking which causes MissingSchemaError
    Category.modelName;
    Kitchen.modelName;

    return MenuItem.find(filters)
      .populate("category", "name")
      .populate("kitchenId", "name")
      .sort({ name: 1 })
      .lean();
  }
}
