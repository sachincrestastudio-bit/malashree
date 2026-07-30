const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "src");

const files = {
  // Config & Setup
  "database/mongoose.ts": `import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing');

  cached.promise = cached.promise || mongoose.connect(MONGODB_URI, { dbName: 'malashree', bufferCommands: false });
  cached.conn = await cached.promise;
  return cached.conn;
};
`,
  "config/env.ts": `export const env = {
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV,
};
`,
  "config/global.ts": `export const config = {
  appName: 'Malashree',
  apiPrefix: '/api',
};
`,
  "lib/server-action-helpers.ts": `export const withActionAuth = async (action: Function) => {
  // Placeholder for authenticated server actions
  return action();
};
`,
  "lib/api-helpers.ts": `export const parseRequestBody = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
};
`,
  "lib/error-helpers.ts": `export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}
`,
  "lib/response-helpers.ts": `import { NextResponse } from 'next/server';

export const successResponse = (data: any, status = 200) => NextResponse.json({ success: true, data }, { status });
export const errorResponse = (message: string, status = 400) => NextResponse.json({ success: false, error: message }, { status });
`,
  "lib/validation-helpers.ts": `import { z } from 'zod';

export const validate = <T>(schema: z.Schema<T>, data: unknown) => {
  return schema.safeParse(data);
};
`,
  "lib/logger.ts": `export const logger = {
  info: (msg: string, ...args: any[]) => console.log(\`[INFO] \${msg}\`, ...args),
  error: (msg: string, ...args: any[]) => console.error(\`[ERROR] \${msg}\`, ...args),
};
`,

  // Stores
  "store/userStore.ts": `import { create } from 'zustand';

interface UserState {
  user: null;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
}));
`,
  "store/cartStore.ts": `import { create } from 'zustand';

interface CartState {
  items: any[];
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
}));
`,
  "store/kitchenStore.ts": `import { create } from 'zustand';

interface KitchenState {
  activeKitchen: null;
}

export const useKitchenStore = create<KitchenState>((set) => ({
  activeKitchen: null,
}));
`,
  "store/locationStore.ts": `import { create } from 'zustand';

interface LocationState {
  location: null;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
}));
`,
  "store/themeStore.ts": `import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
}));
`,
  "store/notificationStore.ts": `import { create } from 'zustand';

interface NotificationState {
  notifications: any[];
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
}));
`,

  // Models
  ...[
    "User",
    "Kitchen",
    "MenuItem",
    "Category",
    "Order",
    "OrderItem",
    "Address",
    "Coupon",
    "Review",
    "Notification",
    "Driver",
    "Payment",
    "Wishlist",
  ].reduce((acc, name) => {
    acc[`models/${name}.ts`] =
      `import { Schema, model, models } from 'mongoose';\n\nconst ${name}Schema = new Schema({}, { timestamps: true });\n\nexport const ${name} = models.${name} || model('${name}', ${name}Schema);\n`;
    return acc;
  }, {}),

  // Schemas
  ...["user", "login", "register", "address", "order", "coupon", "menu", "kitchen"].reduce(
    (acc, name) => {
      acc[`schemas/${name}.ts`] =
        `import { z } from 'zod';\n\nexport const ${name}Schema = z.object({});\n`;
      return acc;
    },
    {},
  ),

  // Utilities
  "utils/formatters.ts": `export const formatCurrency = (amount: number) => \`₹\${amount.toFixed(2)}\`;
export const formatDistance = (meters: number) => \`\${(meters / 1000).toFixed(1)} km\`;
export const formatTime = (date: Date) => date.toLocaleTimeString();
export const formatDate = (date: Date) => date.toLocaleDateString();
`,
  "utils/slug.ts": `export const generateSlug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');\n`,
  "utils/image.ts": `export const getImageUrl = (path: string) => path;\n`,
  "utils/api-response.ts": `export const apiResponse = () => {};\n`,
  "utils/error.ts": `export const handleError = (err: any) => console.error(err);\n`,

  // Types
  ...[
    "user",
    "order",
    "menu",
    "kitchen",
    "cart",
    "address",
    "payment",
    "coupon",
    "driver",
    "review",
  ].reduce((acc, name) => {
    const capitalize = name.charAt(0).toUpperCase() + name.slice(1);
    acc[`types/${name}.d.ts`] = `export interface I${capitalize} {}\n`;
    return acc;
  }, {}),
};

// Write API Routes
const apiRoutes = [
  "auth",
  "menu",
  "orders",
  "checkout",
  "kitchen",
  "payment",
  "review",
  "offers",
  "notifications",
];
apiRoutes.forEach((route) => {
  const dirPath = path.join(src, "app", "api", route);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(
    path.join(dirPath, "route.ts"),
    `import { NextResponse } from 'next/server';\n\nexport async function GET() {\n  return NextResponse.json({ message: '${route} API placeholder' });\n}\n`,
  );
});

// Write Files
for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(src, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

console.log("Backend architecture generated successfully!");
