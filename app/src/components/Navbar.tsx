'use client';

/**
 * Navbar 컴포넌트
 * 
 * 전역 네비게이션 바를 제공합니다.
 * 로그인 상태와 사용자 역할에 따라 다른 메뉴를 표시합니다.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthButton } from './AuthButton';

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: '홈', public: true },
    { href: '/dashboard', label: '대시보드', public: false },
    { href: '/admin', label: '관리자', public: false, adminOnly: true },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 로고 및 메뉴 */}
          <div className="flex">
            {/* 로고 */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Enterprise SSO
                </span>
              </Link>
            </div>

            {/* 메뉴 링크 */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* 인증 버튼 */}
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 (선택사항) */}
      <div className="sm:hidden border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
