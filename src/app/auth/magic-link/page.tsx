'use client';

import { Suspense, useEffect, useState } from 'react'; // Импортируем Suspense
import { useSearchParams, useRouter } from 'next/navigation';

interface AuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Основная логика страницы вынесена в отдельный компонент
function MagicLinkVerificationContent() {
  const searchParams = useSearchParams(); // useSearchParams используется здесь
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    error: null,
    success: false,
  });

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setAuthState({
        loading: false,
        error: 'No authentication token provided',
        success: false,
      });
      return;
    }

    // Проверяем формат токена (должен быть UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      setAuthState({
        loading: false,
        error: 'Invalid token format',
        success: false,
      });
      return;
    }

    // Отправляем токен для верификации
    verifyMagicLink(token);
  }, [searchParams]); // Зависимость от searchParams

  const verifyMagicLink = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthState({
          loading: false,
          error: null,
          success: true,
        });

        // Перенаправляем на главную страницу через 2 секунды
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setAuthState({
          loading: false,
          error: data.message || 'Authentication failed',
          success: false,
        });

        // Перенаправляем на страницу ошибки через 3 секунды
        setTimeout(() => {
          router.push(`/auth/error?error=auth_failed&message=${encodeURIComponent(data.message || 'Authentication failed')}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Magic link verification failed:', error);
      setAuthState({
        loading: false,
        error: 'Network error. Please try again.',
        success: false,
      });

      setTimeout(() => {
        router.push('/auth/error?error=network_error&message=Network error. Please try again.');
      }, 3000);
    }
  };

  // UI остается таким же, как и был
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {authState.loading && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Authenticating...
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your magic link.
              </p>
            </>
          )}

          {authState.success && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Authentication Successful!
              </h1>
              <p className="text-gray-600 mb-4">
                You have been successfully authenticated.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {authState.error && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Authentication Failed
              </h1>
              <p className="text-gray-600 mb-4">
                {authState.error}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to error page...
              </p>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

// Экспортируемый по умолчанию компонент страницы
export default function MagicLinkPage() {
  return (
    // Оборачиваем компонент, использующий useSearchParams, в Suspense
    <Suspense fallback={ // Fallback UI, пока searchParams не доступен
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              Loading Page...
            </h1>
            <p className="text-gray-600">
              Please wait while we prepare the authentication page.
            </p>
          </div>
        </div>
      </div>
    }>
      <MagicLinkVerificationContent />
    </Suspense>
  );
}