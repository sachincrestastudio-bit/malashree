import { Schema, model, models } from 'mongoose';

const PaymentSchema = new Schema({
  transactionId: { type: String, required: true, unique: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  provider: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  method: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
  gatewayResponse: { type: Schema.Types.Mixed },
  refundStatus: { type: String },
}, { timestamps: true });

export const Payment = models.Payment || model('Payment', PaymentSchema);
