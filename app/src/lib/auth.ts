/**
 * 인증 유틸리티 함수
 * 
 * JWT 처리, Role 확인, 서버 사이드 인증 등을 담당합니다.
 */

import { decodeJwt, jwtVerify, importJWK, JWTPayload } from 'jose';
import type { DecodedJWT, UserRole } from '@/types/auth';
import { cookies } from 'next/headers';

/**
 * JWT 토큰 디코딩 (검증 없이)
 */
export function decodeToken(token: string): DecodedJWT | null {
  try {
    const decoded = decodeJwt(token) as JWTPayload;
    
    return {
      sub: decoded.sub || '',
      email: decoded.email as string || '',
      preferred_username: decoded.preferred_username as string || '',
      name: decoded.name as string,
      given_name: decoded.given_name as string,
      family_name: decoded.family_name as string,
      realm_roles: (decoded.realm_access as any)?.roles || [],
      exp: decoded.exp || 0,
      iat: decoded.iat || 0,
      iss: decoded.iss || '',
      aud: decoded.aud as string | string[] || '',
    };
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
}

/**
 * JWT 토큰 검증
 * @param token JWT 토큰
 * @param publicKey Keycloak Public Key (선택사항)
 */
export async function verifyToken(token: string, publicKey?: string): Promise<DecodedJWT | null> {
  try {
    // 검증 없이 디코딩 (간단한 검증)
    // 실제 프로덕션에서는 Keycloak의 공개 키로 검증해야 합니다
    const decoded = decodeToken(token);
    
    if (!decoded) {
      return null;
    }

    // 토큰 만료 확인
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      console.error('토큰이 만료되었습니다.');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('JWT 검증 실패:', error);
    return null;
  }
}

/**
 * 토큰에서 역할 추출
 */
export function extractRolesFromToken(token: string): UserRole[] {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.realm_roles) {
    return [];
  }

  const validRoles: UserRole[] = ['admin', 'user', 'viewer'];
  return decoded.realm_roles.filter((role): role is UserRole =>
    validRoles.includes(role as UserRole)
  );
}

/**
 * 토큰에서 특정 역할 확인
 */
export function hasRoleInToken(token: string, role: UserRole): boolean {
  const roles = extractRolesFromToken(token);
  return roles.includes(role);
}

/**
 * 토큰에서 여러 역할 중 하나라도 있는지 확인
 */
export function hasAnyRoleInToken(token: string, roles: UserRole[]): boolean {
  const userRoles = extractRolesFromToken(token);
  return roles.some(role => userRoles.includes(role));
}

/**
 * 쿠키에서 액세스 토큰 가져오기 (서버 사이드)
 */
export async function getAccessTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('access_token')?.value || null;
  } catch (error) {
    console.error('쿠키에서 토큰 가져오기 실패:', error);
    return null;
  }
}

/**
 * 서버 사이드 인증 확인
 */
export async function checkServerAuth(): Promise<{
  isAuthenticated: boolean;
  user: DecodedJWT | null;
  token: string | null;
}> {
  const token = await getAccessTokenFromCookies();
  
  if (!token) {
    return {
      isAuthenticated: false,
      user: null,
      token: null,
    };
  }

  const user = await verifyToken(token);
  
  return {
    isAuthenticated: !!user,
    user,
    token,
  };
}

/**
 * Protected Route 헬퍼 함수
 * 인증되지 않은 경우 에러를 던집니다
 */
export async function requireAuth(): Promise<{
  user: DecodedJWT;
  token: string;
}> {
  const auth = await checkServerAuth();
  
  if (!auth.isAuthenticated || !auth.user || !auth.token) {
    throw new Error('인증이 필요합니다.');
  }

  return {
    user: auth.user,
    token: auth.token,
  };
}

/**
 * Role 기반 접근 제어 헬퍼 함수
 * 특정 역할이 없으면 에러를 던집니다
 */
export async function requireRole(role: UserRole): Promise<{
  user: DecodedJWT;
  token: string;
}> {
  const auth = await requireAuth();
  
  if (!hasRoleInToken(auth.token, role)) {
    throw new Error(`${role} 역할이 필요합니다.`);
  }

  return auth;
}

/**
 * 여러 역할 중 하나라도 필요한 경우
 */
export async function requireAnyRole(roles: UserRole[]): Promise<{
  user: DecodedJWT;
  token: string;
}> {
  const auth = await requireAuth();
  
  if (!hasAnyRoleInToken(auth.token, roles)) {
    throw new Error(`다음 역할 중 하나가 필요합니다: ${roles.join(', ')}`);
  }

  return auth;
}

/**
 * Request 헤더에서 액세스 토큰 추출
 */
export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.replace('Bearer ', '');
}

/**
 * Request 헤더에서 사용자 정보 추출
 */
export function getUserFromRequest(request: Request): DecodedJWT | null {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return null;
  }

  return decodeToken(token);
}
