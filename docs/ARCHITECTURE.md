# 시스템 아키텍처

이 문서는 Enterprise SSO 데모 시스템의 전체 아키텍처와 각 컴포넌트 간의 상호작용을 설명합니다.

## 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser                                 │
└───┬─────────────────────────────────────────────────────────┬───┘
    │                                                         │
    │ HTTP Requests                              WebSocket   │
    │                                                         │
┌───▼─────────────────────────────────────────────────────────▼───┐
│                    Next.js Application                          │
│                   (http://localhost:3000)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pages      │  │ API Routes   │  │  Middleware  │         │
│  │              │  │              │  │              │         │
│  │ - /          │  │ - /api/auth  │  │ Route        │         │
│  │ - /login     │  │ - /api/notes │  │ Protection   │         │
│  │ - /dashboard │  │              │  │              │         │
│  │ - /admin     │  │              │  │              │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───┬─────────────────────────────────────────────────────────┬───┘
    │                                                         │
    │ OpenID Connect                          JWT + RLS       │
    │                                                         │
┌───▼────────────────────────┐             ┌─────────────────▼───┐
│       Keycloak             │             │     Supabase        │
│  (http://localhost:8080)   │             │   (Cloud/Local)     │
│                            │             │                     │
│  ┌──────────────────────┐  │             │  ┌───────────────┐ │
│  │ Realm: enterprise-sso│  │             │  │ PostgreSQL DB │ │
│  │ - Client: nextjs-app │  │             │  │ - user_profiles│ │
│  │ - Roles: admin/user  │  │             │  │ - notes       │ │
│  │ - Users: 3 accounts  │  │             │  │ - RLS Policies│ │
│  └──────────────────────┘  │             │  └───────────────┘ │
│                            │             │                     │
│  ┌──────────────────────┐  │             │  ┌───────────────┐ │
│  │   PostgreSQL DB      │  │             │  │  RESTful API  │ │
│  │   (Keycloak Data)    │  │             │  │  (PostgREST)  │ │
│  └──────────────────────┘  │             │  └───────────────┘ │
└────────────────────────────┘             └─────────────────────┘
```

## 컴포넌트 설명

### 1. Next.js Application

**역할**: 프론트엔드 및 백엔드 API 제공

**구성**:
- **Pages (App Router)**
  - `/`: 공개 랜딩 페이지
  - `/login`: Keycloak 로그인 리다이렉트
  - `/dashboard`: 인증된 사용자 대시보드
  - `/admin`: 관리자 전용 페이지

- **API Routes**
  - `/api/auth/callback`: OAuth2 콜백 처리
  - `/api/auth/logout`: 로그아웃 처리
  - `/api/notes`: 메모 CRUD API

- **Middleware**
  - 인증 확인
  - Role 기반 접근 제어
  - 미인증 사용자 리다이렉트

**기술**:
- Next.js 14 App Router
- React 18 Server & Client Components
- TypeScript
- Tailwind CSS

### 2. Keycloak

**역할**: 중앙 인증 및 권한 관리 서버

**기능**:
- OpenID Connect / OAuth2 인증
- JWT 토큰 발급 및 관리
- 사용자 및 역할 관리
- 세션 관리

**구성**:
- **Realm**: `enterprise-sso`
- **Client**: `nextjs-app` (Confidential)
- **Roles**: admin, user, viewer
- **Users**: 3개의 테스트 계정

**데이터 저장**: PostgreSQL (별도 컨테이너)

### 3. Supabase

**역할**: 데이터베이스 및 백엔드 서비스

**기능**:
- PostgreSQL 데이터베이스
- RESTful API (PostgREST)
- Row Level Security (RLS)
- Real-time subscriptions (선택사항)

**테이블**:
- `user_profiles`: 사용자 프로필 (Keycloak 동기화)
- `notes`: 사용자 메모

**보안**: JWT 기반 RLS 정책

## 인증 플로우

### 1. 로그인 플로우 (Authorization Code Flow with PKCE)

```
┌─────────┐                                        ┌──────────┐
│ Browser │                                        │ Next.js  │
└────┬────┘                                        └────┬─────┘
     │                                                  │
     │ 1. GET /login                                    │
     │ ─────────────────────────────────────────────────>
     │                                                  │
     │ 2. Redirect to Keycloak                          │
     │ <─────────────────────────────────────────────────
     │                                                  │
┌────▼────┐                                             │
│Keycloak │                                             │
└────┬────┘                                             │
     │                                                  │
     │ 3. Show login page                               │
     │ 4. User enters credentials                       │
     │ 5. Validate credentials                          │
     │                                                  │
     │ 6. Redirect with authorization code              │
     │ ──────────────────────────────────────────────────>
     │                                                  │
┌────┴────┐                                        ┌────▼─────┐
│ Browser │                                        │ Next.js  │
└────┬────┘                                        └────┬─────┘
     │                                                  │
     │ 7. GET /api/auth/callback?code=xxx               │
     │ ─────────────────────────────────────────────────>
     │                                                  │
     │                                             ┌────▼─────┐
     │                                             │Exchange  │
     │                                             │code for  │
     │                                             │tokens    │
     │                                             └────┬─────┘
     │                                                  │
     │                                             ┌────▼─────┐
     │                                             │Sync user │
     │                                             │to        │
     │                                             │Supabase  │
     │                                             └────┬─────┘
     │                                                  │
     │ 8. Set cookies & redirect to /dashboard          │
     │ <─────────────────────────────────────────────────
     │                                                  │
```

**단계별 설명**:

1. **로그인 요청**: 사용자가 `/login` 페이지 접속
2. **Keycloak 리다이렉트**: Next.js가 Keycloak 로그인 URL로 리다이렉트
   - PKCE code_challenge 포함
3. **로그인 페이지**: Keycloak이 로그인 폼 표시
4. **자격증명 입력**: 사용자가 username/password 입력
5. **인증 확인**: Keycloak이 자격증명 검증
6. **Authorization Code 발급**: Keycloak이 authorization code와 함께 callback URL로 리다이렉트
7. **Callback 처리**: Next.js API route가 요청 받음
8. **토큰 교환**: 
   - Authorization code를 access_token, refresh_token으로 교환
   - Client secret 사용 (confidential client)
9. **사용자 동기화**: 
   - JWT에서 사용자 정보 추출
   - Supabase `user_profiles` 테이블에 동기화
10. **세션 설정**: 
    - Access token을 HttpOnly 쿠키에 저장
    - Dashboard로 리다이렉트

### 2. API 요청 플로우

```
┌─────────┐                ┌──────────┐                ┌──────────┐
│ Browser │                │ Next.js  │                │ Supabase │
└────┬────┘                └────┬─────┘                └────┬─────┘
     │                          │                           │
     │ 1. GET /api/notes        │                           │
     │    Cookie: access_token  │                           │
     │ ─────────────────────────>                           │
     │                          │                           │
     │                     ┌────▼─────┐                     │
     │                     │ Verify   │                     │
     │                     │ JWT      │                     │
     │                     └────┬─────┘                     │
     │                          │                           │
     │                          │ 2. Query with JWT         │
     │                          │ ─────────────────────────>│
     │                          │                           │
     │                          │                      ┌────▼─────┐
     │                          │                      │ Apply    │
     │                          │                      │ RLS      │
     │                          │                      │ Policies │
     │                          │                      └────┬─────┘
     │                          │                           │
     │                          │ 3. Filtered data          │
     │                          │ <─────────────────────────│
     │                          │                           │
     │ 4. JSON response         │                           │
     │ <─────────────────────────                           │
     │                          │                           │
```

**단계별 설명**:

1. **API 요청**: 브라우저가 Authorization header 또는 cookie로 JWT 전송
2. **JWT 검증**: Next.js API route가 토큰 유효성 확인
3. **Supabase 쿼리**: JWT와 함께 Supabase에 요청
4. **RLS 적용**: 
   - Supabase가 JWT claims 읽기
   - RLS 정책에 따라 데이터 필터링
   - 사용자는 자신의 데이터만 조회
5. **응답 반환**: 필터링된 데이터를 클라이언트에 반환

## JWT 구조

### Access Token Claims

```json
{
  "exp": 1234567890,
  "iat": 1234567800,
  "iss": "http://localhost:8080/realms/enterprise-sso",
  "sub": "keycloak-user-uuid",
  "email": "admin@test.com",
  "email_verified": true,
  "preferred_username": "admin",
  "name": "Admin User",
  "given_name": "Admin",
  "family_name": "User",
  "realm_access": {
    "roles": ["admin", "user"]
  }
}
```

**주요 Claims**:
- `sub`: Keycloak 사용자 ID (Supabase에서 사용자 식별)
- `email`: 이메일 주소
- `realm_access.roles`: 사용자 역할 배열

## Row Level Security (RLS) 정책

### user_profiles 테이블

```sql
-- 정책 1: 사용자는 자신의 프로필만 조회
CREATE POLICY "사용자는 자신의 프로필만 조회 가능"
  ON user_profiles FOR SELECT
  USING (
    keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- 정책 2: Admin은 모든 프로필 조회
CREATE POLICY "Admin은 모든 프로필 조회 가능"
  ON user_profiles FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->'realm_roles' ? 'admin'
  );
```

**작동 방식**:
1. Supabase가 요청에서 JWT 추출
2. JWT claims를 PostgreSQL 설정으로 저장
3. 쿼리 실행 시 RLS 정책 평가
4. 조건에 맞는 행만 반환

### notes 테이블

```sql
-- 사용자는 자신의 메모만 조회
CREATE POLICY "사용자는 자신의 메모만 조회 가능"
  ON notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = notes.user_id
      AND user_profiles.keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
```

**보안 이점**:
- 애플리케이션 코드에서 필터링 불필요
- SQL Injection 방어
- 권한 로직이 데이터베이스 레벨에서 일관되게 적용

## Role 기반 접근 제어 (RBAC)

### 역할 정의

| Role | 권한 | 페이지 접근 |
|------|------|------------|
| **admin** | - 모든 사용자 프로필 조회<br>- 모든 메모 CRUD<br>- 통계 및 관리 기능 | /, /login, /dashboard, /admin |
| **user** | - 자신의 프로필 조회/수정<br>- 자신의 메모 CRUD | /, /login, /dashboard |
| **viewer** | - 자신의 프로필 조회<br>- 공개 메모 조회 (읽기만) | /, /login, /dashboard |

### 구현 계층

#### 1. Next.js Middleware (라우트 레벨)

```typescript
// app/src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  
  // /admin 라우트는 admin 역할 필요
  if (pathname.startsWith('/admin')) {
    if (!hasRole(token, 'admin')) {
      return NextResponse.redirect('/dashboard?error=forbidden');
    }
  }
}
```

#### 2. API Route (API 레벨)

```typescript
// app/src/app/api/notes/route.ts
export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  
  // Admin만 모든 메모 조회 가능
  if (all && hasRole(user.token, 'admin')) {
    // 모든 메모 반환
  } else {
    // 자신의 메모만 반환 (RLS 자동 적용)
  }
}
```

#### 3. Supabase RLS (데이터베이스 레벨)

```sql
-- Admin은 모든 메모 조회 가능
CREATE POLICY "Admin은 모든 메모 조회 가능"
  ON notes FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->'realm_roles' ? 'admin'
  );
```

## 보안 고려사항

### 1. 토큰 저장

- **Access Token**: HttpOnly 쿠키 (XSS 방어)
- **Refresh Token**: HttpOnly 쿠키
- **클라이언트**: LocalStorage 사용 안 함

### 2. CSRF 방어

- SameSite=Lax 쿠키 속성
- State parameter 사용 (OAuth2)

### 3. JWT 검증

- 서버 사이드에서만 검증
- 만료 시간 확인
- Issuer 및 Audience 확인

### 4. HTTPS

- 프로덕션에서는 필수
- 모든 통신 암호화

## 확장 가능성

### 1. 추가 인증 방법

- Google OAuth
- GitHub OAuth
- SAML 2.0
- Multi-Factor Authentication (MFA)

### 2. 추가 역할 및 권한

```typescript
// 세밀한 권한 정의
const permissions = {
  'notes:read': ['admin', 'user', 'viewer'],
  'notes:write': ['admin', 'user'],
  'notes:delete': ['admin', 'user'],
  'users:read': ['admin'],
  'users:write': ['admin'],
};
```

### 3. 다중 테넌트

- Organization 개념 추가
- 조직별 데이터 격리
- 조직 관리자 역할

## 성능 최적화

### 1. 캐싱

- JWT 공개 키 캐싱
- User 프로필 캐싱
- API 응답 캐싱 (React Query)

### 2. 데이터베이스

- 적절한 인덱스 사용
- Connection pooling (Supavisor)
- Query 최적화

### 3. 프론트엔드

- Code splitting
- Lazy loading
- Image optimization

## 모니터링

### 1. 로깅

- API 요청 로그
- 인증 실패 로그
- 에러 로그

### 2. 메트릭

- 응답 시간
- 에러율
- 동시 사용자 수

### 3. 알림

- 인증 실패 급증
- API 에러율 증가
- 비정상적인 접근 패턴

## 참고 자료

- [OpenID Connect Specification](https://openid.net/connect/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
