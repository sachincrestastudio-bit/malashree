import { connectToDatabase } from '../database/mongoose';
import { MenuItem } from '../models/MenuItem';

export class MenuService {
  static async getMenuByKitchen(kitchenId: string) {
    await connectToDatabase();
    return await MenuItem.find({ kitchenId, isAvailable: true })
      .populate('category')
      .lean();
  }

  static async searchMenu(kitchenId: string, query: string) {
    await connectToDatabase();
    return await MenuItem.find({
      kitchenId,
      isAvailable: true,
      $text: { $search: query }
    }).populate('category').lean();
  }
}
