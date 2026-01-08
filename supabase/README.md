# Supabase 설정 가이드

## 개요

이 디렉토리에는 Supabase 데이터베이스 마이그레이션 파일과 설정 정보가 포함되어 있습니다.

## 로컬 Supabase 설정

이 프로젝트는 로컬 셀프호스트 Supabase를 사용하도록 설계되었습니다. 그러나 클라우드 Supabase를 사용할 수도 있습니다.

### 옵션 1: Supabase Cloud (권장)

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - Anon Public Key
   - Service Role Key

3. Next.js 앱의 `.env.local`에 설정:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 옵션 2: 로컬 Docker Supabase

로컬에서 Supabase를 실행하려면 [Supabase 공식 Docker 설정](https://supabase.com/docs/guides/self-hosting/docker)을 참조하세요.

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 초기화
supabase init

# 로컬 Supabase 시작
supabase start
```

기본 포트: `http://localhost:54321`

## Migration 실행 방법

### Supabase Cloud 사용 시

1. Supabase 대시보드에 로그인
2. 좌측 메뉴에서 **SQL Editor** 선택
3. `migrations/001_initial_schema.sql` 파일의 내용을 복사
4. SQL Editor에 붙여넣기
5. **Run** 버튼 클릭

### Supabase CLI 사용 시

```bash
# 로컬 Supabase에 마이그레이션 적용
supabase db push

# 또는 직접 SQL 실행
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
```

## 데이터베이스 스키마

### 테이블 구조

#### `user_profiles` 테이블

사용자 프로필 정보를 저장합니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| keycloak_sub | TEXT | Keycloak Subject (JWT sub claim) - UNIQUE |
| email | TEXT | 이메일 주소 |
| full_name | TEXT | 전체 이름 |
| role | TEXT | 사용자 역할 (admin, user, viewer) |
| created_at | TIMESTAMP | 생성 일시 |
| updated_at | TIMESTAMP | 수정 일시 |

#### `notes` 테이블

사용자별 메모를 저장합니다.

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key → user_profiles.id |
| title | TEXT | 메모 제목 |
| content | TEXT | 메모 내용 |
| is_public | BOOLEAN | 공개 여부 |
| created_at | TIMESTAMP | 생성 일시 |
| updated_at | TIMESTAMP | 수정 일시 |

## Row Level Security (RLS) 정책

### user_profiles 정책

1. **사용자는 자신의 프로필만 조회 가능**
   - JWT의 `sub` claim과 `keycloak_sub`가 일치하는 경우만 허용

2. **사용자는 자신의 프로필만 수정 가능**
   - 본인의 프로필만 수정 가능

3. **서비스 역할은 모든 프로필 생성 가능**
   - 인증 콜백에서 새 사용자 프로필 생성 시 사용

4. **Admin은 모든 프로필 조회 가능**
   - JWT의 `realm_roles`에 `admin`이 포함된 경우

### notes 정책

1. **사용자는 자신의 메모만 CRUD 가능**
   - 본인의 `user_id`와 일치하는 메모만 조회/수정/삭제

2. **공개 메모는 모두 조회 가능**
   - `is_public = true`인 메모는 모든 사용자가 조회 가능

3. **Admin은 모든 메모 CRUD 가능**
   - JWT의 `realm_roles`에 `admin`이 포함된 경우

## JWT 설정 방법

Supabase가 Keycloak JWT를 검증하려면 JWT 설정이 필요합니다.

### Supabase Cloud 설정

1. Supabase 대시보드의 **Settings** → **API** 이동
2. **JWT Settings** 섹션에서:
   - **JWT Secret**: Keycloak의 Realm Public Key 또는 JWKS URL 설정

### JWT Claims 매핑

Keycloak JWT에서 다음 claims를 사용합니다:

```json
{
  "sub": "keycloak-user-id",
  "email": "user@test.com",
  "realm_roles": ["user", "admin"],
  "preferred_username": "username"
}
```

Supabase RLS 정책은 다음 설정을 통해 JWT claims를 읽습니다:

```sql
current_setting('request.jwt.claims', true)::json->>'sub'
current_setting('request.jwt.claims', true)::json->'realm_roles'
```

## RLS 정책 테스트 방법

### 1. Supabase SQL Editor에서 테스트

```sql
-- 현재 JWT claims 확인
SELECT current_setting('request.jwt.claims', true);

-- 특정 사용자로 테스트 (개발 환경)
SET request.jwt.claims = '{"sub":"test-keycloak-sub","realm_roles":["user"]}';

-- 자신의 프로필 조회 (성공해야 함)
SELECT * FROM user_profiles WHERE keycloak_sub = 'test-keycloak-sub';

-- 다른 사용자 프로필 조회 (실패해야 함)
SELECT * FROM user_profiles WHERE keycloak_sub = 'other-keycloak-sub';
```

### 2. Next.js API에서 테스트

```typescript
// app/src/app/api/test-rls/route.ts
import { createClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const supabase = createClient(request);
  
  // RLS 정책이 적용된 쿼리
  const { data, error } = await supabase
    .from('notes')
    .select('*');
  
  return Response.json({ data, error });
}
```

## 헬퍼 함수

### `get_current_user_id()`

현재 인증된 사용자의 프로필 ID를 반환합니다.

```sql
SELECT get_current_user_id();
```

### `is_admin()`

현재 사용자가 admin 역할을 가지고 있는지 확인합니다.

```sql
SELECT is_admin();
```

## 인덱스

성능 최적화를 위해 다음 인덱스가 생성됩니다:

- `idx_user_profiles_keycloak_sub`: keycloak_sub로 빠른 조회
- `idx_user_profiles_email`: email로 검색
- `idx_notes_user_id`: user_id로 메모 조회
- `idx_notes_created_at`: 생성일 기준 정렬
- `idx_notes_is_public`: 공개 메모 필터링

## 문제 해결

### RLS 정책이 작동하지 않는 경우

1. **JWT Claims 확인**:
```sql
SELECT current_setting('request.jwt.claims', true);
```

2. **RLS 활성화 확인**:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

3. **정책 확인**:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('user_profiles', 'notes');
```

### Service Role Key 사용

RLS를 우회해야 하는 경우 (예: 관리 작업) Service Role Key를 사용하세요:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // RLS 우회
);
```

> ⚠️ **주의**: Service Role Key는 서버 사이드에서만 사용하고, 클라이언트에 노출하지 마세요!

### Migration 롤백

문제가 발생한 경우 테이블을 삭제하고 다시 생성할 수 있습니다:

```sql
-- 주의: 모든 데이터가 삭제됩니다!
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 그런 다음 마이그레이션을 다시 실행
```

## 추가 리소스

- [Supabase RLS 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS 공식 문서](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase JWT 인증](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
