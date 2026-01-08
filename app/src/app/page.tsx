import Link from 'next/link';

/**
 * 공개 랜딩 페이지
 * 
 * 프로젝트 소개 및 주요 기능을 설명합니다.
 */

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-500 to-primary-700 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl py-32 sm:py-48">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              엔터프라이즈급 SSO 데모 시스템
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Keycloak과 Supabase를 활용한 Single Sign-On (SSO) 인증 시스템입니다.
              <br />
              Role 기반 접근 제어(RBAC)와 Row Level Security(RLS)를 구현했습니다.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="rounded-md bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
              >
                SSO 로그인 시작하기
              </Link>
              <a
                href="https://github.com/binseongpark/enterprise-sso-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors"
              >
                GitHub 보기 <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            주요 기능
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            엔터프라이즈급 인증 시스템
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Keycloak의 강력한 인증 기능과 Supabase의 데이터베이스를 결합하여
            안전하고 확장 가능한 SSO 시스템을 구축했습니다.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                  <svg
                    className="h-6 w-6 text-white"
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
                </div>
                Keycloak 기반 중앙 인증
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  업계 표준 OpenID Connect 프로토콜을 사용하는 Keycloak으로
                  안전하고 확장 가능한 인증을 제공합니다.
                </p>
              </dd>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                Role 기반 접근 제어 (RBAC)
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Admin, User, Viewer 역할을 통해 세밀한 권한 관리와
                  페이지별 접근 제어를 구현했습니다.
                </p>
              </dd>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                    />
                  </svg>
                </div>
                Supabase RLS 데이터 보안
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Row Level Security 정책으로 데이터베이스 레벨에서
                  사용자별 데이터 격리를 보장합니다.
                </p>
              </dd>
            </div>

            {/* Feature 4 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                Next.js 14 App Router
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  최신 Next.js 14와 React Server Components를 활용한
                  빠르고 현대적인 웹 애플리케이션입니다.
                </p>
              </dd>
            </div>

            {/* Feature 5 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                Docker Compose 통합 환경
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Docker Compose로 모든 서비스를 손쉽게 실행하고
                  로컬 개발 환경을 빠르게 구축할 수 있습니다.
                </p>
              </dd>
            </div>

            {/* Feature 6 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                </div>
                Tailwind CSS 디자인
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                <p className="flex-auto">
                  Tailwind CSS로 구현한 깔끔하고 반응형인 UI로
                  모든 디바이스에서 최적의 경험을 제공합니다.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Test Accounts Section */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">
              테스트 계정
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              3가지 역할 체험하기
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              각기 다른 권한을 가진 테스트 계정으로 SSO 시스템을 체험해보세요.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-8 lg:max-w-none lg:grid-cols-3">
              {/* Admin Account */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <dt className="text-lg font-semibold text-gray-900 mb-4">
                  👑 Admin 계정
                </dt>
                <dd className="text-base text-gray-600 space-y-2">
                  <p><strong>Username:</strong> admin</p>
                  <p><strong>Password:</strong> admin123</p>
                  <p><strong>권한:</strong> 모든 데이터 접근 및 관리</p>
                </dd>
              </div>

              {/* User Account */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <dt className="text-lg font-semibold text-gray-900 mb-4">
                  👤 User 계정
                </dt>
                <dd className="text-base text-gray-600 space-y-2">
                  <p><strong>Username:</strong> user</p>
                  <p><strong>Password:</strong> user123</p>
                  <p><strong>권한:</strong> 본인 데이터 CRUD</p>
                </dd>
              </div>

              {/* Viewer Account */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <dt className="text-lg font-semibold text-gray-900 mb-4">
                  👁️ Viewer 계정
                </dt>
                <dd className="text-base text-gray-600 space-y-2">
                  <p><strong>Username:</strong> viewer</p>
                  <p><strong>Password:</strong> viewer123</p>
                  <p><strong>권한:</strong> 읽기 전용</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              지금 바로 시작하세요
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Keycloak SSO로 로그인하여 엔터프라이즈급 인증 시스템을 체험해보세요.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/login"
                className="rounded-md bg-white px-6 py-3 text-base font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
              >
                로그인하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
