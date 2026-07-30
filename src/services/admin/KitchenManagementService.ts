import { connectToDatabase } from "../../database/mongoose";
import { Kitchen } from "../../models/Kitchen";
import { logAdminAction } from "../../actions/admin/auth";

export class KitchenManagementService {
  /**
   * Retrieves all kitchens with optional filtering.
   */
  static async getAllKitchens(filters = {}) {
    await connectToDatabase();
    return Kitchen.find(filters).sort({ name: 1 }).lean();
  }

  /**
   * Updates a kitchen's status or settings.
   */
  static async updateKitchen(id: string, updates: any) {
    await connectToDatabase();

    const kitchen = await Kitchen.findById(id);
    if (!kitchen) throw new Error("Kitchen not found");

    const previousValue = kitchen.toObject();

    Object.assign(kitchen, updates);
    await kitchen.save();

    // The caller (Server Action) is responsible for calling logAdminAction,
    // or we can just return the old/new state for the action to log.
    return {
      kitchen: JSON.parse(JSON.stringify(kitchen)),
      previousValue: JSON.parse(JSON.stringify(previousValue)),
    };
  }
}
