import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const DeliveryAuditLogSchema = new Schema({
  driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  action: { type: String, required: true },
  previousStatus: { type: String },
  newStatus: { type: String },
  gpsLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  reason: { type: String }
}, { timestamps: true });

DeliveryAuditLogSchema.index({ driverId: 1 });
DeliveryAuditLogSchema.index({ orderId: 1 });
DeliveryAuditLogSchema.index({ createdAt: -1 });

export const DeliveryAuditLog = models.DeliveryAuditLog || model('DeliveryAuditLog', DeliveryAuditLogSchema);
