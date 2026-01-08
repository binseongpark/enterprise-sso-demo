/**
 * Keycloak 인증 콜백 API
 * 
 * Authorization code를 토큰으로 교환하고 사용자 프로필을 동기화합니다.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServiceRoleClient } from '@/lib/supabase';
import { decodeToken } from '@/lib/auth';

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'enterprise-sso';
const CLIENT_ID = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'nextjs-app';
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=no_code`,
        { status: 302 }
      );
    }

    // Authorization code를 access token으로 교환
    const tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: `${APP_URL}/api/auth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('토큰 교환 실패:', error);
      return NextResponse.redirect(
        `${APP_URL}/login?error=token_exchange_failed`,
        { status: 302 }
      );
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    // JWT 디코딩하여 사용자 정보 추출
    const decoded = decodeToken(accessToken);
    
    if (!decoded) {
      return NextResponse.redirect(
        `${APP_URL}/login?error=invalid_token`,
        { status: 302 }
      );
    }

    // Supabase에 사용자 프로필 동기화
    try {
      const supabase = createServiceRoleClient();
      
      // 사용자 프로필이 이미 존재하는지 확인
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('keycloak_sub', decoded.sub)
        .single();

      if (!existingProfile) {
        // 새 사용자 프로필 생성
        const primaryRole = decoded.realm_roles?.[0] || 'user';
        
        await supabase
          .from('user_profiles')
          .insert({
            keycloak_sub: decoded.sub,
            email: decoded.email,
            full_name: decoded.name || decoded.preferred_username,
            role: primaryRole,
          });

        console.log('새 사용자 프로필 생성:', decoded.email);
      } else {
        // 기존 프로필 업데이트
        await supabase
          .from('user_profiles')
          .update({
            email: decoded.email,
            full_name: decoded.name || decoded.preferred_username,
            updated_at: new Date().toISOString(),
          })
          .eq('keycloak_sub', decoded.sub);

        console.log('사용자 프로필 업데이트:', decoded.email);
      }
    } catch (supabaseError) {
      console.error('Supabase 동기화 실패:', supabaseError);
      // Supabase 동기화 실패해도 로그인은 계속 진행
    }

    // 쿠키에 토큰 저장
    const cookieStore = await cookies();
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600, // 1시간
      path: '/',
    });

    if (refreshToken) {
      cookieStore.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokens.refresh_expires_in || 1800, // 30분
        path: '/',
      });
    }

    // Dashboard로 리다이렉트
    const redirectUrl = state || '/dashboard';
    return NextResponse.redirect(`${APP_URL}${redirectUrl}`, { status: 302 });

  } catch (error) {
    console.error('인증 콜백 처리 중 오류:', error);
    return NextResponse.redirect(
      `${APP_URL}/login?error=callback_failed`,
      { status: 302 }
    );
  }
}
