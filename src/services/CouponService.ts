import { connectToDatabase } from "../database/mongoose";
import { Coupon } from "../models/Coupon";

export class CouponService {
  /**
   * Validates a coupon code for a specific kitchen and returns its fractional discount multiplier.
   * (e.g. 20% off -> returns 0.20)
   */
  static async validateCoupon(kitchenId: string, couponCode: string | null): Promise<number> {
    if (!couponCode || !couponCode.trim()) return 0;

    await connectToDatabase();

    const cleanCode = couponCode.trim().toUpperCase();

    const coupon = (await Coupon.findOne({
      code: cleanCode,
      deletedAt: null,
    }).lean()) as any;

    if (!coupon) return 0;

    // 1. Check status
    if (coupon.status !== "active") return 0;

    // 2. Check Expiry
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
      return 0;
    }

    // 3. Check Usage Limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return 0;
    }

    // 4. Check Kitchen Restriction
    if (coupon.kitchenRestriction && coupon.kitchenRestriction.length > 0) {
      const allowed = coupon.kitchenRestriction.some(
        (id: any) => id.toString() === kitchenId
      );
      if (!allowed) return 0;
    }

    // Return percentage multiplier (e.g. 20% -> 0.2)
    if (coupon.discountType === "percentage") {
      return Math.min(1, Math.max(0, coupon.discountValue / 100));
    }

    // Fixed amount fallback returned as estimated ratio or handle in PricingService
    return Math.min(1, Math.max(0, coupon.discountValue / 500));
  }
}
