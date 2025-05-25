import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const SESSION_COOKIE_NAME = 'auth-session';
const SESSION_DURATION = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

// Типы для сессии - ИСПРАВЛЕННАЯ ВЕРСИЯ
export interface SessionPayload extends JWTPayload {
  appId: string;
  authorizedAt: number;
  isAuthorized: boolean;
  sessionId: string;
}

// Схема валидации для входящих данных
export const MagicLinkTokenSchema = z.object({
  token: z.string().uuid('Invalid token format'),
});

export const SessionSchema = z.object({
  appId: z.string().min(1),
  authorizedAt: z.number(),
  isAuthorized: z.boolean(),
  sessionId: z.string().min(1),
});

// Создание JWT токена
export async function createSession(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + SESSION_DURATION))
    .sign(JWT_SECRET);

  return token;
}

// Верификация JWT токена
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const validatedPayload = SessionSchema.parse(payload);
    
    // Проверяем, что сессия не истекла
    if (validatedPayload.authorizedAt + SESSION_DURATION < Date.now()) {
      return null;
    }

    return validatedPayload;
  } catch (error) {
    console.error('Session verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Получение сессии из cookies (для серверных компонентов)
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return await verifySession(sessionCookie.value);
}

// Получение сессии из request (для API routes и middleware)
export async function getSessionFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return await verifySession(sessionCookie.value);
}

// Установка сессионного cookie
export function setSessionCookie(response: NextResponse, sessionToken: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // в секундах
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
  });
}

// Удаление сессионного cookie
export function clearSessionCookie(response: NextResponse): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  response.cookies.delete({
    name: SESSION_COOKIE_NAME,
    path: '/',
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined,
  });
}

// Генерация уникального session ID
export function generateSessionId(): string {
  return crypto.randomUUID();
}

// Проверка авторизации пользователя
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session?.isAuthorized === true;
}

// Обновление времени последней активности в сессии
export async function refreshSession(currentSession: SessionPayload): Promise<string> {
  const updatedPayload: SessionPayload = {
    ...currentSession,
    authorizedAt: Date.now(),
  };

  return await createSession(updatedPayload);
}