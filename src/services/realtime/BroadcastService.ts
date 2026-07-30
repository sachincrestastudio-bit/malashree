import { SocketGateway } from "./SocketGateway";

export class BroadcastService {
  /**
   * Dispatches domain events to the appropriate Socket.IO rooms.
   */
  static dispatch(event: string, payload: any) {
    const { order, customerId, kitchenId, driverId } = payload;

    // Always notify Admins of every state change for the live dashboard
    SocketGateway.emitToAdmins("SystemEvent", { event, payload });

    switch (event) {
      case "OrderCreated":
        // Notify the kitchen
        if (kitchenId) SocketGateway.emitToKitchen(kitchenId, "NewOrder", order);
        break;

      case "OrderAccepted":
      case "PreparationStarted":
        // Notify customer
        if (customerId) SocketGateway.emitToCustomer(customerId, "OrderStatusUpdated", order);
        if (kitchenId) SocketGateway.emitToKitchen(kitchenId, "OrderQueueUpdated", order);
        break;

      case "OrderReady":
        // Notify customer & alert nearby drivers (in this phase, we target a specific driver)
        if (customerId) SocketGateway.emitToCustomer(customerId, "OrderStatusUpdated", order);
        if (kitchenId) SocketGateway.emitToKitchen(kitchenId, "OrderQueueUpdated", order);
        if (driverId) SocketGateway.emitToDriver(driverId, "NewAssignment", order);
        break;

      case "DriverAssigned":
        // Notify Kitchen and Customer
        if (customerId) SocketGateway.emitToCustomer(customerId, "DriverAssigned", order);
        if (kitchenId) SocketGateway.emitToKitchen(kitchenId, "DriverAssigned", order);
        break;

      case "OrderPickedUp":
      case "OutForDelivery":
        if (customerId) SocketGateway.emitToCustomer(customerId, "OutForDelivery", order);
        if (kitchenId) SocketGateway.emitToKitchen(kitchenId, "OrderPickedUp", order);
        if (driverId) SocketGateway.emitToDriver(driverId, "ActiveDeliveryUpdated", order);
        break;

      case "Delivered":
        if (customerId) SocketGateway.emitToCustomer(customerId, "Delivered", order);
        if (kitchenId) SocketGateway.emitToKitchen(kitchenId, "OrderCompleted", order);
        if (driverId) SocketGateway.emitToDriver(driverId, "DeliveryCompleted", order);
        break;

      case "Cancelled":
        if (customerId) SocketGateway.emitToCustomer(customerId, "OrderCancelled", order);
        if (kitchenId) SocketGateway.emitToKitchen(kitchenId, "OrderCancelled", order);
        if (driverId) SocketGateway.emitToDriver(driverId, "DeliveryCancelled", order);
        break;

      case "MenuAvailabilityChanged":
        if (kitchenId) SocketGateway.emitToKitchen(kitchenId, "MenuUpdated", payload);
        break;

      default:
        console.warn(`[BroadcastService] Unhandled event type: ${event}`);
    }
  }
}
