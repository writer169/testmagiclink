'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'unknown_error';
  const message = searchParams.get('message') || 'An unknown error occurred';

  const getErrorDetails = (error: string) => {
    switch (error) {
      case 'unauthorized':
        return {
          title: 'Authentication Required',
          description: 'You need to authenticate to access this page.',
          icon: '🔒',
          color: 'text-amber-600',
          bgColor: 'bg-amber-100',
        };
      case 'auth_failed':
        return {
          title: 'Authentication Failed',
          description: 'Your magic link is invalid, expired, or has already been used.',
          icon: '❌',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
        };
      case 'network_error':
        return {
          title: 'Network Error',
          description: 'There was a problem connecting to our servers.',
          icon: '🌐',
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
        };
      case 'expired':
        return {
          title: 'Link Expired',
          description: 'Your magic link has expired.',
          icon: '⏰',
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
        };
      case 'already_used':
        return {
          title: 'Link Already Used',
          description: 'This magic link has already been used.',
          icon: '✅',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case 'logged_out':
        return {
          title: 'Logged Out',
          description: 'You have been successfully logged out.',
          icon: '👋',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      case 'logout_error':
        return {
          title: 'Logout Completed',
          description: 'Logout completed with some errors.',
          icon: '⚠️',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
        };
      default:
        return {
          title: 'Error',
          description: 'Something went wrong.',
          icon: '⚠️',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className={`w-16 h-16 ${errorDetails.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <span className="text-2xl">{errorDetails.icon}</span>
          </div>

          <h1 className={`text-2xl font-semibold ${errorDetails.color} mb-3`}>
            {errorDetails.title}
          </h1>

          <p className="text-gray-600 mb-2">
            {errorDetails.description}
          </p>

          {message !== errorDetails.description && (
            <p className="text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
              {message}
            </p>
          )}

          <div className="space-y-3">
            {error === 'network_error' && (
              <button
                onClick={handleRetry}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
            )}

            <button
              onClick={handleGoHome}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              Go to Home
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help? Here are some common solutions:
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>• Request a new magic link if yours has expired</p>
            <p>• Check your email for the most recent link</p>
            <p>• Clear your browser cache and try again</p>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700 font-medium mb-1">Debug Info (Development Only):</p>
            <p className="text-xs text-yellow-600">Error: {error}</p>
            <p className="text-xs text-yellow-600">Message: {message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}