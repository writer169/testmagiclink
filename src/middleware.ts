import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, refreshSession, setSessionCookie } from './lib/auth';

// Публичные роуты, которые не требуют авторизации
const PUBLIC_ROUTES = [
  '/auth/magic-link',
  '/auth/error',
  '/api/auth/verify-magic-link',
];

// API роуты, которые не требуют авторизации
const PUBLIC_API_ROUTES = [
  '/api/auth/verify-magic-link',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем статические файлы и служебные роуты Next.js
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/health')
  ) {
    return NextResponse.next();
  }

  // Проверяем, является ли роут публичным
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isPublicApiRoute = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

  // Для публичных роутов не требуется авторизация
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Получаем сессию пользователя
  const session = await getSessionFromRequest(request);

  // Если сессии нет или пользователь не авторизован
  if (!session || !session.isAuthorized) {
    // Для API роутов возвращаем 401
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Для обычных страниц редиректим на страницу ошибки
    const errorUrl = new URL('/auth/error', request.url);
    errorUrl.searchParams.set('error', 'unauthorized');
    errorUrl.searchParams.set('message', 'Authentication required');
    return NextResponse.redirect(errorUrl);
  }

  // Проверяем, нужно ли обновить сессию (если прошло больше 1 часа с последней активности)
  const ONE_HOUR = 60 * 60 * 1000;
  const shouldRefreshSession = Date.now() - session.authorizedAt > ONE_HOUR;

  if (shouldRefreshSession) {
    try {
      const newSessionToken = await refreshSession(session);
      const response = NextResponse.next();
      setSessionCookie(response, newSessionToken);
      return response;
    } catch (error) {
      console.error('Failed to refresh session:', error instanceof Error ? error.message : 'Unknown error');
      
      // Если не удалось обновить сессию, продолжаем с текущей
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}