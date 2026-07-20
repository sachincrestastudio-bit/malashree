import { connectToDatabase } from '../database/mongoose';
import { CartService } from './CartService';
import { OrderService } from './OrderService';
import { OrderNumberService } from './OrderNumberService';
import { AddressService } from './AddressService';
import { Kitchen } from '../models/Kitchen';
import { MenuItem } from '../models/MenuItem';

export class CheckoutService {
  /**
   * Orchestrates the entire checkout flow.
   * 1. Validates the cart and prices.
   * 2. Validates the delivery address.
   * 3. Generates the order snapshots.
   * 4. Saves the order.
   */
  static async processCheckout(
    userId: string,
    kitchenId: string,
    cartItems: { dishId: string; qty: number }[],
    couponCode: string | null,
    addressString: string | undefined,
    paymentMethod: string
  ) {
    await connectToDatabase();

    // 1. Verify kitchen exists and is open
    const kitchen = await Kitchen.findById(kitchenId).lean();
    if (!kitchen) {
      throw new Error('Kitchen not found.');
    }
    // (Assume kitchen is open for now; we could check kitchen.isOpen)

    // 2. Validate Cart and Prices server-side
    if (cartItems.length === 0) {
      throw new Error('Cart is empty.');
    }
    const { totals, validCartItems } = await CartService.calculateCart(kitchenId, cartItems, couponCode);
    if (validCartItems.length === 0) {
      throw new Error('No valid items in cart. Dishes may be unavailable.');
    }

    // 3. Validate Address
    const addressSnapshot = AddressService.validateAndFormat(addressString);
    if (!addressSnapshot) {
      throw new Error('Delivery address is missing or invalid.');
    }

    // 4. Generate Order Snapshots
    // Fetch dish names for the snapshot
    const dishIds = validCartItems.map(i => i.menuItemId);
    const menuItems = await MenuItem.find({ _id: { $in: dishIds } }).lean();
    const itemMap = new Map(menuItems.map(m => [m._id.toString(), { name: m.name, price: m.price }]));

    const orderItemsSnapshot = validCartItems.map(item => {
      const dishDetails = itemMap.get(item.menuItemId.toString());
      return {
        menuItem: item.menuItemId,
        dishName: dishDetails ? dishDetails.name : 'Unknown Dish',
        quantity: item.quantity,
        price: dishDetails ? dishDetails.price : 0,
        specialInstructions: ''
      };
    });

    const orderNumber = OrderNumberService.generate();

    const orderPayload = {
      orderNumber,
      customer: userId,
      kitchen: kitchenId,
      kitchenName: kitchen.name,
      deliveryAddress: addressSnapshot,
      items: orderItemsSnapshot,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      tax: totals.tax,
      discount: totals.discount,
      grandTotal: totals.grandTotal,
      couponCode,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed', // Assuming 'upi'/'card' are pre-paid mock for now
      orderStatus: 'placed',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60000), // ETA 30 mins
      timeline: [{ status: 'placed', time: new Date() }]
    };

    // 5. Create Order
    const newOrder = await OrderService.createOrder(orderPayload);

    // 6. Clear user's DB cart
    await CartService.clearUserCart(userId, kitchenId);

    return newOrder;
  }
}
