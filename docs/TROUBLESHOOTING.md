# 문제 해결 가이드

이 문서는 Enterprise SSO 데모 시스템에서 자주 발생하는 문제와 해결 방법을 제공합니다.

## 목차

- [Keycloak 관련 문제](#keycloak-관련-문제)
- [Supabase 관련 문제](#supabase-관련-문제)
- [Next.js 앱 관련 문제](#nextjs-앱-관련-문제)
- [인증 관련 문제](#인증-관련-문제)
- [CORS 문제](#cors-문제)
- [RLS 정책 문제](#rls-정책-문제)
- [로그 확인 방법](#로그-확인-방법)

---

## Keycloak 관련 문제

### 1. Keycloak이 시작되지 않음

**증상**:
```bash
docker-compose up -d
# Keycloak 컨테이너가 계속 재시작됨
```

**원인**:
- PostgreSQL이 준비되기 전에 Keycloak이 시작 시도
- 포트 충돌
- 메모리 부족

**해결방법**:

1. **로그 확인**:
```bash
docker-compose logs keycloak
```

2. **PostgreSQL 상태 확인**:
```bash
docker-compose ps postgres-keycloak
# STATE가 "Up"이어야 함
```

3. **포트 충돌 확인**:
```bash
# macOS/Linux
lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

다른 프로세스가 8080 포트를 사용 중이면 종료하거나 docker-compose.yml에서 포트 변경:
```yaml
ports:
  - "8081:8080"  # 8080 대신 8081 사용
```

4. **컨테이너 재시작**:
```bash
docker-compose down
docker-compose up -d
```

### 2. Realm import 실패

**증상**:
- Keycloak은 시작되지만 `enterprise-sso` realm이 없음

**원인**:
- `realm-config.json` 파일 경로 오류
- JSON 형식 오류

**해결방법**:

1. **JSON 유효성 검사**:
```bash
cat keycloak/realm-config.json | jq .
# 에러가 없으면 유효한 JSON
```

2. **파일 경로 확인**:
```bash
ls -la keycloak/realm-config.json
# 파일이 존재해야 함
```

3. **수동 import**:
   - Keycloak Admin Console 접속
   - 좌측 메뉴에서 Realm 선택 드롭다운
   - "Create Realm" 클릭
   - "Browse..." 버튼으로 realm-config.json 선택
   - "Create" 클릭

### 3. Client Secret이 보이지 않음

**증상**:
- Keycloak Admin Console에서 Client의 Credentials 탭이 없음

**원인**:
- Client가 Public으로 설정됨

**해결방법**:
1. Clients → nextjs-app 클릭
2. Settings 탭에서:
   - **Client authentication**: ON
   - **Authorization**: OFF (선택사항)
3. Save
4. Credentials 탭에서 Client Secret 확인

### 4. 로그인 후 "Invalid redirect URI" 오류

**증상**:
```
Invalid parameter: redirect_uri
```

**원인**:
- Keycloak Client 설정에서 Redirect URI가 올바르지 않음

**해결방법**:
1. Keycloak Admin Console → Clients → nextjs-app
2. Settings 탭에서 **Valid Redirect URIs** 확인:
   ```
   http://localhost:3000/*
   http://localhost:3000/api/auth/callback
   ```
3. **Web Origins**도 확인:
   ```
   http://localhost:3000
   ```
4. Save

---

## Supabase 관련 문제

### 1. Migration 실행 실패

**증상**:
```
Error: relation "user_profiles" already exists
```

**원인**:
- Migration이 이미 실행됨
- 부분적으로 실패한 Migration

**해결방법**:

**Supabase Cloud**:
1. SQL Editor에서 테이블 삭제:
```sql
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
```
2. Migration SQL 다시 실행

**로컬 Supabase**:
```bash
supabase db reset
```

### 2. RLS 정책 작동 안 함

**증상**:
- 사용자가 다른 사용자의 데이터를 볼 수 있음

**원인**:
- RLS가 비활성화됨
- JWT가 올바르게 전달되지 않음
- 정책 조건이 잘못됨

**해결방법**:

1. **RLS 활성화 확인**:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
-- rowsecurity가 true여야 함
```

2. **정책 확인**:
```sql
SELECT * FROM pg_policies 
WHERE tablename IN ('user_profiles', 'notes');
```

3. **JWT Claims 확인**:
```sql
SELECT current_setting('request.jwt.claims', true);
-- JWT claims가 출력되어야 함
```

4. **Service Role Key 사용 확인**:
   - Service Role Key는 RLS를 우회함
   - API에서 Anon Key를 사용하는지 확인

### 3. Connection 오류

**증상**:
```
Error: Failed to connect to Supabase
```

**원인**:
- Supabase URL 또는 Key 오류
- 네트워크 문제
- Supabase 프로젝트 일시 중지

**해결방법**:

1. **.env.local 확인**:
```bash
cat app/.env.local | grep SUPABASE
# URL과 Key가 올바른지 확인
```

2. **Supabase 프로젝트 상태 확인**:
   - Supabase 대시보드 접속
   - 프로젝트가 활성 상태인지 확인

3. **네트워크 테스트**:
```bash
curl https://your-project.supabase.co
# 응답이 있어야 함
```

---

## Next.js 앱 관련 문제

### 1. 빌드 오류

**증상**:
```bash
npm run dev
# Module not found 에러
```

**원인**:
- 의존성 설치 안 됨
- Node 버전 불일치
- 캐시 오염

**해결방법**:

1. **의존성 재설치**:
```bash
cd app
rm -rf node_modules .next
npm install
```

2. **Node 버전 확인**:
```bash
node --version
# v18 이상이어야 함
```

3. **캐시 삭제**:
```bash
rm -rf .next
npm run dev
```

### 2. 환경변수 인식 안 됨

**증상**:
```
Error: NEXT_PUBLIC_KEYCLOAK_URL is not defined
```

**원인**:
- `.env.local` 파일 없음
- 환경변수 이름 오타
- 서버 재시작 안 함

**해결방법**:

1. **.env.local 파일 확인**:
```bash
ls -la app/.env.local
# 파일이 존재해야 함
```

2. **환경변수 내용 확인**:
```bash
cat app/.env.local
```

3. **서버 재시작**:
```bash
# Ctrl+C로 중지 후
npm run dev
```

### 3. 페이지가 로드되지 않음

**증상**:
- 브라우저에서 빈 화면
- 콘솔에 JavaScript 에러

**원인**:
- 컴포넌트 에러
- API 호출 실패
- 라우팅 문제

**해결방법**:

1. **브라우저 콘솔 확인**:
   - F12 → Console 탭
   - 에러 메시지 확인

2. **Next.js 터미널 로그 확인**:
```bash
# npm run dev를 실행한 터미널에서 에러 확인
```

3. **네트워크 탭 확인**:
   - F12 → Network 탭
   - 실패한 요청 확인

---

## 인증 관련 문제

### 1. 로그인 루프

**증상**:
- 로그인 후 다시 로그인 페이지로 리다이렉트

**원인**:
- JWT 쿠키가 설정되지 않음
- JWT 검증 실패
- Redirect URI 불일치

**해결방법**:

1. **브라우저 쿠키 확인**:
   - F12 → Application → Cookies
   - `access_token` 쿠키 존재 확인

2. **JWT 디코딩**:
```bash
# 쿠키에서 access_token 복사
# https://jwt.io 에서 디코딩
```

3. **쿠키 삭제 후 재시도**:
   - 브라우저에서 모든 쿠키 삭제
   - 재로그인

### 2. "인증이 필요합니다" 에러

**증상**:
```
401 Unauthorized: 인증이 필요합니다
```

**원인**:
- 토큰이 만료됨
- 토큰이 쿠키에 없음
- 미들웨어가 토큰을 인식하지 못함

**해결방법**:

1. **토큰 만료 확인**:
```javascript
// 브라우저 콘솔에서
const token = document.cookie.split('access_token=')[1]?.split(';')[0];
const decoded = JSON.parse(atob(token.split('.')[1]));
console.log('만료 시간:', new Date(decoded.exp * 1000));
```

2. **재로그인**:
   - 로그아웃 후 다시 로그인

3. **Keycloak 세션 확인**:
   - Keycloak Admin Console → Sessions
   - 활성 세션 확인

### 3. JWT 검증 실패

**증상**:
```
Error: Invalid token signature
```

**원인**:
- Client Secret 불일치
- JWT 발급자(issuer) 불일치
- 토큰 변조

**해결방법**:

1. **Client Secret 확인**:
   - `.env.local`의 `KEYCLOAK_CLIENT_SECRET`
   - Keycloak Admin Console의 Client Secret
   - 두 값이 일치해야 함

2. **Issuer 확인**:
```javascript
// JWT의 iss claim 확인
{
  "iss": "http://localhost:8080/realms/enterprise-sso"
}
```

---

## CORS 문제

### 1. CORS 오류

**증상**:
```
Access to fetch at 'http://localhost:8080' has been blocked by CORS policy
```

**원인**:
- Keycloak에서 Next.js 도메인을 허용하지 않음

**해결방법**:

1. **Keycloak Web Origins 설정**:
   - Clients → nextjs-app → Settings
   - **Web Origins**:
     ```
     http://localhost:3000
     ```
   - Save

2. **브라우저 캐시 삭제**:
   - Ctrl+Shift+Delete
   - 캐시 및 쿠키 삭제

---

## RLS 정책 문제

### 1. 사용자가 자신의 데이터를 볼 수 없음

**증상**:
- Dashboard에서 메모가 표시되지 않음
- "메모를 불러오는데 실패했습니다" 에러

**원인**:
- RLS 정책이 너무 엄격함
- JWT claims가 올바르게 전달되지 않음
- user_profiles에 사용자 레코드가 없음

**해결방법**:

1. **user_profiles 확인**:
```sql
SELECT * FROM user_profiles WHERE keycloak_sub = 'your-keycloak-sub';
-- 레코드가 있어야 함
```

2. **JWT claims 확인**:
```sql
SELECT current_setting('request.jwt.claims', true);
```

3. **수동으로 프로필 생성** (테스트용):
```sql
INSERT INTO user_profiles (keycloak_sub, email, full_name, role)
VALUES ('your-keycloak-sub', 'test@test.com', 'Test User', 'user');
```

### 2. Admin이 모든 데이터를 볼 수 없음

**증상**:
- Admin으로 로그인해도 다른 사용자 데이터가 보이지 않음

**원인**:
- JWT에 realm_roles가 포함되지 않음
- RLS 정책의 role 확인 로직 오류

**해결방법**:

1. **JWT에 realm_roles 확인**:
```javascript
// 브라우저 콘솔에서 JWT 디코딩
// realm_access.roles에 "admin"이 있어야 함
```

2. **Keycloak Role Mapper 확인**:
   - Clients → nextjs-app → Client scopes
   - roles 클릭
   - Mappers 확인

3. **RLS 정책 테스트**:
```sql
-- Admin role이 있는 JWT로 설정
SET request.jwt.claims = '{"sub":"test","realm_roles":["admin"]}';

-- 모든 메모가 조회되어야 함
SELECT * FROM notes;
```

---

## 로그 확인 방법

### Docker 로그

```bash
# Keycloak 로그
docker-compose logs -f keycloak

# PostgreSQL 로그
docker-compose logs -f postgres-keycloak

# 모든 컨테이너 로그
docker-compose logs -f
```

### Next.js 로그

```bash
# 개발 서버 터미널에서 실시간 로그 확인
# 또는

# 브라우저 콘솔 (F12)
```

### Supabase 로그

**Supabase Cloud**:
1. 대시보드 → Logs
2. API, Database, Auth 등 로그 확인

**로컬 Supabase**:
```bash
supabase logs
```

---

## 추가 디버깅 팁

### 1. 네트워크 요청 확인

브라우저 F12 → Network 탭:
- 모든 HTTP 요청/응답 확인
- 실패한 요청의 상세 정보 확인
- 헤더 및 쿠키 확인

### 2. React DevTools

React 컴포넌트 상태 확인:
- [React Developer Tools](https://react.dev/learn/react-developer-tools) 설치
- 컴포넌트 props 및 state 확인

### 3. 데이터베이스 직접 쿼리

Supabase SQL Editor에서:
```sql
-- 사용자 프로필 확인
SELECT * FROM user_profiles;

-- 메모 확인
SELECT * FROM notes;

-- RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'notes';
```

### 4. 환경 초기화

모든 것을 리셋하고 처음부터:

```bash
# 1. Docker 정리
docker-compose down -v
docker-compose up -d

# 2. Next.js 정리
cd app
rm -rf node_modules .next
npm install

# 3. 브라우저 캐시 및 쿠키 삭제

# 4. Supabase Migration 재실행
```

---

## 추가 지원

위 해결 방법으로도 문제가 해결되지 않으면:

1. **GitHub Issues**: [이슈 생성](https://github.com/binseongpark/enterprise-sso-demo/issues)
2. **로그 첨부**: 관련 에러 로그를 함께 제공
3. **환경 정보**:
   - OS 및 버전
   - Docker 버전
   - Node.js 버전
   - 브라우저 및 버전

---

## 참고 자료

- [Keycloak Troubleshooting](https://www.keycloak.org/docs/latest/server_admin/#troubleshooting)
- [Supabase Debugging](https://supabase.com/docs/guides/platform/debugging)
- [Next.js Debugging](https://nextjs.org/docs/advanced-features/debugging)
