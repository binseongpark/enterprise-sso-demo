# 상세 설정 가이드

이 문서는 Enterprise SSO 데모 시스템을 처음부터 설정하는 방법을 단계별로 설명합니다.

## 사전 요구사항

시작하기 전에 다음 소프트웨어가 설치되어 있어야 합니다:

- **Docker Desktop** (또는 Docker Engine + Docker Compose)
  - Docker 20.10 이상
  - Docker Compose 2.0 이상
- **Node.js** 18 이상
- **npm** 또는 **yarn**
- **Git**

### 선택사항
- **Supabase CLI** (로컬 Supabase 사용 시)

## 1단계: 저장소 클론

```bash
git clone https://github.com/binseongpark/enterprise-sso-demo.git
cd enterprise-sso-demo
```

## 2단계: Keycloak 설정

### 2.1 Keycloak 시작

```bash
# Docker Compose로 Keycloak 및 PostgreSQL 시작
docker-compose up -d

# 로그 확인 (Keycloak이 완전히 시작될 때까지 대기)
docker-compose logs -f keycloak
```

Keycloak이 성공적으로 시작되면 다음과 같은 메시지가 표시됩니다:
```
keycloak | ... Listening on: http://0.0.0.0:8080
```

### 2.2 Keycloak Admin Console 접속

1. 브라우저에서 http://localhost:8080 접속
2. **Administration Console** 클릭
3. 로그인 정보 입력:
   - **Username**: `admin`
   - **Password**: `admin`

### 2.3 Realm 및 Client 확인

Keycloak은 `realm-config.json` 파일을 자동으로 임포트합니다.

1. 좌측 상단의 Realm 선택 드롭다운에서 **"enterprise-sso"** 확인
2. 좌측 메뉴에서 **Clients** 클릭
3. **nextjs-app** 클라이언트 확인

### 2.4 Client Secret 확인

Next.js 앱에서 사용할 Client Secret을 확인해야 합니다:

1. **Clients** → **nextjs-app** 클릭
2. **Credentials** 탭 선택
3. **Client Secret** 값을 복사 (나중에 사용)

> 💡 **기본 Secret**: `nextjs-app-secret-key-change-in-production`
> 
> 프로덕션에서는 반드시 재생성하세요!

### 2.5 사용자 확인

1. 좌측 메뉴에서 **Users** 클릭
2. **View all users** 버튼 클릭
3. 3명의 테스트 사용자 확인:
   - admin
   - user
   - viewer

## 3단계: Supabase 설정

### 옵션 A: Supabase Cloud (권장)

#### 3.1 프로젝트 생성

1. [Supabase](https://supabase.com) 접속 및 로그인
2. **New project** 클릭
3. 프로젝트 정보 입력:
   - **Name**: enterprise-sso-demo
   - **Database Password**: 안전한 비밀번호 (저장 필수!)
   - **Region**: 가까운 지역 선택
4. **Create new project** 클릭

#### 3.2 Database Migration 실행

1. Supabase 대시보드에서 **SQL Editor** 메뉴 선택
2. 프로젝트의 `supabase/migrations/001_initial_schema.sql` 파일 열기
3. 파일 내용 전체를 복사하여 SQL Editor에 붙여넣기
4. **Run** 버튼 클릭
5. 성공 메시지 확인

#### 3.3 API 키 확인

1. **Settings** → **API** 메뉴 선택
2. 다음 정보를 복사 (나중에 사용):
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (⚠️ 절대 클라이언트에 노출하지 마세요!)

### 옵션 B: 로컬 Supabase

#### 3.1 Supabase CLI 설치

```bash
npm install -g supabase
```

#### 3.2 Supabase 초기화 및 시작

```bash
# 프로젝트 루트에서 실행
supabase init

# 로컬 Supabase 시작
supabase start
```

시작이 완료되면 다음과 같은 정보가 표시됩니다:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJh...
service_role key: eyJh...
```

이 정보들을 복사해 두세요.

#### 3.3 Migration 적용

```bash
# Migration 파일을 Supabase 프로젝트에 링크
cp supabase/migrations/001_initial_schema.sql ./supabase/migrations/

# Migration 적용
supabase db push
```

## 4단계: Next.js 앱 설정

### 4.1 의존성 설치

```bash
cd app
npm install
```

설치가 완료되면 `node_modules` 디렉토리가 생성됩니다.

### 4.2 환경변수 파일 생성

```bash
# .env.local.example을 복사하여 .env.local 생성
cp .env.local.example .env.local
```

### 4.3 환경변수 설정

`.env.local` 파일을 편집기로 열고 다음 정보를 입력합니다:

```env
# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=enterprise-sso
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=nextjs-app
KEYCLOAK_CLIENT_SECRET=nextjs-app-secret-key-change-in-production

# Supabase Configuration (Supabase Cloud 사용 시)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# 또는 로컬 Supabase 사용 시
# NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Session Secret (32자 이상의 랜덤 문자열로 변경)
SESSION_SECRET=change-this-to-a-random-secret-at-least-32-characters-long
```

**반드시 변경해야 할 값:**
- `KEYCLOAK_CLIENT_SECRET`: Keycloak에서 확인한 Client Secret
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
- `SESSION_SECRET`: 랜덤 문자열로 변경

> 💡 **SESSION_SECRET 생성 방법:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4.4 개발 서버 시작

```bash
npm run dev
```

개발 서버가 시작되면:
```
> enterprise-sso-app@1.0.0 dev
> next dev

   ▲ Next.js 14.2.0
   - Local:        http://localhost:3000

 ✓ Ready in 2.3s
```

## 5단계: 동작 확인

### 5.1 랜딩 페이지 접속

브라우저에서 http://localhost:3000 접속

다음 내용이 표시되어야 합니다:
- "엔터프라이즈급 SSO 데모 시스템" 제목
- 주요 기능 설명
- "SSO 로그인 시작하기" 버튼

### 5.2 로그인 테스트

1. **"SSO 로그인 시작하기"** 버튼 클릭
2. Keycloak 로그인 페이지로 리다이렉트됨
3. 테스트 계정으로 로그인:
   - **Username**: `admin`
   - **Password**: `admin123`
4. 로그인 성공 후 **Dashboard**로 리다이렉트됨

### 5.3 Dashboard 확인

로그인 후 Dashboard 페이지에서 다음을 확인:
- ✅ 사용자 프로필 카드 (왼쪽)
- ✅ 역할 배지 (admin, user)
- ✅ 메모 작성 기능 (오른쪽)

### 5.4 메모 CRUD 테스트

1. **"새 메모 작성"** 버튼 클릭
2. 제목과 내용 입력
3. **"작성"** 버튼 클릭
4. 메모가 목록에 표시됨
5. 수정/삭제 버튼으로 메모 편집 가능

### 5.5 Admin 페이지 테스트

1. 상단 네비게이션 바에서 **"관리자"** 클릭
2. Admin 대시보드 표시
3. **"사용자"** 탭에서 등록된 사용자 확인
4. **"모든 메모"** 탭에서 전체 메모 확인

### 5.6 Role 기반 접근 제어 테스트

1. 로그아웃
2. **user** 계정으로 로그인 (user/user123)
3. **"관리자"** 메뉴 클릭 시도
4. ⛔ Dashboard로 리다이렉트되고 "접근 권한이 없습니다" 메시지 표시

## 6단계: RLS 정책 테스트

### 6.1 여러 사용자로 메모 작성

1. **admin** 계정으로 메모 몇 개 작성
2. 로그아웃
3. **user** 계정으로 로그인하여 메모 작성
4. **user**는 **admin**의 메모를 볼 수 없음 (RLS 정책 작동)

### 6.2 Supabase에서 확인

Supabase 대시보드의 **Table Editor**에서:
1. **notes** 테이블 열기
2. 모든 메모 확인
3. 각 메모의 `user_id`가 다름을 확인

## 문제 해결

### Keycloak 연결 오류

**증상**: "Keycloak 로그인 페이지로 이동 중..." 에서 멈춤

**해결방법**:
1. Keycloak이 실행 중인지 확인:
   ```bash
   docker-compose ps
   ```
2. Keycloak 로그 확인:
   ```bash
   docker-compose logs keycloak
   ```
3. 포트 8080이 사용 중인지 확인:
   ```bash
   lsof -i :8080
   ```

### Supabase 연결 오류

**증상**: "메모를 불러오는데 실패했습니다"

**해결방법**:
1. `.env.local`의 Supabase URL과 키 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. Migration이 정상적으로 실행되었는지 확인:
   ```bash
   supabase db reset  # 로컬 Supabase만
   ```

### JWT 검증 실패

**증상**: 로그인 후 바로 로그아웃됨

**해결방법**:
1. 브라우저 쿠키 확인 (개발자 도구 → Application → Cookies)
2. `access_token` 쿠키가 설정되어 있는지 확인
3. JWT를 https://jwt.io 에서 디코딩하여 유효성 확인

### 빌드 오류

**증상**: `npm run dev` 실행 시 오류

**해결방법**:
```bash
# node_modules 및 캐시 삭제
rm -rf node_modules .next

# 의존성 재설치
npm install

# 개발 서버 재시작
npm run dev
```

## 다음 단계

설정이 완료되었습니다! 이제 다음을 확인하세요:

- [시스템 아키텍처](ARCHITECTURE.md) - 전체 시스템 구조 이해
- [문제 해결](TROUBLESHOOTING.md) - 자주 발생하는 문제 해결
- Keycloak Admin Console에서 추가 사용자 및 역할 생성
- Supabase에서 RLS 정책 커스터마이징

## 추가 설정

### HTTPS 설정 (프로덕션)

로컬 개발이 아닌 실제 배포 시:
1. Reverse Proxy (Nginx, Caddy) 설정
2. Let's Encrypt로 SSL 인증서 발급
3. Keycloak의 `KC_HOSTNAME`과 `KC_HTTP_ENABLED` 변경

### 이메일 설정

Keycloak에서 이메일 인증을 사용하려면:
1. Keycloak Admin Console → Realm Settings → Email
2. SMTP 서버 정보 입력
3. Test connection으로 확인

### 로깅 및 모니터링

프로덕션 환경에서는:
- Application Performance Monitoring (APM) 도구 연동
- 로그 수집 및 분석 (ELK Stack, DataDog 등)
- 에러 트래킹 (Sentry 등)

## 지원

문제가 계속되면 [GitHub Issues](https://github.com/binseongpark/enterprise-sso-demo/issues)에 문의하세요.
