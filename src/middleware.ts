
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './utils/jwt';

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
