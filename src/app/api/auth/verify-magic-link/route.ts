import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { MagicLinkTokenSchema, createSession, generateSessionId, setSessionCookie, SessionPayload } from '@/lib/auth';
import { getMagicLinkData, markTokenAsUsed } from '@/lib/redis';

// Схема для запроса
const VerifyMagicLinkRequestSchema = z.object({
  token: z.string().uuid('Invalid token format'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация входящих данных
    const validationResult = VerifyMagicLinkRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          message: validationResult.error.errors[0]?.message || 'Invalid token format'
        },
        { status: 400 }
      );
    }

    const { token } = validationResult.data;

    // Получаем данные токена из Redis
    const magicLinkData = await getMagicLinkData(token);
    
    if (!magicLinkData) {
      console.log(`Invalid or expired magic link attempt: ${token.substring(0, 8)}...`);
      return NextResponse.json(
        { 
          error: 'Invalid token',
          message: 'Magic link is invalid, expired, or already used'
        },
        { status: 401 }
      );
    }

    // Помечаем токен как использованный
    const marked = await markTokenAsUsed(token);
    if (!marked) {
      console.error(`Failed to mark token as used: ${token.substring(0, 8)}...`);
      return NextResponse.json(
        { 
          error: 'Processing error',
          message: 'Failed to process magic link'
        },
        { status: 500 }
      );
    }

    // Создаем сессию пользователя
    const sessionPayload: SessionPayload = {
      appId: magicLinkData.appId,
      authorizedAt: Date.now(),
      isAuthorized: true,
      sessionId: generateSessionId(),
    };

    const sessionToken = await createSession(sessionPayload);

    // Создаем ответ с установкой cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Authentication successful',
        session: {
          appId: sessionPayload.appId,
          sessionId: sessionPayload.sessionId,
          authorizedAt: sessionPayload.authorizedAt,
        }
      },
      { status: 200 }
    );

    // Устанавливаем сессионный cookie
    setSessionCookie(response, sessionToken);

    console.log(`Successful authentication for appId: ${magicLinkData.appId}, sessionId: ${sessionPayload.sessionId}`);
    
    return response;

  } catch (error) {
    console.error('Magic link verification error:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process authentication request'
      },
      { status: 500 }
    );
  }
}