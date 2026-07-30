import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const KitchenOfferSchema = new Schema(
  {
    kitchenId: { type: Schema.Types.ObjectId, ref: "Kitchen", required: true },
    code: { type: String, required: true },
    title: { type: String, required: true },
    sub: { type: String },
    active: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

KitchenOfferSchema.index({ kitchenId: 1 });
KitchenOfferSchema.index({ code: 1 });

export const KitchenOffer = models.KitchenOffer || model("KitchenOffer", KitchenOfferSchema);
