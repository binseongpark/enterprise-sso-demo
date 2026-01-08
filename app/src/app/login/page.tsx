'use client';

/**
 * 로그인 페이지
 * 
 * Keycloak 로그인으로 리다이렉트합니다.
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { initKeycloak, login, isAuthenticated } from '@/lib/keycloak';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const reason = searchParams.get('reason');

  useEffect(() => {
    handleLogin();
  }, []);

  const handleLogin = async () => {
    try {
      // Keycloak 초기화
      await initKeycloak();

      // 이미 로그인된 경우 리다이렉트
      if (isAuthenticated()) {
        router.push(redirectUrl);
        return;
      }

      // 로그인 페이지로 리다이렉트
      await login(redirectUrl);
    } catch (err) {
      console.error('로그인 초기화 실패:', err);
      setError('로그인을 시작할 수 없습니다. 잠시 후 다시 시도해주세요.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-3xl">E</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Enterprise SSO
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Keycloak 통합 인증으로 로그인하세요
          </p>
        </div>

        {reason === 'expired' && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
            <p className="text-sm">세션이 만료되었습니다. 다시 로그인해주세요.</p>
          </div>
        )}

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            <p className="text-sm">{error}</p>
            <button
              onClick={handleLogin}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-8">
            {loading && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
                <p className="text-center text-sm text-gray-600">
                  Keycloak 로그인 페이지로 이동 중...
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500">
            테스트 계정: admin/admin123, user/user123, viewer/viewer123
          </p>
        </div>
      </div>
    </div>
  );
}
