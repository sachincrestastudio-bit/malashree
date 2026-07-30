import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "admin", "kitchen_manager", "driver"],
      default: "customer",
    },
    profileImage: { type: String },
    savedAddresses: [{ type: Schema.Types.ObjectId, ref: "Address" }],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "MenuItem" }],
    loyaltyPoints: { type: Number, default: 0 },
    assignedKitchen: { type: Schema.Types.ObjectId, ref: "Kitchen" },
    preferences: { type: Schema.Types.Mixed },
    notificationSettings: { type: Schema.Types.Mixed },
    lastLogin: { type: Date },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

UserSchema.index({ email: 1 });

export const User = models.User || model("User", UserSchema);
