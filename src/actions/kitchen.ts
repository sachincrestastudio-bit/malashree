'use server';

import { cookies } from 'next/headers';
import { connectToDatabase } from '../database/mongoose';
import { User } from '../models/User';
import { Kitchen } from '../models/Kitchen';
import { getCurrentUser } from './user';

export const setAssignedKitchen = async (branchId: string) => {
  await connectToDatabase();
  
  // Verify the kitchen exists
  const kitchen = await Kitchen.findOne({ code: branchId }).lean();
  if (!kitchen) {
    throw new Error('Invalid kitchen ID');
  }

  const user = await getCurrentUser();

  if (user) {
    // Authenticated: update DB
    await User.findByIdAndUpdate(user.id, { assignedKitchen: kitchen._id });
  }

  // Set the cookie for both guests and authenticated users for fast middleware/action access
  const cookieStore = await cookies();
  cookieStore.set('assigned_kitchen', kitchen._id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return { success: true };
};

export const getAssignedKitchenId = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get('assigned_kitchen')?.value || null;
};
