import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
    private redisClient: Redis;

    constructor() {
        const fullRedisUrl = process.env.REDIS_FULL_URL;

        if (!fullRedisUrl) {
            throw new Error('REDIS_FULL_URL is required.');
        }

        this.redisClient = new Redis(fullRedisUrl, {
            tls: {
                rejectUnauthorized: false,
            },
        });
    }

    onApplicationShutdown() {
        this.redisClient.disconnect();
    }

    async getOrFetch<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl: number = 86400,
    ): Promise<T> {
        const cached = await this.redisClient.get(key).catch(() => null);
        if (cached) return JSON.parse(cached);

        const data = await fetcher();

        if (data !== undefined && data !== null) {
            this.redisClient
                .set(key, JSON.stringify(data), 'EX', ttl)
                .catch(Logger.error);
        }

        return data;
    }
}
