export class PricingService {
  /**
   * Calculates all cart totals based on item prices and an optional discount amount.
   */
  static calculateTotals(
    items: { price: number; quantity: number }[],
    discountPercentage: number = 0,
  ) {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Apply discount (e.g., 0.1 for 10% off)
    const discount = Math.round(subtotal * discountPercentage);

    const subtotalAfterDiscount = subtotal - discount;

    // GST 5%
    const tax = Math.round(subtotalAfterDiscount * 0.05);

    // Delivery fee: Free if subtotal > 499, otherwise 39
    const deliveryFee = subtotal > 0 ? (subtotal > 499 ? 0 : 39) : 0;

    const grandTotal = subtotalAfterDiscount + tax + deliveryFee;

    return {
      subtotal,
      discount,
      tax,
      deliveryFee,
      grandTotal,
    };
  }
}
