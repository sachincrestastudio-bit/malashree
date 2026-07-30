import { connectToDatabase } from "../../database/mongoose";
import { Supplier } from "../../models/Supplier";

export class SupplierService {
  static async getAllSuppliers() {
    await connectToDatabase();
    return await Supplier.find().sort({ name: 1 }).lean();
  }

  static async getSupplierById(id: string) {
    await connectToDatabase();
    return await Supplier.findById(id).lean();
  }
}
