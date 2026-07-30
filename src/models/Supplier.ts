import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const SupplierSchema = new Schema(
  {
    name: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    gstNumber: { type: String },
    address: { type: String },
    itemsSupplied: [{ type: String }], // SKUs or categories they supply
  },
  { timestamps: true },
);

export const Supplier = models.Supplier || model("Supplier", SupplierSchema);
