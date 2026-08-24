export class PricingService {
  /**
   * Calculates all cart totals based on item prices, discount, and admin dynamic GST rate.
   */
  static calculateTotals(
    items: { price: number; quantity: number }[],
    discountPercentage: number = 0,
    taxPercentage: number = 5,
    packagingCharge: number = 15,
    platformFee: number = 5,
    defaultDeliveryFee: number = 34,
    freeDeliveryThreshold: number = 500,
  ) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const discount = Math.round(subtotal * discountPercentage);
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);

    // GST calculated dynamically from admin settings
    const tax = subtotal > 0 ? parseFloat(((subtotalAfterDiscount * taxPercentage) / 100).toFixed(2)) : 0;

    // Delivery fee
    const deliveryFee = subtotal > 0 ? (subtotal >= freeDeliveryThreshold ? 0 : defaultDeliveryFee) : 0;
    const packaging = subtotal > 0 ? packagingCharge : 0;
    const platform = subtotal > 0 ? platformFee : 0;

    const grandTotal = subtotal > 0
      ? parseFloat((subtotalAfterDiscount + packaging + platform + deliveryFee + tax).toFixed(2))
      : 0;

    return {
      subtotal,
      discount,
      tax,
      taxPercentage,
      packagingCharge: packaging,
      platformFee: platform,
      deliveryFee,
      grandTotal,
    };
  }
}
