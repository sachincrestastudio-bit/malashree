import { Schema, model, models } from "mongoose";

const DriverSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicle: { type: String },
    license: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }, // [longitude, latitude]
    },
    availability: { type: Boolean, default: true },
    assignedOrders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    rating: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

DriverSchema.index({ location: "2dsphere" });

export const Driver = models.Driver || model("Driver", DriverSchema);
