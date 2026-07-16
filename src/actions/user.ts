
'use server';

import { connectToDatabase } from '../database/mongoose';
import { User } from '../models/User';
import { getAuthCookie, verifyToken } from '../utils/jwt';

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
