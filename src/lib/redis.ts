// Файл: src/lib/redis.ts (в вашем приложении testmagiclink - ПА)
// Версия без комментариев внутри кода

import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface StoredMagicLinkData {
  appId: string;
}

export interface MagicLinkDataInternal {
  appId: string;
}

const MAGIC_LINK_PREFIX_FROM_GENERATOR = 'magic_link_token:';

export async function getMagicLinkData(token: string): Promise<MagicLinkDataInternal | null> {
  try {
    const key = `${MAGIC_LINK_PREFIX_FROM_GENERATOR}${token}`;
    const data = await redis.get<StoredMagicLinkData>(key);
    
    if (!data) {
      return null;
    }

    return { appId: data.appId };
  } catch (error) {
    console.error('Error fetching magic link data (using generator\'s prefix):', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function markTokenAsUsed(token: string): Promise<boolean> {
  try {
    const key = `${MAGIC_LINK_PREFIX_FROM_GENERATOR}${token}`;
    const result = await redis.del(key);
    return result > 0; 
  } catch (error) {
    console.error('Error marking token as used by deleting (using generator\'s prefix):', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

export async function checkRedisConnection(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    console.error('Redis connection failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/*
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const pattern = `${MAGIC_LINK_PREFIX_FROM_GENERATOR}*`;
    const keys = await redis.keys(pattern);
    // Логика удаления здесь была бы избыточной, если ПГС использует setex
    // и Redis сам удаляет ключи по TTL.
    // Если все же нужна, она должна быть адаптирована.
    console.log(`Cleanup function (review logic): ${keys.length} keys found with prefix ${MAGIC_LINK_PREFIX_FROM_GENERATOR}.`);
    return keys.length; 
  } catch (error) {
    console.error('Error in cleanup (using generator\'s prefix):', error instanceof Error ? error.message : 'Unknown error');
    return 0;
  }
}
*/