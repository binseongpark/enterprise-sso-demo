'use client';

/**
 * 관리자 페이지
 * 
 * Admin 역할을 가진 사용자만 접근 가능합니다.
 * 모든 사용자 및 메모를 조회할 수 있습니다.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, isAuthenticated, hasRole } from '@/lib/keycloak';
import { getToken } from '@/lib/keycloak';
import type { UserProfile, Note } from '@/types/auth';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'notes'>('users');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // 인증 확인
      if (!isAuthenticated()) {
        router.push('/login?redirect=/admin');
        return;
      }

      // Admin 역할 확인
      if (!hasRole('admin')) {
        router.push('/dashboard?error=forbidden');
        return;
      }

      // 데이터 로드
      await Promise.all([loadProfiles(), loadAllNotes()]);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const token = getToken();
      if (!token) return;

      // 실제로는 Supabase에서 모든 프로필을 가져와야 하지만,
      // 여기서는 데모를 위해 빈 배열로 초기화
      // TODO: Supabase API 구현 후 실제 데이터 로드
      setProfiles([]);
    } catch (err) {
      console.error('프로필 로드 실패:', err);
    }
  };

  const loadAllNotes = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch('/api/notes?all=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAllNotes(data.notes || []);
      }
    } catch (err) {
      console.error('메모 로드 실패:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">👑</span>
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        </div>
        <p className="mt-2 text-gray-600">
          모든 사용자와 데이터를 관리할 수 있습니다.
        </p>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            사용자 ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notes'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            모든 메모 ({allNotes.length})
          </button>
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'users' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">사용자 목록</h2>
          </div>
          
          {profiles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                등록된 사용자가 없습니다.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                사용자가 로그인하면 자동으로 프로필이 생성됩니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      역할
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      생성일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {profiles.map((profile) => (
                    <tr key={profile.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {profile.full_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(profile.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">모든 메모</h2>
          </div>
          
          {allNotes.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">작성된 메모가 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {allNotes.map((note) => (
                <div key={note.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-medium text-gray-900">
                          {note.title}
                        </h3>
                        {note.is_public && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            공개
                          </span>
                        )}
                      </div>
                      {note.content && (
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {note.content}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(note.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
