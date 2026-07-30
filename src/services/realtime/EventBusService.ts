/**
 * Internal EventBus mapping domain events to Socket broadcasts.
 * Acts as a decoupling layer so OrderLifecycleService doesn't directly import SocketGateway.
 */

import { BroadcastService } from "./BroadcastService";

type EventType =
  | "OrderCreated"
  | "OrderAccepted"
  | "OrderRejected"
  | "PreparationStarted"
  | "OrderReady"
  | "DriverAssigned"
  | "OrderPickedUp"
  | "OutForDelivery"
  | "Delivered"
  | "Cancelled"
  | "MenuAvailabilityChanged"
  | "KitchenStatusChanged";

export class EventBusService {
  /**
   * Publishes an event to the ecosystem.
   * This routes the event to the BroadcastService for WebSocket distribution.
   */
  static publish(event: EventType, payload: any) {
    // In a microservices architecture, this might publish to Redis PubSub/RabbitMQ.
    // Since we are monolithic for now, we directly call the BroadcastService.
    BroadcastService.dispatch(event, payload);
  }
}
