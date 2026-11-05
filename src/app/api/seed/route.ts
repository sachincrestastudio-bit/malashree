import { NextRequest, NextResponse } from "next/server";
import { seedDatabase } from "@/actions/seed";
import { verifyToken } from "@/utils/jwt";

async function isAuthorized(req: NextRequest) {
  // Allow if ADMIN_SEED_SECRET matches Authorization header or query param
  const secretHeader = req.headers.get("x-seed-secret");
  const secretEnv = process.env.ADMIN_SEED_SECRET;
  if (secretEnv && secretHeader === secretEnv) return true;

  // Otherwise check admin auth cookie
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return false;

  const payload = await verifyToken(token);
  return payload?.role === "admin";
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }
  const result = await seedDatabase();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }
  const result = await seedDatabase();
  return NextResponse.json(result);
}
