import { connectToDatabase } from "../../database/mongoose";
import { PurchaseOrder } from "../../models/PurchaseOrder";
import { InventoryService } from "./InventoryService";

export class PurchaseService {
  /**
   * Creates a new purchase order
   */
  static async createPO(supplierId: string, kitchenId: string, items: any[]) {
    await connectToDatabase();

    let totalCost = 0;
    const mappedItems = items.map((item) => {
      const itemTotal = item.quantity * item.costPerUnit;
      totalCost += itemTotal;
      return {
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        costPerUnit: item.costPerUnit,
        totalCost: itemTotal,
      };
    });

    const poNumber = `PO-${Date.now().toString().slice(-6)}`;

    return await PurchaseOrder.create({
      poNumber,
      supplierId,
      kitchenId,
      items: mappedItems,
      totalCost,
    });
  }

  /**
   * Receives a purchase order and updates inventory automatically
   */
  static async receivePO(poId: string, userId: string) {
    await connectToDatabase();

    const po = await PurchaseOrder.findById(poId);
    if (!po) throw new Error("Purchase order not found");
    if (po.status === "received") throw new Error("PO already received");
    if (po.status === "cancelled") throw new Error("Cannot receive cancelled PO");

    // Update inventory for each item
    for (const item of po.items) {
      await InventoryService.adjustStock(
        item.ingredientId.toString(),
        po.kitchenId.toString(),
        item.quantity,
        "purchase",
        userId,
        `Received PO: ${po.poNumber}`,
        po.poNumber,
      );
    }

    po.status = "received";
    po.receivedAt = new Date();
    await po.save();

    return po;
  }
}
