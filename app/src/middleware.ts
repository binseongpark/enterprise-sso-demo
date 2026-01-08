/**
 * Next.js 미들웨어 - 라우트 보호
 * 
 * 인증이 필요한 라우트에 접근할 때 자동으로 인증을 확인하고,
 * Role 기반 접근 제어를 적용합니다.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeToken, extractRolesFromToken } from '@/lib/auth';

// 공개 라우트 (인증 불필요)
const PUBLIC_ROUTES = ['/', '/login'];

// 인증 필요 라우트
const PROTECTED_ROUTES = ['/dashboard', '/admin'];

// Admin 역할이 필요한 라우트
const ADMIN_ROUTES = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일 및 API 라우트는 미들웨어 건너뛰기
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 공개 라우트는 통과
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // 쿠키에서 액세스 토큰 가져오기
  const accessToken = request.cookies.get('access_token')?.value;

  // 보호된 라우트인 경우
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!accessToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // 토큰 검증
    const decoded = decodeToken(accessToken);
    
    if (!decoded) {
      // 토큰이 유효하지 않으면 로그인 페이지로 리다이렉트
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // 토큰 만료 확인
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      // 토큰이 만료되었으면 로그인 페이지로 리다이렉트
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      url.searchParams.set('reason', 'expired');
      return NextResponse.redirect(url);
    }

    // Admin 라우트인 경우 역할 확인
    const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
    
    if (isAdminRoute) {
      const roles = extractRolesFromToken(accessToken);
      
      if (!roles.includes('admin')) {
        // Admin 역할이 없으면 403 에러 페이지로 리다이렉트
        const url = new URL('/dashboard', request.url);
        url.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
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
