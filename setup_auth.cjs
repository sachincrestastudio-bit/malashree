const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src');

const files = {
  'utils/security.ts': `
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SALT_ROUNDS = 10;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = async (payload: any, expiresIn: string = '7d'): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<any | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
};

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
};

export const getAuthCookie = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
};

export const clearAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
};
`,

  'middleware.ts': `
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './utils/security';

const protectedRoutes = ['/profile', '/checkout', '/orders', '/wishlist', '/admin'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  if (isProtected) {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (path === '/login' || path === '/register') {
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/profile', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
`,

  'actions/auth.ts': `
'use server';

import { connectToDatabase } from '../database/mongoose';
import { User } from '../models/User';
import { hashPassword, verifyPassword, generateToken, setAuthCookie, clearAuthCookie } from '../utils/security';
import { LoginSchema, RegisterSchema } from '../schemas/auth';
import { revalidatePath } from 'next/cache';

export const registerUser = async (formData: any) => {
  try {
    const validated = RegisterSchema.safeParse(formData);
    
    if (!validated.success) {
      return { error: 'Invalid input data. Ensure password is at least 6 characters long.' };
    }

    const { name, email, phone, password } = validated.data;

    await connectToDatabase();

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return { error: 'Email or phone already exists.' };
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: 'customer',
      address: formData.address || '',
    });

    const token = await generateToken({ id: user._id, role: user.role, email: user.email });
    await setAuthCookie(token);

    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    console.error('Registration Error:', error);
    return { error: 'Internal Server Error' };
  }
};

export const loginUser = async (formData: any) => {
  try {
    const validated = LoginSchema.safeParse(formData);
    
    if (!validated.success) {
      return { error: 'Invalid email or password format.' };
    }

    const { email, password } = validated.data;

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return { error: 'Invalid credentials.' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid credentials.' };
    }
    
    user.lastLogin = new Date();
    await user.save();

    const token = await generateToken({ id: user._id, role: user.role, email: user.email });
    await setAuthCookie(token);

    revalidatePath('/profile');
    return { success: true };
  } catch (error: any) {
    console.error('Login Error:', error);
    return { error: 'Internal Server Error' };
  }
};

export const logoutUser = async () => {
  await clearAuthCookie();
  revalidatePath('/');
};
`,

  'actions/user.ts': `
'use server';

import { connectToDatabase } from '../database/mongoose';
import { User } from '../models/User';
import { getAuthCookie, verifyToken } from '../utils/security';

export const getCurrentUser = async () => {
  try {
    const token = await getAuthCookie();
    if (!token) return null;
    
    const payload = await verifyToken(token);
    if (!payload) return null;
    
    await connectToDatabase();
    const user = await User.findById(payload.id).lean() as any;
    if (!user) return null;
    
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      joinedDate: user.createdAt,
      lastLogin: user.lastLogin,
      loyaltyPoints: user.loyaltyPoints,
    };
  } catch (err) {
    return null;
  }
};
`
};

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(src, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Auth setup scripts generated.');
