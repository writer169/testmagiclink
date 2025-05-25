'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Успешный выход - перенаправляем на страницу ошибки с сообщением о выходе
        router.push('/auth/error?error=logged_out&message=You have been successfully logged out');
      } else {
        console.error('Logout failed:', data.message);
        // Даже если API вернул ошибку, пытаемся перенаправить пользователя
        router.push('/auth/error?error=logout_error&message=Logout completed with errors');
      }
    } catch (error) {
      console.error('Logout request failed:', error);
      // В случае сетевой ошибки все равно пытаемся перенаправить
      router.push('/auth/error?error=network_error&message=Logout completed despite network error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
        isLoggingOut
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg'
      }`}
    >
      {isLoggingOut ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Logging out...</span>
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </>
      )}
    </button>
  );
}