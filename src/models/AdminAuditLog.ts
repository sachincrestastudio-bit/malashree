import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const AdminAuditLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g., 'CREATE_KITCHEN', 'UPDATE_MENU'
    entityType: { type: String, required: true }, // e.g., 'Kitchen', 'MenuItem'
    entityId: { type: String },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    remarks: { type: String },
  },
  { timestamps: true },
);

AdminAuditLogSchema.index({ adminId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ entityType: 1, entityId: 1 });

export const AdminAuditLog = models.AdminAuditLog || model("AdminAuditLog", AdminAuditLogSchema);
