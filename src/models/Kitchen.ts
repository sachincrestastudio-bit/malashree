import { Schema, model, models } from 'mongoose';

const KitchenSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  address: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  deliveryRadius: { type: Number, default: 5000 }, // in meters
  preparationTime: { type: Number, default: 30 }, // in minutes
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  operatingHours: { type: Schema.Types.Mixed },
  manager: { type: Schema.Types.ObjectId, ref: 'User' },
  menuAvailability: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

KitchenSchema.index({ location: '2dsphere' });
KitchenSchema.index({ code: 1 });

export const Kitchen = models.Kitchen || model('Kitchen', KitchenSchema);
