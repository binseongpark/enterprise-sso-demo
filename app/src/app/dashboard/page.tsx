'use client';

/**
 * 대시보드 페이지
 * 
 * 인증된 사용자만 접근 가능합니다.
 * 사용자 프로필과 메모 CRUD 기능을 제공합니다.
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getUserInfo, isAuthenticated } from '@/lib/keycloak';
import { UserProfile } from '@/components/UserProfile';
import { NotesList } from '@/components/NotesList';
import type { KeycloakUser } from '@/types/auth';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [loading, setLoading] = useState(true);
  const error = searchParams.get('error');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (!isAuthenticated()) {
        router.push('/login?redirect=/dashboard');
        return;
      }

      const userInfo = await getUserInfo();
      if (userInfo) {
        setUser(userInfo);
      } else {
        router.push('/login?redirect=/dashboard');
      }
    } catch (err) {
      console.error('사용자 정보 로드 실패:', err);
      router.push('/login?redirect=/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 에러 메시지 */}
      {error === 'forbidden' && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <p className="text-sm">
            ⛔ 접근 권한이 없습니다. 해당 페이지는 Admin 역할이 필요합니다.
          </p>
        </div>
      )}

      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">
          안녕하세요, {user.name || user.preferred_username}님! 👋
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 사용자 프로필 */}
        <div className="lg:col-span-1">
          <UserProfile user={user} />
        </div>

        {/* 메모 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">내 메모</h2>
            <NotesList />
          </div>
        </div>
      </div>
    </div>
  );
}
