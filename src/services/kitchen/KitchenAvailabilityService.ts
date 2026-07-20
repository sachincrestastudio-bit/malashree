import { connectToDatabase } from '../../database/mongoose';
import { MenuItem } from '../../models/MenuItem';
import { requireKitchenAccess } from '../../actions/kitchen/auth';

export class KitchenAvailabilityService {
  /**
   * Retrieves menu items assigned to this kitchen.
   */
  static async getKitchenMenu(kitchenId: string) {
    await connectToDatabase();
    
    // We only fetch items specifically linked to this kitchenId
    const items = await MenuItem.find({ kitchenId })
      .populate('category', 'name')
      .sort({ name: 1 })
      .lean();

    return JSON.parse(JSON.stringify(items));
  }

  /**
   * Toggles the availability of a specific menu item.
   */
  static async toggleItemAvailability(itemId: string, isAvailable: boolean) {
    await connectToDatabase();
    const user = await requireKitchenAccess();

    const item = await MenuItem.findById(itemId);
    if (!item) throw new Error('Item not found');

    if (item.kitchenId.toString() !== user.kitchenId) {
      throw new Error('Forbidden: Item belongs to a different kitchen');
    }

    item.isAvailable = isAvailable;
    await item.save();

    return JSON.parse(JSON.stringify(item));
  }
}
