import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDoctorRoute = pathname.startsWith('/doctors');
  const isPatientRoute = pathname.startsWith('/patient');

  // If accessing protected route without token -> login
  if ((isDoctorRoute || isPatientRoute) && !token) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  // Role guard
  if (isDoctorRoute && role !== 'doctor') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isPatientRoute && role !== 'patient') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If already logged in and visiting auth pages, redirect by role
  if (token && isAuthPage) {
    if (role === 'doctor') return NextResponse.redirect(new URL('/doctors/dashboard', request.url));
    if (role === 'patient') return NextResponse.redirect(new URL('/patient/dashboard', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
