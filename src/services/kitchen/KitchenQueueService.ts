import { connectToDatabase } from "../../database/mongoose";
import { Order } from "../../models/Order";
import { Kitchen } from "../../models/Kitchen";
import mongoose from "mongoose";

export class KitchenQueueService {
  /**
   * Retrieves the live order queue for a specific kitchen.
   */
  static async getLiveQueue(kitchenId: string) {
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(kitchenId);
    const kitchen = isObjectId
      ? await Kitchen.findById(kitchenId).lean()
      : await Kitchen.findOne({ code: kitchenId }).lean();

    const targetKitchenId = kitchen ? (kitchen as any)._id : (isObjectId ? new mongoose.Types.ObjectId(kitchenId) : kitchenId);

    const kitchenMatch = {
      $or: [
        { kitchen: targetKitchenId },
        { kitchenId: targetKitchenId },
        { kitchenName: kitchen ? (kitchen as any).name : kitchenId },
      ],
    };

    // Fetch active orders that the kitchen needs to look at right now
    const orders = await Order.find({
      ...kitchenMatch,
      orderStatus: { $in: ["placed", "accepted", "preparing", "ready"] },
    })
      .sort({ createdAt: 1 }) // oldest first (FIFO)
      .populate("customer", "name phone")
      .lean();

    return JSON.parse(JSON.stringify(orders)).map((t: any) => ({
      ...t,
      items: (t.items || []).map((i: any) => ({
        ...i,
        name: i.dishName || i.name || i.dish?.name || "Dish Item",
      })),
    }));
  }

  /**
   * Retrieves paginated order history for the kitchen.
   */
  static async getHistory(kitchenId: string, page = 1, limit = 50) {
    await connectToDatabase();

    const skip = (page - 1) * limit;
    const isObjectId = mongoose.Types.ObjectId.isValid(kitchenId);
    const kitchen = isObjectId
      ? await Kitchen.findById(kitchenId).lean()
      : await Kitchen.findOne({ code: kitchenId }).lean();

    const targetKitchenId = kitchen ? (kitchen as any)._id : (isObjectId ? new mongoose.Types.ObjectId(kitchenId) : kitchenId);

    const kitchenMatch = {
      $or: [
        { kitchen: targetKitchenId },
        { kitchenId: targetKitchenId },
        { kitchenName: kitchen ? (kitchen as any).name : kitchenId },
      ],
    };

    const orders = await Order.find({
      ...kitchenMatch,
      orderStatus: { $in: ["delivered", "cancelled"] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "name phone")
      .lean();

    const total = await Order.countDocuments({
      ...kitchenMatch,
      orderStatus: { $in: ["delivered", "cancelled"] },
    });

    return {
      orders: JSON.parse(JSON.stringify(orders)),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    };
  }
}
