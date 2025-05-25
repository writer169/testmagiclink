// src/app/auth/magic-link/page.tsx
// Показываю полный файл с изменениями, адаптированный под ваш существующий /api/auth/session

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface AuthState {
  loading: boolean;
  error: string | null;
  success: boolean;
  message?: string;
}

function MagicLinkVerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    error: null,
    success: false,
    message: 'Initializing...'
  });

  useEffect(() => {
    const processAuth = async () => {
      setAuthState(prev => ({ ...prev, loading: true, message: 'Checking existing session...' }));

      // 1. Проверяем активную сессию
      try {
        const sessionResponse = await fetch('/api/auth/session');
        // Ваш эндпоинт всегда возвращает 200, поэтому проверяем тело ответа
        if (sessionResponse.ok) { 
          const sessionData = await sessionResponse.json();
          // Проверяем поле 'authenticated' из вашего эндпоинта
          if (sessionData.authenticated === true) { 
            setAuthState({
              loading: false,
              error: null,
              success: true,
              message: 'You are already logged in. Redirecting...'
            });
            setTimeout(() => {
              router.push('/'); 
            }, 1500);
            return; 
          }
        }
        // Если sessionData.authenticated === false или ошибка fetch, продолжаем
      } catch (sessionError) {
        console.warn('Failed to check existing session:', sessionError);
      }

      // 2. Если сессии нет, продолжаем с верификацией magic link токена
      setAuthState(prev => ({ ...prev, message: 'Verifying your magic link...' }));
      const token = searchParams.get('token');

      if (!token) {
        setAuthState({
          loading: false,
          error: 'No authentication token provided.',
          success: false,
        });
        return;
      }

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(token)) {
        setAuthState({
          loading: false,
          error: 'Invalid token format.',
          success: false,
        });
        return;
      }

      await verifyMagicLinkToken(token);
    };

    processAuth();
  }, [searchParams, router]);

  const verifyMagicLinkToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setAuthState({
          loading: false,
          error: null,
          success: true,
          message: data.message || 'Authentication Successful! Redirecting...'
        });
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setAuthState({
          loading: false,
          error: data.message || 'Authentication failed. Magic link might be expired or already used.',
          success: false,
        });
      }
    } catch (error) {
      console.error('Magic link verification failed:', error);
      setAuthState({
        loading: false,
        error: 'Network error during magic link verification. Please try again.',
        success: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {authState.loading && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Processing...
              </h1>
              <p className="text-gray-600">
                {authState.message || 'Please wait...'}
              </p>
            </>
          )}

          {authState.success && !authState.loading && (
            <>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Success!
              </h1>
              <p className="text-gray-600 mb-4">
                {authState.message || 'You have been successfully authenticated.'}
              </p>
            </>
          )}

          {authState.error && !authState.loading && (
            <>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-2">
                Authentication Problem
              </h1>
              <p className="text-gray-600 mb-4">
                {authState.error}
              </p>
              <button
                onClick={() => router.push('/login')} 
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login Page
              </button>
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

export default function MagicLinkPage() {
  const fallbackUI = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Loading Authentication...
          </h1>
          <p className="text-gray-600">
            Please wait.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallbackUI}>
      <MagicLinkVerificationContent />
    </Suspense>
  );
}