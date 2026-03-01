import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_token';

/** Routes the middleware will run on. */
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow the login page and the auth API (login/logout endpoints)
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/auth'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return deny(request);
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    // Token expired or invalid — clear it and redirect
    const response = deny(request);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

/** Return the appropriate "unauthorized" response based on route type. */
function deny(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // API routes → 401 JSON
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Pages → redirect to login
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}
