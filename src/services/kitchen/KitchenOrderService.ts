import { connectToDatabase } from '../../database/mongoose';
import { OrderLifecycleService } from '../OrderLifecycleService';
import { Order } from '../../models/Order';
import { requireKitchenAccess } from '../../actions/kitchen/auth';

export class KitchenOrderService {
  /**
   * Updates an order status, ensuring the kitchen only modifies its own orders.
   */
  static async updateOrderStatus(orderId: string, newStatus: string) {
    await connectToDatabase();
    const user = await requireKitchenAccess();
    
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    if (order.kitchenId.toString() !== user.kitchenId) {
      throw new Error('Forbidden: Order belongs to a different kitchen');
    }

    // Use the existing Phase 7 lifecycle service for strict validations & audit logging
    const updatedOrder = await OrderLifecycleService.updateOrderStatus(
      orderId, 
      newStatus as any, 
      user.id,
      `Kitchen staff updated status to ${newStatus}`
    );

    // In a real app with EventEmitter, this is where we would emit an event for SSE
    // global.eventEmitter.emit('kitchen_order_update', { kitchenId: user.kitchenId, orderId });

    return JSON.parse(JSON.stringify(updatedOrder));
  }
}
