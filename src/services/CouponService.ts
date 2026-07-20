import { connectToDatabase } from '../database/mongoose';
import { KitchenOffer } from '../models/KitchenOffer';

export class CouponService {
  /**
   * Validates a coupon code for a specific kitchen and returns its discount configuration.
   */
  static async validateCoupon(kitchenId: string, couponCode: string | null): Promise<number> {
    if (!couponCode) return 0;
    
    await connectToDatabase();
    
    // Check if the kitchen offer exists and is active
    const offer = await KitchenOffer.findOne({
      kitchenId,
      code: { $regex: new RegExp(`^${couponCode}$`, 'i') },
      active: true
    }).lean();

    if (!offer) {
      return 0; // Invalid or inactive coupon
    }

    // Hardcode 10% for now
    return 0.10;
  }
}
