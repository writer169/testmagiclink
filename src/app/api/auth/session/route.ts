import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session || !session.isAuthorized) {
      return NextResponse.json(
        { 
          authenticated: false,
          session: null
        },
        { status: 200 }
      );
    }

    // Возвращаем информацию о сессии (без чувствительных данных)
    return NextResponse.json(
      { 
        authenticated: true,
        session: {
          appId: session.appId,
          sessionId: session.sessionId,
          authorizedAt: session.authorizedAt,
          isAuthorized: session.isAuthorized,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Session check error:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to check session'
      },
      { status: 500 }
    );
  }
}