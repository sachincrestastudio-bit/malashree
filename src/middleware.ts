import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./utils/jwt";

const protectedRoutes = ["/profile", "/checkout", "/orders", "/wishlist"];
const adminRoutes = ["/admin"];
const kitchenRoutes = ["/kitchen"];
const deliveryRoutes = ["/delivery"];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const getPayload = async () => {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return null;
    return verifyToken(token);
  };

  // ── Admin routes: must be authenticated AND role === "admin" ──
  if (adminRoutes.some((r) => path.startsWith(r))) {
    const payload = await getPayload();
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    if (payload.role !== "admin") {
      // kitchen_manager goes to their panel; everyone else goes home
      if (payload.role === "kitchen_manager") {
        return NextResponse.redirect(new URL("/kitchen/dashboard", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── Kitchen routes: kitchen_manager or admin only ──
  else if (kitchenRoutes.some((r) => path.startsWith(r))) {
    const payload = await getPayload();
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    if (payload.role !== "kitchen_manager" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── Delivery routes: driver or admin only ──
  else if (deliveryRoutes.some((r) => path.startsWith(r))) {
    const payload = await getPayload();
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
    if (payload.role !== "driver" && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // ── Customer-only protected routes ──
  else if (protectedRoutes.some((r) => path.startsWith(r))) {
    const payload = await getPayload();
    if (!payload) return NextResponse.redirect(new URL("/login", req.url));
  }

  // ── Redirect already-logged-in users away from auth pages ──
  if (path === "/login" || path === "/register") {
    const payload = await getPayload();
    if (payload) {
      if (payload.role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      if (payload.role === "kitchen_manager") return NextResponse.redirect(new URL("/kitchen/dashboard", req.url));
      if (payload.role === "driver") return NextResponse.redirect(new URL("/delivery/dashboard", req.url));
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
