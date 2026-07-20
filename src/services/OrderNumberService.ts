export class OrderNumberService {
  /**
   * Generates a unique, readable order number (e.g., MAL-8F3A2B)
   */
  static generate(): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MAL-${randomHex}`;
  }
}
