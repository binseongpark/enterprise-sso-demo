# Keycloak 설정 가이드

## 개요

이 디렉토리에는 Keycloak 인증 서버 설정 파일이 포함되어 있습니다. `realm-config.json` 파일은 Docker Compose를 통해 Keycloak이 시작될 때 자동으로 임포트됩니다.

## Keycloak 접속 방법

### Admin Console

Keycloak을 실행한 후 다음 주소로 접속하세요:

```
http://localhost:8080
```

### Admin 로그인 정보

- **Username**: `admin`
- **Password**: `admin`

> ⚠️ **보안 경고**: 프로덕션 환경에서는 반드시 비밀번호를 변경하세요!

## Realm 설정 확인

1. Admin Console에 로그인
2. 좌측 상단의 Realm 선택 드롭다운에서 **"enterprise-sso"** 선택
3. 다음 메뉴들을 확인:
   - **Realm settings**: Realm 기본 설정
   - **Clients**: 등록된 클라이언트 애플리케이션
   - **Realm roles**: 정의된 역할들
   - **Users**: 등록된 사용자들

## Client 설정 확인

### Client ID: `nextjs-app`

Next.js 애플리케이션을 위한 클라이언트 설정입니다.

#### Client Secret 확인 방법

1. Admin Console에서 **enterprise-sso** realm 선택
2. 좌측 메뉴에서 **Clients** 클릭
3. 클라이언트 목록에서 **nextjs-app** 클릭
4. **Credentials** 탭 선택
5. **Client Secret** 값을 복사
6. 이 값을 Next.js 앱의 `.env.local` 파일에 `KEYCLOAK_CLIENT_SECRET`로 설정

#### Client 설정 확인 사항

- **Client Protocol**: `openid-connect`
- **Access Type**: `confidential` (Public Client: OFF)
- **Standard Flow Enabled**: ON
- **Direct Access Grants Enabled**: ON
- **Valid Redirect URIs**: `http://localhost:3000/*`
- **Web Origins**: `http://localhost:3000`

## Realm Roles

### 정의된 역할

| Role | 설명 | 권한 |
|------|------|------|
| **admin** | 관리자 역할 | 모든 데이터 접근 및 관리 권한, /admin 페이지 접근 가능 |
| **user** | 일반 사용자 역할 | 자신의 데이터 CRUD 권한, /dashboard 접근 가능 |
| **viewer** | 뷰어 역할 | 읽기 전용 권한, /dashboard 접근 가능 (읽기만) |

### Role 확인 방법

1. Admin Console에서 **enterprise-sso** realm 선택
2. 좌측 메뉴에서 **Realm roles** 클릭
3. 각 역할을 클릭하여 설명 및 설정 확인

## 사용자 관리

### 테스트 사용자 계정

| Username | Email | Password | Roles | 설명 |
|----------|-------|----------|-------|------|
| admin | admin@test.com | admin123 | admin, user | 관리자 및 일반 사용자 권한 |
| user | user@test.com | user123 | user | 일반 사용자 권한 |
| viewer | viewer@test.com | viewer123 | viewer | 읽기 전용 권한 |

### 사용자 목록 확인

1. Admin Console에서 **enterprise-sso** realm 선택
2. 좌측 메뉴에서 **Users** 클릭
3. **View all users** 버튼 클릭

### 새 사용자 추가

1. **Users** 페이지에서 **Add user** 버튼 클릭
2. 필수 정보 입력:
   - **Username**: 사용자 ID
   - **Email**: 이메일 주소
   - **First Name**: 이름
   - **Last Name**: 성
   - **Email Verified**: ON (이메일 인증 완료로 설정)
3. **Save** 버튼 클릭
4. **Credentials** 탭에서 비밀번호 설정:
   - **Password**: 초기 비밀번호
   - **Password Confirmation**: 비밀번호 확인
   - **Temporary**: OFF (임시 비밀번호가 아닌 경우)
   - **Set Password** 버튼 클릭

### Role 할당 방법

1. **Users** 페이지에서 사용자 선택
2. **Role Mappings** 탭 클릭
3. **Available Roles** 목록에서 할당할 역할 선택
4. **Add selected** 버튼 클릭
5. 할당된 역할이 **Assigned Roles**에 표시됨

### 사용자 비밀번호 재설정

1. **Users** 페이지에서 사용자 선택
2. **Credentials** 탭 클릭
3. **Reset Password** 섹션에서:
   - **Password**: 새 비밀번호
   - **Password Confirmation**: 비밀번호 확인
   - **Temporary**: 사용자가 첫 로그인 시 비밀번호 변경 필요 여부
   - **Reset Password** 버튼 클릭

## JWT 토큰 설정

### Token Mappers

realm-config.json에는 다음 Protocol Mappers가 설정되어 있습니다:

1. **realm-roles**: Realm 역할을 JWT의 `realm_roles` claim에 포함
2. **client-roles**: Client 역할을 JWT에 포함

이 설정을 통해 Next.js 앱에서 JWT 토큰에서 직접 사용자 역할을 확인할 수 있습니다.

### Token 확인 방법

1. https://jwt.io 에서 JWT 토큰 디코딩
2. 또는 Next.js 앱에서 `jose` 라이브러리로 디코딩:

```typescript
import { decodeJwt } from 'jose';

const token = 'your-jwt-token';
const decoded = decodeJwt(token);
console.log(decoded.realm_roles); // ['admin', 'user']
```

## 문제 해결

### Keycloak이 시작되지 않는 경우

1. Docker 컨테이너 로그 확인:
```bash
docker-compose logs keycloak
```

2. PostgreSQL 연결 확인:
```bash
docker-compose logs postgres-keycloak
```

3. 포트 8080이 이미 사용 중인 경우:
```bash
# 포트 사용 확인
lsof -i :8080

# docker-compose.yml에서 다른 포트로 변경
ports:
  - "8081:8080"
```

### Realm import 실패

1. `realm-config.json` 파일이 올바른 JSON 형식인지 확인
2. JSON 유효성 검사:
```bash
cat keycloak/realm-config.json | jq .
```

### Client Secret이 보이지 않는 경우

1. Client가 **confidential** 타입인지 확인
2. **Access Type**이 `public`이 아닌 `confidential`로 설정되어야 함
3. Client 설정에서 **Settings** 탭 → **Access Type** → `confidential` 선택 → **Save**

## 보안 고려사항

### 프로덕션 배포 시 필수 변경 사항

1. **Admin 비밀번호 변경**
   - `docker-compose.yml`의 `KEYCLOAK_ADMIN_PASSWORD` 변경

2. **Client Secret 변경**
   - Keycloak Admin Console에서 새 Secret 생성 또는 재생성

3. **데이터베이스 비밀번호 변경**
   - `docker-compose.yml`의 PostgreSQL 비밀번호 변경

4. **SSL/TLS 설정**
   - `KC_HOSTNAME_STRICT=true` 설정
   - `KC_HTTP_ENABLED=false` 설정
   - 인증서 설정

5. **Redirect URIs 제한**
   - 프로덕션 도메인만 허용하도록 설정

## 추가 리소스

- [Keycloak 공식 문서](https://www.keycloak.org/documentation)
- [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/)
- [OpenID Connect 스펙](https://openid.net/connect/)
