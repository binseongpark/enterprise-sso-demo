// TypeScript 타입 정의

export type UserRole = 'admin' | 'user' | 'viewer';

export interface KeycloakUser {
  sub: string; // Keycloak subject ID
  email: string;
  email_verified: boolean;
  name?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_roles?: UserRole[];
}

export interface JWTToken {
  access_token: string;
  refresh_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  scope: string;
}

export interface DecodedJWT {
  sub: string;
  email: string;
  preferred_username: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  realm_roles?: UserRole[];
  exp: number;
  iat: number;
  iss: string;
  aud: string | string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: KeycloakUser | null;
  token: string | null;
  roles: UserRole[];
}

export interface UserProfile {
  id: string;
  keycloak_sub: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}
