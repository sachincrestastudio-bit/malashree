
'use server';

import { connectToDatabase } from '../database/mongoose';
import { User } from '../models/User';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
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
