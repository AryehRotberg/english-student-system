import { Injectable, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';

interface CacheOptions {
    ttl?: number;
}

@Injectable()
export class RedisService {
    private redisClient: Redis;
    private pendingRefreshes = new Map<string, Promise<any>>();

    constructor() {
        const redisUrl = process.env.REDIS_URL;
        const redisToken = process.env.REDIS_TOKEN;

        if (!redisUrl || !redisToken) {
            throw new Error('REDIS_URL and REDIS_TOKEN are required.');
        }

        this.redisClient = new Redis({
            url: redisUrl,
            token: redisToken,
        });
    }

    getClient(): Redis {
        return this.redisClient;
    }

    async getOrFetch<T>(
        key: string,
        fetcher: () => Promise<T>,
        options: CacheOptions = {},
    ): Promise<T> {
        // Check if a fetch for this key is already in progress
        if (this.pendingRefreshes.has(key)) {
            return this.pendingRefreshes.get(key);
        }

        const { ttl = 86400 } = options; // Default TTL: 24 hours

        const promise = (async () => {
            try {
                try {
                    const cached = await this.redisClient.get<T>(key);
                    if (cached) {
                        return cached;
                    }
                } catch (error) {
                    Logger.error('[Cache] Redis get error:', error);
                }

                const data = await fetcher();

                if (data !== undefined && data !== null) {
                    await this.redisClient
                        .set(key, data, { ex: ttl })
                        .catch((e) =>
                            Logger.error('[Cache] Redis set error:', e),
                        );
                }

                return data;
            } finally {
                // Cleanup pending promise
                this.pendingRefreshes.delete(key);
            }
        })();

        this.pendingRefreshes.set(key, promise);
        return promise;
    }

    async invalidate(pattern: string) {
        try {
            if (!pattern.includes('*')) {
                await this.redisClient.del(pattern);
                return;
            }

            let cursor = 0;
            do {
                const [nextCursor, keys] = await this.redisClient.scan(cursor, {
                    match: pattern,
                    count: 100,
                });

                if (keys.length > 0) {
                    await this.redisClient.del(...keys);
                }

                cursor = Number(nextCursor);
            } while (cursor !== 0);

            Logger.log(`[Cache] Invalidated pattern: ${pattern}`);
        } catch (error) {
            Logger.error('[Cache] Invalidation error:', error);
        }
    }
}
