/**
 * Keycloak 클라이언트 설정 및 유틸리티 함수
 * 
 * 이 파일은 브라우저 환경에서 Keycloak 인증을 처리합니다.
 */

import Keycloak from 'keycloak-js';
import type { KeycloakUser, UserRole } from '@/types/auth';

// Keycloak 설정
const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'enterprise-sso',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'nextjs-app',
};

let keycloakInstance: Keycloak | null = null;

/**
 * Keycloak 인스턴스 가져오기 (싱글톤)
 */
export function getKeycloakInstance(): Keycloak {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
}

/**
 * Keycloak 초기화
 * @returns 초기화된 Keycloak 인스턴스
 */
export async function initKeycloak(): Promise<Keycloak> {
  const keycloak = getKeycloakInstance();
  
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    });

    console.log('Keycloak 초기화:', authenticated ? '인증됨' : '미인증');

    // 토큰 갱신 설정 (만료 5분 전에 자동 갱신)
    if (authenticated) {
      setInterval(() => {
        keycloak.updateToken(300).catch(() => {
          console.error('토큰 갱신 실패');
        });
      }, 60000); // 1분마다 체크
    }

    return keycloak;
  } catch (error) {
    console.error('Keycloak 초기화 실패:', error);
    throw error;
  }
}

/**
 * Keycloak 로그인
 * @param redirectUri 로그인 후 리다이렉트할 URL
 */
export function login(redirectUri?: string): Promise<void> {
  const keycloak = getKeycloakInstance();
  return keycloak.login({
    redirectUri: redirectUri || `${window.location.origin}/dashboard`,
  });
}

/**
 * Keycloak 로그아웃
 * @param redirectUri 로그아웃 후 리다이렉트할 URL
 */
export function logout(redirectUri?: string): Promise<void> {
  const keycloak = getKeycloakInstance();
  return keycloak.logout({
    redirectUri: redirectUri || window.location.origin,
  });
}

/**
 * 액세스 토큰 가져오기
 */
export function getToken(): string | undefined {
  const keycloak = getKeycloakInstance();
  return keycloak.token;
}

/**
 * 토큰 갱신
 * @param minValidity 토큰 최소 유효 시간(초)
 */
export async function refreshToken(minValidity: number = 5): Promise<boolean> {
  const keycloak = getKeycloakInstance();
  try {
    const refreshed = await keycloak.updateToken(minValidity);
    if (refreshed) {
      console.log('토큰 갱신됨');
    }
    return refreshed;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return false;
  }
}

/**
 * 사용자 정보 가져오기
 */
export async function getUserInfo(): Promise<KeycloakUser | null> {
  const keycloak = getKeycloakInstance();
  
  if (!keycloak.authenticated) {
    return null;
  }

  try {
    await keycloak.loadUserProfile();
    const profile = keycloak.profile;
    
    if (!profile) {
      return null;
    }

    const user: KeycloakUser = {
      sub: profile.id || '',
      email: profile.email || '',
      email_verified: profile.emailVerified || false,
      name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      preferred_username: profile.username,
      given_name: profile.firstName,
      family_name: profile.lastName,
      realm_roles: extractRoles(keycloak),
    };

    return user;
  } catch (error) {
    console.error('사용자 정보 로드 실패:', error);
    return null;
  }
}

/**
 * Keycloak 토큰에서 역할 추출
 */
export function extractRoles(keycloak: Keycloak): UserRole[] {
  const realmAccess = keycloak.realmAccess;
  if (!realmAccess || !realmAccess.roles) {
    return [];
  }

  const validRoles: UserRole[] = ['admin', 'user', 'viewer'];
  return realmAccess.roles.filter((role): role is UserRole =>
    validRoles.includes(role as UserRole)
  );
}

/**
 * 특정 역할을 가지고 있는지 확인
 */
export function hasRole(role: UserRole): boolean {
  const keycloak = getKeycloakInstance();
  
  if (!keycloak.authenticated) {
    return false;
  }

  return keycloak.hasRealmRole(role);
}

/**
 * 여러 역할 중 하나라도 가지고 있는지 확인
 */
export function hasAnyRole(roles: UserRole[]): boolean {
  return roles.some(role => hasRole(role));
}

/**
 * 모든 역할을 가지고 있는지 확인
 */
export function hasAllRoles(roles: UserRole[]): boolean {
  return roles.every(role => hasRole(role));
}

/**
 * 인증 여부 확인
 */
export function isAuthenticated(): boolean {
  const keycloak = getKeycloakInstance();
  return keycloak.authenticated || false;
}
