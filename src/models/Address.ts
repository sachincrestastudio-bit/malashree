import { Schema, model, models } from 'mongoose';

const AddressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export const Address = models.Address || model('Address', AddressSchema);
