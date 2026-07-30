import { SocketGateway } from "./SocketGateway";

export class DriverLocationService {
  /**
   * Processes high-frequency GPS pings from a driver's mobile device.
   */
  static handleLocationUpdate(
    driverId: string,
    location: { lat: number; lng: number; heading?: number },
  ) {
    // We broadcast this exclusively to the customer and kitchen associated with active orders for this driver.
    // In a real application, we would lookup the active orders here, but we can emit to a driver-specific tracking room
    // that customers and kitchens temporarily join when an order is out for delivery.

    // Broadcast to tracking room (e.g. tracking:driverId)
    SocketGateway.emitToRoom(`tracking:${driverId}`, "LocationUpdate", {
      driverId,
      location,
      timestamp: new Date(),
    });

    // Also broadcast to Admin map
    SocketGateway.emitToAdmins("DriverLocationUpdate", { driverId, location });
  }
}
