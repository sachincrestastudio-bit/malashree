import { connectToDatabase } from '../database/mongoose';
import { Order } from '../models/Order';
import { StatusTransitionService } from './StatusTransitionService';
import { ETAService } from './ETAService';
import { TimelineService } from './TimelineService';

export class OrderLifecycleService {
  /**
   * Updates an order's status enforcing strict transition rules and creating audit logs.
   * Leverages optimistic concurrency (`__v`) via Mongoose to prevent race conditions.
   */
  static async updateStatus(
    orderId: string,
    kitchenId: string,
    newStatus: string,
    updatedBy: string,
    role: string,
    ipAddress: string,
    remarks?: string
  ) {
    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    // Validate Kitchen Ownership
    if (order.kitchen.toString() !== kitchenId) {
      throw new Error('Unauthorized: Order does not belong to this kitchen');
    }

    const oldStatus = order.orderStatus;

    // Validate Transition
    if (!StatusTransitionService.validateTransition(oldStatus, newStatus, role)) {
      throw new Error(`Invalid status transition from ${oldStatus} to ${newStatus} for role ${role}`);
    }

    // No-op if status is same
    if (oldStatus === newStatus) return order;

    // Update ETAs/Actuals based on status
    if (newStatus === 'accepted') {
      const etas = ETAService.calculateInitialETAs();
      order.estimatedReadyTime = etas.estimatedReadyTime;
      order.estimatedDeliveryTime = etas.estimatedDeliveryTime;
    } else if (newStatus === 'ready') {
      order.actualReadyTime = new Date();
    } else if (newStatus === 'delivered') {
      order.actualDeliveryTime = new Date();
    }

    order.orderStatus = newStatus;
    
    // Add to embedded timeline
    order.timeline.push(
      TimelineService.createTimelineEntry(newStatus, updatedBy, role, remarks)
    );

    // Save order (optimistic concurrency will throw VersionError if document was modified in parallel)
    try {
      await order.save();
    } catch (error: any) {
      if (error.name === 'VersionError') {
        throw new Error('Race condition detected: Order was updated by another process. Please refresh and try again.');
      }
      throw error;
    }

    // Create immutable audit log
    await TimelineService.createAuditLog(
      order._id.toString(),
      'STATUS_CHANGE',
      oldStatus,
      newStatus,
      updatedBy,
      role,
      ipAddress,
      remarks
    );

    // TODO in future phases: Emit notification events here (e.g., NotificationService.emit('ORDER_READY'))

    return order;
  }
}
