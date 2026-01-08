/**
 * 로그아웃 API
 * 
 * 토큰을 제거하고 Keycloak 세션을 종료합니다.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'enterprise-sso';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    // 쿠키에서 토큰 제거
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    // Keycloak 로그아웃 URL
    const logoutUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;
    const redirectUri = `${APP_URL}/`;

    return NextResponse.json({
      success: true,
      logoutUrl: `${logoutUrl}?redirect_uri=${encodeURIComponent(redirectUri)}`,
    });
  } catch (error) {
    console.error('로그아웃 실패:', error);
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // 쿠키에서 토큰 제거
    const cookieStore = await cookies();
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    // 홈으로 리다이렉트
    return NextResponse.redirect(`${APP_URL}/`, { status: 302 });
  } catch (error) {
    console.error('로그아웃 실패:', error);
    return NextResponse.redirect(`${APP_URL}/`, { status: 302 });
  }
}
