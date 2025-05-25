import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, clearSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Получаем текущую сессию для логирования
    const session = await getSessionFromRequest(request);
    
    if (session) {
      console.log(`User logout: appId: ${session.appId}, sessionId: ${session.sessionId}`);
    }

    // Создаем ответ
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Logout successful'
      },
      { status: 200 }
    );

    // Удаляем сессионный cookie
    clearSessionCookie(response);

    return response;

  } catch (error) {
    console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Даже при ошибке удаляем cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Logout completed'
      },
      { status: 200 }
    );

    clearSessionCookie(response);
    
    return response;
  }
}

// Также поддерживаем GET для простых ссылок logout
export async function GET(request: NextRequest) {
  return POST(request);
}