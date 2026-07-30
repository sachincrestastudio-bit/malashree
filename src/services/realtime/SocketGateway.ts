/**
 * Provides a safe accessor to the global Socket.IO instance attached via server.js.
 * In a standard Next.js environment, `global.io` is undefined during build or standard `next dev`.
 * This wrapper ensures we don't crash if the socket server isn't running.
 */
export class SocketGateway {
  static get io() {
    return (global as any).io;
  }

  /**
   * Broadcasts to a specific room.
   */
  static emitToRoom(room: string, event: string, payload: any) {
    const io = this.io;
    if (io) {
      io.to(room).emit(event, payload);
    } else {
      console.warn(`[SocketGateway] Emitting to ${room} failed: io instance not found`);
    }
  }

  /**
   * Broadcasts to all connected admins.
   */
  static emitToAdmins(event: string, payload: any) {
    this.emitToRoom("admin", event, payload);
  }

  /**
   * Broadcasts to a specific kitchen.
   */
  static emitToKitchen(kitchenId: string, event: string, payload: any) {
    this.emitToRoom(`kitchen:${kitchenId}`, event, payload);
  }

  /**
   * Broadcasts to a specific customer.
   */
  static emitToCustomer(customerId: string, event: string, payload: any) {
    this.emitToRoom(`customer:${customerId}`, event, payload);
  }

  /**
   * Broadcasts to a specific driver.
   */
  static emitToDriver(driverId: string, event: string, payload: any) {
    this.emitToRoom(`driver:${driverId}`, event, payload);
  }
}
