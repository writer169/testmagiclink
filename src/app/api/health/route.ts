import { NextResponse } from 'next/server';
import { checkRedisConnection } from '@/lib/redis';

export async function GET() {
  try {
    // Проверяем подключение к Redis
    const redisHealthy = await checkRedisConnection();
    
    // Проверяем наличие необходимых переменных окружения
    const requiredEnvVars = [
      'JWT_SECRET',
      'UPSTASH_REDIS_REST_URL',
      'UPSTASH_REDIS_REST_TOKEN'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(
      varName => !process.env[varName]
    );

    const isHealthy = redisHealthy && missingEnvVars.length === 0;

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        redis: redisHealthy ? 'connected' : 'disconnected',
        environment: missingEnvVars.length === 0 ? 'configured' : 'missing_variables',
      },
      ...(missingEnvVars.length > 0 && {
        issues: {
          missingEnvVars: missingEnvVars
        }
      })
    };

    return NextResponse.json(
      healthData,
      { 
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      }
    );

  } catch (error) {
    console.error('Health check failed:', error instanceof Error ? error.message : 'Unknown error');
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}