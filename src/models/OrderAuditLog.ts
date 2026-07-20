import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const OrderAuditLogSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  action: { type: String, required: true }, // e.g., 'STATUS_CHANGE', 'CANCELLED'
  oldStatus: { type: String },
  newStatus: { type: String },
  updatedBy: { type: String, required: true }, // User ID or 'system'
  role: { type: String, required: true }, // 'customer', 'kitchen', 'admin', 'system'
  ipAddress: { type: String },
  remarks: { type: String },
}, { timestamps: true, capped: false }); // Capped could be used but standard is fine for 'Never delete logs'

// Index for fast retrieval of a specific order's audit logs
OrderAuditLogSchema.index({ order: 1, createdAt: 1 });

export const OrderAuditLog = models.OrderAuditLog || model('OrderAuditLog', OrderAuditLogSchema);
