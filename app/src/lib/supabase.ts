/**
 * Supabase 클라이언트 설정 및 유틸리티 함수
 * 
 * Keycloak JWT를 사용하여 Supabase에 인증합니다.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * 기본 Supabase 클라이언트 생성 (익명)
 */
export function createClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Keycloak JWT로 인증된 Supabase 클라이언트 생성
 * @param accessToken Keycloak 액세스 토큰
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * 서버 사이드용 Supabase 클라이언트 생성 (Service Role)
 * RLS를 우회하므로 주의해서 사용해야 합니다.
 */
export function createServiceRoleClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL 또는 Service Role Key가 설정되지 않았습니다.');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Request 객체에서 인증 토큰을 추출하여 Supabase 클라이언트 생성
 * Next.js API Route에서 사용
 */
export function createClientFromRequest(request: Request): SupabaseClient {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 인증되지 않은 경우 기본 클라이언트 반환
    return createClient();
  }

  const token = authHeader.replace('Bearer ', '');
  return createAuthenticatedClient(token);
}

/**
 * 쿠키에서 토큰을 추출하여 Supabase 클라이언트 생성
 * 서버 컴포넌트에서 사용
 */
export function createClientFromCookies(cookies: string): SupabaseClient {
  // 쿠키 파싱하여 토큰 추출
  const tokenMatch = cookies.match(/access_token=([^;]+)/);
  
  if (!tokenMatch) {
    return createClient();
  }

  const token = tokenMatch[1];
  return createAuthenticatedClient(token);
}
