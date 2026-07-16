import { NextResponse } from 'next/server';

export const requireRole = (role: string) => {
  return async (req: Request) => {
    // Placeholder logic for middleware
    return NextResponse.next();
  };
};
