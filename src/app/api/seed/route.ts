import { NextResponse } from "next/server";
import { seedDatabase } from "@/actions/seed";

export async function GET() {
  const result = await seedDatabase();
  return NextResponse.json(result);
}

export async function POST() {
  const result = await seedDatabase();
  return NextResponse.json(result);
}
