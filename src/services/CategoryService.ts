import { connectToDatabase } from '../database/mongoose';
import { Category } from '../models/Category';

export class CategoryService {
  static async getCategoriesByKitchen(kitchenId: string) {
    await connectToDatabase();
    return await Category.find({ kitchenId }).lean();
  }
}
