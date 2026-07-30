import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  const isDbConnected = mongoose.connection.readyState === 1;

  const status = isDbConnected ? 200 : 503;

  return NextResponse.json(
    {
      status: isDbConnected ? "ok" : "error",
      timestamp: new Date().toISOString(),
      services: {
        database: isDbConnected ? "connected" : "disconnected",
        web: "running",
      },
    },
    { status },
  );
}
