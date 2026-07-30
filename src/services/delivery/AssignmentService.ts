import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { DeliveryAuditLog } from "../../models/DeliveryAuditLog";
import { EventBusService } from "../realtime/EventBusService";

export class AssignmentService {
  /**
   * Fetches the orders currently assigned to the driver that are not yet completed.
   */
  static async getActiveAssignments(driverId: string) {
    await connectToDatabase();

    const orders = await Order.find({
      driverId,
      orderStatus: { $in: ["ready", "out_for_delivery"] },
    })
      .sort({ createdAt: 1 })
      .populate("customer", "name phone")
      .populate("kitchen", "name location")
      .lean();

    return JSON.parse(JSON.stringify(orders));
  }

  /**
   * Example of how a driver accepts an order that is broadcasting to nearby drivers.
   * In a real system, the order would be in a "looking_for_driver" state.
   */
  static async acceptDelivery(orderId: string, driverId: string, lat: number, lng: number) {
    await connectToDatabase();

    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (order.driverId && order.driverId.toString() !== driverId) {
      throw new Error("Order already assigned to another driver");
    }

    order.driverId = driverId;
    await order.save();

    EventBusService.publish("DriverAssigned", {
      order: JSON.parse(JSON.stringify(order)),
      customerId: order.customer.toString(),
      kitchenId: order.kitchen.toString(),
      driverId,
    });

    await DeliveryAuditLog.create({
      driverId,
      orderId,
      action: "ACCEPTED_DELIVERY",
      gpsLocation: { lat, lng },
    });

    return JSON.parse(JSON.stringify(order));
  }

  /**
   * Mark order out for delivery (Picked Up)
   */
  static async startDelivery(orderId: string, driverId: string, lat: number, lng: number) {
    await connectToDatabase();

    const order = await Order.findOne({ _id: orderId, driverId });
    if (!order) throw new Error("Order not found or not assigned to you");

    const previousStatus = order.orderStatus;
    order.orderStatus = "out_for_delivery";
    order.pickedUpTime = new Date();
    await order.save();

    EventBusService.publish("OutForDelivery", {
      order: JSON.parse(JSON.stringify(order)),
      customerId: order.customer.toString(),
      kitchenId: order.kitchen.toString(),
      driverId,
    });

    await DeliveryAuditLog.create({
      driverId,
      orderId,
      action: "PICKED_UP",
      previousStatus,
      newStatus: "out_for_delivery",
      gpsLocation: { lat, lng },
    });

    return JSON.parse(JSON.stringify(order));
  }
}
