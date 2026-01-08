# 🔐 엔터프라이즈급 SSO 데모 시스템

Keycloak과 Supabase를 활용한 Single Sign-On (SSO) 인증 시스템입니다.

## ✨ 주요 기능

- 🔑 **Keycloak 기반 중앙 인증 서버** - 업계 표준 OpenID Connect 프로토콜
- 🗄️ **Supabase 데이터베이스 통합** - PostgreSQL + Row Level Security
- 🎭 **Role 기반 접근 제어 (RBAC)** - Admin, User, Viewer 역할
- 🔒 **Row Level Security (RLS)** - 데이터베이스 레벨 보안
- ⚡ **Next.js 14 App Router** - 최신 React Server Components
- 🐳 **Docker Compose 통합 환경** - 원클릭 로컬 실행
- 🎨 **Tailwind CSS 디자인** - 반응형 모던 UI

## 🏗️ 시스템 아키텍처

```
Browser
  │
  ├─> Next.js App (http://localhost:3000)
  │     ├─> Pages: /, /login, /dashboard, /admin
  │     ├─> API Routes: /api/auth/*, /api/notes
  │     └─> Middleware: Route Protection
  │
  ├─> Keycloak (http://localhost:8080)
  │     ├─> Realm: enterprise-sso
  │     ├─> Client: nextjs-app
  │     ├─> Roles: admin, user, viewer
  │     └─> Users: admin, user, viewer (테스트 계정)
  │
  └─> Supabase (Cloud or Self-hosted)
        ├─> Tables: user_profiles, notes
        ├─> RLS Policies: User-specific data access
        └─> JWT Verification: Keycloak token
```

## 🚀 빠른 시작

### 사전 요구사항

- Docker & Docker Compose
- Node.js 18+ (Next.js 앱 실행용)
- Supabase 계정 (또는 로컬 Supabase 설치)

### 1단계: Keycloak 시작

```bash
# Docker Compose로 Keycloak 실행
docker-compose up -d

# 로그 확인 (Keycloak이 완전히 시작될 때까지 대기)
docker-compose logs -f keycloak
```

Keycloak이 시작되면 http://localhost:8080 에서 접속 가능합니다.

### 2단계: Supabase 설정

#### 옵션 A: Supabase Cloud (권장)

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 실행
3. Project Settings에서 URL과 Anon Key 확인

#### 옵션 B: 로컬 Supabase

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 시작
supabase start
```

### 3단계: Next.js 앱 설정 및 실행

```bash
cd app

# 의존성 설치
npm install

# 환경변수 파일 생성
cp .env.local.example .env.local

# .env.local 파일을 편집하여 다음 정보를 입력:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - KEYCLOAK_CLIENT_SECRET (Keycloak Admin Console에서 확인)

# 개발 서버 시작
npm run dev
```

### 4단계: 접속 및 테스트

- **Next.js App**: http://localhost:3000
- **Keycloak Admin**: http://localhost:8080 (admin/admin)

## 🧪 테스트 계정

| Username | Password | Role | 권한 |
|----------|----------|------|------|
| admin | admin123 | admin, user | 모든 데이터 조회/관리, /admin 페이지 접근 |
| user | user123 | user | 본인 데이터 CRUD, /dashboard 접근 |
| viewer | viewer123 | viewer | 읽기 전용 권한 |

## 📚 문서

- [상세 설정 가이드](docs/SETUP.md) - 단계별 설정 방법
- [시스템 아키텍처](docs/ARCHITECTURE.md) - 아키텍처 및 인증 플로우 설명
- [문제 해결](docs/TROUBLESHOOTING.md) - 자주 발생하는 문제 해결

## 🛠️ 기술 스택

### 인증 & 보안
- **Keycloak 23.0** - OpenID Connect 기반 SSO
- **JWT** - 토큰 기반 인증
- **PKCE** - Authorization Code Flow with PKCE

### 프론트엔드
- **Next.js 14** - React App Router
- **React 18** - Server & Client Components
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 유틸리티 퍼스트 CSS

### 백엔드 & 데이터베이스
- **Supabase** - PostgreSQL + RESTful API
- **Row Level Security (RLS)** - 데이터베이스 레벨 보안
- **PostgreSQL 15** - 관계형 데이터베이스

### 인프라
- **Docker Compose** - 컨테이너 오케스트레이션
- **PostgreSQL** - Keycloak 데이터 저장소

## 📁 프로젝트 구조

```
.
├── docker-compose.yml           # Docker Compose 설정
├── Makefile                     # 자동화 스크립트
├── keycloak/
│   ├── realm-config.json        # Keycloak Realm 설정
│   └── README.md                # Keycloak 가이드
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # DB 스키마 & RLS 정책
│   └── README.md                # Supabase 가이드
├── app/
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/                 # Next.js Pages
│   │   │   ├── page.tsx         # 랜딩 페이지
│   │   │   ├── login/           # 로그인 페이지
│   │   │   ├── dashboard/       # 대시보드 (인증 필요)
│   │   │   ├── admin/           # 관리자 페이지 (admin 역할)
│   │   │   └── api/             # API Routes
│   │   ├── components/          # React 컴포넌트
│   │   ├── lib/                 # 유틸리티 라이브러리
│   │   └── types/               # TypeScript 타입
│   └── .env.local.example       # 환경변수 예시
└── docs/                        # 문서
    ├── SETUP.md
    ├── ARCHITECTURE.md
    └── TROUBLESHOOTING.md
```

## 🔧 Makefile 명령어

```bash
# Keycloak 시작
make up

# Keycloak 중지
make down

# 로그 확인
make logs

# Next.js 의존성 설치
make install

# Next.js 개발 서버 시작
make dev

# 전체 환경 설정 (Keycloak + npm install)
make setup

# 모든 데이터 및 빌드 파일 삭제
make clean
```

## 🎯 주요 기능 데모

### 1. SSO 로그인
- Keycloak 로그인 페이지로 자동 리다이렉트
- Authorization Code Flow with PKCE
- JWT 토큰 기반 세션 관리

### 2. Role 기반 접근 제어
- **Admin**: /admin 페이지 접근, 모든 사용자/메모 조회
- **User**: /dashboard 접근, 자신의 메모 CRUD
- **Viewer**: /dashboard 접근, 읽기 전용

### 3. Row Level Security (RLS)
- 사용자는 자신의 데이터만 조회/수정/삭제
- Admin은 모든 데이터 접근 가능
- 데이터베이스 레벨에서 자동 적용

### 4. 메모 CRUD
- 메모 생성, 조회, 수정, 삭제
- 공개/비공개 설정
- 실시간 UI 업데이트

## 🔒 보안 고려사항

### 개발 환경
현재 설정은 로컬 개발 환경용입니다:
- HTTP 사용 (HTTPS 아님)
- 간단한 비밀번호
- 로컬 포트 노출

### 프로덕션 배포 시 필수 변경
1. **HTTPS 설정** - SSL/TLS 인증서 필수
2. **비밀번호 변경** - 모든 기본 비밀번호 변경
3. **JWT Secret 재생성** - 강력한 시크릿 사용
4. **CORS 설정** - 실제 도메인만 허용
5. **환경변수 보안** - 민감한 정보는 시크릿 매니저 사용

## 📝 라이선스

MIT License

## 🤝 기여

이슈 및 PR을 환영합니다!

## 📧 문의

문제가 발생하거나 질문이 있으시면 GitHub Issues를 이용해주세요.
