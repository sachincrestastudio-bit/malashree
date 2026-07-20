import { connectToDatabase } from '../database/mongoose';
import { Order } from '../models/Order';

export class OrderService {
  /**
   * Saves the generated order document to the database.
   */
  static async createOrder(orderPayload: any) {
    await connectToDatabase();
    
    const newOrder = new Order(orderPayload);
    await newOrder.save();
    
    return newOrder;
  }
}
