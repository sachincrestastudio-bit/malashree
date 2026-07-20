'use server';

import { OrderLifecycleService } from '../services/OrderLifecycleService';
import { KitchenWorkflowService } from '../services/KitchenWorkflowService';
import { getCurrentUser } from './user';
import { getAssignedKitchenId } from './kitchen';

/**
 * Updates the status of an order.
 * Ensures the user belongs to the kitchen that owns the order.
 */
export const updateOrderStatus = async (orderId: string, newStatus: string, remarks?: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    // In a real application, you would ensure `user` has 'kitchen' or 'admin' role.
    // For this prototype, we'll verify they are assigned to the kitchen.
    const kitchenId = await getAssignedKitchenId();
    if (!kitchenId) return { success: false, error: 'Kitchen assignment missing' };

    const role = user.role || 'kitchen'; // Treat as kitchen staff for this lifecycle update
    // We can't access req.ip in Next.js Server Actions directly easily without headers, 
    // but we can pass 'system' or a placeholder for IP.
    const ipAddress = '0.0.0.0'; 

    const order = await OrderLifecycleService.updateStatus(
      orderId,
      kitchenId,
      newStatus,
      user.id,
      role,
      ipAddress,
      remarks
    );

    return { success: true, orderStatus: order.orderStatus };
  } catch (error: any) {
    console.error('updateOrderStatus error:', error);
    return { success: false, error: error.message || 'Failed to update order status' };
  }
};

/**
 * Cancels an order.
 */
export const cancelOrder = async (orderId: string, remarks?: string) => {
  return updateOrderStatus(orderId, 'cancelled', remarks || 'Cancelled by user');
};

/**
 * Retrieves active orders for the currently assigned kitchen.
 */
export const getKitchenOrders = async () => {
  try {
    const kitchenId = await getAssignedKitchenId();
    if (!kitchenId) return { success: false, orders: [] };

    const orders = await KitchenWorkflowService.getActiveOrders(kitchenId);
    
    // Server actions must return plain objects
    return { success: true, orders: JSON.parse(JSON.stringify(orders)) };
  } catch (error: any) {
    console.error('getKitchenOrders error:', error);
    return { success: false, error: error.message };
  }
};
