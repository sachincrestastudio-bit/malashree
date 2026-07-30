export class ETAService {
  /**
   * Calculates the initial ETAs when an order is placed or accepted.
   * In a real system, this would query average kitchen prep time, driver availability, etc.
   * For this phase, we use static offsets.
   */
  static calculateInitialETAs() {
    const now = new Date();

    // Assume 20 mins for prep + 10 mins padding
    const estimatedReadyTime = new Date(now.getTime() + 30 * 60000);

    // Assume 15 mins for delivery after ready
    const estimatedDeliveryTime = new Date(estimatedReadyTime.getTime() + 15 * 60000);

    return {
      estimatedReadyTime,
      estimatedDeliveryTime,
    };
  }

  /**
   * Updates ETA based on delays or status changes if needed.
   */
  static updateDeliveryETA(currentDeliveryETA: Date, addedDelayMinutes: number) {
    return new Date(currentDeliveryETA.getTime() + addedDelayMinutes * 60000);
  }
}
