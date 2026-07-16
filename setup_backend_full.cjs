const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');

const files = {
  // --- 1. Database Connection ---
  'database/mongoose.ts': `import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};
`,

  // --- 2. Security & Auth Utilities ---
  'utils/security.ts': `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (payload: object, expiresIn: string = '7d'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
`,

  'middleware/permissions.ts': `import { NextResponse } from 'next/server';

export const requireRole = (role: string) => {
  return async (req: Request) => {
    // Placeholder logic for middleware
    return NextResponse.next();
  };
};
`,

  // --- 3. Error & Response Helpers ---
  'utils/error.ts': `export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}
`,

  'utils/api-response.ts': `import { NextResponse } from 'next/server';

export const successResponse = (data: any, message = 'Success', statusCode = 200) => {
  return NextResponse.json({ success: true, message, data }, { status: statusCode });
};

export const errorResponse = (message = 'Internal Server Error', statusCode = 500) => {
  return NextResponse.json({ success: false, error: message }, { status: statusCode });
};

export const paginationMeta = (total: number, page: number, limit: number) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
`,

  // --- 4. Zod Validation Schemas ---
  'schemas/auth.ts': `import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
});
`,
  'schemas/address.ts': `import { z } from 'zod';

export const AddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().default('India'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
`,
  'schemas/kitchen.ts': `import { z } from 'zod';

export const KitchenSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  status: z.enum(['active', 'inactive', 'maintenance']),
});
`,
  'schemas/menu.ts': `import { z } from 'zod';

export const MenuItemSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
  category: z.string(),
  isVeg: z.boolean(),
});
`,
  'schemas/order.ts': `import { z } from 'zod';

export const OrderSchema = z.object({
  kitchenId: z.string(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive()
  })).min(1),
});
`,

  // --- 5. Mongoose Models ---
  'models/User.ts': `import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'kitchen_manager', 'driver'], default: 'customer' },
  profileImage: { type: String },
  savedAddresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'MenuItem' }],
  loyaltyPoints: { type: Number, default: 0 },
  assignedKitchen: { type: Schema.Types.ObjectId, ref: 'Kitchen' },
  preferences: { type: Schema.Types.Mixed },
  notificationSettings: { type: Schema.Types.Mixed },
  lastLogin: { type: Date },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

UserSchema.index({ email: 1 });

export const User = models.User || model('User', UserSchema);
`,
  
  'models/Kitchen.ts': `import { Schema, model, models } from 'mongoose';

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
`,

  'models/Category.ts': `import { Schema, model, models } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export const Category = models.Category || model('Category', CategorySchema);
`,

  'models/MenuItem.ts': `import { Schema, model, models } from 'mongoose';

const MenuItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  kitchenAvailability: [{ type: Schema.Types.ObjectId, ref: 'Kitchen' }],
  isVeg: { type: Boolean, default: true },
  spiceLevel: { type: Number, min: 0, max: 3, default: 0 },
  preparationTime: { type: Number, default: 15 },
  ingredients: [{ type: String }],
  nutrition: { type: Schema.Types.Mixed },
  tags: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ name: 'text' });

export const MenuItem = models.MenuItem || model('MenuItem', MenuItemSchema);
`,

  'models/Order.ts': `import { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  kitchen: { type: Schema.Types.ObjectId, ref: 'Kitchen', required: true },
  deliveryAddress: { type: Schema.Types.ObjectId, ref: 'Address' },
  items: [{
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    specialInstructions: { type: String }
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'cash', 'upi'], default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  orderStatus: { type: String, enum: ['placed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'], default: 'placed' },
  timeline: [{
    status: { type: String },
    time: { type: Date, default: Date.now }
  }],
  estimatedDeliveryTime: { type: Date },
  specialInstructions: { type: String },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

OrderSchema.index({ customer: 1 });
OrderSchema.index({ kitchen: 1 });
OrderSchema.index({ orderNumber: 1 });

export const Order = models.Order || model('Order', OrderSchema);
`,

  'models/Address.ts': `import { Schema, model, models } from 'mongoose';

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
`,

  'models/Coupon.ts': `import { Schema, model, models } from 'mongoose';

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minimumOrder: { type: Number, default: 0 },
  maximumDiscount: { type: Number },
  expiry: { type: Date, required: true },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  kitchenRestriction: [{ type: Schema.Types.ObjectId, ref: 'Kitchen' }],
  status: { type: String, enum: ['active', 'expired', 'disabled'], default: 'active' },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export const Coupon = models.Coupon || model('Coupon', CouponSchema);
`,

  'models/Review.ts': `import { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  images: [{ type: String }],
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export const Review = models.Review || model('Review', ReviewSchema);
`,

  'models/Notification.ts': `import { Schema, model, models } from 'mongoose';

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'promo', 'system'], default: 'system' },
  read: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

export const Notification = models.Notification || model('Notification', NotificationSchema);
`,

  'models/Driver.ts': `import { Schema, model, models } from 'mongoose';

const DriverSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  vehicle: { type: String },
  license: { type: String },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  },
  availability: { type: Boolean, default: true },
  assignedOrders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
  rating: { type: Number, default: 0 },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

DriverSchema.index({ location: '2dsphere' });

export const Driver = models.Driver || model('Driver', DriverSchema);
`,

  'models/Payment.ts': `import { Schema, model, models } from 'mongoose';

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
`,


  // --- 6. Repository Pattern Scaffolding ---
  ...['User', 'Kitchen', 'Order', 'Menu', 'Coupon', 'Payment', 'Review'].reduce((acc, name) => {
    acc[`repositories/${name}Repository.ts`] = `
export class ${name}Repository {
  async findById(id: string) {
    // Scaffold
    return null;
  }
  
  async create(data: any) {
    // Scaffold
    return null;
  }

  async update(id: string, data: any) {
    // Scaffold
    return null;
  }

  async delete(id: string) {
    // Scaffold
    return null;
  }
}
`;
    return acc;
  }, {}),

  // --- 7. Service Pattern Scaffolding ---
  ...['Auth', 'Menu', 'Kitchen', 'Order', 'Coupon', 'Payment', 'Notification', 'Review', 'User'].reduce((acc, name) => {
    acc[`services/${name}Service.ts`] = `
export class ${name}Service {
  async handleBusinessLogic() {
    // Scaffold
    return null;
  }
}
`;
    return acc;
  }, {}),

};

// Write Files
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(src, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

console.log('Advanced Backend Architecture generated successfully!');
