'use client';

/**
 * AuthButton 컴포넌트
 * 
 * 로그인/로그아웃 버튼과 사용자 정보를 표시합니다.
 * 인증 상태에 따라 다른 UI를 보여줍니다.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo, isAuthenticated, login, logout } from '@/lib/keycloak';
import type { KeycloakUser } from '@/types/auth';

export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (isAuthenticated()) {
        const userInfo = await getUserInfo();
        setUser(userInfo);
      }
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('로그인 실패:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  // 로그인하지 않은 경우
  if (!user) {
    return (
      <button
        onClick={handleLogin}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
      >
        로그인
      </button>
    );
  }

  // 로그인한 경우
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {/* 아바타 */}
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-semibold">
            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* 사용자 이름 */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.name || user.preferred_username}
          </p>
          <p className="text-xs text-gray-500">
            {user.realm_roles?.join(', ') || 'user'}
          </p>
        </div>

        {/* 드롭다운 아이콘 */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            showDropdown ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 드롭다운 메뉴 */}
      {showDropdown && (
        <>
          {/* 백드롭 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* 메뉴 */}
          <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
            <div className="py-1">
              {/* 사용자 정보 */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user.name || user.preferred_username}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {user.realm_roles && user.realm_roles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user.realm_roles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 메뉴 항목 */}
              <button
                onClick={() => {
                  setShowDropdown(false);
                  router.push('/dashboard');
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                대시보드
              </button>

              {user.realm_roles?.includes('admin') && (
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    router.push('/admin');
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  관리자 페이지
                </button>
              )}

              <div className="border-t border-gray-200"></div>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                로그아웃
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
