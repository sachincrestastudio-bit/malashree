import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const DriverProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  isOnline: { type: Boolean, default: false },
  currentStatus: { type: String, enum: ['available', 'busy', 'offline', 'on_break'], default: 'offline' },
  
  // GPS Location
  location: {
    lat: { type: Number },
    lng: { type: Number },
    lastUpdated: { type: Date }
  },
  
  // Metrics
  todaysEarnings: { type: Number, default: 0 },
  weeklyEarnings: { type: Number, default: 0 },
  monthlyEarnings: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  averageRating: { type: Number, default: 5.0 },
  
  // Preferences
  vehicleType: { type: String, enum: ['bike', 'scooter', 'car'], default: 'bike' }
}, { timestamps: true });

export const DriverProfile = models.DriverProfile || model('DriverProfile', DriverProfileSchema);
