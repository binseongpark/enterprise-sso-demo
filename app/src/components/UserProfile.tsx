'use client';

/**
 * UserProfile 컴포넌트
 * 
 * 사용자 프로필 정보를 카드 형태로 표시합니다.
 */

import type { KeycloakUser } from '@/types/auth';

interface UserProfileProps {
  user: KeycloakUser;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-24"></div>
      
      <div className="px-6 pb-6">
        {/* 아바타 */}
        <div className="flex items-center -mt-12">
          <div className="w-24 h-24 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* 사용자 정보 */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {user.name || user.preferred_username}
          </h2>
          
          <p className="text-gray-600 mt-1">{user.email}</p>

          {user.email_verified && (
            <div className="mt-2 inline-flex items-center text-sm text-green-600">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              이메일 인증됨
            </div>
          )}

          {/* 역할 배지 */}
          {user.realm_roles && user.realm_roles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">역할</h3>
              <div className="flex flex-wrap gap-2">
                {user.realm_roles.map((role) => {
                  const roleColors: Record<string, string> = {
                    admin: 'bg-red-100 text-red-800 border-red-200',
                    user: 'bg-blue-100 text-blue-800 border-blue-200',
                    viewer: 'bg-green-100 text-green-800 border-green-200',
                  };

                  return (
                    <span
                      key={role}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                        roleColors[role] || 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      {role === 'admin' && '👑 '}
                      {role === 'user' && '👤 '}
                      {role === 'viewer' && '👁️ '}
                      {role.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* 추가 정보 */}
          <div className="mt-6 space-y-2">
            {user.preferred_username && (
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="w-4 h-4 mr-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>사용자명: {user.preferred_username}</span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Keycloak으로 인증됨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
