import { Redis } from '@upstash/redis';

// Инициализация Redis клиента
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Интерфейс для данных magic link токена
export interface MagicLinkData {
  appId: string;
  createdAt: number;
  expiresAt: number;
  used?: boolean;
}

// Префикс для ключей magic link токенов
const MAGIC_LINK_PREFIX = 'magic_link:';

// Получение данных magic link токена
export async function getMagicLinkData(token: string): Promise<MagicLinkData | null> {
  try {
    const key = `${MAGIC_LINK_PREFIX}${token}`;
    const data = await redis.get<MagicLinkData>(key);
    
    if (!data) {
      console.log(`Magic link token not found: ${token.substring(0, 8)}...`);
      return null;
    }

    // Проверяем, не истек ли токен
    if (data.expiresAt < Date.now()) {
      console.log(`Magic link token expired: ${token.substring(0, 8)}...`);
      // Удаляем истекший токен
      await redis.del(key);
      return null;
    }

    // Проверяем, не был ли токен уже использован
    if (data.used) {
      console.log(`Magic link token already used: ${token.substring(0, 8)}...`);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching magic link data:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Помечаем токен как использованный
export async function markTokenAsUsed(token: string): Promise<boolean> {
  try {
    const key = `${MAGIC_LINK_PREFIX}${token}`;
    const data = await redis.get<MagicLinkData>(key);
    
    if (!data) {
      return false;
    }

    // Обновляем данные, помечая токен как использованный
    const updatedData: MagicLinkData = {
      ...data,
      used: true,
    };

    await redis.set(key, updatedData, {
      exat: Math.floor(data.expiresAt / 1000), // TTL до истечения токена
    });

    return true;
  } catch (error) {
    console.error('Error marking token as used:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Проверка доступности Redis
export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// Очистка истекших токенов (опциональная утилита для cron jobs)
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const pattern = `${MAGIC_LINK_PREFIX}*`;
    const keys = await redis.keys(pattern);
    let deletedCount = 0;

    for (const key of keys) {
      const data = await redis.get<MagicLinkData>(key);
      if (data && data.expiresAt < Date.now()) {
        await redis.del(key);
        deletedCount++;
      }
    }

    console.log(`Cleaned up ${deletedCount} expired magic link tokens`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error instanceof Error ? error.message : 'Unknown error');
    return 0;
  }
}