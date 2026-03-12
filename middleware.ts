import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Redirect based on role
    if (path.startsWith('/api') && token?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login'
    }
  }
);

export const config = {
  matcher: [
    '/',
    '/students/:path*',
    '/jobs/:path*',
    '/analytics/:path*',
    '/ai-matching/:path*',
    '/settings/:path*',
    '/api/:path*'
  ]
};