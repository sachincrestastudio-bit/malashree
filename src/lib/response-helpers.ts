import { NextResponse } from 'next/server';

export const successResponse = (data: any, status = 200) => NextResponse.json({ success: true, data }, { status });
export const errorResponse = (message: string, status = 400) => NextResponse.json({ success: false, error: message }, { status });
