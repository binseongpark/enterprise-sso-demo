-- =====================================================
-- Enterprise SSO 데모 시스템 데이터베이스 스키마
-- =====================================================

-- 사용자 프로필 테이블
-- Keycloak 사용자와 동기화되는 프로필 정보 저장
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloak_sub TEXT UNIQUE NOT NULL,  -- Keycloak subject (sub claim from JWT)
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 메모 테이블
-- 사용자별 메모 저장 (CRUD 기능 데모용)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 트리거 및 함수
-- =====================================================

-- updated_at 컬럼을 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- user_profiles 테이블의 updated_at 트리거
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- notes 테이블의 updated_at 트리거
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) 설정
-- =====================================================

-- RLS 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- user_profiles 테이블 RLS 정책
-- =====================================================

-- 정책: 사용자는 자신의 프로필만 조회 가능
-- JWT의 sub claim과 keycloak_sub가 일치하는 경우만 허용
CREATE POLICY "사용자는 자신의 프로필만 조회 가능"
  ON user_profiles
  FOR SELECT
  USING (
    keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- 정책: 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "사용자는 자신의 프로필만 수정 가능"
  ON user_profiles
  FOR UPDATE
  USING (
    keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
  )
  WITH CHECK (
    keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- 정책: 서비스 역할은 모든 프로필 생성 가능 (인증 콜백에서 사용)
CREATE POLICY "서비스 역할은 모든 프로필 생성 가능"
  ON user_profiles
  FOR INSERT
  WITH CHECK (true);

-- 정책: Admin 역할은 모든 프로필 조회 가능
CREATE POLICY "Admin은 모든 프로필 조회 가능"
  ON user_profiles
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->'realm_roles' ? 'admin'
  );

-- =====================================================
-- notes 테이블 RLS 정책
-- =====================================================

-- 정책: 사용자는 자신의 메모만 조회 가능
CREATE POLICY "사용자는 자신의 메모만 조회 가능"
  ON notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = notes.user_id
      AND user_profiles.keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- 정책: 사용자는 자신의 메모만 생성 가능
CREATE POLICY "사용자는 자신의 메모만 생성 가능"
  ON notes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = notes.user_id
      AND user_profiles.keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- 정책: 사용자는 자신의 메모만 수정 가능
CREATE POLICY "사용자는 자신의 메모만 수정 가능"
  ON notes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = notes.user_id
      AND user_profiles.keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = notes.user_id
      AND user_profiles.keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- 정책: 사용자는 자신의 메모만 삭제 가능
CREATE POLICY "사용자는 자신의 메모만 삭제 가능"
  ON notes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = notes.user_id
      AND user_profiles.keycloak_sub = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- 정책: 공개 메모는 모두 조회 가능
CREATE POLICY "공개 메모는 모두 조회 가능"
  ON notes
  FOR SELECT
  USING (is_public = true);

-- 정책: Admin 역할은 모든 메모 조회 가능
CREATE POLICY "Admin은 모든 메모 조회 가능"
  ON notes
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->'realm_roles' ? 'admin'
  );

-- 정책: Admin 역할은 모든 메모 수정 가능
CREATE POLICY "Admin은 모든 메모 수정 가능"
  ON notes
  FOR UPDATE
  USING (
    current_setting('request.jwt.claims', true)::json->'realm_roles' ? 'admin'
  );

-- 정책: Admin 역할은 모든 메모 삭제 가능
CREATE POLICY "Admin은 모든 메모 삭제 가능"
  ON notes
  FOR DELETE
  USING (
    current_setting('request.jwt.claims', true)::json->'realm_roles' ? 'admin'
  );

-- =====================================================
-- 인덱스
-- =====================================================

-- keycloak_sub로 빠른 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_user_profiles_keycloak_sub 
  ON user_profiles(keycloak_sub);

-- email로 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON user_profiles(email);

-- user_id로 메모 조회를 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_notes_user_id 
  ON notes(user_id);

-- 생성일로 정렬을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_notes_created_at 
  ON notes(created_at DESC);

-- 공개 메모 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_notes_is_public 
  ON notes(is_public) 
  WHERE is_public = true;

-- =====================================================
-- 헬퍼 함수
-- =====================================================

-- 현재 사용자의 프로필 ID 가져오기
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
DECLARE
  keycloak_sub_value TEXT;
  user_id_value UUID;
BEGIN
  -- JWT에서 sub claim 추출
  keycloak_sub_value := current_setting('request.jwt.claims', true)::json->>'sub';
  
  -- keycloak_sub로 user_id 조회
  SELECT id INTO user_id_value
  FROM user_profiles
  WHERE keycloak_sub = keycloak_sub_value;
  
  RETURN user_id_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 현재 사용자가 admin 역할을 가지고 있는지 확인
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN current_setting('request.jwt.claims', true)::json->'realm_roles' ? 'admin';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 테스트 데이터 (선택사항)
-- =====================================================

-- 개발 환경에서만 사용할 샘플 데이터
-- 프로덕션에서는 이 섹션을 제거하거나 주석 처리하세요

-- 샘플 사용자 프로필 (Keycloak에서 자동으로 생성되지만 테스트용)
-- INSERT INTO user_profiles (keycloak_sub, email, full_name, role) VALUES
--   ('keycloak-admin-sub', 'admin@test.com', 'Admin User', 'admin'),
--   ('keycloak-user-sub', 'user@test.com', 'Regular User', 'user'),
--   ('keycloak-viewer-sub', 'viewer@test.com', 'Viewer User', 'viewer')
-- ON CONFLICT (keycloak_sub) DO NOTHING;

-- =====================================================
-- 완료 메시지
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Enterprise SSO 데이터베이스 스키마 생성 완료';
  RAISE NOTICE '📋 테이블: user_profiles, notes';
  RAISE NOTICE '🔒 RLS 정책: 활성화됨';
  RAISE NOTICE '📊 인덱스: 생성됨';
END $$;
